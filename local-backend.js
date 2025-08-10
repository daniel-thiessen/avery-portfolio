#!/usr/bin/env node

// Local CMS backend server for testing content editing without authentication
// This allows editing content locally, then you can manually commit changes to GitHub
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8082; // Different from main server port
const ROOT_DIR = path.resolve(__dirname);

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ensure content directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

ensureDir(path.join(ROOT_DIR, '_content'));
ensureDir(path.join(ROOT_DIR, '_data'));
ensureDir(path.join(ROOT_DIR, '_content/current'));
ensureDir(path.join(ROOT_DIR, '_content/choreography'));
ensureDir(path.join(ROOT_DIR, '_content/projects'));
ensureDir(path.join(ROOT_DIR, '_content/performances'));
ensureDir(path.join(ROOT_DIR, 'images'));

// API health check endpoint
app.get('/api/v1', (req, res) => {
  res.json({ status: 'ok', message: 'Local CMS backend is running' });
});

// List content collections
app.get('/api/v1/collections', (req, res) => {
  try {
    const collections = ['settings', 'about', 'current', 'choreography', 'projects', 'performances', 'contact'];
    res.json(collections.map(name => ({ name })));
  } catch (error) {
    console.error('Error listing collections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content from a collection
app.get('/api/v1/collections/:collection', (req, res) => {
  const { collection } = req.params;
  try {
    let files = [];
    let collectionPath;
    
    // Handle file collections vs folder collections
    if (['settings', 'about', 'contact'].includes(collection)) {
      collectionPath = path.join(ROOT_DIR, '_data');
      files = fs.readdirSync(collectionPath)
        .filter(file => file.endsWith('.yml'))
        .map(file => ({
          path: file,
          name: file.replace('.yml', ''),
          type: 'file'
        }));
    } else {
      collectionPath = path.join(ROOT_DIR, '_content', collection);
      if (fs.existsSync(collectionPath)) {
        files = fs.readdirSync(collectionPath)
          .filter(file => file.endsWith('.md'))
          .map(file => ({
            path: file,
            name: file.replace('.md', ''),
            type: 'file'
          }));
      }
    }
    
    res.json(files);
  } catch (error) {
    console.error(`Error getting collection ${collection}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific file
app.get('/api/v1/collections/:collection/:filename', (req, res) => {
  const { collection, filename } = req.params;
  try {
    let filePath;
    let content;
    
    // Handle file collections vs folder collections
    if (['settings', 'about', 'contact'].includes(collection)) {
      filePath = path.join(ROOT_DIR, '_data', `${filename}.yml`);
    } else {
      filePath = path.join(ROOT_DIR, '_content', collection, `${filename}.md`);
    }
    
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    } else {
      // Create empty file
      if (['settings', 'about', 'contact'].includes(collection)) {
        content = '# Default content\n';
        fs.writeFileSync(filePath, content);
      } else {
        content = '---\ntitle: New Content\ndescription: Add description here\norder: 1\n---\nAdd content here';
        fs.writeFileSync(filePath, content);
      }
    }
    
    res.json({ content });
  } catch (error) {
    console.error(`Error getting file ${filename}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Save a file
app.post('/api/v1/collections/:collection/:filename', express.json(), (req, res) => {
  const { collection, filename } = req.params;
  const { content } = req.body;
  
  try {
    let filePath;
    
    // Handle file collections vs folder collections
    if (['settings', 'about', 'contact'].includes(collection)) {
      filePath = path.join(ROOT_DIR, '_data', `${filename}.yml`);
    } else {
      filePath = path.join(ROOT_DIR, '_content', collection, `${filename}.md`);
    }
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    ensureDir(dir);
    
    // Write file
    fs.writeFileSync(filePath, content);
    console.log(`Saved file: ${filePath}`);
    
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error(`Error saving file ${filename}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
app.delete('/api/v1/collections/:collection/:filename', (req, res) => {
  const { collection, filename } = req.params;
  
  try {
    let filePath;
    
    // Handle file collections vs folder collections
    if (['settings', 'about', 'contact'].includes(collection)) {
      filePath = path.join(ROOT_DIR, '_data', `${filename}.yml`);
    } else {
      filePath = path.join(ROOT_DIR, '_content', collection, `${filename}.md`);
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Media handling (upload)
app.post('/api/v1/media', express.json({ limit: '50mb' }), (req, res) => {
  try {
    const { file, path: mediaPath } = req.body;
    
    // Decode base64 content
    const matches = file.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid file format' });
    }
    
    const buffer = Buffer.from(matches[2], 'base64');
    const filePath = path.join(ROOT_DIR, 'images', mediaPath);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    ensureDir(dir);
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved media: ${filePath}`);
    
    res.json({
      url: `/images/${mediaPath}`,
      path: mediaPath
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Content synchronization endpoints
app.get('/api/v1/sync/pull', (req, res) => {
  exec('node content-sync.js pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error pulling content: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ success: true, message: 'Content pulled successfully', output: stdout });
  });
});

app.get('/api/v1/sync/push', (req, res) => {
  exec('node content-sync.js push', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error pushing content: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ success: true, message: 'Content pushed successfully', output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Local CMS backend running on http://localhost:${PORT}`);
  console.log(`Access the admin interface at http://localhost:8080/admin/`);
});
