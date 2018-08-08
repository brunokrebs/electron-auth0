const {BrowserWindow} = require('electron');
const envVariables = require('../env-variables');
const authService = require('../service/auth-service');

const {apiIdentifier, appDomain, appScheme, auth0Domain, clientId} = envVariables;
const redirectUri = `${appScheme}://${appDomain}/callback`;

module.exports = function loadAuthProcess() {
  // Create the browser window.
  let win = new BrowserWindow({
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
      'code_challenge=' + authService.challenge + '&' +
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
};
