const { ipcRenderer } = require('electron');

ipcRenderer.send('loaded');

ipcRenderer.on('globalProps', (event, props) => {
  const {auth0Domain, clientId, clientSecret, customScheme, customDomain} = props;
  const authorizationCodeType = 'authorization_code';
  const refreshTokenType = 'refresh_token';
  const redirectUri = `${customScheme}://${customDomain}/home.html`;
  const tokenUrl = `https://${auth0Domain}/oauth/token`;

  const authConfig = {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  };

  const refresh_token = localStorage.getItem('refresh_token');
  if (refresh_token) authWithRefreshToken();
  else authWithAuthorizationToken();

  function authWithRefreshToken() {
    authConfig.grant_type = refreshTokenType;
    authConfig.refresh_token = refresh_token;

    axios.post(tokenUrl, authConfig).then((response) => {
      const { access_token, id_token } = response.data;
      sessionStorage.setItem('access_token', access_token);
      populateView(id_token, true);
    }).catch(console.log);
  }

  function authWithAuthorizationToken() {
    // parsing the hash to get access to `code`
    const hash = window.location.hash.substring(1);
    const hashParams = {};
    hash.split('&').map(hashParam => {
      const keyValue = hashParam.split('=');
      hashParams[keyValue[0]] = keyValue[1];
    });

    authConfig.grant_type = authorizationCodeType;
    authConfig.code = hashParams.code;

    console.log(tokenUrl, authConfig);
    debugger;

    axios.post(tokenUrl, authConfig).then((response) => {
      const { access_token, refresh_token, id_token } = response.data;

      sessionStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      populateView(id_token);
    }).catch(console.log);
  }

  function populateView(idToken, loadedWithRefresh) {
    const profile = jwt_decode(idToken);

    document.getElementById('picture').src = profile.picture;
    document.getElementById('name').innerText = profile.name;

    document.getElementById('success').innerText = loadedWithRefresh ?
      'The `access_token` was loaded with the refresh token.' :
      'The `access_token` was loaded with the authorization code.';

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
