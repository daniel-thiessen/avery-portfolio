const simpleOauth = require('simple-oauth2');

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;

// GitHub's OAuth settings
const tokenHost = 'https://github.com';
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
  },
});

// Callback Handler
exports.handler = async (event, context) => {
  const code = event.queryStringParameters.code;
  const redirectUri = `${process.env.NETLIFY_URL}/api/callback`;
  
  try {
    const tokenConfig = {
      code,
      redirect_uri: redirectUri,
    };

    // Exchange auth code for access token
    const accessToken = await oauth2.authorizationCode.getToken(tokenConfig);
    const { token } = oauth2.accessToken.create(accessToken);
    
    // Redirect back to admin with the token
    return {
      statusCode: 302,
      headers: {
        Location: `/admin/#access_token=${token.access_token}&token_type=bearer&expires_in=${token.expires_in}`,
      },
      body: '',
    };
  } catch (error) {
    console.error('Access Token Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error getting access token',
        details: error.message,
      }),
    };
  }
};
