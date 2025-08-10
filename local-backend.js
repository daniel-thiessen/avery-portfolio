#!/usr/bin/env node

// Local CMS backend server for testing content editing without authentication
// This allows editing content locally, then you can manually commit changes to GitHub
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8082; // Different from main server port

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Simple file-based backend for local development
// This provides basic CRUD operations for content files

// Get file contents
app.get('/api/v1/entries/:collection/:slug?', (req, res) => {
  const { collection, slug } = req.params;
  
  try {
    if (collection === 'settings' || collection === 'about' || collection === 'contact') {
      // Handle _data files
      const filePath = path.join(__dirname, '_data', `${collection}.yml`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ data: content });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      // Handle _content collections
      const contentDir = path.join(__dirname, '_content', collection);
      
      if (slug) {
        // Get specific file
        const filePath = path.join(contentDir, `${slug}.md`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.json({ data: content });
        } else {
          res.status(404).json({ error: 'File not found' });
        }
      } else {
        // List all files in collection
        if (fs.existsSync(contentDir)) {
          const files = fs.readdirSync(contentDir)
            .filter(file => file.endsWith('.md'))
            .map(file => ({
              slug: path.basename(file, '.md'),
              path: file
            }));
          res.json({ entries: files });
        } else {
          res.json({ entries: [] });
        }
      }
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save file contents
app.put('/api/v1/entries/:collection/:slug?', (req, res) => {
  const { collection, slug } = req.params;
  const { data } = req.body;
  
  try {
    if (collection === 'settings' || collection === 'about' || collection === 'contact') {
      // Handle _data files
      const filePath = path.join(__dirname, '_data', `${collection}.yml`);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, data, 'utf8');
      res.json({ success: true, path: filePath });
    } else {
      // Handle _content collections
      const contentDir = path.join(__dirname, '_content', collection);
      const filePath = path.join(contentDir, `${slug}.md`);
      
      // Ensure directory exists
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, data, 'utf8');
      res.json({ success: true, path: filePath });
    }
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete('/api/v1/entries/:collection/:slug', (req, res) => {
  const { collection, slug } = req.params;
  
  try {
    let filePath;
    
    if (collection === 'settings' || collection === 'about' || collection === 'contact') {
      filePath = path.join(__dirname, '_data', `${collection}.yml`);
    } else {
      filePath = path.join(__dirname, '_content', collection, `${slug}.md`);
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, deleted: filePath });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local CMS backend running on http://localhost:${PORT}`);
  console.log(`Access the admin interface at http://localhost:8080/admin/`);
});
