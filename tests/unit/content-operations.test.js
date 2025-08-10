const fs = require('fs');
const path = require('path');

describe('Content File Operations', () => {
  const testDataDir = path.join(__dirname, '../../_test_data');
  const testContentDir = path.join(__dirname, '../../_test_content');

  beforeAll(() => {
    // Ensure test directories exist
    [testDataDir, testContentDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  afterEach(() => {
    // Clean up test files after each test
    [testDataDir, testContentDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });
  });

  describe('YAML File Operations', () => {
    test('should create valid YAML content', () => {
      const yamlContent = `site_title: "Test Portfolio"
site_description: "A test portfolio description"
featured_work: true
contact_email: "test@example.com"`;

      const filePath = path.join(testDataDir, 'test-settings.yml');
      fs.writeFileSync(filePath, yamlContent, 'utf8');

      expect(fs.existsSync(filePath)).toBe(true);
      
      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain('Test Portfolio');
      expect(readContent).toContain('featured_work: true');
    });

    test('should handle YAML with special characters', () => {
      const yamlContent = `site_title: "Portfolio with 'quotes' and \"double quotes\""
site_description: "Description with special chars: @#$%^&*()"
artist_name: "Artist & Designer"`;

      const filePath = path.join(testDataDir, 'special-chars.yml');
      fs.writeFileSync(filePath, yamlContent, 'utf8');

      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain("'quotes'");
      expect(readContent).toContain('special chars: @#$%^&*()');
      expect(readContent).toContain('Artist & Designer');
    });

    test('should validate YAML structure', () => {
      const validYaml = `title: "Valid"
description: "This is valid YAML"
number: 42
boolean: true`;

      const invalidYaml = `title: "Invalid
description: Missing closing quote
number: not_a_number
  invalid_indentation: true`;

      // Test valid YAML
      const validPath = path.join(testDataDir, 'valid.yml');
      fs.writeFileSync(validPath, validYaml, 'utf8');
      
      const readValid = fs.readFileSync(validPath, 'utf8');
      expect(readValid).toContain('title: "Valid"');
      expect(readValid).toContain('number: 42');

      // Test invalid YAML (should still write to file, but content is malformed)
      const invalidPath = path.join(testDataDir, 'invalid.yml');
      fs.writeFileSync(invalidPath, invalidYaml, 'utf8');
      
      const readInvalid = fs.readFileSync(invalidPath, 'utf8');
      expect(readInvalid).toContain('Missing closing quote');
    });
  });

  describe('Markdown File Operations', () => {
    test('should create markdown with frontmatter', () => {
      const markdownContent = `---
title: "Test Article"
description: "A test article for the portfolio"
thumbnail: "/images/test-thumb.jpg"
date: "2024-01-15"
tags: ["art", "digital", "portfolio"]
order: 1
---

# Test Article

This is the main content of the article.

## Features

- Feature 1
- Feature 2
- Feature 3

![Test Image](/images/test-image.jpg)

## Description

This is a more detailed description of the artwork or project.`;

      const filePath = path.join(testContentDir, 'test-article.md');
      fs.writeFileSync(filePath, markdownContent, 'utf8');

      expect(fs.existsSync(filePath)).toBe(true);
      
      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain('title: "Test Article"');
      expect(readContent).toContain('# Test Article');
      expect(readContent).toContain('![Test Image]');
    });

    test('should parse frontmatter correctly', () => {
      const markdownContent = `---
title: "Frontmatter Test"
description: "Testing frontmatter parsing"
thumbnail: "/images/thumb.jpg"
video: "https://youtube.com/embed/test"
order: 5
published: true
---

# Content after frontmatter

Some markdown content here.`;

      const filePath = path.join(testContentDir, 'frontmatter-test.md');
      fs.writeFileSync(filePath, markdownContent, 'utf8');

      const readContent = fs.readFileSync(filePath, 'utf8');
      
      // Check frontmatter section
      const frontmatterMatch = readContent.match(/^---\n([\s\S]*?)\n---/);
      expect(frontmatterMatch).toBeTruthy();
      
      const frontmatter = frontmatterMatch[1];
      expect(frontmatter).toContain('title: "Frontmatter Test"');
      expect(frontmatter).toContain('order: 5');
      expect(frontmatter).toContain('published: true');
      
      // Check content section
      const contentAfterFrontmatter = readContent.split('---').slice(2).join('---').trim();
      expect(contentAfterFrontmatter).toContain('# Content after frontmatter');
      expect(contentAfterFrontmatter).toContain('Some markdown content');
    });

    test('should handle markdown without frontmatter', () => {
      const markdownContent = `# Simple Markdown

This is just markdown without frontmatter.

## Section

Some content here.`;

      const filePath = path.join(testContentDir, 'simple.md');
      fs.writeFileSync(filePath, markdownContent, 'utf8');

      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain('# Simple Markdown');
      expect(readContent).not.toContain('---');
    });

    test('should preserve markdown formatting', () => {
      const markdownContent = `---
title: "Formatting Test"
---

# Main Title

## Subtitle

This is **bold text** and this is *italic text*.

### List Example

1. First item
2. Second item
   - Nested bullet
   - Another nested bullet
3. Third item

### Code Example

\`\`\`javascript
const example = "code block";
console.log(example);
\`\`\`

Inline \`code\` example.

> This is a blockquote
> with multiple lines

[Link to website](https://example.com)

![Image alt text](/images/example.jpg "Image title")`;

      const filePath = path.join(testContentDir, 'formatting.md');
      fs.writeFileSync(filePath, markdownContent, 'utf8');

      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain('**bold text**');
      expect(readContent).toContain('*italic text*');
      expect(readContent).toContain('```javascript');
      expect(readContent).toContain('> This is a blockquote');
      expect(readContent).toContain('[Link to website]');
    });
  });

  describe('File System Operations', () => {
    test('should create directory structure automatically', () => {
      const deepPath = path.join(testContentDir, 'deep', 'nested', 'directory', 'file.md');
      const content = '# Deep file\n\nContent in a deeply nested directory.';
      
      // Create directory structure
      const dir = path.dirname(deepPath);
      fs.mkdirSync(dir, { recursive: true });
      
      // Write file
      fs.writeFileSync(deepPath, content, 'utf8');
      
      expect(fs.existsSync(deepPath)).toBe(true);
      expect(fs.readFileSync(deepPath, 'utf8')).toContain('Deep file');
    });

    test('should handle file updates', () => {
      const filePath = path.join(testContentDir, 'update-test.md');
      
      // Create initial file
      const initialContent = '# Initial Content\n\nThis is the initial version.';
      fs.writeFileSync(filePath, initialContent, 'utf8');
      
      expect(fs.readFileSync(filePath, 'utf8')).toContain('Initial Content');
      
      // Update file
      const updatedContent = '# Updated Content\n\nThis is the updated version.';
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      const readContent = fs.readFileSync(filePath, 'utf8');
      expect(readContent).toContain('Updated Content');
      expect(readContent).not.toContain('Initial Content');
    });

    test('should handle file deletion', () => {
      const filePath = path.join(testContentDir, 'delete-test.md');
      
      // Create file
      fs.writeFileSync(filePath, '# To be deleted', 'utf8');
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Delete file
      fs.unlinkSync(filePath);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    test('should list files in directory', () => {
      const dirPath = path.join(testContentDir, 'list-test');
      fs.mkdirSync(dirPath, { recursive: true });
      
      // Create test files
      const files = ['file1.md', 'file2.md', 'file3.md', 'not-markdown.txt'];
      files.forEach(file => {
        fs.writeFileSync(path.join(dirPath, file), '# Test content', 'utf8');
      });
      
      // List all files
      const allFiles = fs.readdirSync(dirPath);
      expect(allFiles).toHaveLength(4);
      expect(allFiles).toContain('file1.md');
      expect(allFiles).toContain('not-markdown.txt');
      
      // Filter markdown files
      const markdownFiles = allFiles.filter(file => file.endsWith('.md'));
      expect(markdownFiles).toHaveLength(3);
      expect(markdownFiles).not.toContain('not-markdown.txt');
    });
  });

  describe('Content Validation', () => {
    test('should validate required frontmatter fields', () => {
      const validateContent = (content, requiredFields) => {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return { valid: false, errors: ['No frontmatter'] };
        
        const frontmatter = frontmatterMatch[1];
        const errors = [];
        
        requiredFields.forEach(field => {
          if (!frontmatter.includes(`${field}:`)) {
            errors.push(`Missing ${field} field`);
          }
        });
        
        return { valid: errors.length === 0, errors };
      };

      // Valid content
      const validContent = `---
title: "Valid Content"
description: "Has all required fields"
thumbnail: "/images/thumb.jpg"
order: 1
---
# Content`;

      const validResult = validateContent(validContent, ['title', 'description', 'thumbnail', 'order']);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // Invalid content
      const invalidContent = `---
title: "Invalid Content"
description: "Missing some fields"
---
# Content`;

      const invalidResult = validateContent(invalidContent, ['title', 'description', 'thumbnail', 'order']);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Missing thumbnail field');
      expect(invalidResult.errors).toContain('Missing order field');
    });

    test('should validate file naming conventions', () => {
      const validateFileName = (fileName) => {
        const errors = [];
        
        if (!fileName.endsWith('.md') && !fileName.endsWith('.yml')) {
          errors.push('File must have .md or .yml extension');
        }
        
        if (fileName.includes(' ')) {
          errors.push('File name should not contain spaces');
        }
        
        if (!/^[a-z0-9-_.]+$/.test(fileName)) {
          errors.push('File name should only contain lowercase letters, numbers, hyphens, underscores, and dots');
        }
        
        return { valid: errors.length === 0, errors };
      };

      // Valid file names
      expect(validateFileName('my-content.md').valid).toBe(true);
      expect(validateFileName('settings.yml').valid).toBe(true);
      expect(validateFileName('content-item-1.md').valid).toBe(true);

      // Invalid file names
      expect(validateFileName('My Content.md').valid).toBe(false);
      expect(validateFileName('UPPERCASE.md').valid).toBe(false);
      expect(validateFileName('content@special.md').valid).toBe(false);
    });

    test('should validate content structure consistency', () => {
      const validateCollectionConsistency = (collectionDir) => {
        if (!fs.existsSync(collectionDir)) {
          return { valid: true, errors: [] }; // Empty collection is valid
        }

        const files = fs.readdirSync(collectionDir).filter(f => f.endsWith('.md'));
        const errors = [];
        const requiredFields = ['title', 'description', 'thumbnail', 'order'];
        
        files.forEach(file => {
          const filePath = path.join(collectionDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (!frontmatterMatch) {
            errors.push(`${file}: No frontmatter found`);
            return;
          }
          
          const frontmatter = frontmatterMatch[1];
          requiredFields.forEach(field => {
            if (!frontmatter.includes(`${field}:`)) {
              errors.push(`${file}: Missing ${field} field`);
            }
          });
        });
        
        return { valid: errors.length === 0, errors };
      };

      // Create test collection with valid files
      const testCollectionDir = path.join(testContentDir, 'valid-collection');
      fs.mkdirSync(testCollectionDir, { recursive: true });
      
      const validFile = `---
title: "Valid Item"
description: "Valid description"
thumbnail: "/images/thumb.jpg"
order: 1
---
# Content`;

      fs.writeFileSync(path.join(testCollectionDir, 'valid-item.md'), validFile, 'utf8');
      
      const result = validateCollectionConsistency(testCollectionDir);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});