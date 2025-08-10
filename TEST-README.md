# CMS Testing Guide

This document explains the comprehensive testing infrastructure for the Avery Portfolio CMS functionality.

## Overview

The testing suite focuses on validating the Content Management System (CMS) functionality, including:

- Content creation, reading, updating, and deletion (CRUD operations)
- Local backend server functionality  
- Main server content serving
- File system operations
- Content synchronization workflows
- Multi-collection support

## Test Structure

```
tests/
├── unit/               # Unit tests for individual components
│   ├── content-operations.test.js  # File operations and validation
│   └── content-sync.test.js        # Content synchronization logic
├── integration/        # Integration tests
│   ├── local-backend.test.js       # CMS backend API tests
│   ├── server.test.js             # Main server tests
│   └── live-server.test.js        # Live server integration tests
├── e2e/               # End-to-end workflow tests
│   └── cms-workflow.test.js       # Complete CMS workflows
└── setup.js           # Test environment setup
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Categories
```bash
# Unit tests only
npm test -- --testPathPattern="unit"

# Integration tests only  
npm test -- --testPathPattern="integration"

# End-to-end tests only
npm test -- --testPathPattern="e2e"

# Specific test file
npm test -- --testPathPattern="local-backend"
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Watch Mode for Development
```bash
npm run test:watch
```

## Manual Testing

For comprehensive manual testing that actually starts servers and tests real functionality:

```bash
node test-cms-manual.js
```

This script will:
1. Start both the main server (port 8089) and CMS backend (port 8090)
2. Test all CRUD operations
3. Validate content serving through both servers
4. Test multiple content collections
5. Clean up all test content
6. Stop servers automatically

## Test Categories

### Unit Tests

**Content Operations (`content-operations.test.js`)**
- YAML file creation and validation
- Markdown file handling with frontmatter
- File system operations (create, read, update, delete)
- Content validation and naming conventions
- Directory structure management

**Content Synchronization (`content-sync.test.js`)**  
- Directory initialization
- Change detection
- Git operations simulation
- Error handling
- Backup and recovery workflows

### Integration Tests

**Local Backend (`local-backend.test.js`)**
- CMS API endpoints (`/api/v1/entries/...`)
- Data file management (`_data/*.yml`)
- Content file management (`_content/*/*.md`)
- CRUD operations for all collection types
- Error handling and validation

**Main Server (`server.test.js`)**
- Static file serving
- Admin interface routing
- Content synchronization API endpoints
- Dynamic content file creation
- Cache control headers

**Live Server (`live-server.test.js`)**
- Server startup validation
- Real HTTP requests to running servers
- Configuration validation
- Project structure validation

### End-to-End Tests

**CMS Workflow (`cms-workflow.test.js`)**
- Complete content creation workflow
- Multi-collection content management
- Settings and configuration updates
- Content validation and structure checking
- Synchronization simulation

## Content Types Tested

### Data Files (`_data/`)
- `settings.yml` - Site configuration
- `about.yml` - About page content  
- `contact.yml` - Contact information

### Content Collections (`_content/`)
- `current/` - Current work items
- `choreography/` - Dance and choreography pieces
- `projects/` - Art projects
- `performances/` - Live performances

Each content item includes:
- **Frontmatter**: Title, description, thumbnail, order
- **Markdown content**: Rich text content with formatting
- **Validation**: Required fields and structure checking

## Test Data Management

### Temporary Files
- Tests use `_test_data/` and `_test_content/` directories
- Cleanup happens automatically after each test
- No interference with actual content

### Test Isolation
- Each test creates its own test files
- Cleanup ensures no test pollution
- Mock git operations prevent actual repository changes

## Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageDirectory: 'coverage'
}
```

### Test Environment Variables
- `NODE_ENV=test` - Test mode
- `PORT=8083` - Test server port (different from development)

## Common Test Patterns

### Creating Test Content
```javascript
const testContent = `---
title: "Test Item"
description: "Test description"
thumbnail: "/images/test.jpg"
order: 1
---
# Test Content`;

const filePath = testUtils.createTestFile('_content/test/item.md', testContent);
```

### Testing API Endpoints
```javascript
const response = await request(app)
  .put('/api/v1/entries/current/test-item')
  .send({ data: testContent })
  .expect(200);

expect(response.body.success).toBe(true);
```

### Validation Testing
```javascript
const validateContent = (content, requiredFields) => {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  // ... validation logic
};
```

## Troubleshooting

### Test Failures
1. **Port conflicts**: Tests use ports 8083-8090, ensure they're available
2. **File permissions**: Ensure write access to test directories
3. **Server startup**: Manual tests require actual server startup

### Common Issues
- **EADDRINUSE**: Kill processes using test ports
- **ENOENT**: Missing directories are created automatically
- **Timeout**: Increase timeout for slow environments

### Debug Mode
Add `--verbose` to see detailed test output:
```bash
npm test -- --verbose
```

## CI/CD Integration

The test suite is designed to run in continuous integration environments:

- No external dependencies required
- All servers started programmatically
- Comprehensive cleanup
- Clear success/failure reporting

### GitHub Actions Example
```yaml
- name: Run CMS Tests
  run: |
    npm install
    npm test
    npm run test:coverage
```

## Performance Testing

The manual test script includes timing information and can be extended for performance validation:

```bash
time node test-cms-manual.js
```

## Security Testing

Tests validate:
- Input sanitization
- File path validation
- CORS headers
- Error message security

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add proper cleanup in `afterEach`/`afterAll`
3. Use descriptive test names
4. Group related tests in `describe` blocks
5. Add both positive and negative test cases
6. Update this documentation

## Coverage Goals

Target coverage metrics:
- **Lines**: 80%+
- **Functions**: 85%+
- **Branches**: 75%+
- **Statements**: 80%+

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```