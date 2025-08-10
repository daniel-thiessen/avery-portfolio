# OAuth Authentication Fix

I've fixed the authentication issue with Decap CMS (formerly Netlify CMS). The error `Invalid event name 'login'` was occurring because Decap CMS 3.0.0 has changed some event names compared to previous versions of Netlify CMS.

## Changes Made:

1. Updated event listeners in `admin/index.html`:
   - Changed `login` event to `authSuccess`
   - Added `authFailure` event handler
   
2. Simplified CMS initialization:
   - Removed redundant configuration in JavaScript
   - Now relying on `config.yml` for configuration

3. Updated backend config in `admin/config.yml`:
   - Added Netlify's authentication service configuration
   - Set proper base_url and auth_endpoint

4. Created `OAUTH_SETUP.md` with detailed instructions for:
   - Setting up OAuth with Netlify (recommended)
   - Alternative direct GitHub OAuth setup
   - Troubleshooting authentication issues

## Next Steps:

1. Follow instructions in `OAUTH_SETUP.md` to set up OAuth authentication
2. Create a new OAuth application on GitHub
3. Configure Netlify for authentication service
4. Update config.yml with your OAuth Client ID if needed

After completing these steps, authentication should work properly with Decap CMS 3.0.0.
