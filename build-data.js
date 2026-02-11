#!/usr/bin/env node

/**
 * Build Data Script (Minimal Version)
 * 
 * This script is now minimal since all data fetching happens at runtime
 * via the Netlify functions. This script just ensures directories exist.
 * 
 * Usage: node build-data.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, 'public', 'data'),
  IMAGES_DIR: path.join(__dirname, 'public', 'images', 'repos'),
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function build() {
  const startTime = Date.now();
  
  log('Starting minimal build process...');
  log('Note: All data fetching now happens at runtime via Netlify functions');

  try {
    // Ensure output directories exist
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
      log(`Created output directory: ${CONFIG.OUTPUT_DIR}`);
    } else {
      log(`Output directory already exists: ${CONFIG.OUTPUT_DIR}`);
    }
    
    if (!fs.existsSync(CONFIG.IMAGES_DIR)) {
      fs.mkdirSync(CONFIG.IMAGES_DIR, { recursive: true });
      log(`Created images directory: ${CONFIG.IMAGES_DIR}`);
    } else {
      log(`Images directory already exists: ${CONFIG.IMAGES_DIR}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('=== BUILD SUMMARY ===');
    log('Duration: ' + duration + 's');
    log('Status: Directories prepared for runtime data fetching');
    log('Next: Data will be fetched on first page load via Netlify functions');
    log('=====================');

    return true;

  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled rejection at: ${promise}`, 'error');
    log(`Reason: ${reason}`, 'error');
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    log(`Uncaught exception: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  });

  build().then(success => {
    if (success) {
      log('Build completed successfully', 'info');
      process.exit(0); // Exit with success code
    } else {
      log('Build completed with errors', 'warn');
      process.exit(1); // Exit with error code
    }
  }).catch(error => {
    log(`Build failed: ${error.message}`, 'error');
    log(error.stack, 'error');
    process.exit(1);
  });
}

module.exports = { build };
