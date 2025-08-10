const queryString = require('query-string');
const fetch = require('node-fetch');

// Callback Handler
exports.handler = async (event, context) => {
  // Get the code from the query
  const code = event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: 'Missing code parameter' };
  }

  // Get environment variables
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const siteUrl = process.env.NETLIFY_URL || 'https://heartfelt-biscotti-de2960.netlify.app';
  const mainSiteUrl = process.env.SITE_URL || 'https://daniel-thiessen.github.io/avery-portfolio';
  const redirectUri = `${siteUrl}/.netlify/functions/callback`;

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

    // Return to the GitHub Pages admin page with token
    return {
      statusCode: 302,
      headers: {
        'Location': `${mainSiteUrl}/admin/#access_token=${tokenData.access_token}&token_type=bearer`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
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
