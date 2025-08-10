# Avery Smith Portfolio

A minimalist artist portfolio website designed to showcase artistic work in a clean, elegant interface. The site features responsive design, image carousels, video integration, contact form, and **simplified local content management**.

## Features

- Responsive design that works on all devices
- Clean, minimalist aesthetic
- Image and video galleries organized by category
- Contact form (powered by FormSubmit)
- **🆕 Simplified local content management**
- **🆕 Content synchronization with GitHub**
- Optimized for fast loading
- Easy deployment to GitHub Pages

## Content Management

This site now includes a simplified content management approach:

- **Local Admin Interface**: Access at `/admin/` to manage all content locally
- **No Authentication Required**: Easy editing without OAuth setup
- **Manual Synchronization**: Push changes to GitHub when ready
- **User-Friendly**: Edit text, images, and videos without coding
- **Backup & Versioning**: All changes can be tracked in Git history

## Quick Start

### For Content Editors (Local Development)
1. Clone the repository and run `./start.sh`
2. Access the admin interface at `http://localhost:8080/admin/`
3. Edit content using the visual interface
4. Use the content sync panel (bottom-right of site) to push changes to GitHub

### For Viewing the Live Site
- Navigate to `https://daniel-thiessen.github.io/avery-portfolio/`
- Content is automatically loaded from GitHub repository

### For Developers
The site works with content stored in the repository:
- Content loads from GitHub repository's `_data/` and `_content/` folders
- Uses GitHub API to fetch content dynamically
- Local development environment for testing and content editing
- Enhanced cache busting to ensure fresh content is displayed

### Running Locally
```bash
# Make sure start.sh is executable
chmod +x start.sh

# Install dependencies
npm install

# Run the local development server and CMS backend
./start.sh

# Or to start with admin interface
./start.sh -a

# To specify a different port
./start.sh -p 3000
```

### Content Synchronization

To synchronize content between your local environment and GitHub:

```bash
# Pull latest content from GitHub
npm run pull-content

# Push your local changes to GitHub
npm run push-content
```

Or use the floating control panel that appears when running locally.

## Table of Contents

- [Local Development](#local-development)
- [GitHub Pages Deployment](#github-pages-deployment)
  - [Initial Setup](#initial-setup)
  - [How to Deploy](#how-to-deploy)
  - [Troubleshooting](#troubleshooting-deployment)
  - [Custom Domain](#custom-domain-optional)
- [Contact Form Integration](#contact-form-integration)
  - [How It Works](#how-the-form-works)
  - [Setup Instructions](#contact-form-setup-instructions)
  - [Troubleshooting](#troubleshooting-contact-form)
  - [Privacy Considerations](#privacy-considerations)

## Local Development

To run this site locally:

```bash
# Using the included start script (recommended)
chmod +x start.sh
./start.sh

# Or with Node.js directly
node server.js
```

The start script provides these options:
- `-p PORT` - Specify a custom port (default: 8080)
- `-a` - Open the admin interface instead of the main site

Examples:
```bash
# Run on port 3000
./start.sh -p 3000

# Open the admin interface directly
./start.sh -a

# Run admin on port 5000
./start.sh -p 5000 -a
```

The server will automatically open your browser to the appropriate page.

## GitHub Pages Deployment

This site is configured for deployment on GitHub Pages using manual deployment workflows.

### Initial Setup

1. **Create a GitHub Repository**:
   - Go to GitHub and create a new repository
   - Push your code to this repository

2. **Configure GitHub Pages**:
   - Go to your repository's Settings
   - Navigate to "Pages" in the sidebar
   - Under "Build and deployment", set:
     - Source: "Deploy from a branch"
     - Branch: "gh-pages" (this will be created by the workflow)
   - Click "Save"

3. **Enable GitHub Actions**:
   - In repository Settings, go to "Actions" > "General"
   - Ensure "Allow all actions and reusable workflows" is selected
   - Click "Save"

### How to Deploy

Whenever you want to deploy a new version of your site:

1. Make your changes and push them to the main branch
2. Go to the "Actions" tab in your GitHub repository
3. Select the "Manual Deploy to GitHub Pages" workflow from the left sidebar
4. Click the "Run workflow" button
5. In the dropdown:
   - Select the branch you want to deploy (usually "main")
   - Optionally add deployment notes
6. Click "Run workflow" to start the deployment process

The workflow will:

- Check out your code
- Set up Node.js (in case you need it in the future)
- Install any dependencies if you have a package.json file
- Run any build scripts if specified in package.json
- Deploy the site to the gh-pages branch
- GitHub Pages will automatically update with the new content

### Troubleshooting Deployment

- **Deployment fails**: Check the Actions logs for error messages
- **Site not updating**: It may take a few minutes for GitHub Pages to reflect changes
- **404 errors**: Make sure your repository is public and GitHub Pages is properly configured

### Custom Domain (Optional)

To use a custom domain with your GitHub Pages site:

1. Go to repository Settings > Pages
2. Under "Custom domain", enter your domain name (e.g., `www.yourdomain.com`)
3. Click "Save"
4. Add a file named `CNAME` to your repository with your domain name as the content (e.g., `www.yourdomain.com`)

#### DNS Configuration

For a **subdomain** like `www.yourdomain.com` or `portfolio.yourdomain.com`:

- Create a **CNAME record** at your domain registrar with:
  - Name/Host: `www` or your subdomain (e.g., `portfolio`)
  - Value/Target: `yourusername.github.io` (your GitHub Pages domain)
  - TTL: 3600 (or automatic)

For an **apex domain** like `yourdomain.com` (without www):

- Create **A records** pointing to GitHub Pages' IP addresses:
  - Name/Host: `@` (or leave blank, depending on your registrar)
  - Value/Target:
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`
  - TTL: 3600 (or automatic)

- Alternatively, some registrars support **ALIAS/ANAME records** for apex domains:
  - Name/Host: `@`
  - Value/Target: `yourusername.github.io`

## Contact Form Integration

### How the Form Works

Since GitHub Pages only hosts static websites and doesn't support server-side processing, we've integrated with [FormSubmit.co](https://formsubmit.co/) to handle form submissions. FormSubmit is a free service that allows you to receive form submissions directly to your email without any server-side code.

### Contact Form Setup Instructions

#### 1. Email Protection

The form has been set up with a secure token instead of a direct email address to protect against spam:

```javascript
// In main.js
form.action = 'https://formsubmit.co/7901188d6d31702f00ad3357f2698284';
```

This token is already linked to your email address in the contact section of `js/config.js`, so you don't need to modify the form action.

#### 2. First Form Submission

When someone submits the form for the first time, FormSubmit will send you a confirmation email to activate the endpoint. You need to:

1. Check your inbox (and spam folder) for an email from FormSubmit
2. Click the activation link in that email to confirm you want to receive submissions

#### 3. Additional Form Configuration (Optional)

You can customize your form behavior by updating these parameters in `js/main.js`:

```javascript
// Find this code section (around line 490)
const disableAutoreply = document.createElement('input');
disableAutoreply.type = 'hidden';
disableAutoreply.name = '_autoresponse';
disableAutoreply.value = 'Thank you for your message. I will get back to you soon!';
```

FormSubmit supports many configuration options:

- `_subject` - Customize the email subject
- `_autoresponse` - Set an auto-response message
- `_cc` - Send a copy to another email
- And more at [FormSubmit documentation](https://formsubmit.co/)

#### How Form Submission Works

1. When visitors fill out your contact form and click "Send Message"
2. FormSubmit processes the submission and sends it to your email
3. The visitor is redirected back to your site with a success message
4. You receive the message details in your inbox

### Troubleshooting Contact Form

- **Not receiving emails?** Check your spam folder and make sure you've activated the FormSubmit endpoint.
- **Getting 404 errors when testing locally?** This is expected. The form is configured to use FormSubmit's thank-you page during local testing since FormSubmit cannot redirect to localhost URLs. In production (on GitHub Pages), it will properly redirect back to your site.
- **Form not submitting on GitHub Pages?** Make sure your site is properly deployed with the correct URL.

### Privacy Considerations

FormSubmit's free tier adds a small "Powered by FormSubmit" branding to emails. If you want to remove this, you can upgrade to their paid plan.

## File Structure

```text
├── index.html           # Main HTML file
├── style.css            # Main CSS file
├── js/
│   ├── main.js          # Main JavaScript file
│   └── config.js        # Site configuration
├── .github/
│   └── workflows/
│       └── manual-deploy.yml  # GitHub Actions workflow
└── _config.yml          # Jekyll configuration
```

## Credits

- Placeholder images from [Unsplash](https://unsplash.com/)
- Icons: Custom minimal SVG icons
- Form processing by [FormSubmit](https://formsubmit.co/)
