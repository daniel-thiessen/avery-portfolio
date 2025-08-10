// Simple debug handler for OAuth requests
console.log('Auth endpoint called');
console.log('Query parameters:', window.location.search);

// Parse query parameters
const urlParams = new URLSearchParams(window.location.search);
const provider = urlParams.get('provider');
const code = urlParams.get('code');
const state = urlParams.get('state');

// Log the parameters
document.getElementById('auth-info').innerHTML = `
  <h2>Authentication Request Received</h2>
  <p>Provider: ${provider || 'Not provided'}</p>
  <p>Code: ${code ? 'Present (hidden for security)' : 'Not provided'}</p>
  <p>State: ${state || 'Not provided'}</p>
  <p>This is a debug page to see the OAuth parameters. In production, this would redirect back to the CMS.</p>
  <button onclick="window.location.href = '/avery-portfolio/admin/'">Return to CMS</button>
`;

// In production, you would make a token exchange request to GitHub API
// and return the result to the CMS
