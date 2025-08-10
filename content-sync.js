/**
 * Content Synchronization Script
 * 
 * This script helps synchronize content between local CMS edits and GitHub.
 * It can push content changes to GitHub and pull the latest content.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONTENT_DIRS = ['_content', '_data'];
const REPO_URL = 'https://github.com/daniel-thiessen/avery-portfolio.git';
const BRANCH = 'main';
const GIT_USERNAME = process.env.GIT_USERNAME || 'Content Bot';
const GIT_EMAIL = process.env.GIT_EMAIL || 'content-bot@example.com';

// Command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

/**
 * Initialize the content directories
 */
function initContentDirs() {
  CONTENT_DIRS.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Create subdirectories for content types
  const contentTypes = ['current', 'choreography', 'projects', 'performances'];
  contentTypes.forEach(type => {
    const typePath = path.join(__dirname, '_content', type);
    if (!fs.existsSync(typePath)) {
      console.log(`Creating content type directory: ${type}`);
      fs.mkdirSync(typePath, { recursive: true });
    }
  });
}

/**
 * Push content changes to GitHub
 */
function pushChanges() {
  try {
    // Configure git if needed
    execSync(`git config user.name "${GIT_USERNAME}"`, { stdio: 'inherit' });
    execSync(`git config user.email "${GIT_EMAIL}"`, { stdio: 'inherit' });
    
    // Add all content files
    CONTENT_DIRS.forEach(dir => {
      execSync(`git add ${dir}`, { stdio: 'inherit' });
    });
    
    // Check if there are changes to commit
    const status = execSync('git status --porcelain').toString();
    if (!status.trim()) {
      console.log('No changes to commit.');
      return;
    }
    
    // Commit changes
    const timestamp = new Date().toISOString();
    execSync(`git commit -m "Content update: ${timestamp}"`, { stdio: 'inherit' });
    
    // Push to GitHub
    execSync(`git push origin ${BRANCH}`, { stdio: 'inherit' });
    
    console.log('Content successfully pushed to GitHub!');
  } catch (error) {
    console.error('Error pushing content:', error.message);
    process.exit(1);
  }
}

/**
 * Pull latest content from GitHub
 */
function pullChanges() {
  try {
    // Pull latest changes
    execSync(`git pull origin ${BRANCH}`, { stdio: 'inherit' });
    
    console.log('Content successfully pulled from GitHub!');
  } catch (error) {
    console.error('Error pulling content:', error.message);
    process.exit(1);
  }
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Content Sync Tool
-----------------

Available commands:
  node content-sync.js init     - Initialize content directories
  node content-sync.js push     - Push content changes to GitHub
  node content-sync.js pull     - Pull latest content from GitHub
  node content-sync.js help     - Show this help message
  `);
}

// Main execution
switch (command) {
  case 'init':
    initContentDirs();
    break;
  case 'push':
    pushChanges();
    break;
  case 'pull':
    pullChanges();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
