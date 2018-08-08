const { ipcRenderer } = require('electron');
const jwtDecode = require('jwt-decode');

ipcRenderer.send('loaded');

document.getElementById('logout').onclick = () => {
  ipcRenderer.send('logout');
};

document.getElementById('secured-request').onclick = () => {
  ipcRenderer.send('secured-request');
};

ipcRenderer.on('load-profile', (event, props) => {
  const {idToken} = props;
  const profile = jwtDecode(idToken);

  document.getElementById('picture').src = profile.picture;
  document.getElementById('name').innerText = profile.name;
  document.getElementById('success').innerText = 'The `access_token` was loaded with the authorization code.';
});

ipcRenderer.on('secured-request-response', (event, props) => {
  document.getElementById('message').innerText = props.message;
});
