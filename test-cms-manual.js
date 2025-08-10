#!/usr/bin/env node

/**
 * Manual CMS Testing Script
 * 
 * This script runs comprehensive tests against the actual servers to validate 
 * the CMS functionality including content creation, updates, and serving.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const MAIN_SERVER_PORT = 8089;
const CMS_SERVER_PORT = 8090;
const TEST_TIMEOUT = 10000;

let mainServer;
let cmsServer;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function startServers() {
  log('🚀 Starting servers...', colors.blue);
  
  return new Promise((resolve, reject) => {
    // Start main server
    mainServer = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: MAIN_SERVER_PORT },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Start CMS server
    cmsServer = spawn('node', ['local-backend.js'], {
      env: { ...process.env, PORT: CMS_SERVER_PORT },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let mainServerReady = false;
    let cmsServerReady = false;

    function checkReady() {
      if (mainServerReady && cmsServerReady) {
        log('✅ Both servers started successfully', colors.green);
        resolve();
      }
    }

    mainServer.stdout.on('data', (data) => {
      if (data.toString().includes('Server running')) {
        mainServerReady = true;
        checkReady();
      }
    });

    cmsServer.stdout.on('data', (data) => {
      if (data.toString().includes('Local CMS backend running')) {
        cmsServerReady = true;
        checkReady();
      }
    });

    mainServer.on('error', reject);
    cmsServer.on('error', reject);

    // Timeout fallback
    setTimeout(() => {
      if (!mainServerReady || !cmsServerReady) {
        log('⚠️  Server startup timeout, proceeding anyway...', colors.yellow);
        resolve();
      }
    }, 5000);
  });
}

function stopServers() {
  log('🛑 Stopping servers...', colors.blue);
  
  if (mainServer) {
    mainServer.kill();
    mainServer = null;
  }
  
  if (cmsServer) {
    cmsServer.kill();
    cmsServer = null;
  }
}

async function testMainServer() {
  log('🧪 Testing main server...', colors.blue);
  
  try {
    // Test main page
    const mainPageResponse = await makeRequest({
      hostname: 'localhost',
      port: MAIN_SERVER_PORT,
      path: '/',
      method: 'GET'
    });
    
    if (mainPageResponse.statusCode === 200) {
      log('✅ Main page serves correctly', colors.green);
    } else {
      log(`❌ Main page failed: ${mainPageResponse.statusCode}`, colors.red);
    }

    // Test admin page
    const adminResponse = await makeRequest({
      hostname: 'localhost',
      port: MAIN_SERVER_PORT,
      path: '/admin/',
      method: 'GET'
    });
    
    if (adminResponse.statusCode === 200) {
      log('✅ Admin page serves correctly', colors.green);
    } else {
      log(`❌ Admin page failed: ${adminResponse.statusCode}`, colors.red);
    }

    // Test API endpoints
    const pullResponse = await makeRequest({
      hostname: 'localhost',
      port: MAIN_SERVER_PORT,
      path: '/api/pull-content',
      method: 'GET'
    });
    
    if (pullResponse.statusCode === 200) {
      log('✅ Pull content API works', colors.green);
    } else {
      log(`❌ Pull content API failed: ${pullResponse.statusCode}`, colors.red);
    }

    const pushResponse = await makeRequest({
      hostname: 'localhost',
      port: MAIN_SERVER_PORT,
      path: '/api/push-content',
      method: 'GET'
    });
    
    if (pushResponse.statusCode === 200) {
      log('✅ Push content API works', colors.green);
    } else {
      log(`❌ Push content API failed: ${pushResponse.statusCode}`, colors.red);
    }

  } catch (error) {
    log(`❌ Main server test failed: ${error.message}`, colors.red);
  }
}

async function testCMSBackend() {
  log('🧪 Testing CMS backend...', colors.blue);
  
  try {
    // Test creating content
    const testContent = `---
title: "Manual Test Project"
description: "A project created through manual testing"
thumbnail: "/images/manual-test-thumb.jpg"
order: 999
---

# Manual Test Project

This content was created through manual CMS testing.`;

    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: CMS_SERVER_PORT,
      path: '/api/v1/entries/current/manual-test-project',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ data: testContent }));
    
    if (createResponse.statusCode === 200) {
      log('✅ Content creation works', colors.green);
      
      // Test reading the content back
      const readResponse = await makeRequest({
        hostname: 'localhost',
        port: CMS_SERVER_PORT,
        path: '/api/v1/entries/current/manual-test-project',
        method: 'GET'
      });
      
      if (readResponse.statusCode === 200) {
        const responseData = JSON.parse(readResponse.body);
        if (responseData.data && responseData.data.includes('Manual Test Project')) {
          log('✅ Content reading works', colors.green);
        } else {
          log('❌ Content reading returned wrong data', colors.red);
        }
      } else {
        log(`❌ Content reading failed: ${readResponse.statusCode}`, colors.red);
      }

      // Test content serving through main server
      const serveResponse = await makeRequest({
        hostname: 'localhost',
        port: MAIN_SERVER_PORT,
        path: '/_content/current/manual-test-project.md',
        method: 'GET'
      });
      
      if (serveResponse.statusCode === 200 && serveResponse.body.includes('Manual Test Project')) {
        log('✅ Content serving through main server works', colors.green);
      } else {
        log(`❌ Content serving failed: ${serveResponse.statusCode}`, colors.red);
      }

      // Clean up - delete the test content
      const deleteResponse = await makeRequest({
        hostname: 'localhost',
        port: CMS_SERVER_PORT,
        path: '/api/v1/entries/current/manual-test-project',
        method: 'DELETE'
      });
      
      if (deleteResponse.statusCode === 200) {
        log('✅ Content deletion works', colors.green);
      } else {
        log(`❌ Content deletion failed: ${deleteResponse.statusCode}`, colors.red);
      }

    } else {
      log(`❌ Content creation failed: ${createResponse.statusCode}`, colors.red);
    }

  } catch (error) {
    log(`❌ CMS backend test failed: ${error.message}`, colors.red);
  }
}

async function testDataFiles() {
  log('🧪 Testing data file management...', colors.blue);
  
  try {
    // Test creating a settings file
    const testSettings = `site_title: "Manual Test Portfolio"
site_description: "Testing the CMS functionality"
test_mode: true`;

    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: CMS_SERVER_PORT,
      path: '/api/v1/entries/test-manual-settings',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ data: testSettings }));
    
    if (createResponse.statusCode === 200) {
      log('✅ Data file creation works', colors.green);
      
      // Test reading the data file
      const readResponse = await makeRequest({
        hostname: 'localhost',
        port: CMS_SERVER_PORT,
        path: '/api/v1/entries/test-manual-settings',
        method: 'GET'
      });
      
      if (readResponse.statusCode === 200) {
        const responseData = JSON.parse(readResponse.body);
        if (responseData.data && responseData.data.includes('Manual Test Portfolio')) {
          log('✅ Data file reading works', colors.green);
        } else {
          log('❌ Data file reading returned wrong data', colors.red);
        }
      } else {
        log(`❌ Data file reading failed: ${readResponse.statusCode}`, colors.red);
      }

      // Test serving through main server
      const serveResponse = await makeRequest({
        hostname: 'localhost',
        port: MAIN_SERVER_PORT,
        path: '/_data/test-manual-settings.yml',
        method: 'GET'
      });
      
      if (serveResponse.statusCode === 200 && serveResponse.body.includes('Manual Test Portfolio')) {
        log('✅ Data file serving through main server works', colors.green);
      } else {
        log(`❌ Data file serving failed: ${serveResponse.statusCode}`, colors.red);
      }

      // Clean up
      const deleteResponse = await makeRequest({
        hostname: 'localhost',
        port: CMS_SERVER_PORT,
        path: '/api/v1/entries/test-manual-settings',
        method: 'DELETE'
      });
      
      if (deleteResponse.statusCode === 200) {
        log('✅ Data file deletion works', colors.green);
      } else {
        log(`❌ Data file deletion failed: ${deleteResponse.statusCode}`, colors.red);
      }

    } else {
      log(`❌ Data file creation failed: ${createResponse.statusCode}`, colors.red);
    }

  } catch (error) {
    log(`❌ Data file test failed: ${error.message}`, colors.red);
  }
}

async function testMultipleCollections() {
  log('🧪 Testing multiple content collections...', colors.blue);
  
  const collections = ['current', 'choreography', 'projects', 'performances'];
  
  for (const collection of collections) {
    try {
      const testContent = `---
title: "Test ${collection} Item"
description: "Testing ${collection} collection"
thumbnail: "/images/test-${collection}.jpg"
order: 1
---

# Test ${collection.charAt(0).toUpperCase() + collection.slice(1)} Item

This is test content for the ${collection} collection.`;

      const createResponse = await makeRequest({
        hostname: 'localhost',
        port: CMS_SERVER_PORT,
        path: `/api/v1/entries/${collection}/test-${collection}-item`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({ data: testContent }));
      
      if (createResponse.statusCode === 200) {
        log(`✅ ${collection} collection creation works`, colors.green);
        
        // Clean up
        await makeRequest({
          hostname: 'localhost',
          port: CMS_SERVER_PORT,
          path: `/api/v1/entries/${collection}/test-${collection}-item`,
          method: 'DELETE'
        });
        
      } else {
        log(`❌ ${collection} collection creation failed: ${createResponse.statusCode}`, colors.red);
      }

    } catch (error) {
      log(`❌ ${collection} collection test failed: ${error.message}`, colors.red);
    }
  }
}

async function runAllTests() {
  log('🎯 Starting comprehensive CMS testing...', colors.blue);
  
  try {
    await startServers();
    
    // Give servers a moment to fully start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testMainServer();
    await testCMSBackend();
    await testDataFiles();
    await testMultipleCollections();
    
    log('🎉 All tests completed!', colors.green);
    
  } catch (error) {
    log(`💥 Test execution failed: ${error.message}`, colors.red);
  } finally {
    stopServers();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('⏹️  Received SIGINT, stopping servers...', colors.yellow);
  stopServers();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('⏹️  Received SIGTERM, stopping servers...', colors.yellow);
  stopServers();
  process.exit(0);
});

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  startServers,
  stopServers,
  testMainServer,
  testCMSBackend,
  testDataFiles,
  testMultipleCollections,
  runAllTests
};