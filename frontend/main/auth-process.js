const {BrowserWindow} = require('electron');
const authService = require('../service/auth-service');

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

    win.loadURL(authService.getAuthenticationURL());
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
