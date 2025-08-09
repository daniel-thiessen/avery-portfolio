// For netlify-identity-widget
const express = require('express');
const bodyParser = require('body-parser');
const queryString = require('query-string');
const fetch = require('node-fetch');

// Auth Handler for GitHub
exports.handler = async (event, context) => {
  // Check method
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get environment variables
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: 'OAuth credentials not properly configured'
    };
  }

  // Create GitHub OAuth URL
  const authEndpoint = 'https://github.com/login/oauth/authorize';
  const siteUrl = process.env.NETLIFY_URL || 'https://heartfelt-biscotti-de2960.netlify.app';
  const redirectUri = `${siteUrl}/api/callback`;
  
  // Build the authorization URL
  const queryParams = queryString.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    response_type: 'code',
    state: 'dcmsauth' + Math.random().toString(36).substring(2)
  });

  // Redirect to GitHub for authorization
  return {
    statusCode: 302,
    headers: {
      Location: `${authEndpoint}?${queryParams}`,
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({})
  };
};
