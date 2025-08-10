// Test setup file
const fs = require('fs');
const path = require('path');

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '8083'; // Different port for testing

// Clean up test data before each test suite
beforeAll(() => {
  // Ensure test directories exist
  const testDataDir = path.join(__dirname, '..', '_test_data');
  const testContentDir = path.join(__dirname, '..', '_test_content');
  
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  if (!fs.existsSync(testContentDir)) {
    fs.mkdirSync(testContentDir, { recursive: true });
  }
});

// Utility functions for tests
global.testUtils = {
  createTestFile: (filePath, content) => {
    const fullPath = path.join(__dirname, '..', filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    return fullPath;
  },
  
  removeTestFile: (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  },
  
  readTestFile: (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
    return null;
  }
};