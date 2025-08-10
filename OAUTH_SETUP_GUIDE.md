# Setting up GitHub OAuth for Decap CMS on GitHub Pages

This document provides detailed instructions for setting up GitHub OAuth for Decap CMS (formerly Netlify CMS) on a GitHub Pages site.

## Prerequisites

1. A GitHub repository with GitHub Pages enabled
2. Admin access to the repository settings
3. A GitHub account that can create OAuth apps

## Step 1: Create a GitHub OAuth App

1. Go to your GitHub account settings: https://github.com/settings/profile
2. Navigate to "Developer settings" > "OAuth Apps"
3. Click "New OAuth App"
4. Fill in the following details:
   - **Application name**: `[Your Site Name] CMS`
   - **Homepage URL**: `https://[your-username].github.io/[your-repo]`
   - **Application description**: Optional description
   - **Authorization callback URL**: `https://[your-username].github.io/[your-repo]/admin/`
5. Click "Register application"
6. After registration, you'll see your Client ID
7. Generate a new Client Secret by clicking "Generate a new client secret"
8. **IMPORTANT**: Save both the Client ID and Client Secret, as you won't be able to see the Client Secret again

## Step 2: Set Up Authentication Backend

For GitHub Pages, you need an authentication service that can exchange the OAuth code for a token. There are several options:

### Option 1: Use Netlify Functions (Recommended)

If you're also deploying to Netlify, you can use Netlify Identity or Functions:

1. Create a Netlify site connected to your GitHub repo
2. In your `config.yml`, set:

```yaml
backend:
  name: github
  repo: [username]/[repo]
  branch: main
  base_url: https://your-netlify-site-name.netlify.app
  auth_endpoint: api/auth
```

3. Create a Netlify function in your repo at `netlify/functions/auth.js`

### Option 2: Use a Serverless OAuth Provider

You can use a service like:
- [Netlify](https://github.com/netlify/netlify-cms-github-oauth-provider)
- [Statically.io](https://github.com/staticallyio/staticaly-oauth)
- [Vercel](https://github.com/ublabs/netlify-cms-oauth)

### Option 3: Set Up Your Own OAuth Server

For complete control, you can set up your own OAuth server:

1. Create a server that implements the OAuth flow (Express.js, Flask, etc.)
2. Deploy it to a service like Heroku, Vercel, or any hosting provider
3. Set your `base_url` in `config.yml` to your server's URL

## Step 3: Configure Decap CMS

Update your `admin/config.yml`:

```yaml
backend:
  name: github
  repo: [username]/[repo]
  branch: main
  base_url: [your-oauth-provider-url]
  auth_endpoint: api/auth # Adjust according to your OAuth provider
```

## Step 4: Create an Optimized Admin Interface

Create or update your `admin/index.html`:

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
</head>
<body>
  <!-- Include the script that builds the page and powers Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  
  <!-- Optional: Debug info for troubleshooting -->
  <script>
    if (window.location.hash && window.location.hash.includes('error=')) {
      console.error('Auth Error:', window.location.hash);
    }
    
    // Monitor initialization
    window.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, waiting for CMS initialization');
    });
  </script>
</body>
</html>
```

## Troubleshooting

### Common Issues

1. **Infinite Loading Spinner**:
   - Check browser console for errors
   - Verify your OAuth app settings match your site URL exactly
   - Ensure CORS is properly configured on your OAuth server

2. **"No Auth Provider Found" Error**:
   - Check that your `backend` configuration is correct
   - Verify your `base_url` and `auth_endpoint` are correctly set

3. **"Authorization Error"**:
   - Ensure your OAuth app's callback URL exactly matches your admin path
   - Check that your Client ID and Client Secret are correctly configured

### Debug Steps

1. Open browser developer tools and check the console for errors
2. Add a debug flag to your CMS URL: `/admin/#debug`
3. Check network requests during the authentication flow
4. Verify all URLs are correctly formatted and use HTTPS

## Additional Resources

- [Decap CMS Authentication Documentation](https://decapcms.org/docs/backends-overview/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Sample OAuth Provider Implementation](https://github.com/vencax/netlify-cms-github-oauth-provider)

## Local Development Testing

For local development, you'll need to:

1. Create a second OAuth app for local testing with callback URL `http://localhost:your-port/admin/`
2. Run a local OAuth server or proxy service
3. Update your local `config.yml` to point to your local OAuth server
