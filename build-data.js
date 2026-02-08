#!/usr/bin/env node

/**
 * Build Data Script
 * 
 * This script fetches all repository data from GitHub during deployment
 * and generates static files that can be used by the frontend.
 * 
 * Usage: node build-data.js
 * 
 * Output:
 * - public/data/repos.json - Static repository data
 * - public/images/repos/ - Downloaded screenshot images
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Use node-fetch for compatibility
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = require('node-fetch');
}

// Configuration
const CONFIG = {
  GITHUB_USERNAME: process.env.GITHUB_USERNAME || 'omnisonic',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  OUTPUT_DIR: path.join(__dirname, 'public', 'data'),
  IMAGES_DIR: path.join(__dirname, 'public', 'images', 'repos'),
  EXCLUDE_TOPICS: (process.env.EXCLUDE_TOPICS || '').split(',').map(t => t.trim().toLowerCase()).filter(t => t),
  MAX_RETRIES: 3,
  TIMEOUT: 30000
};

// Language colors (same as in script.js)
const LANGUAGE_COLORS = {
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'TypeScript': '#2b7489',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Java': '#b07219',
  'C': '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  'PHP': '#4F5D95',
  'Ruby': '#701516',
  'Swift': '#ffac45',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Kotlin': '#F18E33',
  'Scala': '#c22d40',
  'R': '#198ce7',
  'Shell': '#89e051',
  'PowerShell': '#012456',
  'Vue': '#2c3e50',
  'Svelte': '#ff3e00'
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 0) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries < CONFIG.MAX_RETRIES) {
      log(`Retry ${retries + 1}/${CONFIG.MAX_RETRIES} for ${url}`, 'warn');
      await sleep(1000 * (retries + 1));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

// GitHub API functions
async function fetchAllRepositories() {
  log('Fetching all repositories...');
  const GITHUB_API_URL = 'https://api.github.com';
  const username = CONFIG.GITHUB_USERNAME;
  
  let repositories = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=created&direction=desc`;
    const options = {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(CONFIG.GITHUB_TOKEN ? { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` } : {})
      },
      timeout: CONFIG.TIMEOUT
    };

    const response = await fetchWithRetry(url, options);
    const pageRepos = await response.json();

    if (pageRepos.length === 0) {
      break;
    }

    repositories = repositories.concat(pageRepos);
    log(`Fetched page ${page}, got ${pageRepos.length} repositories. Total: ${repositories.length}`);

    if (pageRepos.length < perPage) {
      break;
    }

    page++;
    if (page > 50) {
      log('Reached safety limit of 50 pages', 'warn');
      break;
    }
  }

  // Filter out forks
  const originalRepos = repositories.filter(repo => !repo.fork);
  log(`Filtered out ${repositories.length - originalRepos.length} forked repositories. ${originalRepos.length} remaining.`);
  
  return originalRepos;
}

async function fetchRepositoryTopics(repositories) {
  log(`Fetching topics for ${repositories.length} repositories...`);
  const username = CONFIG.GITHUB_USERNAME;
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const url = `https://api.github.com/repos/${username}/${repo.name}/topics`;
        const options = {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(CONFIG.GITHUB_TOKEN ? { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` } : {})
          }
        };
        
        const response = await fetchWithRetry(url, options);
        if (response.ok) {
          const topicsData = await response.json();
          repo.topics = topicsData.names || [];
        } else {
          repo.topics = [];
        }
      } catch (error) {
        log(`Error fetching topics for ${repo.name}: ${error.message}`, 'error');
        repo.topics = [];
      }
      
      return repo;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < repositories.length) {
      await sleep(100);
    }
  }

  return results;
}

async function applyTopicFilter(repositories) {
  if (CONFIG.EXCLUDE_TOPICS.length === 0) {
    log('No exclude topics configured, skipping topic filtering.');
    return repositories;
  }

  const beforeFilter = repositories.length;
  const filtered = repositories.filter(repo => {
    const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
    const hasExcludedTopic = CONFIG.EXCLUDE_TOPICS.some(excluded => repoTopics.includes(excluded));
    return !hasExcludedTopic;
  });

  const afterFilter = filtered.length;
  log(`Applied exclude topics filter: ${beforeFilter - afterFilter} repositories filtered out, ${afterFilter} remaining.`);
  
  return filtered;
}

async function fetchRepositoryDetails(repositories) {
  log(`Fetching repository details (README, languages) for ${repositories.length} repositories...`);
  const username = CONFIG.GITHUB_USERNAME;
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      // Check README
      try {
        const readmeUrl = `https://api.github.com/repos/${username}/${repo.name}/readme`;
        const options = {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(CONFIG.GITHUB_TOKEN ? { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` } : {})
          }
        };
        
        const readmeResponse = await fetchWithRetry(readmeUrl, options);
        repo.hasReadme = readmeResponse.ok;
      } catch (readmeError) {
        repo.hasReadme = false;
      }

      // Fetch languages
      try {
        const langUrl = `https://api.github.com/repos/${username}/${repo.name}/languages`;
        const options = {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(CONFIG.GITHUB_TOKEN ? { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` } : {})
          }
        };
        
        const langResponse = await fetchWithRetry(langUrl, options);
        if (langResponse.ok) {
          repo.languages = await langResponse.json();
        } else {
          repo.languages = {};
        }
      } catch (langError) {
        repo.languages = {};
      }

      return repo;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < repositories.length) {
      await sleep(100);
    }
  }

  return results;
}

async function extractScreenshotUrls(repositories) {
  log(`Extracting screenshot URLs from READMEs for ${repositories.length} repositories...`);
  const username = CONFIG.GITHUB_USERNAME;
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      if (!repo.hasReadme) {
        return { ...repo, screenshotUrl: null };
      }

      try {
        const readmeUrl = `https://api.github.com/repos/${username}/${repo.name}/readme`;
        const options = {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(CONFIG.GITHUB_TOKEN ? { 'Authorization': `token ${CONFIG.GITHUB_TOKEN}` } : {})
          }
        };
        
        const readmeResponse = await fetchWithRetry(readmeUrl, options);
        if (!readmeResponse.ok) {
          return { ...repo, screenshotUrl: null };
        }

        const readmeData = await readmeResponse.json();
        let readmeContent;
        
        if (readmeData.encoding === 'base64') {
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
        } else {
          readmeContent = readmeData.content;
        }

        // Extract first markdown image
        const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
        const markdownMatch = readmeContent.match(markdownImageRegex);
        
        if (markdownMatch && markdownMatch[1]) {
          let imageUrl = markdownMatch[1];
          
          // Handle relative URLs
          if (imageUrl.startsWith('assets/') || imageUrl.startsWith('./assets/')) {
            const cleanPath = imageUrl.replace(/^\.\//, '');
            imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/${cleanPath}`;
          }
          
          // Skip data URLs
          if (imageUrl.startsWith('data:')) {
            return { ...repo, screenshotUrl: null };
          }
          
          return { ...repo, screenshotUrl: imageUrl };
        }
        
        return { ...repo, screenshotUrl: null };
        
      } catch (error) {
        return { ...repo, screenshotUrl: null };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < repositories.length) {
      await sleep(100);
    }
  }

  return results;
}

// Image processing functions
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);
    
    // Handle HTTPS request
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(filepath);
          log(`Downloaded image: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(2)} KB)`);
          resolve(filepath);
        });
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete temp file
      reject(err);
    });
  });
}

async function downloadAllScreenshots(repositories) {
  const reposWithScreenshots = repositories.filter(r => r.screenshotUrl);
  log(`Downloading screenshots for ${reposWithScreenshots.length} repositories...`);

  const results = [];
  const batchSize = 3; // Conservative for file operations

  for (let i = 0; i < reposWithScreenshots.length; i += batchSize) {
    const batch = reposWithScreenshots.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const extension = path.extname(repo.screenshotUrl) || '.png';
        const filename = `${repo.name}${extension}`;
        const filepath = path.join(CONFIG.IMAGES_DIR, filename);
        
        // Check if file already exists
        if (fs.existsSync(filepath)) {
          log(`Image already exists for ${repo.name}, skipping download`);
          return { ...repo, localScreenshotPath: `/images/repos/${filename}` };
        }

        await downloadImage(repo.screenshotUrl, filepath);
        return { ...repo, localScreenshotPath: `/images/repos/${filename}` };
      } catch (error) {
        log(`Failed to download screenshot for ${repo.name}: ${error.message}`, 'error');
        return { ...repo, localScreenshotPath: null };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches
    if (i + batchSize < reposWithScreenshots.length) {
      await sleep(500);
    }
  }

  // Merge results back with repos that don't have screenshots
  const allResults = repositories.map(repo => {
    const downloaded = results.find(r => r.name === repo.name);
    return downloaded || repo;
  });

  return allResults;
}

// Data processing functions
function cleanRepositoryData(repositories) {
  return repositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    homepage: repo.homepage,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    topics: repo.topics || [],
    languages: repo.languages || {},
    hasReadme: repo.hasReadme || false,
    screenshotUrl: repo.localScreenshotPath || repo.screenshotUrl || null,
    // Add computed fields for frontend
    homepageUrl: repo.homepage || ''
  }));
}

function sortRepositories(repositories) {
  return repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getLanguageStats(repositories) {
  const stats = {};
  repositories.forEach(repo => {
    Object.keys(repo.languages || {}).forEach(lang => {
      stats[lang] = (stats[lang] || 0) + 1;
    });
  });
  return stats;
}

// Main build process
async function build() {
  const startTime = Date.now();
  
  log('Starting build process...');
  log(`Configuration: ${JSON.stringify({
    username: CONFIG.GITHUB_USERNAME,
    excludeTopics: CONFIG.EXCLUDE_TOPICS,
    outputDir: CONFIG.OUTPUT_DIR,
    imagesDir: CONFIG.IMAGES_DIR
  }, null, 2)}`);

  try {
    // Ensure output directories exist
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
      log(`Created output directory: ${CONFIG.OUTPUT_DIR}`);
    }
    
    if (!fs.existsSync(CONFIG.IMAGES_DIR)) {
      fs.mkdirSync(CONFIG.IMAGES_DIR, { recursive: true });
      log(`Created images directory: ${CONFIG.IMAGES_DIR}`);
    }

    // Step 1: Fetch all repositories
    let repositories = await fetchAllRepositories();
    log(`Total repositories fetched: ${repositories.length}`);

    // Step 2: Fetch topics
    repositories = await fetchRepositoryTopics(repositories);

    // Step 3: Apply topic filtering
    repositories = await applyTopicFilter(repositories);

    // Step 4: Fetch detailed information
    repositories = await fetchRepositoryDetails(repositories);

    // Step 5: Extract screenshot URLs
    repositories = await extractScreenshotUrls(repositories);

    // Step 6: Download screenshots
    repositories = await downloadAllScreenshots(repositories);

    // Step 7: Clean and sort data
    repositories = cleanRepositoryData(repositories);
    repositories = sortRepositories(repositories);

    // Step 8: Generate final data file
    const finalData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        username: CONFIG.GITHUB_USERNAME,
        totalRepos: repositories.length,
        languageStats: getLanguageStats(repositories)
      },
      repositories: repositories
    };

    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'repos.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    
    log(`Generated static data file: ${outputPath}`);
    log(`Total repositories in final data: ${repositories.length}`);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const reposWithScreenshots = repositories.filter(r => r.screenshotUrl).length;
    
    log('=== BUILD SUMMARY ===');
    log(`Duration: ${duration}s`);
    log(`Total repositories: ${repositories.length}`);
    log(`Repositories with screenshots: ${reposWithScreenshots}`);
    log(`Language stats: ${JSON.stringify(finalData.metadata.languageStats, null, 2)}`);
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
  build();
}

module.exports = { build };