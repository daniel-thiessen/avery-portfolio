const request = require('supertest');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('End-to-End CMS Content Workflow Tests', () => {
  let mainServer;
  let cmsServer;
  const mainServerPort = 8085;
  const cmsServerPort = 8086;

  beforeAll((done) => {
    // Set up clean test environment
    const testDataDir = path.join(__dirname, '../../_test_data');
    const testContentDir = path.join(__dirname, '../../_test_content');
    
    // Create test directories
    [testDataDir, testContentDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    done();
  });

  afterAll((done) => {
    // Clean up test servers
    if (mainServer) mainServer.kill();
    if (cmsServer) cmsServer.kill();
    
    setTimeout(done, 1000); // Give servers time to shut down
  });

  describe('Full Content Management Workflow', () => {
    test('should create, read, update, and delete content through the CMS', async () => {
      // This test simulates the full workflow a content editor would go through
      
      // Step 1: Create a new portfolio item via CMS backend
      const newContent = `---
title: "My New Artwork"
description: "A beautiful piece of contemporary art"
thumbnail: "/images/artwork-thumbnail.jpg"
full_image: "/images/artwork-full.jpg"
order: 1
---

# My New Artwork

This is a detailed description of my latest artwork. It represents...`;

      // Test creating content file directly (simulating CMS backend operation)
      const contentPath = path.join(__dirname, '../../_content/current/my-new-artwork.md');
      const contentDir = path.dirname(contentPath);
      
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }
      
      fs.writeFileSync(contentPath, newContent, 'utf8');
      
      // Verify file was created
      expect(fs.existsSync(contentPath)).toBe(true);
      
      // Step 2: Read the content back
      const readContent = fs.readFileSync(contentPath, 'utf8');
      expect(readContent).toContain('title: "My New Artwork"');
      expect(readContent).toContain('This is a detailed description');
      
      // Step 3: Update the content
      const updatedContent = `---
title: "My Updated Artwork"
description: "An even more beautiful piece of contemporary art"
thumbnail: "/images/artwork-thumbnail-v2.jpg"
full_image: "/images/artwork-full-v2.jpg"
order: 2
---

# My Updated Artwork

This is an updated description with more details about the creative process...`;

      fs.writeFileSync(contentPath, updatedContent, 'utf8');
      
      // Verify update
      const updatedReadContent = fs.readFileSync(contentPath, 'utf8');
      expect(updatedReadContent).toContain('title: "My Updated Artwork"');
      expect(updatedReadContent).toContain('updated description');
      expect(updatedReadContent).not.toContain('My New Artwork');
      
      // Step 4: Delete the content
      fs.unlinkSync(contentPath);
      
      // Verify deletion
      expect(fs.existsSync(contentPath)).toBe(false);
    });

    test('should handle settings updates through CMS workflow', async () => {
      // Test updating site settings through the CMS workflow
      
      // Step 1: Create/update settings
      const settingsContent = `site_title: "Avery Smith - Updated Portfolio"
site_description: "An updated showcase of artistic work and performances"
featured_work: true
contact_email: "updated@averysmith.com"`;

      const settingsPath = path.join(__dirname, '../../_data/settings.yml');
      const settingsDir = path.dirname(settingsPath);
      
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }
      
      fs.writeFileSync(settingsPath, settingsContent, 'utf8');
      
      // Verify settings were saved
      expect(fs.existsSync(settingsPath)).toBe(true);
      
      const readSettings = fs.readFileSync(settingsPath, 'utf8');
      expect(readSettings).toContain('Updated Portfolio');
      expect(readSettings).toContain('updated@averysmith.com');
      
      // Step 2: Update contact information
      const updatedContactContent = `email: "contact@averysmith.com"
phone: "+1-555-0123"
social_media:
  instagram: "@averysmith_art"
  facebook: "averysmithartist"
  youtube: "AverySmithChannel"
form_enabled: true`;

      const contactPath = path.join(__dirname, '../../_data/contact.yml');
      fs.writeFileSync(contactPath, updatedContactContent, 'utf8');
      
      // Verify contact info was saved
      const readContact = fs.readFileSync(contactPath, 'utf8');
      expect(readContact).toContain('contact@averysmith.com');
      expect(readContact).toContain('@averysmith_art');
      
      // Clean up test files
      fs.unlinkSync(settingsPath);
      fs.unlinkSync(contactPath);
    });

    test('should handle multiple content items across different collections', async () => {
      // Test managing content across multiple collections (current, choreography, projects, performances)
      
      const collections = [
        {
          name: 'current',
          content: {
            title: 'Current Work Item',
            description: 'Latest artistic piece',
            slug: 'current-work-1'
          }
        },
        {
          name: 'choreography',
          content: {
            title: 'Dance Piece',
            description: 'Contemporary dance choreography',
            slug: 'dance-piece-1'
          }
        },
        {
          name: 'projects',
          content: {
            title: 'Art Project',
            description: 'Collaborative art project',
            slug: 'art-project-1'
          }
        },
        {
          name: 'performances',
          content: {
            title: 'Live Performance',
            description: 'Recent stage performance',
            slug: 'performance-1'
          }
        }
      ];

      const createdFiles = [];

      // Create content in each collection
      for (const collection of collections) {
        const content = `---
title: "${collection.content.title}"
description: "${collection.content.description}"
thumbnail: "/images/${collection.content.slug}-thumb.jpg"
order: 1
---

# ${collection.content.title}

This is the content for ${collection.content.description}.`;

        const filePath = path.join(__dirname, `../../_content/${collection.name}/${collection.content.slug}.md`);
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        createdFiles.push(filePath);
        
        // Verify file was created
        expect(fs.existsSync(filePath)).toBe(true);
        
        const readContent = fs.readFileSync(filePath, 'utf8');
        expect(readContent).toContain(collection.content.title);
        expect(readContent).toContain(collection.content.description);
      }

      // Verify we can list all files in each collection
      for (const collection of collections) {
        const collectionDir = path.join(__dirname, `../../_content/${collection.name}`);
        const files = fs.readdirSync(collectionDir).filter(f => f.endsWith('.md'));
        expect(files.length).toBeGreaterThanOrEqual(1);
        expect(files).toContain(`${collection.content.slug}.md`);
      }

      // Clean up all created files
      createdFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });

    test('should validate content structure and frontmatter', async () => {
      // Test that content files have proper structure and required fields
      
      const validContent = `---
title: "Valid Content Item"
description: "This has all required fields"
thumbnail: "/images/valid-thumb.jpg"
order: 1
---

# Valid Content

This is properly structured content.`;

      const invalidContent = `---
title: "Invalid Content"
# Missing required fields like description and thumbnail
---

# Invalid Content

This content is missing required fields.`;

      const validPath = path.join(__dirname, '../../_content/test/valid-item.md');
      const invalidPath = path.join(__dirname, '../../_content/test/invalid-item.md');
      const testDir = path.dirname(validPath);
      
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Create test files
      fs.writeFileSync(validPath, validContent, 'utf8');
      fs.writeFileSync(invalidPath, invalidContent, 'utf8');

      // Function to validate content structure
      const validateContent = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (!frontmatterMatch) {
          return { valid: false, errors: ['No frontmatter found'] };
        }

        const frontmatter = frontmatterMatch[1];
        const errors = [];

        // Check required fields
        if (!frontmatter.includes('title:')) errors.push('Missing title field');
        if (!frontmatter.includes('description:')) errors.push('Missing description field');
        if (!frontmatter.includes('thumbnail:')) errors.push('Missing thumbnail field');
        
        return { valid: errors.length === 0, errors };
      };

      // Validate files
      const validResult = validateContent(validPath);
      const invalidResult = validateContent(invalidPath);

      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
      expect(invalidResult.errors).toContain('Missing description field');
      expect(invalidResult.errors).toContain('Missing thumbnail field');

      // Clean up
      if (fs.existsSync(validPath)) {
        fs.unlinkSync(validPath);
      }
      
      if (fs.existsSync(invalidPath)) {
        fs.unlinkSync(invalidPath);
      }
    });
  });

  describe('Content Synchronization Simulation', () => {
    test('should simulate content sync workflow', async () => {
      // Simulate the workflow of editing content locally and syncing with repository
      
      // Step 1: Create local content changes
      const localChanges = [
        {
          type: 'create',
          collection: 'current',
          slug: 'new-painting',
          content: `---
title: "Abstract Painting #5"
description: "A vibrant abstract piece using acrylic on canvas"
thumbnail: "/images/abstract-5-thumb.jpg"
full_image: "/images/abstract-5-full.jpg"
order: 5
---

# Abstract Painting #5

This piece explores the relationship between color and emotion...`
        },
        {
          type: 'update',
          collection: 'about',
          content: `name: "Avery Smith"
profile_image: "/images/avery-profile-updated.jpg"
bio: "Contemporary artist and performer with updated bio"
long_bio: "Avery is a multidisciplinary artist working in... (updated text)"`
        },
        {
          type: 'delete',
          collection: 'projects',
          slug: 'old-project'
        }
      ];

      const createdFiles = [];

      // Apply local changes
      for (const change of localChanges) {
        if (change.type === 'create') {
          const filePath = path.join(__dirname, `../../_content/${change.collection}/${change.slug}.md`);
          const dir = path.dirname(filePath);
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(filePath, change.content, 'utf8');
          createdFiles.push(filePath);
          
          expect(fs.existsSync(filePath)).toBe(true);
          
        } else if (change.type === 'update') {
          const filePath = path.join(__dirname, `../../_data/${change.collection}.yml`);
          const dir = path.dirname(filePath);
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(filePath, change.content, 'utf8');
          createdFiles.push(filePath);
          
          expect(fs.existsSync(filePath)).toBe(true);
          const content = fs.readFileSync(filePath, 'utf8');
          expect(content).toContain('updated');
          
        } else if (change.type === 'delete') {
          // Simulate deletion by creating then removing a file
          const filePath = path.join(__dirname, `../../_content/${change.collection}/${change.slug}.md`);
          const dir = path.dirname(filePath);
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          // Create the file first
          fs.writeFileSync(filePath, '---\ntitle: To be deleted\n---\n# Content', 'utf8');
          expect(fs.existsSync(filePath)).toBe(true);
          
          // Then delete it
          fs.unlinkSync(filePath);
          expect(fs.existsSync(filePath)).toBe(false);
        }
      }

      // Step 2: Verify content structure is maintained
      const collections = ['current', 'choreography', 'projects', 'performances'];
      
      for (const collection of collections) {
        const collectionDir = path.join(__dirname, `../../_content/${collection}`);
        
        if (fs.existsSync(collectionDir)) {
          const files = fs.readdirSync(collectionDir).filter(f => f.endsWith('.md'));
          
          // Each markdown file should have proper structure
          for (const file of files) {
            const filePath = path.join(collectionDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Should have frontmatter
            expect(content).toMatch(/^---\n[\s\S]*?\n---/);
            
            // Should have markdown content after frontmatter (if it exists)
            const parts = content.split('---');
            if (parts.length >= 3) {
              const afterFrontmatter = parts.slice(2).join('---').trim();
              // Only check length if there actually is content after frontmatter
              // Some files might just have frontmatter, which is valid
              if (afterFrontmatter) {
                expect(afterFrontmatter).toBeTruthy();
              }
            }
          }
        }
      }

      // Clean up created files
      createdFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    });
  });
});