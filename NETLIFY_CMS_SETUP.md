# Netlify CMS Setup Instructions

This document explains how to set up and use the Netlify CMS with GitHub OAuth authentication for the Avery Smith Portfolio website.

## What We've Implemented

✅ **Netlify CMS Integration**
- Created admin interface at `/admin/`
- Set up content collections for all portfolio sections
- Migrated existing content to CMS-manageable format
- Created content loader that works with both CMS and fallback data

✅ **Content Structure**
- Site settings (`_data/settings.yml`)
- About section (`_data/about.yml`)
- Contact information (`_data/contact.yml`)
- Current work items (`_content/current/`)
- Choreography pieces (`_content/choreography/`)
- Projects (`_content/projects/`)
- Performances (`_content/performances/`)

✅ **Backward Compatibility**
- Site works with original `config.js` if CMS content fails to load
- No changes to existing UI/UX
- Minimal code changes to support dual content sources

## GitHub OAuth App Setup

To enable admin login via GitHub, you need to create a GitHub OAuth application:

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: `Avery Portfolio CMS`
   - **Homepage URL**: `https://daniel-thiessen.github.io/avery-portfolio`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
4. Click "Register application"
5. Note down the **Client ID** and **Client Secret**

### Step 2: Configure Netlify CMS

1. In the repository, edit `admin/config.yml`
2. Replace the test backend with the GitHub backend:

```yaml
backend:
  name: github
  repo: daniel-thiessen/avery-portfolio
  branch: main
```

### Step 3: Deploy with Netlify (Recommended)

For the easiest OAuth setup, deploy the site to Netlify:

1. Connect your GitHub repository to Netlify
2. In Netlify site settings, go to "Access control" → "OAuth"
3. Click "Install provider" → "GitHub"
4. Enter your GitHub OAuth app's Client ID and Client Secret
5. The admin interface will now work with GitHub authentication

### Alternative: Self-hosted OAuth

If not using Netlify, you can set up your own OAuth endpoint:

1. Create an OAuth authentication service (examples: [netlify-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider))
2. Deploy the service and get the endpoint URL
3. Update `admin/config.yml`:

```yaml
backend:
  name: github
  repo: daniel-thiessen/avery-portfolio
  branch: main
  auth_endpoint: https://your-oauth-service.com/auth
```

## Using the CMS

### Accessing the Admin Interface

1. Navigate to `https://your-site.com/admin/`
2. Log in with your GitHub account
3. You'll see all content collections in the sidebar

### Managing Content

- **Site Settings**: Update site title and description
- **About**: Edit bio, profile image, and personal information
- **Contact**: Update contact details and social media links
- **Content Sections**: Add, edit, or delete items in Current Work, Choreography, Projects, and Performances

### Content Format

All content items support:
- Title
- Thumbnail image
- Full-size image (optional, defaults to thumbnail)
- Video URL (YouTube embed format)
- Description
- Order (for sorting)

## Local Development

For local testing without OAuth:

1. The CMS is configured with `test-repo` backend by default
2. This allows you to test the interface without authentication
3. Changes won't be saved to the repository
4. Switch to GitHub backend for production

## Troubleshooting

### CMS Not Loading
- Check that external scripts can load (CDN not blocked)
- Verify OAuth configuration if using GitHub backend
- Check browser console for error messages

### Content Not Displaying
- The site falls back to `config.js` if CMS content fails
- Check browser console for loading errors
- Verify file paths in content files

### Authentication Issues
- Ensure GitHub OAuth app callback URL is correct
- Verify Client ID and Secret are properly configured
- Check that the GitHub user has repository access

## File Structure

```
/
├── admin/
│   ├── index.html          # CMS admin interface
│   └── config.yml          # CMS configuration
├── _data/
│   ├── settings.yml        # Site settings
│   ├── about.yml          # About section content
│   └── contact.yml        # Contact information
├── _content/
│   ├── current/           # Current work items
│   ├── choreography/      # Choreography pieces
│   ├── projects/          # Project items
│   └── performances/      # Performance items
└── js/
    ├── content-loader.js  # CMS content loader
    ├── config.js         # Original config (fallback)
    └── main.js           # Updated main script
```

## Benefits

1. **Easy Content Management**: Non-technical users can update content
2. **GitHub Integration**: Content changes create Git commits
3. **Backup & Version Control**: All content changes are tracked
4. **No Database Required**: Content stored as files in the repository
5. **Fast Loading**: Static files, no server-side processing needed
6. **Secure**: Authentication via GitHub, no additional user management