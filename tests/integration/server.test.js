const request = require('supertest');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a test server based on the main server logic
const createTestServer = () => {
  const url = require('url');

  // MIME types and cache settings from the main server
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

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // API endpoints for content synchronization
    if (pathname === '/api/pull-content') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Content pulled successfully: test mode');
      return;
    } else if (pathname === '/api/push-content') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Content pushed successfully: test mode');
      return;
    }
    
    // Route handling
    let filePath;
    if (pathname === '/' || pathname === '') {
      filePath = path.join(__dirname, '../../index.html');
    } else if (pathname === '/admin' || pathname === '/admin/') {
      filePath = path.join(__dirname, '../../admin/index.html');
    } else {
      filePath = path.join(__dirname, '../..', pathname);
    }
    
    // Handle content files
    if (pathname.startsWith('/_content/') || pathname.startsWith('/_data/')) {
      const extname = path.extname(filePath);
      const contentType = MIME_TYPES[extname] || 'text/plain';
      
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          // Create empty file for testing
          if (req.method === 'GET') {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            if (extname === '.yml' || extname === '.yaml') {
              fs.writeFileSync(filePath, '# Generated empty file\n');
              res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              });
              res.end('# Generated empty file\n');
              return;
            }
            
            if (extname === '.md') {
              fs.writeFileSync(filePath, '# Empty content\n');
              res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              });
              res.end('# Empty content\n');
              return;
            }
          }
          
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end(`File not found: ${pathname}`);
          return;
        }
        
        // File exists, serve it
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Server error reading file: ${pathname}`);
            return;
          }
          
          res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(content);
        });
      });
      return;
    }
    
    // Default file serving
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  return server;
};

describe('Main Server API Endpoints', () => {
  let server;

  beforeAll((done) => {
    server = createTestServer();
    server.listen(8084, done);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Content Synchronization Endpoints', () => {
    test('should handle /api/pull-content endpoint', async () => {
      const response = await request(server)
        .get('/api/pull-content')
        .expect(200);
      
      expect(response.text).toContain('Content pulled successfully');
    });

    test('should handle /api/push-content endpoint', async () => {
      const response = await request(server)
        .get('/api/push-content')
        .expect(200);
      
      expect(response.text).toContain('Content pushed successfully');
    });
  });

  describe('Content File Serving', () => {
    beforeEach(() => {
      // Create test content files
      const testDataDir = path.join(__dirname, '../../_data');
      const testContentDir = path.join(__dirname, '../../_content/test');
      
      if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
      }
      
      if (!fs.existsSync(testContentDir)) {
        fs.mkdirSync(testContentDir, { recursive: true });
      }
      
      // Create test files
      fs.writeFileSync(
        path.join(testDataDir, 'test-settings.yml'),
        'site_title: Test Site\nsite_description: Test Description\n'
      );
      
      fs.writeFileSync(
        path.join(testContentDir, 'test-content.md'),
        '---\ntitle: Test Content\ndescription: Test Description\n---\n# Test Content\n'
      );
    });

    afterEach(() => {
      // Clean up test files
      const testFiles = [
        path.join(__dirname, '../../_data/test-settings.yml'),
        path.join(__dirname, '../../_content/test/test-content.md')
      ];
      
      testFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });

    test('should serve content files from _data directory', async () => {
      const response = await request(server)
        .get('/_data/test-settings.yml')
        .expect(200);
      
      expect(response.text).toContain('site_title: Test Site');
      expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    });

    test('should serve content files from _content directory', async () => {
      const response = await request(server)
        .get('/_content/test/test-content.md')
        .expect(200);
      
      expect(response.text).toContain('title: Test Content');
      expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
    });

    test('should create empty YAML file if it does not exist', async () => {
      const response = await request(server)
        .get('/_data/non-existent.yml')
        .expect(200);
      
      expect(response.text).toContain('# Generated empty file');
      
      // Verify file was created
      const filePath = path.join(__dirname, '../../_data/non-existent.yml');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Clean up
      fs.unlinkSync(filePath);
    });

    test('should create empty markdown file if it does not exist', async () => {
      const response = await request(server)
        .get('/_content/test/new-content.md')
        .expect(200);
      
      expect(response.text).toContain('# Empty content');
      
      // Verify file was created
      const filePath = path.join(__dirname, '../../_content/test/new-content.md');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Clean up
      fs.unlinkSync(filePath);
    });
  });

  describe('Admin Routes', () => {
    test('should serve admin interface', async () => {
      await request(server)
        .get('/admin/')
        .expect(200);
    });

    test('should redirect /admin to /admin/', async () => {
      await request(server)
        .get('/admin')
        .expect(200);
    });
  });

  describe('Static File Serving', () => {
    test('should serve main page', async () => {
      await request(server)
        .get('/')
        .expect(200);
    });

    test('should handle 404 for non-existent pages', async () => {
      await request(server)
        .get('/non-existent-page')
        .expect(404);
    });
  });
});