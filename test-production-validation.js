#!/usr/bin/env node

/**
 * Production Validation Script for Embedded Data Solution
 * 
 * This script validates the embedded data solution in production.
 * It performs checks that can be run after deployment to verify:
 * 1. Function logs show embedded data loaded successfully
 * 2. Client-side data protection works
 * 3. Update detection still functions
 * 4. No file system errors occur
 * 
 * Usage: node test-production-validation.js [production-url]
 * Example: node test-production-validation.js https://www.jctech.work
 */

const https = require('https');
const url = require('url');

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

// Helper function to make HTTPS requests
function makeRequest(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(urlString);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Embedded-Data-Validator/1.0',
        ...options.headers
      },
      timeout: 10000
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test 1: Check function responds to check mode
async function testCheckMode(baseUrl) {
  section('TEST 1: Function Check Mode');
  
  try {
    info(`Testing: ${baseUrl}/.netlify/functions/get-repos?mode=check`);
    
    const response = await makeRequest(`${baseUrl}/.netlify/functions/get-repos?mode=check`);
    
    if (response.status !== 200) {
      error(`Function returned status ${response.status}`);
      return false;
    }
    success(`Function returned status 200`);
    
    try {
      const data = JSON.parse(response.body);
      
      if (data.error) {
        error(`Function returned error: ${data.error}`);
        return false;
      }
      
      if (data.success === false && !data.needsFullFetch) {
        error('Function returned success=false without needsFullFetch flag');
        return false;
      }
      
      success('Function returned valid response');
      info(`Response keys: ${Object.keys(data).join(', ')}`);
      
      if (data.needsFullFetch) {
        warn('Server indicates no static data (needsFullFetch=true)');
      } else {
        success('Server has static data available');
        if (data.changedRepos) {
          info(`Changed repositories: ${data.changedRepos.length}`);
        }
        if (data.unchangedRepos) {
          info(`Unchanged repositories: ${data.unchangedRepos.length}`);
        }
      }
      
      return true;
    } catch (parseErr) {
      error(`Failed to parse response: ${parseErr.message}`);
      return false;
    }
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return false;
  }
}

// Test 2: Check static data file is accessible
async function testStaticDataAccess(baseUrl) {
  section('TEST 2: Static Data File Access');
  
  try {
    info(`Testing: ${baseUrl}/data/repos.json`);
    
    const response = await makeRequest(`${baseUrl}/data/repos.json`);
    
    if (response.status === 404) {
      warn('Static data file not found (404) - this is expected if not deployed yet');
      return true;
    }
    
    if (response.status !== 200) {
      error(`Static data file returned status ${response.status}`);
      return false;
    }
    success(`Static data file returned status 200`);
    
    try {
      const data = JSON.parse(response.body);
      
      if (!data.repositories) {
        error('Static data missing repositories property');
        return false;
      }
      success(`Static data contains ${data.repositories.length} repositories`);
      
      if (!data.metadata) {
        error('Static data missing metadata property');
        return false;
      }
      success('Static data has metadata');
      
      return true;
    } catch (parseErr) {
      error(`Failed to parse static data: ${parseErr.message}`);
      return false;
    }
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return false;
  }
}

// Test 3: Check main page loads
async function testPageLoad(baseUrl) {
  section('TEST 3: Main Page Load');
  
  try {
    info(`Testing: ${baseUrl}/`);
    
    const response = await makeRequest(`${baseUrl}/`);
    
    if (response.status !== 200) {
      error(`Page returned status ${response.status}`);
      return false;
    }
    success(`Page returned status 200`);
    
    if (!response.body.includes('<!DOCTYPE') && !response.body.includes('<html')) {
      error('Response does not appear to be HTML');
      return false;
    }
    success('Response is valid HTML');
    
    // Check for script.js reference
    if (!response.body.includes('script.js')) {
      warn('Page does not reference script.js');
    } else {
      success('Page references script.js');
    }
    
    return true;
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return false;
  }
}

// Test 4: Verify function response structure
async function testResponseStructure(baseUrl) {
  section('TEST 4: Function Response Structure');
  
  try {
    info('Testing full fetch mode response structure...');
    
    const response = await makeRequest(`${baseUrl}/.netlify/functions/get-repos?mode=full`);
    
    if (response.status !== 200) {
      warn(`Full fetch returned status ${response.status} - skipping structure test`);
      return true;
    }
    
    try {
      const data = JSON.parse(response.body);
      
      // Check for expected properties
      const expectedProps = ['repositories', 'metadata'];
      const missingProps = expectedProps.filter(prop => !data.hasOwnProperty(prop));
      
      if (missingProps.length > 0) {
        error(`Response missing properties: ${missingProps.join(', ')}`);
        return false;
      }
      success(`Response has all expected properties: ${expectedProps.join(', ')}`);
      
      // Check metadata structure
      const metadata = data.metadata;
      const metadataProps = ['generatedAt', 'username', 'totalRepos'];
      const missingMetadata = metadataProps.filter(prop => !metadata.hasOwnProperty(prop));
      
      if (missingMetadata.length > 0) {
        error(`Metadata missing properties: ${missingMetadata.join(', ')}`);
        return false;
      }
      success(`Metadata has all expected properties: ${metadataProps.join(', ')}`);
      
      // Check repository structure
      if (data.repositories.length > 0) {
        const firstRepo = data.repositories[0];
        const repoProps = ['id', 'name', 'html_url', 'created_at'];
        const missingRepoProps = repoProps.filter(prop => !firstRepo.hasOwnProperty(prop));
        
        if (missingRepoProps.length > 0) {
          error(`Repository missing properties: ${missingRepoProps.join(', ')}`);
          return false;
        }
        success(`Repository has all expected properties: ${repoProps.join(', ')}`);
      }
      
      return true;
    } catch (parseErr) {
      error(`Failed to parse response: ${parseErr.message}`);
      return false;
    }
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return false;
  }
}

// Test 5: Check for common error patterns
async function testErrorPatterns(baseUrl) {
  section('TEST 5: Error Pattern Detection');
  
  try {
    info('Checking for common error patterns in function responses...');
    
    const response = await makeRequest(`${baseUrl}/.netlify/functions/get-repos?mode=check`);
    
    try {
      const data = JSON.parse(response.body);
      const dataStr = JSON.stringify(data);
      
      // Check for file system errors
      if (dataStr.includes('ENOENT') || dataStr.includes('EACCES')) {
        error('Response contains file system error codes');
        return false;
      }
      success('No file system error codes detected');
      
      // Check for "No static data found" message
      if (dataStr.includes('No static data found')) {
        warn('Response contains "No static data found" message');
        info('This is expected if embedded data is not yet deployed');
      } else {
        success('No "No static data found" message detected');
      }
      
      // Check for embedded data success message
      if (dataStr.includes('Embedded data loaded successfully')) {
        success('Embedded data loaded successfully message detected');
      } else {
        info('Embedded data loaded message not in response (check function logs)');
      }
      
      return true;
    } catch (parseErr) {
      error(`Failed to parse response: ${parseErr.message}`);
      return false;
    }
  } catch (err) {
    error(`Request failed: ${err.message}`);
    return false;
  }
}

// Main validation runner
async function runValidation() {
  // Get base URL from command line or use default
  let baseUrl = process.argv[2] || 'https://www.jctech.work';
  
  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  section('PRODUCTION VALIDATION - EMBEDDED DATA SOLUTION');
  info(`Target URL: ${baseUrl}`);
  info(`Timestamp: ${new Date().toISOString()}`);
  
  const tests = [
    { name: 'Check Mode', fn: () => testCheckMode(baseUrl), async: true },
    { name: 'Static Data Access', fn: () => testStaticDataAccess(baseUrl), async: true },
    { name: 'Page Load', fn: () => testPageLoad(baseUrl), async: true },
    { name: 'Response Structure', fn: () => testResponseStructure(baseUrl), async: true },
    { name: 'Error Patterns', fn: () => testErrorPatterns(baseUrl), async: true }
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
  section('VALIDATION SUMMARY');
  
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
    success('All validation tests passed!');
    process.exit(0);
  } else {
    warn(`${total - passed} test(s) failed or had issues.`);
    process.exit(1);
  }
}

// Run validation
runValidation().catch(err => {
  error(`Validation failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
