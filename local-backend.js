#!/usr/bin/env node

/**
 * Local CMS Backend Server
 * 
 * This server provides a backend API for Decap CMS (formerly Netlify CMS) to edit content
 * locally without requiring authentication. It handles all CRUD operations for both
 * data files (YAML) and content collections (Markdown).
 * 
 * Content changes made through the CMS admin interface will be persisted to the appropriate
 * files in the _data/ or _content/ directories.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

/**
 * Determines if a collection is a data file or content collection
 * @param {string} collection - The collection name
 * @param {string|undefined} slug - The slug (if any)
 * @returns {boolean} - True if it's a data file, false if it's a content collection
 */
function isDataFileCollection(collection, slug) {
  // Fallback hardcoded lists
  const contentCollections = ['current', 'choreography', 'projects', 'performances'];
  const knownDataCollections = ['settings', 'about', 'contact'];
  
  // Try to get collections from config.yml
  let configContentCollections = [];
  try {
    const configPath = path.join(__dirname, 'admin', 'config.yml');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      // Look for collections in the YAML - this is a simple extraction, not a full YAML parser
      const collectionMatches = configContent.match(/collections:[\s\S]+?(?=backend:|publish_mode:|media_folder:|public_folder:|$)/);
      if (collectionMatches) {
        const collectionsSection = collectionMatches[0];
        
        // Extract content collections (those with folder: prefix)
        const folderMatches = collectionsSection.match(/name: ([a-zA-Z0-9_-]+)[\s\S]*?folder:/g);
        if (folderMatches) {
          folderMatches.forEach(match => {
            const nameMatch = match.match(/name: ([a-zA-Z0-9_-]+)/);
            if (nameMatch && nameMatch[1]) {
              configContentCollections.push(nameMatch[1]);
            }
          });
        }
      }
    }
  } catch (error) {
    console.warn('Error reading config.yml:', error.message);
  }
  
  // Use config collections if available, otherwise use hardcoded lists
  const effectiveContentCollections = configContentCollections.length > 0 
    ? configContentCollections 
    : contentCollections;
  
  // A collection is a data file if:
  // 1. It's one of the known data collections, or
  // 2. It's not one of the content collections AND either it has no slug or it ends with '-test'
  return knownDataCollections.includes(collection) || 
         (!effectiveContentCollections.includes(collection) && 
          (!slug || collection.endsWith('-test')));
}

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
    // Determine if this is a data file or content collection
    const isDataFile = isDataFileCollection(collection, slug);
    
    if (isDataFile) {
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
    // Determine if this is a data file or content collection
    const isDataFile = isDataFileCollection(collection, slug);
    
    if (isDataFile) {
      // Handle _data files
      const filePath = path.join(__dirname, '_data', `${collection}.yml`);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      console.log(`Saving data file: ${filePath}`);
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
app.delete('/api/v1/entries/:collection/:slug?', (req, res) => {
  const { collection, slug } = req.params;
  
  try {
    let filePath;
    
    // Determine if this is a data file or content collection
    const isDataFile = isDataFileCollection(collection, slug);
    
    if (isDataFile) {
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
