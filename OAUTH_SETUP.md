# Setting Up OAuth for Decap CMS

To enable GitHub authentication for Decap CMS (formerly Netlify CMS), you need to set up OAuth authentication. Here's how to do it:

## Option 1: Using Netlify for Authentication (Recommended)

The simplest way to set up authentication is to use Netlify's Identity service, even if your site is hosted on GitHub Pages.

1. Sign up for a Netlify account at [netlify.com](https://www.netlify.com/) if you don't have one
2. Create a new site in Netlify (you don't need to actually host your site there)
   - Go to "Sites" and click "New site from Git"
   - Select GitHub and your repository
   - Configure basic build settings (these don't matter much since we're just using authentication)
   - Deploy the site
   
3. Set up OAuth:
   - Go to Site Settings > Access Control > OAuth
   - Click "Install provider" and select GitHub
   - Register a new OAuth application on GitHub:
     - Go to [GitHub Developer Settings](https://github.com/settings/developers)
     - Click "New OAuth App"
     - Fill in the details:
       - Application name: "Avery Portfolio CMS"
       - Homepage URL: Your GitHub Pages URL (e.g., `https://daniel-thiessen.github.io/avery-portfolio/`)
       - Authorization callback URL: `https://api.netlify.com/auth/done`
     - Click "Register application"
     - Copy the Client ID and Client Secret
   - Return to Netlify and paste the Client ID and Client Secret
   
4. Update your Decap CMS configuration to use Netlify's authentication:
   - In `admin/config.yml`, update the backend configuration:
   ```yaml
   backend:
     name: github
     repo: daniel-thiessen/avery-portfolio
     branch: main
     base_url: https://api.netlify.com
     auth_endpoint: auth
   ```
   
   - In `admin/index.html`, remove any custom OAuth configuration and let Decap CMS handle authentication through Netlify.

## Option 2: Direct GitHub Authentication

For direct GitHub authentication without Netlify:

1. Register a new OAuth application on GitHub:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "Avery Portfolio CMS"
     - Homepage URL: Your GitHub Pages URL
     - Authorization callback URL: Your GitHub Pages URL + `/admin/` (e.g., `https://daniel-thiessen.github.io/avery-portfolio/admin/`)
   - Click "Register application"
   - Copy the Client ID
   
2. Update your Decap CMS configuration:
   - In `admin/index.html`, update the CMS initialization with your Client ID:
   ```javascript
   CMS.init({
     config: {
       backend: {
         name: 'github',
         repo: 'daniel-thiessen/avery-portfolio',
         branch: 'main',
         oauth_client_id: 'YOUR_CLIENT_ID_HERE',
         auth_scope: 'repo'
       },
       // Other config options...
     }
   });
   ```

3. Set up a small OAuth server to handle the authentication flow. You can use:
   - [Netlify's OAuth provider](https://github.com/netlify/netlify-cms-oauth-provider-github)
   - Or deploy a simple OAuth server on a service like Netlify, Vercel, or Heroku

## Testing Authentication

After setting up OAuth:

1. Open your CMS admin page (`/admin/`)
2. Click the login button
3. You should be redirected to GitHub for authentication
4. After authenticating, you should be redirected back to your CMS admin interface

## Troubleshooting

If you encounter authentication errors:

1. Check browser console for specific error messages
2. Ensure your OAuth client ID and callback URLs are correctly configured
3. Check that your repository has the correct permissions
4. Verify that GitHub API access is working by using the debug panel
