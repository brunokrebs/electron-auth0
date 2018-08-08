const {app, BrowserWindow, ipcMain, protocol} = require('electron');
const envVariables = require('./env-variables');
const crypto = require('crypto');
const request = require('request');
const url = require('url');

const {apiIdentifier, auth0Domain, clientId} = envVariables;

const verifier = base64URLEncode(crypto.randomBytes(32));
const challenge = base64URLEncode(sha256(verifier));

let accessToken = null;
let refreshToken = null;
let idToken = null;

let win;

// you will need a custom scheme so Auth0 can redirect to this scheme+domain after authentication
// i.e. `file://home.html` won't work because Auth0 appends a hash to the callback URL and Electron
// will think it has to load a file called (e.g.) `home.html#access_token=123...`
const customScheme = 'custom-scheme';
const customDomain = 'custom-domain';
const redirectUri = `${customScheme}://${customDomain}/callback`;

// needed, otherwise localstorage, sessionstorage, cookies, etc, become unavailable
// https://electronjs.org/docs/api/protocol#methods
protocol.registerStandardSchemes([customScheme]);

function showWindow() {

  protocol.registerFileProtocol(customScheme, (req, callback) => {
    const urlRequested = req.url.replace(`${customScheme}://${customDomain}/`, '').substring(0, req.url.length - 1);

    if (urlRequested.indexOf('callback') === 0) {
      win.close();
      const urlParts = url.parse(urlRequested, true);
      const query = urlParts.query;

      const exchangeOptions = {
        'grant_type': 'authorization_code',
        'client_id': clientId,
        'code_verifier': verifier,
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

        win = new BrowserWindow({
          width: 1000,
          height: 600,
        });

        const responseBody = JSON.parse(body);
        accessToken = responseBody.access_token;
        idToken = responseBody.id_token;
        refreshToken = responseBody.refresh_token;

        ipcMain.on('loaded', () => {
          win.webContents.send('globalProps', {
            idToken,
          });
        });

        win.loadURL(`${customScheme}://${customDomain}/home.html`);
      });

      return;
    }

    console.log('here i am -------------------------------------');
    console.log(`${__dirname}/renderer/${urlRequested}`);
    callback(`${__dirname}/renderer/${urlRequested}`);
    console.log('here i am -------------------------------------');
  }, (error) => {
    if (error) console.error('Failed to register protocol')
  });

  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  const authenticated = false;
  if (!authenticated) {

    const authorizationUrl = 'https://' + auth0Domain + '/authorize?' +
      'audience=' + apiIdentifier + '&' +
      'scope=openid profile offline_access&' +
      'response_type=code&' +
      'client_id=' + clientId + '&' +
      'code_challenge=' + challenge + '&' +
      'code_challenge_method=S256&' +
      'redirect_uri=' + redirectUri;

    win.loadURL(authorizationUrl);
  }

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
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

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}
