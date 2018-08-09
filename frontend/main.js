const {app, protocol} = require('electron');

const envVariables = require('./env-variables');
const loadAuthProcess = require('./main/auth-process');
const loadAppProcess = require('./main/app-process');
const authService = require('./service/auth-service');

const {appDomain, appScheme} = envVariables;

// needed, otherwise localstorage, sessionstorage, cookies, etc, become unavailable
// https://electronjs.org/docs/api/protocol#methods
protocol.registerStandardSchemes([appScheme]);

function showWindow() {

  protocol.registerFileProtocol(appScheme, async (req, callback) => {
    const requestedURL = req.url.replace(`${appScheme}://${appDomain}/`, '').substring(0, req.url.length - 1);

    if (requestedURL.indexOf('callback') === 0) {
      await authService.loadTokens(requestedURL);
      return loadAppProcess();
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
