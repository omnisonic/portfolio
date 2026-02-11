const cache = require('./cache-utils');
const path = require('path');
const fs = require('fs').promises;
const GitHubClient = require('./github-client');
const RepositoryProcessor = require('./repository-processor');
const StaticDataManager = require('./static-data-manager');

// Try to load embedded data (generated during build)
let EMBEDDED_DATA = null;
try {
  EMBEDDED_DATA = require('./embedded-data.js');
  console.log('Embedded data loaded successfully');
} catch (error) {
  console.warn('Embedded data not available:', error.message);
  console.warn('Will fall back to file system reads');
}

// Fetch cache - will be initialized on first use
const fetchCache = {};

/**
 * Get fetch function (handles ESM module loading)
 */
async function getFetch() {
  if (fetchCache.fetch) return fetchCache.fetch;
  
  try {
    // Try to use global fetch first (Node.js 18+)
    if (typeof global.fetch !== 'undefined') {
      console.log('Using global fetch (Node.js 18+)');
      fetchCache.fetch = global.fetch;
      return fetchCache.fetch;
    }
    
    // Fall back to node-fetch for older Node.js versions
    console.log('Using node-fetch module');
    const nodeFetch = await import('node-fetch');
    fetchCache.fetch = nodeFetch.default;
    return fetchCache.fetch;
  } catch (error) {
    console.error('Failed to initialize fetch:', error.message);
    throw new Error('Unable to load fetch function. Please ensure node-fetch is installed.');
  }
}

// Initialize modules
const staticDataManager = new StaticDataManager();
const repositoryProcessor = new RepositoryProcessor();

// Initialize GitHub client
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Validate GitHub username is configured
if (!GITHUB_USERNAME) {
  console.error('CRITICAL: GITHUB_USERNAME environment variable is not set');
}

const githubClient = new GitHubClient(GITHUB_USERNAME, GITHUB_TOKEN);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  console.error(error.stack);
  process.exit(1);
});

exports.handler = async function (event, context) {
  console.log('=== GET-REPOS FUNCTION START ===');
  console.log('Data source tracking enabled');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));





  // Check for specific variables we need
  const githubUsername = process.env.GITHUB_USERNAME;
  const githubToken = process.env.GITHUB_TOKEN;
  const nodeEnv = process.env.NODE_ENV;

  


  // Check for Netlify-specific environment variables
  const netlifyEnvVars = Object.keys(process.env).filter(key =>
    key.toLowerCase().includes('netlify') ||
    key.toLowerCase().includes('github') ||
    key.toLowerCase().includes('env')
  );
  console.log('Netlify/GitHub related env vars:', netlifyEnvVars);

  console.log('==================================');



  // Check for cache clear request
  if (event.queryStringParameters && event.queryStringParameters.clear === 'true') {
    console.log('Cache clear requested');
    const cleared = cache.clearCache();
    console.log('Cache cleared:', cleared);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cache cleared successfully',
        clearedEntries: cleared,
        logs: [
          { timestamp: new Date().toISOString(), message: 'Cache clear requested' },
          { timestamp: new Date().toISOString(), message: `Cache cleared: ${cleared}` }
        ]
      })
    };
  }

  // Check for mode parameter
  const mode = event.queryStringParameters?.mode || 'full';
  console.log('Operation mode:', mode);
  const logs = [{ timestamp: new Date().toISOString(), message: `Operation mode: ${mode}` }];

  if (!GITHUB_USERNAME) {
    console.error('GitHub username not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub username not configured' })
    };
  }

  // Get exclude topics from environment variable
  const excludeTopicsEnv = process.env.EXCLUDE_TOPICS || '';
  const excludeTopics = excludeTopicsEnv.split(',').map(t => t.trim().toLowerCase()).filter(t => t);

  console.log('Exclude topics configuration:', {
    envValue: excludeTopicsEnv,
    parsed: excludeTopics,
    count: excludeTopics.length
  });

  try {
    let result;
    if (mode === 'check') {
      // Lightweight check for updates
      result = await checkForUpdates(githubClient, excludeTopics);
    } else if (mode === 'update') {
      // Update changed repositories
      // Parse body if it's a string (Netlify sends it as string)
      let body = event.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.error('Failed to parse request body:', e.message);
          body = null;
        }
      }
      result = await updateChangedRepos(event.queryStringParameters, githubClient, excludeTopics, body);
    } else {
      // Full fetch (default)
      result = await fetchAllRepositories(githubClient, excludeTopics);
    }

    // Add logs to the result
    if (result.body) {
      const body = JSON.parse(result.body);
      body.logs = logs;
      result.body = JSON.stringify(body, null, 2);
    }

    return result;
  } catch (error) {
    console.error('Error in get-repos:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch repositories',
        details: error.message,
        type: error.constructor.name,
        logs: logs
      })
    };
  }
};

// Export for testing
module.exports = {
  handler: exports.handler,
  checkForUpdates,
  updateChangedRepos,
  fetchAllRepositories
};

/**
 * Check for repository updates by fetching only lightweight data
 */
async function checkForUpdates(githubClient, excludeTopics) {
  console.log('=== CHECK FOR UPDATES START ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Check if githubClient is properly initialized
    console.log('Checking GitHub client initialization...');
    console.log('githubClient exists:', !!githubClient);
    console.log('githubClient.fetchRepositories exists:', !!githubClient?.fetchRepositories);
    
    if (!githubClient || !githubClient.fetchRepositories) {
      console.error('GitHub client not properly initialized');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'GitHub client not initialized',
          details: 'githubClient is missing or fetchRepositories method is not available'
        })
      };
    }

    // Check if username is set
    console.log('Checking GitHub username...');
    console.log('githubClient.username:', githubClient.username || 'NOT_SET');
    
    if (!githubClient.username) {
      console.error('GitHub username not set in client');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'GitHub username not configured',
          details: 'GitHub username is required to fetch repositories'
        })
      };
    }

    console.log(`Fetching repositories for user: ${githubClient.username}`);

    // Fetch only name, updated_at, and pushed_at for all repos
    let response;
    try {
      console.log('Calling githubClient.fetchRepositories...');
      response = await githubClient.fetchRepositories({
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      });
      console.log('GitHub API response received');
      console.log('Response type:', typeof response);
      console.log('Response is array:', Array.isArray(response));
      console.log('Response length:', response?.length || 'N/A');
    } catch (fetchError) {
      console.error('Failed to fetch repositories from GitHub API');
      console.error('Error message:', fetchError.message);
      console.error('Error type:', fetchError.constructor.name);
      console.error('Error stack:', fetchError.stack);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch repositories from GitHub API',
          details: fetchError.message
        })
      };
    }

    if (!Array.isArray(response)) {
      console.error('Unexpected response format from GitHub API:', typeof response);
      console.error('Response content:', JSON.stringify(response).substring(0, 500));
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Invalid response from GitHub API',
          details: 'Expected array of repositories'
        })
      };
    }

    const repos = response.filter(repo => !repo.fork);
    console.log(`Fetched ${repos.length} non-forked repositories from ${response.length} total`);

    // Apply exclude topics filtering
    if (excludeTopics.length > 0) {
      console.log(`Applying exclude topics filter with ${excludeTopics.length} topics...`);
      const filtered = repos.filter(repo => {
        const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
        const hasExcludedTopic = excludeTopics.some(excluded => repoTopics.includes(excluded));
        return !hasExcludedTopic;
      });
      console.log(`Applied exclude topics filter: ${repos.length - filtered.length} repositories filtered out`);
      repos.length = 0;
      repos.push(...filtered);
    }

    // Load existing static data - use embedded data as primary source
    // File system is not accessible in Netlify serverless environment
    console.log('Loading existing static data from embedded source...');
    let staticData = EMBEDDED_DATA;

    if (!staticData || !staticData.repositories || staticData.repositories.length === 0) {
      console.log('No embedded data available');
      console.log('NOTE: Client may still have valid static data loaded');
      console.log('Returning needsFullFetch: true to trigger client-side full fetch');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          needsFullFetch: true,
          reason: 'No embedded data available on server'
        })
      };
    }

    console.log('Using embedded static data');
    console.log('Static data repositories count:', staticData.repositories.length);

    // Compare updated_at timestamps to find changed repos
    console.log('Comparing repositories for changes...');
    const changedRepos = [];
    const unchangedRepos = [];

    for (const repo of repos) {
      try {
        const existingRepo = staticData.repositories?.find(r => r.name === repo.name);
        if (existingRepo) {
          // Safe timestamp extraction with proper fallback
          // Use updated_at as primary, then pushed_at, then current time as fallback
          const existingUpdated = new Date(existingRepo.updated_at || existingRepo.pushed_at || new Date(0)).getTime();
          const currentUpdated = new Date(repo.updated_at || repo.pushed_at || new Date(0)).getTime();
          
          // Use pushed_at as primary, then updated_at, then current time as fallback
          const existingPushed = new Date(existingRepo.pushed_at || existingRepo.updated_at || new Date(0)).getTime();
          const currentPushed = new Date(repo.pushed_at || repo.updated_at || new Date(0)).getTime();

          console.log(`=== REPO COMPARISON: ${repo.name} ===`);
          console.log('Existing data:');
          console.log('  updated_at:', existingRepo.updated_at || 'N/A');
          console.log('  pushed_at:', existingRepo.pushed_at || 'N/A');
          console.log('Current GitHub data:');
          console.log('  updated_at:', repo.updated_at || 'N/A');
          console.log('  pushed_at:', repo.pushed_at || 'N/A');
          console.log('Timestamps (ms):');
          console.log('  existingUpdated:', existingUpdated);
          console.log('  currentUpdated:', currentUpdated);
          console.log('  existingPushed:', existingPushed);
          console.log('  currentPushed:', currentPushed);

          // Consider repo changed if either updated_at or pushed_at has changed
          // This ensures we catch changes regardless of which timestamp was updated
          const isUpdatedChanged = currentUpdated > existingUpdated;
          const isPushedChanged = currentPushed > existingPushed;
          console.log('Comparison results:');
          console.log('  updated_at changed:', isUpdatedChanged);
          console.log('  pushed_at changed:', isPushedChanged);

          if (isUpdatedChanged || isPushedChanged) {
            console.log(`REPO MARKED AS CHANGED: ${repo.name}`);
            changedRepos.push({
              name: repo.name,
              updated_at: repo.updated_at,
              pushed_at: repo.pushed_at
            });
          } else {
            console.log(`REPO MARKED AS UNCHANGED: ${repo.name}`);
            unchangedRepos.push(repo.name);
          }
        } else {
          console.log(`NEW REPOSITORY DETECTED: ${repo.name}`);
          // New repository not in static data
          changedRepos.push({
            name: repo.name,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at
          });
        }
      } catch (comparisonError) {
        console.error(`Error comparing repo ${repo.name}:`, comparisonError.message);
      }
    }

    console.log(`Update check complete: ${changedRepos.length} changed repos, ${unchangedRepos.length} unchanged repos`);
    console.log('=== CHECK FOR UPDATES END ===');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        needsFullFetch: false,
        changedRepos: changedRepos,
        unchangedRepos: unchangedRepos,
        totalRepos: repos.length,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('=== CHECK FOR UPDATES ERROR ===');
    console.error('Error checking for updates:', error);
    console.error('Error message:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to check for updates',
        details: error.message,
        type: error.constructor.name
      })
    };
  }
}

/**
 * Update only the changed repositories
 */
async function updateChangedRepos(queryParams, githubClient, excludeTopics, body) {
  console.log('Updating changed repositories...');
  console.log('Query params:', queryParams);
  console.log('Body:', body);
  console.log('NOTE: Runtime updates are ephemeral - changes will not persist between deployments');

  // Try to get changedRepos from body first (POST request), then from query params
  let changedRepoNames;
  
  if (body && body.changedRepos) {
    console.log('Using changedRepos from request body');
    changedRepoNames = body.changedRepos;
  } else if (queryParams && queryParams.changedRepos) {
    console.log('Using changedRepos from query parameters');
    changedRepoNames = JSON.parse(queryParams.changedRepos);
  } else {
    console.error('changedRepos parameter is required');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'changedRepos parameter is required' })
    };
  }

  console.log(`Updating ${changedRepoNames.length} changed repositories...`);

  try {
    // Load existing static data from embedded source
    // File system is not accessible in Netlify serverless environment
    console.log('Loading static data from embedded source for update...');
    const staticData = EMBEDDED_DATA;

    if (!staticData || !staticData.repositories || staticData.repositories.length === 0) {
      console.error('No embedded data available for update');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No embedded data available for update' })
      };
    }

    console.log('Using embedded static data for update');
    console.log('Static data repositories count:', staticData.repositories.length);

    // Fetch full details for changed repositories
    const updatedRepos = await fetchRepositoryDetails(changedRepoNames, githubClient, excludeTopics);

    // Update static data in memory
    const updatedStaticData = staticDataManager.updateStaticData(staticData, updatedRepos);
    
    // NOTE: Do NOT save to file - Netlify functions run in read-only environment
    // Runtime updates are ephemeral and will be lost between deployments
    // Data will be refreshed on next deployment via build-data.js
    console.log('Skipping file write - running in read-only Netlify environment');
    console.log('Updated data will be returned but not persisted');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        updatedRepos: updatedRepos.length,
        totalRepos: updatedStaticData.repositories.length,
        timestamp: updatedStaticData.metadata.generatedAt,
        note: 'Runtime updates are ephemeral - data will not persist between deployments'
      })
    };
  } catch (error) {
    console.error('Error updating changed repositories:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update changed repositories', details: error.message })
    };
  }
}

/**
 * Fetch all repositories with full details (original functionality)
 */
async function fetchAllRepositories(githubClient, excludeTopics) {
  console.log(`Starting to fetch all repositories...`);

  try {
    // Fetch all repositories with pagination
    let repositories = [];
    let page = 1;
    const perPage = 100; // Maximum per page for GitHub API

    while (true) {
      const response = await githubClient.fetchRepositories({
        per_page: perPage,
        page: page,
        sort: 'created',
        direction: 'desc'
      });

      const pageRepos = response;

      if (pageRepos.length === 0) {
        // No more repositories to fetch
        break;
      }

      repositories = repositories.concat(pageRepos);
      console.log(`Fetched page ${page}, got ${pageRepos.length} repositories. Total: ${repositories.length}`);

      // Check if we've reached the last page
      // If we got exactly perPage repositories, we might have more pages
      // But if we got fewer, we've reached the end
      if (pageRepos.length < perPage) {
        break;
      }

      // Also check if we've reached the maximum number of repositories
      // GitHub API returns up to 1000 repositories for unauthenticated requests
      // and more for authenticated requests, but let's be safe
      if (repositories.length >= 1000) {
        console.warn('Reached maximum repository limit of 1000');
        break;
      }

      page++;

      // Safety limit to prevent infinite loops
      if (page > 50) {
        console.warn('Reached safety limit of 50 pages');
        break;
      }
    }

    // Filter out forked repositories
    repositories = repositoryProcessor.filterForks(repositories);
    console.log(`Filtered out ${repositories.length - repositories.length} forked repositories. ${repositories.length} remaining.`);

    // Fetch topics for each repository
    console.log(`Fetching topics for ${repositories.length} repositories...`);
    const reposWithTopics = await fetchRepositoryTopics(repositories, githubClient);
    repositories = reposWithTopics;

    // Apply exclude topics filtering
    if (excludeTopics.length > 0) {
      const beforeFilter = repositories.length;
      repositories = repositories.filter(repo => !repositoryProcessor.shouldExcludeRepository(repo));
      const afterFilter = repositories.length;
      console.log(`Applied exclude topics filter: ${beforeFilter - afterFilter} repositories filtered out, ${afterFilter} remaining.`);
    } else {
      console.log('No exclude topics configured, skipping topic filtering.');
    }

    // Add homepage URL to repositories
    repositories = repositoryProcessor.addHomepageUrls(repositories);

    // Sort repositories by creation date
    repositories = repositoryProcessor.sortByCreationDate(repositories);

    // Process repositories for README and screenshots
    console.log(`Processing ${repositories.length} repositories for README and screenshots...`);
    repositories = await repositoryProcessor.processRepositories(repositories, githubClient.username);

    // Create static data structure
    const staticData = staticDataManager.createStaticData(repositories, githubClient.username, excludeTopics);

    // Save static data
    await staticDataManager.saveStaticData(staticData);

    return {
      statusCode: 200,
      body: JSON.stringify(staticData),
      headers: {
        'X-Cache': 'MISS'
      }
    };
  } catch (error) {
    console.error('Error fetching all repositories:', error);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch repositories',
        details: error.message,
        type: error.constructor.name
      })
    };
  }
}

/**
 * Fetch repository details for specific repositories
 */
async function fetchRepositoryDetails(repoNames, githubClient, excludeTopics) {
  console.log(`Fetching details for ${repoNames.length} specific repositories...`);

  const results = [];
  const batchSize = 5;

  for (let i = 0; i < repoNames.length; i += batchSize) {
    const batch = repoNames.slice(i, i + batchSize);

    const batchPromises = batch.map(async (repoName) => {
      try {
        // Fetch repository info
        const repo = await githubClient.fetchRepositoryDetails(repoName);

        // Fetch topics
        try {
          const topicsData = await githubClient.fetchRepositoryTopics(repoName);
          repo.topics = topicsData.names || [];
        } catch (error) {
          console.error(`Error fetching topics for ${repoName}:`, error.message);
          repo.topics = [];
        }

        // Apply exclude topics filtering
        if (excludeTopics.length > 0 && repositoryProcessor.shouldExcludeRepository(repo)) {
          console.log(`Repository ${repoName} excluded due to topic filtering`);
          return null;
        }

        // Check README
        try {
          const readmeData = await githubClient.fetchRepositoryReadme(repoName);
          repo.hasReadme = true;

          // Fetch README content if available
          let readmeContent;
          if (readmeData.encoding === 'base64') {
            readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
          } else {
            readmeContent = readmeData.content;
          }
          repo.readmeContent = readmeContent;
          
          // Extract screenshot URL from README content
          const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
          const markdownMatch = readmeContent.match(markdownImageRegex);
          
          if (markdownMatch && markdownMatch[1]) {
            let imageUrl = markdownMatch[1];
            
            // Handle relative URLs - convert to GitHub raw URLs
            if (imageUrl.startsWith('assets/') || imageUrl.startsWith('./assets/')) {
              const cleanPath = imageUrl.replace(/^\.\//, '');
              imageUrl = `https://raw.githubusercontent.com/${githubClient.username}/${repoName}/main/${cleanPath}`;
            } else if (imageUrl.startsWith('images/') || imageUrl.startsWith('./images/')) {
              const cleanPath = imageUrl.replace(/^\.\//, '');
              imageUrl = `https://raw.githubusercontent.com/${githubClient.username}/${repoName}/main/${cleanPath}`;
            } else if (!imageUrl.startsWith('http')) {
              // Handle other relative paths
              imageUrl = `https://raw.githubusercontent.com/${githubClient.username}/${repoName}/main/${imageUrl}`;
            }
            
            // Skip data URLs
            if (!imageUrl.startsWith('data:')) {
              repo.screenshotUrl = imageUrl;
            }
          }
        } catch (readmeError) {
          console.error(`Error checking README for ${repoName}:`, readmeError.message);
          repo.hasReadme = false;
          repo.readmeContent = null;
          repo.screenshotUrl = null;
        }

        // Fetch languages
        try {
          const langResponse = await githubClient.fetchRepositoryLanguages(repoName);
          repo.languages = langResponse;
        } catch (langError) {
          console.error(`Error fetching languages for ${repoName}:`, langError.message);
          repo.languages = {};
        }

        // Add homepageUrl
        repo.homepageUrl = repo.homepage || '';

        return repo;
      } catch (error) {
        console.error(`Error processing ${repoName}:`, error.message);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(r => r !== null);
    results.push(...validResults);

    if (i + batchSize < repoNames.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Fetch topics for each repository
 */
async function fetchRepositoryTopics(repositories, githubClient) {
  const results = [];
  const batchSize = 5; // Process 5 repos at a time to avoid rate limiting

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);

    const batchPromises = batch.map(async (repo) => {
      try {
        const topicsData = await githubClient.fetchRepositoryTopics(repo.name);
        repo.topics = topicsData.names || [];
      } catch (error) {
        console.error(`Error fetching topics for ${repo.name}:`, error.message);
        repo.topics = [];
      }

      return repo;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add small delay between batches
    if (i + batchSize < repositories.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Add screenshot URLs and full README content from README images
 */
async function addScreenshotUrlsAndReadmeContent(repositories, githubClient) {
  const results = [];
  const batchSize = 5; // Process 5 repos at a time

  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);

    const batchPromises = batch.map(async (repo) => {
      try {
        // Only process repos that have READMEs
        if (!repo.hasReadme) {
          return { ...repo, screenshotUrl: null, readmeContent: null };
        }

        // Fetch README content
        const readmeData = await githubClient.fetchRepositoryReadme(repo.name);

        // readmeData is already parsed by githubClient.request()

        // Decode base64 content
        let readmeContent;
        if (readmeData.encoding === 'base64') {
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
        } else {
          readmeContent = readmeData.content;
        }

        // Try to extract first image from markdown
        const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
        const markdownMatch = readmeContent.match(markdownImageRegex);

        let screenshotUrl = null;
        if (markdownMatch && markdownMatch[1]) {
          let imageUrl = markdownMatch[1];

          // Handle relative URLs in markdown
          if (imageUrl.startsWith('assets/') || imageUrl.startsWith('./assets/') ||
              imageUrl.startsWith('images/') || imageUrl.startsWith('./images/')) {
            // Convert to GitHub raw URL
            let cleanPath = imageUrl;
            if (cleanPath.startsWith('./')) {
              cleanPath = cleanPath.replace(/^\.\//, '');
            }
            imageUrl = `https://raw.githubusercontent.com/${githubClient.username}/${repo.name}/main/${cleanPath}`;
          }

          // Skip data URLs
          if (imageUrl.startsWith('data:')) {
            screenshotUrl = null;
          } else {
            screenshotUrl = imageUrl;
          }
        }

        // Map GitHub raw URLs to local paths to match build-data.js behavior
        // This ensures consistency between static and dynamic data
        let localScreenshotUrl = null;

        if (screenshotUrl && screenshotUrl.startsWith('https://raw.githubusercontent.com/')) {
          // Extract the filename from the GitHub URL
          const urlParts = screenshotUrl.split('/');
          const filename = urlParts[urlParts.length - 1];

          // Check if this matches common screenshot naming patterns
          // The build-data.js downloads images with repo name as filename
          const expectedLocalPath = `/images/repos/${repo.name}${path.extname(filename)}`;

          // For now, use the local path pattern that build-data.js creates
          // This assumes the image was downloaded during build
          localScreenshotUrl = expectedLocalPath;
        } else if (screenshotUrl && !screenshotUrl.startsWith('data:')) {
          // If it's already a local path or other URL, keep it
          localScreenshotUrl = screenshotUrl;
        }

        return {
          ...repo,
          screenshotUrl: localScreenshotUrl,
          readmeContent: readmeContent
        };

      } catch (error) {
        console.error(`Error extracting image from ${repo.name} README:`, error.message);
        return { ...repo, screenshotUrl: null, readmeContent: null };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add small delay between batches
    if (i + batchSize < repositories.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

module.exports = {
  handler: exports.handler,
  addScreenshotUrlsAndReadmeContent
};