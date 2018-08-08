const crypto = require('crypto');
const envVariables = require('../env-variables');

const {apiIdentifier, appDomain, appScheme, auth0Domain, clientId} = envVariables;
const redirectUri = `${appScheme}://${appDomain}/callback`;

const verifier = base64URLEncode(crypto.randomBytes(32));
const challenge = base64URLEncode(sha256(verifier));

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
  getAuthenticationURL,
  verifier,
};
