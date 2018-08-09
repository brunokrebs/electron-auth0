const {BrowserWindow} = require('electron');
const authService = require('../service/auth-service');

let win = null;

function destroyAuthWin() {
  if (!win) return;
  win.close();
  win = null;
}

function createAuthWin() {
  destroyAuthWin();

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
    win.loadURL(authService.getAuthenticationURL());
  }

  win.on('authenticated', () => {
    destroyAuthWin();
  });

  win.on('closed', () => {
    win = null;
  });
}

module.exports = {
  createAuthWin,
  destroyAuthWin,
};
