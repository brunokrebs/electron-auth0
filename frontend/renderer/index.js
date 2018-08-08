const axios = require('axios');
const { ipcRenderer } = require('electron');

ipcRenderer.send('loaded');

ipcRenderer.on('globalProps', (event, props) => {
  const {apiIdentifier, auth0Domain, clientId, customScheme, customDomain} = props;
  // TODO generate better (random?) nonce and state properties

  const nonce = 'XHcLb-0hZg~V5u~lz-KKpr8rfqlQh9JZ';
  const redirectUri = `${customScheme}://${customDomain}/home.html`;
  const responseType = 'code id_token';
  const scope = 'openid profile offline_access';
  const state = 'czc13QkjPlb9V-xCmMpqDlURjSyse02L';

  // checking for refresh token to redirect authenticated users
  const refresh_token = localStorage.getItem('refresh_token');
  if (refresh_token) window.location.assign(encodeURI(redirectUri));

  const authorisationUrl = 'https://' + auth0Domain + '/authorize' +
    '?client_id=' + clientId +
    '&response_type=' + responseType +
    '&redirect_uri=' + redirectUri +
    '&scope=' + scope +
    '&state=' + state +
    '&audience=' + apiIdentifier +
    '&nonce=' + nonce;

  function login() {
    window.location.assign(encodeURI(authorisationUrl));
  }

  document.getElementById('login').onclick = login;

  function fetchPublic() {
    axios.get('http://localhost:3000/public').then((response) => {
      alert(response.data);
    }).catch(console.log);
  }

  document.getElementById('public').onclick = fetchPublic;
});
