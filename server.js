const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// Configure MIME types for file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

// Cache control settings by file type
const CACHE_SETTINGS = {
  // Content files - no caching to ensure updated content is served
  '.yml': 'no-cache, no-store, must-revalidate',
  '.yaml': 'no-cache, no-store, must-revalidate',
  '.md': 'no-cache, no-store, must-revalidate',
  '.json': 'no-cache, no-store, must-revalidate',
  
  // HTML and JavaScript - short cache
  '.html': 'max-age=60',
  '.js': 'max-age=600',
  
  // Static assets - longer cache
  '.css': 'max-age=86400',
  '.png': 'max-age=604800',
  '.jpg': 'max-age=604800',
  '.jpeg': 'max-age=604800',
  '.gif': 'max-age=604800',
  '.svg': 'max-age=604800',
  '.ico': 'max-age=604800',
  '.webp': 'max-age=604800',
};

const server = http.createServer((req, res) => {
  const requestTime = new Date().toLocaleTimeString();
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`[${requestTime}] ${req.method} ${pathname}`);
  
  // CORS headers to allow cross-origin requests (for GitHub API, etc)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Support admin path routing to admin/index.html
  let filePath;
  if (pathname === '/' || pathname === '') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin/') {
    filePath = path.join(__dirname, 'admin/index.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }
  
  // Handle requests to content directories specifically
  if (pathname.startsWith('/_content/') || pathname.startsWith('/_data/')) {
    const extname = path.extname(filePath);
    
    // Set appropriate MIME type
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`Content file not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`File not found: ${pathname}`);
        return;
      }
      
      // Serve content file with no-cache headers
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    });
    return;
  }
  
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  const cacheControl = CACHE_SETTINGS[extname] || 'max-age=3600';
  
  // Default file serving logic
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Check if this is a request for a directory and serve index.html if so
        if (pathname.endsWith('/')) {
          const indexPath = path.join(filePath, 'index.html');
          fs.readFile(indexPath, (err, content) => {
            if (err) {
              console.error(`Page not found: ${pathname}`);
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
              res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Cache-Control': cacheControl
              });
              res.end(content, 'utf-8');
            }
          });
          return;
        }
        
        // Page not found
        console.error(`Page not found: ${pathname}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        // Server error
        console.error(`Server error: ${err.code} for ${pathname}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Successful response
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Admin interface available at http://localhost:${PORT}/admin/`);
  console.log(`Press Ctrl+C to stop the server`);
});
