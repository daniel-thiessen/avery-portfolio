# Decap CMS Setup Documentation

## Overview

This repository uses [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) to provide a user-friendly interface for content editing. The CMS is configured to work both in production (using GitHub authentication) and locally (using a test-repo backend).

## Configuration

The CMS configuration is located in `admin/config.yml`. This file defines:

- Collections: Content types that can be edited through the CMS
- Fields: The structure and validation for each content type
- Media settings: Where uploaded images are stored
- Backend settings: How the CMS authenticates and stores content

## Local Development

For local development, a custom backend server (`local-backend.js`) is provided that allows editing content without authentication.

### Starting the Local CMS

1. Run the main site: `npm start` (starts on port 8080)
2. In a separate terminal, start the local backend: `node local-backend.js` (starts on port 8082)
3. Access the CMS at http://localhost:8080/admin/

### How Local Content Editing Works

1. The CMS makes API calls to the local backend server
2. The server reads/writes directly to your local files
3. Changes are immediately reflected in the site
4. You can manually commit these changes to git when ready

## Content Structure

The CMS is configured to handle two types of content:

1. **Data Files**: YAML files stored in the `_data/` directory
   - Used for structured data like site settings, navigation menus, etc.
   - Each file corresponds to a collection in the CMS

2. **Content Collections**: Markdown files stored in the `_content/` directory
   - Used for blog posts, pages, or other content-heavy sections
   - Support front matter (YAML header) and markdown body

## Testing

The repository includes tests to verify that the CMS backend works correctly:

- `tests/integration/content-persistence.test.js`: Tests CRUD operations on the backend API
- `tests/e2e/cms-persistence.test.js`: End-to-end tests verifying all collections

Run tests with: `npm test`

## Production Deployment

In production, the CMS uses GitHub authentication. To set this up:

1. Register a new OAuth application in your GitHub account
2. Set the required environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
3. Deploy your site and the authentication server

## Troubleshooting

If content changes aren't being saved:

1. Check the browser console for errors
2. Verify the local backend server is running
3. Check permissions on the content directories
4. Examine the backend server logs for errors
