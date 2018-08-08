const axios = require('axios');
const { ipcRenderer } = require('electron');
const jwtDecode = require('jwt-decode');

ipcRenderer.send('loaded');

ipcRenderer.on('globalProps', (event, props) => {
  console.log('----------------------');
  const {idToken} = props;
  populateView(idToken, true);

  function populateView(idToken) {
    console.log(idToken);
    const profile = jwtDecode(idToken);

    document.getElementById('picture').src = profile.picture;
    document.getElementById('name').innerText = profile.name;
    document.getElementById('success').innerText = 'The `access_token` was loaded with the authorization code.';
    document.getElementById('logout').onclick = logout;
  }

  function logout() {
    localStorage.clear();
    window.location.assign(`${customScheme}://${customDomain}/index.html`);
  }

  function fetchPrivate() {
    const options = {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' +  sessionStorage.getItem('access_token') },
      url: 'http://localhost:3000/private',
    };

    axios(options).then((response) => {
      alert(response.data);
    }).catch(console.log);
  }

  document.getElementById('private').onclick = fetchPrivate;
});
