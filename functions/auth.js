const queryString = require('query-string');

// Auth Handler for GitHub
exports.handler = async (event, context) => {
  // Get parameters from Decap CMS
  const params = event.queryStringParameters;
  const provider = params.provider || 'github';
  const scope = params.scope || 'repo,user';
  
  // Get environment variables
  const clientId = process.env.OAUTH_CLIENT_ID;
  
  if (!clientId) {
    return {
      statusCode: 500,
      body: 'OAuth client ID not configured'
    };
  }

  // Create GitHub OAuth URL
  const authEndpoint = 'https://github.com/login/oauth/authorize';
  const siteUrl = process.env.NETLIFY_URL || 'https://heartfelt-biscotti-de2960.netlify.app';
  const redirectUri = `${siteUrl}/.netlify/functions/callback`;
  
  // Build the authorization URL
  const queryParams = queryString.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    response_type: 'code',
    state: 'dcmsauth' + Math.random().toString(36).substring(2)
  });

  console.log(`Redirecting to ${authEndpoint}?${queryParams}`);

  // Redirect to GitHub for authorization
  return {
    statusCode: 302,
    headers: {
      Location: `${authEndpoint}?${queryParams}`,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  };
};
