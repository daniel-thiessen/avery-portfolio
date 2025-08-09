const queryString = require('query-string');
const fetch = require('node-fetch');

// Callback Handler
exports.handler = async (event, context) => {
  // Check method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the code from the query
  const code = event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: 'Missing code parameter' };
  }

  // Get environment variables
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const siteUrl = process.env.NETLIFY_URL || 'https://heartfelt-biscotti-de2960.netlify.app';
  const redirectUri = `${siteUrl}/api/callback`;

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Error getting token:', tokenData.error_description);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: tokenData.error,
          error_description: tokenData.error_description
        })
      };
    }

    // Redirect back to the admin page with the token
    return {
      statusCode: 302,
      headers: {
        Location: `/admin/#access_token=${tokenData.access_token}&token_type=bearer&expires_in=${tokenData.expires_in || '3600'}`
      },
      body: ''
    };
    
  } catch (err) {
    console.error('Token exchange error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error during token exchange' })
    };
  }
};
