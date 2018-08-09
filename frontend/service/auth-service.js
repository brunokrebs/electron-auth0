const crypto = require('crypto');
const request = require('request');
const url = require('url');
const envVariables = require('../env-variables');
const storeService = require('../service/store-service');

const {apiIdentifier, appDomain, appScheme, auth0Domain, clientId} = envVariables;

const redirectUri = `${appScheme}://${appDomain}/callback`;

const verifier = base64URLEncode(crypto.randomBytes(32));
const challenge = base64URLEncode(sha256(verifier));

let accessToken = null;
let idToken = null;
let refreshToken = null;

function getAccessToken() {
  return accessToken;
}

function getIdToken() {
  return idToken;
}

function getRefreshToken() {
  return refreshToken;
}

function getAuthenticationURL() {
  return 'https://' + auth0Domain + '/authorize?' +
    'audience=' + apiIdentifier + '&' +
    'scope=openid profile offline_access&' +
    'response_type=code&' +
    'client_id=' + clientId + '&' +
    'code_challenge=' + challenge + '&' +
    'code_challenge_method=S256&' +
    'redirect_uri=' + redirectUri;
}

function loadTokens(callbackURL) {
  return new Promise((resolve, reject) => {
    const urlParts = url.parse(callbackURL, true);
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

    request(options, (error, resp, body) => {
      if (error) return reject(error);

      const responseBody = JSON.parse(body);
      accessToken = responseBody.access_token;
      idToken = responseBody.id_token;
      refreshToken = responseBody.refresh_token;

      storeService.set('refresh-token', refreshToken);

      resolve();
    });
  });
}

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

module.exports = {
  getAccessToken,
  getAuthenticationURL,
  getIdToken,
  getRefreshToken,
  loadTokens,
  verifier,
};
