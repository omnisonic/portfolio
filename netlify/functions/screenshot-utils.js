const fs = require('fs');
const path = require('path');

/**
 * Server-side screenshot matching utility
 * This runs at build time to match screenshots to repositories
 */

const SCREENSHOT_DIR = path.join(__dirname, '../../assets/screenshots');
const SCREENSHOT_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Get all screenshot files from the screenshots directory
 */
function getAllScreenshotFiles() {
  try {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      return [];
    }
    
    return fs.readdirSync(SCREENSHOT_DIR)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return SCREENSHOT_EXTENSIONS.includes(ext);
      });
  } catch (error) {
    console.error('Error reading screenshot directory:', error);
    return [];
  }
}

/**
 * Find screenshot for a repository using strict patterns
 */
function findStrictScreenshot(repoName, allFiles) {
  const patterns = [
    `${repoName}`,
    `${repoName}-screenshot`,
    `${repoName}-preview`,
    `${repoName}-demo`,
    `${repoName}-img`
  ];

  for (const ext of SCREENSHOT_EXTENSIONS) {
    for (const pattern of patterns) {
      const filename = `${pattern}${ext}`;
      if (allFiles.includes(filename)) {
        return `assets/screenshots/${filename}`;
      }
    }
  }

  return null;
}

/**
 * Find screenshot for a repository using flexible patterns
 */
function findFlexibleScreenshot(repoName, allFiles) {
  const normalizedRepoName = repoName.toLowerCase();
  
  // Try flexible patterns
  const flexiblePatterns = [
    `Screenshot ${repoName}`,
    `Screenshot ${repoName} preview`,
    `${repoName} screenshot`,
    `${repoName} preview`,
    `${repoName} demo`
  ];

  for (const ext of SCREENSHOT_EXTENSIONS) {
    for (const pattern of flexiblePatterns) {
      // Try exact pattern
      const exactFilename = `${pattern}${ext}`;
      if (allFiles.includes(exactFilename)) {
        return `assets/screenshots/${exactFilename}`;
      }
      
      // Try with spaces replaced
      const spaceReplaced = pattern.replace(/\s+/g, ' ');
      if (allFiles.includes(spaceReplaced)) {
        return `assets/screenshots/${spaceReplaced}`;
      }
    }
  }

  return null;
}

/**
 * Find screenshot for a repository using partial name matching
 */
function findPartialScreenshot(repoName, allFiles) {
  const normalizedRepoName = repoName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Generate variations
  const variations = [
    repoName,
    repoName.replace(/-/g, ' '),
    repoName.replace(/_/g, ' '),
    repoName.split('-')[0],
    repoName.split('_')[0]
  ];

  const uniqueVariations = [...new Set(variations.map(v => v.toLowerCase()))];

  for (const file of allFiles) {
    const lowerFile = file.toLowerCase();
    const fileNameWithoutExt = path.parse(lowerFile).name;
    
    // Check if any variation matches
    for (const variation of uniqueVariations) {
      if (fileNameWithoutExt.includes(variation) || variation.includes(fileNameWithoutExt)) {
        return `assets/screenshots/${file}`;
      }
    }
  }

  return null;
}

/**
 * Main function to find screenshot for a repository
 */
function findScreenshotForRepo(repoName) {
  const allFiles = getAllScreenshotFiles();
  
  if (allFiles.length === 0) {
    return null;
  }

  // 1. Try strict patterns first
  const strictMatch = findStrictScreenshot(repoName, allFiles);
  if (strictMatch) return strictMatch;

  // 2. Try flexible patterns
  const flexibleMatch = findFlexibleScreenshot(repoName, allFiles);
  if (flexibleMatch) return flexibleMatch;

  // 3. Try partial matching
  const partialMatch = findPartialScreenshot(repoName, allFiles);
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Add screenshot URLs to repository data
 */
function addScreenshotUrls(repositories) {
  return repositories.map(repo => ({
    ...repo,
    screenshotUrl: findScreenshotForRepo(repo.name)
  }));
}

module.exports = {
  findScreenshotForRepo,
  addScreenshotUrls,
  getAllScreenshotFiles
};