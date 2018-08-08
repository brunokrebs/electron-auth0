const {app, BrowserWindow, ipcMain, protocol} = require('electron');
const request = require('request');
const url = require('url');
const envVariables = require('./env-variables');
const loadAuthProcess = require('./main/auth-process');
const authService = require('./service/auth-service');

const {appDomain, appScheme, auth0Domain, clientId} = envVariables;

let accessToken = null;
let refreshToken = null;
let idToken = null;

// you will need a custom scheme so Auth0 can redirect to this scheme+domain after authentication
// i.e. `file://home.html` won't work because Auth0 appends a hash to the callback URL and Electron
// will think it has to load a file called (e.g.) `home.html#access_token=123...`
const redirectUri = `${appScheme}://${appDomain}/callback`;

// needed, otherwise localstorage, sessionstorage, cookies, etc, become unavailable
// https://electronjs.org/docs/api/protocol#methods
protocol.registerStandardSchemes([appScheme]);

function showWindow() {

  protocol.registerFileProtocol(appScheme, (req, callback) => {
    const requestedURL = req.url.replace(`${appScheme}://${appDomain}/`, '').substring(0, req.url.length - 1);

    if (requestedURL.indexOf('callback') === 0) {
      return triggerHome(requestedURL);
    }

    callback(`${__dirname}/renderer/${requestedURL}`);
  }, console.error);

  loadAuthProcess();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', showWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    showWindow();
  }
});

function triggerHome(requestedURL) {
  const urlParts = url.parse(requestedURL, true);
  const query = urlParts.query;

  const exchangeOptions = {
    'grant_type': 'authorization_code',
    'client_id': clientId,
    'code_verifier': authService.verifier,
    'code': query.code,
    'redirect_uri': redirectUri,
  };

  const options = {
    method: 'POST',
    url: `https://${auth0Domain}/oauth/token`,
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(exchangeOptions),
  };

  request(options, function (error, resp, body) {
    if (error) throw new Error(error);

    const win = new BrowserWindow({
      width: 1000,
      height: 600,
    });

    const responseBody = JSON.parse(body);
    accessToken = responseBody.access_token;
    idToken = responseBody.id_token;
    refreshToken = responseBody.refresh_token;

    ipcMain.on('loaded', (event) => {
      event.sender.send('load-profile', {
        idToken,
      });
    });

    ipcMain.on('secured-request', (event) => {
      const requestOptions = {
        method: 'GET',
        url: `http://localhost:3000/private`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      };

      request(requestOptions, function (error, resp, body) {
        if (error) throw new Error(error);

        event.sender.send('secured-request-response', {
          message: resp.body,
        });
      });
    });

    ipcMain.on('logout', (event) => {
      event.sender.close();
    });

    win.loadURL(`${appScheme}://${appDomain}/home.html`);
  });
}
