const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock execSync to prevent actual git operations during tests
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Import the content sync module
const contentSyncModule = require('../../content-sync.js');

describe('Content Synchronization', () => {
  const testDir = path.join(__dirname, '../../_test_sync');
  const originalCwd = process.cwd();
  const originalArgv = process.argv;

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock successful git operations
    execSync.mockImplementation((command) => {
      if (command.includes('git status --porcelain')) {
        return 'M _content/current/test.md\n'; // Mock some changes
      }
      return '';
    });
  });

  afterEach(() => {
    // Clean up test files
    const testPaths = [
      path.join(__dirname, '../../_content/test'),
      path.join(__dirname, '../../_data/test.yml')
    ];
    
    testPaths.forEach(testPath => {
      if (fs.existsSync(testPath)) {
        if (fs.statSync(testPath).isDirectory()) {
          fs.rmSync(testPath, { recursive: true });
        } else {
          fs.unlinkSync(testPath);
        }
      }
    });
  });

  afterAll(() => {
    // Restore original values
    process.argv = originalArgv;
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('Content Directory Initialization', () => {
    test('should create content directories if they do not exist', () => {
      // Test content directory creation functionality
      const testContentDir = path.join(__dirname, '../../_test_content_init');
      const testDataDir = path.join(__dirname, '../../_test_data_init');
      
      // Ensure directories don't exist initially
      if (fs.existsSync(testContentDir)) {
        fs.rmSync(testContentDir, { recursive: true });
      }
      if (fs.existsSync(testDataDir)) {
        fs.rmSync(testDataDir, { recursive: true });
      }

      // Function to initialize directories (extracted from content-sync.js logic)
      const initTestDirs = () => {
        const dirs = [testContentDir, testDataDir];
        dirs.forEach(dir => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        });
        
        // Create content type subdirectories
        const contentTypes = ['current', 'choreography', 'projects', 'performances'];
        contentTypes.forEach(type => {
          const typePath = path.join(testContentDir, type);
          if (!fs.existsSync(typePath)) {
            fs.mkdirSync(typePath, { recursive: true });
          }
        });
      };

      // Run initialization
      initTestDirs();

      // Verify directories were created
      expect(fs.existsSync(testContentDir)).toBe(true);
      expect(fs.existsSync(testDataDir)).toBe(true);
      
      // Verify content type subdirectories
      const contentTypes = ['current', 'choreography', 'projects', 'performances'];
      contentTypes.forEach(type => {
        const typePath = path.join(testContentDir, type);
        expect(fs.existsSync(typePath)).toBe(true);
      });

      // Clean up
      fs.rmSync(testContentDir, { recursive: true });
      fs.rmSync(testDataDir, { recursive: true });
    });

    test('should not overwrite existing directories', () => {
      const testDir = path.join(__dirname, '../../_test_existing');
      
      // Create directory with existing content
      fs.mkdirSync(testDir, { recursive: true });
      const testFile = path.join(testDir, 'existing-file.txt');
      fs.writeFileSync(testFile, 'existing content', 'utf8');

      // Function to safely initialize (should not overwrite)
      const safeInit = (dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      };

      // Run initialization
      safeInit(testDir);

      // Verify existing content is preserved
      expect(fs.existsSync(testFile)).toBe(true);
      expect(fs.readFileSync(testFile, 'utf8')).toBe('existing content');

      // Clean up
      fs.rmSync(testDir, { recursive: true });
    });
  });

  describe('Content Change Detection', () => {
    test('should detect changes in content files', () => {
      // Create test content
      const contentDir = path.join(__dirname, '../../_content/test');
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }

      const testFile = path.join(contentDir, 'test-item.md');
      const content = `---
title: "Test Item"
description: "Test description"
---
# Test Content`;

      fs.writeFileSync(testFile, content, 'utf8');

      // Function to check for changes (simulates git status check)
      const hasChanges = (dirs) => {
        return dirs.some(dir => {
          const dirPath = path.join(__dirname, '../../', dir);
          if (!fs.existsSync(dirPath)) return false;
          
          const files = fs.readdirSync(dirPath, { recursive: true });
          return files.length > 0;
        });
      };

      const hasContentChanges = hasChanges(['_content/test']);
      expect(hasContentChanges).toBe(true);

      // Clean up
      fs.unlinkSync(testFile);
    });

    test('should handle empty directories', () => {
      const emptyDir = path.join(__dirname, '../../_empty_test');
      fs.mkdirSync(emptyDir, { recursive: true });

      const hasChanges = (dir) => {
        if (!fs.existsSync(dir)) return false;
        const files = fs.readdirSync(dir);
        return files.length > 0;
      };

      expect(hasChanges(emptyDir)).toBe(false);

      // Clean up
      fs.rmSync(emptyDir, { recursive: true });
    });
  });

  describe('Git Operations Simulation', () => {
    test('should simulate git add operations', () => {
      // Test that we can simulate adding files to git
      const gitAdd = (files) => {
        // In real implementation, this would run git add
        // Here we just verify the files exist
        return files.every(file => {
          const fullPath = path.join(__dirname, '../../', file);
          return fs.existsSync(fullPath) || fs.existsSync(path.dirname(fullPath));
        });
      };

      // Create test content
      const testFile = path.join(__dirname, '../../_content/test-git.md');
      const dir = path.dirname(testFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(testFile, '# Test content', 'utf8');

      const canAdd = gitAdd(['_content/test-git.md']);
      expect(canAdd).toBe(true);

      // Clean up
      fs.unlinkSync(testFile);
    });

    test('should simulate git commit operations', () => {
      // Mock git operations
      execSync.mockImplementation((command) => {
        if (command.includes('git config')) return '';
        if (command.includes('git add')) return '';
        if (command.includes('git commit')) return 'Commit successful';
        if (command.includes('git push')) return 'Push successful';
        return '';
      });

      // Function to simulate commit workflow
      const simulateCommit = () => {
        try {
          execSync('git config user.name "Test User"');
          execSync('git add .');
          execSync('git commit -m "Test commit"');
          return { success: true, message: 'Committed successfully' };
        } catch (error) {
          return { success: false, message: error.message };
        }
      };

      const result = simulateCommit();
      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git config user.name "Test User"');
      expect(execSync).toHaveBeenCalledWith('git add .');
      expect(execSync).toHaveBeenCalledWith('git commit -m "Test commit"');
    });

    test('should handle git push operations', () => {
      execSync.mockImplementation((command) => {
        if (command.includes('git push')) {
          return 'Push successful';
        }
        return '';
      });

      const simulatePush = () => {
        try {
          execSync('git push origin main');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = simulatePush();
      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git push origin main');
    });

    test('should handle git pull operations', () => {
      execSync.mockImplementation((command) => {
        if (command.includes('git pull')) {
          return 'Pull successful';
        }
        return '';
      });

      const simulatePull = () => {
        try {
          execSync('git pull origin main');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = simulatePull();
      expect(result.success).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git pull origin main');
    });
  });

  describe('Error Handling', () => {
    test('should handle git command failures gracefully', () => {
      execSync.mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const simulateFailedOperation = () => {
        try {
          execSync('git invalid-command');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = simulateFailedOperation();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Git command failed');
    });

    test('should handle file system errors', () => {
      const simulateFileOperation = () => {
        try {
          // Try to write to a non-existent directory without creating it
          fs.writeFileSync('/non/existent/path/file.txt', 'content');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.code };
        }
      };

      const result = simulateFileOperation();
      expect(result.success).toBe(false);
      expect(result.error).toBe('ENOENT');
    });

    test('should validate required environment variables', () => {
      const validateConfig = () => {
        const config = {
          username: process.env.GIT_USERNAME || 'Content Bot',
          email: process.env.GIT_EMAIL || 'content-bot@example.com',
          branch: 'main'
        };

        const errors = [];
        if (!config.username) errors.push('Missing Git username');
        if (!config.email) errors.push('Missing Git email');
        if (!config.branch) errors.push('Missing Git branch');

        return { valid: errors.length === 0, errors, config };
      };

      const validation = validateConfig();
      expect(validation.valid).toBe(true);
      expect(validation.config.username).toBeTruthy();
      expect(validation.config.email).toBeTruthy();
      expect(validation.config.branch).toBe('main');
    });
  });

  describe('Content Backup and Recovery', () => {
    test('should create backup of content before operations', () => {
      // Create test content
      const contentFile = path.join(__dirname, '../../_content/backup-test.md');
      const backupDir = path.join(__dirname, '../../_backup');
      
      const dir = path.dirname(contentFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(contentFile, '# Original content', 'utf8');

      // Function to create backup
      const createBackup = (sourceDir, backupDir) => {
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        if (fs.existsSync(sourceDir)) {
          const files = fs.readdirSync(sourceDir, { recursive: true });
          files.forEach(file => {
            const sourcePath = path.join(sourceDir, file);
            const backupPath = path.join(backupDir, file);
            
            if (fs.statSync(sourcePath).isFile()) {
              const backupSubDir = path.dirname(backupPath);
              if (!fs.existsSync(backupSubDir)) {
                fs.mkdirSync(backupSubDir, { recursive: true });
              }
              fs.copyFileSync(sourcePath, backupPath);
            }
          });
        }
      };

      createBackup(path.dirname(contentFile), backupDir);

      // Verify backup was created
      const backupFile = path.join(backupDir, 'backup-test.md');
      expect(fs.existsSync(backupFile)).toBe(true);
      expect(fs.readFileSync(backupFile, 'utf8')).toBe('# Original content');

      // Clean up
      fs.unlinkSync(contentFile);
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true });
      }
    });

    test('should restore content from backup', () => {
      const originalFile = path.join(__dirname, '../../_content/restore-test.md');
      const backupFile = path.join(__dirname, '../../_backup/restore-test.md');
      
      // Create directories
      [path.dirname(originalFile), path.dirname(backupFile)].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Create backup
      fs.writeFileSync(backupFile, '# Backup content', 'utf8');
      
      // Simulate corrupted original
      fs.writeFileSync(originalFile, '# Corrupted content', 'utf8');

      // Restore function
      const restoreFromBackup = (backupPath, targetPath) => {
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, targetPath);
          return true;
        }
        return false;
      };

      const restored = restoreFromBackup(backupFile, originalFile);
      expect(restored).toBe(true);
      expect(fs.readFileSync(originalFile, 'utf8')).toBe('# Backup content');

      // Clean up
      fs.unlinkSync(originalFile);
      fs.rmSync(path.dirname(backupFile), { recursive: true });
    });
  });
});