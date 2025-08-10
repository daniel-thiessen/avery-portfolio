const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// We need to create a testable version of the local backend
const createLocalBackend = () => {
  const app = express();
  const cors = require('cors');
  
  // Enable CORS for all routes
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Get file contents
  app.get('/api/v1/entries/:collection/:slug?', (req, res) => {
    const { collection, slug } = req.params;
    
    try {
      // Check if it's a data file collection
      const isDataFile = collection === 'settings' || collection === 'about' || collection === 'contact' ||
                        collection.startsWith('test-settings') || collection.startsWith('test-');
      
      if (isDataFile) {
        // Handle _data files - support both exact names and prefixed names for testing
        const fileName = `${collection}.yml`;
        const filePath = path.join(__dirname, '../../_data', fileName);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.json({ data: content });
        } else {
          res.status(404).json({ error: 'File not found' });
        }
      } else {
        // Handle _content collections
        const contentDir = path.join(__dirname, '../../_content', collection);
        
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
      // Check if it's a data file collection
      const isDataFile = collection === 'settings' || collection === 'about' || collection === 'contact' ||
                        collection.startsWith('test-settings') || collection.startsWith('test-');
      
      if (isDataFile) {
        // Handle _data files - support both exact names and prefixed names for testing
        const fileName = `${collection}.yml`;
        const filePath = path.join(__dirname, '../../_data', fileName);
        const dir = path.dirname(filePath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, data, 'utf8');
        res.json({ success: true, path: filePath });
      } else {
        // Handle _content collections
        const contentDir = path.join(__dirname, '../../_content', collection);
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
      
      // Check if it's a data file collection
      const isDataFile = collection === 'settings' || collection === 'about' || collection === 'contact' ||
                        collection.startsWith('test-settings') || collection.startsWith('test-');
      
      if (isDataFile) {
        // Handle _data files
        const fileName = `${collection}.yml`;
        filePath = path.join(__dirname, '../../_data', fileName);
      } else {
        filePath = path.join(__dirname, '../../_content', collection, `${slug}.md`);
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

  return app;
};

describe('Local CMS Backend', () => {
  let app;

  beforeAll(() => {
    app = createLocalBackend();
  });

  beforeEach(() => {
    // Clean up test files before each test
    const testFiles = [
      path.join(__dirname, '../../_data/test-settings.yml'),
      path.join(__dirname, '../../_content/test/test-item.md')
    ];
    
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  afterEach(() => {
    // Clean up test files after each test
    const testFiles = [
      path.join(__dirname, '../../_data/test-settings.yml'),
      path.join(__dirname, '../../_content/test/test-item.md')
    ];
    
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  describe('Content CRUD Operations', () => {
    describe('Data Files (_data)', () => {
      test('should create a new settings file', async () => {
        const testData = 'site_title: Test Portfolio\nsite_description: Test Description\n';
        
        const response = await request(app)
          .put('/api/v1/entries/test-settings')
          .send({ data: testData })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.path).toContain('test-settings.yml');
        
        // Verify file was created
        const filePath = path.join(__dirname, '../../_data/test-settings.yml');
        expect(fs.existsSync(filePath)).toBe(true);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        expect(fileContent).toContain('site_title: Test Portfolio');
      });

      test('should read an existing settings file', async () => {
        // Create test file first
        const testData = 'site_title: Test Portfolio\nsite_description: Test Description\n';
        const filePath = path.join(__dirname, '../../_data/test-settings.yml');
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, testData, 'utf8');
        
        // Test reading the file
        const response = await request(app)
          .get('/api/v1/entries/test-settings')
          .expect(200);
        
        expect(response.body.data).toContain('site_title: Test Portfolio');
      });

      test('should update an existing settings file', async () => {
        // Create initial file
        const initialData = 'site_title: Initial Title\n';
        const filePath = path.join(__dirname, '../../_data/test-settings.yml');
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, initialData, 'utf8');
        
        // Update the file
        const updatedData = 'site_title: Updated Title\nsite_description: New Description\n';
        
        const response = await request(app)
          .put('/api/v1/entries/test-settings')
          .send({ data: updatedData })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        
        // Verify file was updated
        const fileContent = fs.readFileSync(filePath, 'utf8');
        expect(fileContent).toContain('Updated Title');
        expect(fileContent).toContain('New Description');
        expect(fileContent).not.toContain('Initial Title');
      });

      test('should delete a settings file', async () => {
        // Create test file first
        const testData = 'site_title: Test Portfolio\n';
        const filePath = path.join(__dirname, '../../_data/test-settings.yml');
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, testData, 'utf8');
        
        // Delete the file
        const response = await request(app)
          .delete('/api/v1/entries/test-settings')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.deleted).toContain('test-settings.yml');
        
        // Verify file was deleted
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });

    describe('Content Files (_content)', () => {
      test('should create a new content item', async () => {
        const testContent = `---
title: Test Project
description: A test project description
thumbnail: /images/test.jpg
order: 1
---
# Test Project

This is test content for a project.`;
        
        const response = await request(app)
          .put('/api/v1/entries/test/test-item')
          .send({ data: testContent })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.path).toContain('test-item.md');
        
        // Verify file was created
        const filePath = path.join(__dirname, '../../_content/test/test-item.md');
        expect(fs.existsSync(filePath)).toBe(true);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        expect(fileContent).toContain('title: Test Project');
        expect(fileContent).toContain('This is test content');
      });

      test('should read an existing content item', async () => {
        // Create test file first
        const testContent = `---
title: Test Project
description: A test project
---
# Test Content`;
        
        const filePath = path.join(__dirname, '../../_content/test/test-item.md');
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, testContent, 'utf8');
        
        // Test reading the file
        const response = await request(app)
          .get('/api/v1/entries/test/test-item')
          .expect(200);
        
        expect(response.body.data).toContain('title: Test Project');
        expect(response.body.data).toContain('# Test Content');
      });

      test('should list all items in a collection', async () => {
        // Create test files
        const contentDir = path.join(__dirname, '../../_content/test');
        
        if (!fs.existsSync(contentDir)) {
          fs.mkdirSync(contentDir, { recursive: true });
        }
        
        const files = ['item1.md', 'item2.md', 'item3.md'];
        files.forEach(file => {
          fs.writeFileSync(
            path.join(contentDir, file),
            `---\ntitle: ${file}\n---\n# Content`,
            'utf8'
          );
        });
        
        // Test listing collection
        const response = await request(app)
          .get('/api/v1/entries/test')
          .expect(200);
        
        expect(response.body.entries).toHaveLength(3);
        expect(response.body.entries.map(e => e.slug)).toContain('item1');
        expect(response.body.entries.map(e => e.slug)).toContain('item2');
        expect(response.body.entries.map(e => e.slug)).toContain('item3');
        
        // Clean up
        files.forEach(file => {
          fs.unlinkSync(path.join(contentDir, file));
        });
      });

      test('should delete a content item', async () => {
        // Create test file first
        const testContent = '---\ntitle: Test\n---\n# Content';
        const filePath = path.join(__dirname, '../../_content/test/test-item.md');
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, testContent, 'utf8');
        
        // Delete the file
        const response = await request(app)
          .delete('/api/v1/entries/test/test-item')
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.deleted).toContain('test-item.md');
        
        // Verify file was deleted
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });

    describe('Error Handling', () => {
      test('should return 404 for non-existent data file', async () => {
        const response = await request(app)
          .get('/api/v1/entries/test-non-existent-data')
          .expect(404);
        
        expect(response.body.error).toBe('File not found');
      });

      test('should return 404 for non-existent content item', async () => {
        const response = await request(app)
          .get('/api/v1/entries/test/non-existent')
          .expect(404);
        
        expect(response.body.error).toBe('File not found');
      });

      test('should return 404 when deleting non-existent file', async () => {
        const response = await request(app)
          .delete('/api/v1/entries/test/non-existent')
          .expect(404);
        
        expect(response.body.error).toBe('File not found');
      });

      test('should return empty array for non-existent collection', async () => {
        const response = await request(app)
          .get('/api/v1/entries/non-existent-collection')
          .expect(200);
        
        expect(response.body.entries).toEqual([]);
      });
    });
  });
});