# Local CMS Troubleshooting Guide

If you're experiencing issues with the local CMS, this guide provides solutions to common problems.

## Connection Errors

### Error: "Error connecting to local backend: NetworkError when attempting to fetch resource."

This means the admin interface can't connect to the local backend server on port 8082.

**Solutions:**

1. **Check if the backend server is running:**
   ```bash
   # Check if anything is running on port 8082
   lsof -i :8082
   ```

2. **Start the backend server manually:**
   ```bash
   # Make the script executable
   chmod +x start-cms-backend.sh
   
   # Run the backend server
   ./start-cms-backend.sh
   ```

3. **Check for firewall or network issues:**
   - Ensure your firewall isn't blocking local connections on port 8082
   - Try using 127.0.0.1 instead of localhost in the browser

## CMS Loading Issues

### Error: "Failed to load config.yml (404)"

The CMS configuration is now embedded directly in the HTML, so this error should no longer occur. If it does:

**Solutions:**

1. **Refresh the browser with cache clearing:**
   - Chrome/Edge: Hold Shift and click Refresh, or press Ctrl+F5
   - Firefox: Press Ctrl+Shift+R
   - Safari: Hold Option+Command and press E, then refresh

2. **Check the browser console for more specific errors**

## Content Not Saving

If you're making changes in the CMS but they're not being saved:

**Solutions:**

1. **Check the backend server console for errors**

2. **Verify content directories exist and are writable:**
   ```bash
   # Make sure directories exist
   ls -la _content
   ls -la _data
   
   # Check permissions
   ls -la | grep "_content\\|_data"
   ```

3. **Try creating content directories manually:**
   ```bash
   mkdir -p _content/current _content/choreography _content/projects _content/performances _data
   ```

## Content Not Syncing with GitHub

If changes aren't being pushed to or pulled from GitHub:

**Solutions:**

1. **Check Git configuration:**
   ```bash
   git config user.name
   git config user.email
   
   # Set them if not configured
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

2. **Check Git permissions:**
   ```bash
   # Test GitHub authentication
   ssh -T git@github.com
   ```

3. **Try manual sync:**
   ```bash
   node content-sync.js push
   ```

## Port Conflicts

If you get "port already in use" errors:

**Solutions:**

1. **Find and stop the process using the port:**
   ```bash
   # Find process
   lsof -i :8080
   lsof -i :8082
   
   # Stop the process (replace PID with actual process ID)
   kill PID
   ```

2. **Use different ports:**
   ```bash
   # For main server
   PORT=3000 node server.js
   
   # For CMS backend
   PORT=3001 node local-backend.js
   ```

## Still Having Issues?

If none of these solutions work:

1. Check the browser console (F12 or Cmd+Option+I) for more detailed error messages
2. Look at server logs in the terminal where you started the servers
3. Try starting each server in separate terminals to see more detailed logs
