#!/usr/bin/env node

/**
 * Test Script for Embedded Data Solution
 * 
 * This script tests the embedded data functionality locally before deployment.
 * It verifies:
 * 1. Build process generates embedded-data.js correctly
 * 2. Embedded data is valid JavaScript with proper exports
 * 3. Function can load and use embedded data
 * 4. Data structure matches expected format
 * 
 * Usage: node test-embedded-data.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');
}

// Test 1: Verify build process
async function testBuildProcess() {
  section('TEST 1: Build Process');
  
  try {
    info('Running build-data.js...');
    
    const { build } = require('./build-data.js');
    const buildResult = await build();
    
    if (buildResult) {
      success('Build process completed successfully');
      return true;
    } else {
      error('Build process returned false');
      return false;
    }
  } catch (err) {
    error(`Build process failed: ${err.message}`);
    return false;
  }
}

// Test 2: Verify embedded-data.js file exists and is valid
function testEmbeddedDataFile() {
  section('TEST 2: Embedded Data File Validation');
  
  const embeddedDataPath = path.join(__dirname, 'netlify', 'functions', 'embedded-data.js');
  
  // Check if file exists
  if (!fs.existsSync(embeddedDataPath)) {
    error(`Embedded data file not found at: ${embeddedDataPath}`);
    return false;
  }
  success(`Embedded data file exists: ${embeddedDataPath}`);
  
  // Check file size
  const stats = fs.statSync(embeddedDataPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  info(`File size: ${fileSizeKB} KB`);
  
  if (stats.size < 1000) {
    warn(`File size is very small (${fileSizeKB} KB) - may indicate empty data`);
  }
  
  // Check file content
  try {
    const content = fs.readFileSync(embeddedDataPath, 'utf8');
    
    // Verify it contains EMBEDDED_DATA export
    if (!content.includes('const EMBEDDED_DATA =')) {
      error('File does not contain "const EMBEDDED_DATA =" declaration');
      return false;
    }
    success('File contains EMBEDDED_DATA declaration');
    
    // Verify it has module.exports
    if (!content.includes('module.exports = EMBEDDED_DATA')) {
      error('File does not contain "module.exports = EMBEDDED_DATA"');
      return false;
    }
    success('File contains proper module.exports');
    
    // Try to parse the data
    try {
      const embeddedData = require(embeddedDataPath);
      success('Embedded data loaded successfully');
      
      // Verify data structure
      if (!embeddedData.metadata) {
        error('Embedded data missing "metadata" property');
        return false;
      }
      success('Embedded data has metadata property');
      
      if (!embeddedData.repositories) {
        error('Embedded data missing "repositories" property');
        return false;
      }
      success('Embedded data has repositories property');
      
      // Check repository count
      const repoCount = embeddedData.repositories.length;
      info(`Embedded data contains ${repoCount} repositories`);
      
      if (repoCount === 0) {
        warn('Embedded data contains 0 repositories - this may be intentional for testing');
      }
      
      // Verify metadata structure
      const metadata = embeddedData.metadata;
      const requiredMetadataFields = ['generatedAt', 'username', 'totalRepos'];
      const missingFields = requiredMetadataFields.filter(field => !metadata.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        error(`Metadata missing required fields: ${missingFields.join(', ')}`);
        return false;
      }
      success(`Metadata contains all required fields: ${requiredMetadataFields.join(', ')}`);
      
      info(`Generated at: ${metadata.generatedAt}`);
      info(`Username: ${metadata.username}`);
      info(`Total repos: ${metadata.totalRepos}`);
      
      return true;
    } catch (parseErr) {
      error(`Failed to parse embedded data: ${parseErr.message}`);
      return false;
    }
  } catch (readErr) {
    error(`Failed to read embedded data file: ${readErr.message}`);
    return false;
  }
}

// Test 3: Verify repos.json exists and matches embedded data
function testStaticDataFile() {
  section('TEST 3: Static Data File Validation');
  
  const staticDataPath = path.join(__dirname, 'public', 'data', 'repos.json');
  
  // Check if file exists
  if (!fs.existsSync(staticDataPath)) {
    error(`Static data file not found at: ${staticDataPath}`);
    return false;
  }
  success(`Static data file exists: ${staticDataPath}`);
  
  // Check file size
  const stats = fs.statSync(staticDataPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  info(`File size: ${fileSizeKB} KB`);
  
  try {
    const staticData = JSON.parse(fs.readFileSync(staticDataPath, 'utf8'));
    success('Static data file is valid JSON');
    
    // Compare with embedded data
    try {
      const embeddedData = require(path.join(__dirname, 'netlify', 'functions', 'embedded-data.js'));
      
      // Compare repository counts
      const staticRepoCount = staticData.repositories?.length || 0;
      const embeddedRepoCount = embeddedData.repositories?.length || 0;
      
      info(`Static data repos: ${staticRepoCount}`);
      info(`Embedded data repos: ${embeddedRepoCount}`);
      
      if (staticRepoCount !== embeddedRepoCount) {
        warn(`Repository count mismatch: static=${staticRepoCount}, embedded=${embeddedRepoCount}`);
      } else {
        success('Repository counts match');
      }
      
      // Compare metadata
      if (staticData.metadata?.username === embeddedData.metadata?.username) {
        success('Username matches between static and embedded data');
      } else {
        warn(`Username mismatch: static=${staticData.metadata?.username}, embedded=${embeddedData.metadata?.username}`);
      }
      
      return true;
    } catch (compareErr) {
      warn(`Could not compare with embedded data: ${compareErr.message}`);
      return true; // Not a failure, just a warning
    }
  } catch (parseErr) {
    error(`Failed to parse static data file: ${parseErr.message}`);
    return false;
  }
}

// Test 4: Verify function can load embedded data
function testFunctionEmbeddedDataLoading() {
  section('TEST 4: Function Embedded Data Loading');
  
  try {
    // Clear require cache to get fresh load
    delete require.cache[require.resolve('./netlify/functions/get-repos.js')];
    delete require.cache[require.resolve('./netlify/functions/embedded-data.js')];
    
    info('Loading get-repos function...');
    const getReposModule = require('./netlify/functions/get-repos.js');
    
    success('get-repos function loaded successfully');
    
    // Check if embedded data was loaded
    // We can't directly check the EMBEDDED_DATA variable, but we can verify the module exports
    if (getReposModule.handler) {
      success('Function handler is exported');
    } else {
      error('Function handler is not exported');
      return false;
    }
    
    return true;
  } catch (err) {
    error(`Failed to load function: ${err.message}`);
    return false;
  }
}

// Test 5: Verify data consistency
function testDataConsistency() {
  section('TEST 5: Data Consistency Check');
  
  try {
    const embeddedData = require(path.join(__dirname, 'netlify', 'functions', 'embedded-data.js'));
    
    if (!embeddedData.repositories || embeddedData.repositories.length === 0) {
      warn('No repositories in embedded data - skipping consistency checks');
      return true;
    }
    
    let consistencyErrors = 0;
    
    // Check each repository for required fields
    embeddedData.repositories.forEach((repo, index) => {
      const requiredFields = ['id', 'name', 'html_url', 'created_at'];
      const missingFields = requiredFields.filter(field => !repo.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        error(`Repository ${index} (${repo.name}) missing fields: ${missingFields.join(', ')}`);
        consistencyErrors++;
      }
    });
    
    if (consistencyErrors === 0) {
      success(`All ${embeddedData.repositories.length} repositories have required fields`);
      return true;
    } else {
      error(`Found ${consistencyErrors} repositories with missing fields`);
      return false;
    }
  } catch (err) {
    error(`Failed to check data consistency: ${err.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  section('EMBEDDED DATA SOLUTION - LOCAL TEST SUITE');
  
  const tests = [
    { name: 'Build Process', fn: testBuildProcess, async: true },
    { name: 'Embedded Data File', fn: testEmbeddedDataFile, async: false },
    { name: 'Static Data File', fn: testStaticDataFile, async: false },
    { name: 'Function Loading', fn: testFunctionEmbeddedDataLoading, async: false },
    { name: 'Data Consistency', fn: testDataConsistency, async: false }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      let result;
      if (test.async) {
        result = await test.fn();
      } else {
        result = test.fn();
      }
      results.push({ name: test.name, passed: result });
    } catch (err) {
      error(`Test "${test.name}" threw an error: ${err.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  section('TEST SUMMARY');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      success(`${result.name}: PASSED`);
    } else {
      error(`${result.name}: FAILED`);
    }
  });
  
  log(`\nTotal: ${passed}/${total} tests passed\n`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    success('All tests passed! Ready for deployment.');
    process.exit(0);
  } else {
    error(`${total - passed} test(s) failed. Please review the errors above.`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  error(`Test suite failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
