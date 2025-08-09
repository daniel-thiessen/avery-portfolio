const simpleOauth = require('simple-oauth2');

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;

// GitHub's OAuth settings
const authorizationHost = 'https://github.com';
const tokenHost = 'https://github.com';
const authorizePath = '/login/oauth/authorize';
const tokenPath = '/login/oauth/access_token';

// Create oAuth2 client
const oauth2 = simpleOauth.create({
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    tokenHost,
    tokenPath,
    authorizePath,
    authorizeHost: authorizationHost,
  },
});

// Auth Handler
exports.handler = async (event, context) => {
  // Redirect URL pointing back to your site
  const redirectUrl = `${process.env.NETLIFY_URL}/api/callback`;
  
  // Authorization URL oauth2 client
  const authorizationUrl = oauth2.authorizationCode.authorizeURL({
    redirect_uri: redirectUrl,
    scope: 'repo,user', // Scope required for repository access
  });

  // Redirect to GitHub authorization page
  return {
    statusCode: 302,
    headers: {
      Location: authorizationUrl,
    },
    body: '',
  };
};
