const cache = require('./cache-utils');

// Use node-fetch for Netlify compatibility
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  fetch = require('node-fetch');
}

exports.handler = async function (event, context) {
  console.log('=== GET-REPOS FUNCTION START ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  
  // DETAILED ENVIRONMENT VARIABLE LOGGING
  console.log('=== DETAILED ENVIRONMENT VARIABLE ANALYSIS ===');
  
  // Check if process.env exists and what it contains
  console.log('process.env exists:', typeof process.env !== 'undefined');
  console.log('process.env type:', typeof process.env);
  console.log('process.env keys count:', Object.keys(process.env || {}).length);
  
  // Log all environment variables (be careful with sensitive data)
  const allEnvVars = Object.keys(process.env || {});
  console.log('All environment variable names:', allEnvVars);
  
  // Check for specific variables we need
  const githubUsername = process.env.GITHUB_USERNAME;
  const githubToken = process.env.GITHUB_TOKEN;
  const nodeEnv = process.env.NODE_ENV;
  
  console.log('GITHUB_USERNAME value:', githubUsername || 'NOT_SET');
  console.log('GITHUB_USERNAME type:', typeof githubUsername);
  console.log('GITHUB_TOKEN exists:', !!githubToken);
  console.log('NODE_ENV value:', nodeEnv || 'NOT_SET');
  
  // Check for case variations
  console.log('g_i_t_h_u_b__u_s_e_r_n_a_m_e:', process.env['GITHUB_USERNAME']);
  console.log('github_username:', process.env['github_username']);
  console.log('GitHub_USERNAME:', process.env['GitHub_USERNAME']);
  
  // Check if variables are in different namespaces
  console.log('process.env.GITHUB_USERNAME === undefined:', process.env.GITHUB_USERNAME === undefined);
  console.log('process.env.GITHUB_USERNAME === null:', process.env.GITHUB_USERNAME === null);
  console.log('process.env.GITHUB_USERNAME === "":', process.env.GITHUB_USERNAME === '');
  console.log('process.env.GITHUB_USERNAME === "undefined":', process.env.GITHUB_USERNAME === 'undefined');
  console.log('process.env.GITHUB_USERNAME === "null":', process.env.GITHUB_USERNAME === 'null');
  
  // Check for Netlify-specific environment variables
  const netlifyEnvVars = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('netlify') || 
    key.toLowerCase().includes('github') || 
    key.toLowerCase().includes('env')
  );
  console.log('Netlify/GitHub related env vars:', netlifyEnvVars);
  
  console.log('==================================');
  
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_API_URL = 'https://api.github.com';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  console.log('Environment variables:', {
    GITHUB_USERNAME: GITHUB_USERNAME || 'NOT_SET',
    GITHUB_TOKEN: GITHUB_TOKEN ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    available_fetch: typeof fetch !== 'undefined'
  });

  // Check for cache clear request
  if (event.queryStringParameters && event.queryStringParameters.clear === 'true') {
    console.log('Cache clear requested');
    const cleared = cache.clearCache();
    console.log('Cache cleared:', cleared);
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Cache cleared successfully',
        clearedEntries: cleared 
      })
    };
  }

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

  // Generate cache key - include pagination and filtering parameters
  const cacheKey = cache.generateCacheKey('get-repos', { 
    username: GITHUB_USERNAME,
    includeForks: false,
    perPage: 100,
    excludeTopics: excludeTopics.sort() // Sort for consistent cache keys
  });

  // Check cache first
  const cachedData = cache.getFromCache(cacheKey);
  if (cachedData) {
    return {
      statusCode: 200,
      body: JSON.stringify(cachedData),
      headers: {
        'X-Cache': 'HIT'
      }
    };
  }

  try {
    // Fetch all repositories with pagination
    let repositories = [];
    let page = 1;
    const perPage = 100; // Maximum per page for GitHub API

    console.log(`Starting to fetch repositories for ${GITHUB_USERNAME}...`);

    while (true) {
      const response = await fetch(
        `${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos?per_page=${perPage}&page=${page}&sort=created&direction=desc`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
          }
        }
      );

      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: `Failed to fetch repositories: ${response.statusText}` })
        };
      }

      const pageRepos = await response.json();
      
      if (pageRepos.length === 0) {
        // No more repositories to fetch
        break;
      }

      repositories = repositories.concat(pageRepos);
      console.log(`Fetched page ${page}, got ${pageRepos.length} repositories. Total: ${repositories.length}`);

      // If we got fewer than perPage, we've reached the end
      if (pageRepos.length < perPage) {
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
    const originalRepos = repositories.filter(repo => !repo.fork);
    console.log(`Filtered out ${repositories.length - originalRepos.length} forked repositories. ${originalRepos.length} remaining.`);
    repositories = originalRepos;

    // Fetch topics for each repository
    console.log(`Fetching topics for ${repositories.length} repositories...`);
    const reposWithTopics = await fetchRepositoryTopics(repositories, GITHUB_USERNAME, GITHUB_TOKEN);
    repositories = reposWithTopics;

    // Apply exclude topics filtering
    if (excludeTopics.length > 0) {
      const beforeFilter = repositories.length;
      repositories = repositories.filter(repo => {
        const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
        const hasExcludedTopic = excludeTopics.some(excluded => repoTopics.includes(excluded));
        return !hasExcludedTopic;
      });
      const afterFilter = repositories.length;
      console.log(`Applied exclude topics filter: ${beforeFilter - afterFilter} repositories filtered out, ${afterFilter} remaining.`);
    } else {
      console.log('No exclude topics configured, skipping topic filtering.');
    }

    // Add homepageUrl to each repository
    for (const repo of repositories) {
      repo.homepageUrl = repo.homepage || '';
    }

    // Repositories are already sorted by creation date (descending) from API
    // But we'll keep the sort for consistency
    repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Check if each repository has a README and fetch languages
    // Use Promise.all with concurrency limit to avoid rate limiting
    const processRepos = async (repos) => {
      const results = [];
      const batchSize = 5; // Process 5 repos at a time
      
      for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (repo) => {
          try {
            // Check README
            const readmeResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/readme`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
              }
            });
            repo.hasReadme = readmeResponse.ok;
          } catch (readmeError) {
            console.error(`Error checking README for ${repo.name}:`, readmeError.message);
            repo.hasReadme = false;
          }

          try {
            // Fetch languages
            const langResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/languages`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
              }
            });

            if (langResponse.ok) {
              repo.languages = await langResponse.json();
            } else {
              repo.languages = {};
            }
          } catch (langError) {
            console.error(`Error fetching languages for ${repo.name}:`, langError.message);
            repo.languages = {};
          }

          return repo;
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add small delay between batches to be respectful to the API
        if (i + batchSize < repos.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    };

    console.log(`Processing ${repositories.length} repositories for README and languages...`);
    repositories = await processRepos(repositories);

    // Add screenshot URLs from README images
    repositories = await addScreenshotUrlsFromReadme(repositories, GITHUB_USERNAME, GITHUB_TOKEN);

    // Cache the result
    cache.setInCache(cacheKey, repositories);

    console.log(`Final result: ${repositories.length} repositories`);

    return {
      statusCode: 200,
      body: JSON.stringify(repositories),
      headers: {
        'X-Cache': 'MISS'
      }
    };
  } catch (error) {
    console.error('Error fetching repositories:', error);
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
};

/**
 * Fetch topics for each repository
 */
async function fetchRepositoryTopics(repositories, username, token) {
  const results = [];
  const batchSize = 5; // Process 5 repos at a time to avoid rate limiting
  
  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const topicsResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/topics`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              ...(token ? { 'Authorization': `token ${token}` } : {})
            }
          }
        );
        
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          repo.topics = topicsData.names || [];
        } else {
          repo.topics = [];
        }
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
 * Add screenshot URLs from README images
 */
async function addScreenshotUrlsFromReadme(repositories, username, token) {
  const results = [];
  const batchSize = 5; // Process 5 repos at a time
  
  for (let i = 0; i < repositories.length; i += batchSize) {
    const batch = repositories.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        // Only process repos that have READMEs
        if (!repo.hasReadme) {
          return { ...repo, screenshotUrl: null };
        }
        
        // Fetch README content
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${username}/${repo.name}/readme`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              ...(token ? { 'Authorization': `token ${token}` } : {})
            }
          }
        );
        
        if (!readmeResponse.ok) {
          return { ...repo, screenshotUrl: null };
        }
        
        const readmeData = await readmeResponse.json();
        
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
        
        if (markdownMatch && markdownMatch[1]) {
          let imageUrl = markdownMatch[1];
          
          // Handle relative URLs in markdown
          if (imageUrl.startsWith('assets/') || imageUrl.startsWith('./assets/')) {
            // Convert to GitHub raw URL
            const cleanPath = imageUrl.replace(/^\.\//, '');
            imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/${cleanPath}`;
          }
          
          // Skip data URLs
          if (imageUrl.startsWith('data:')) {
            return { ...repo, screenshotUrl: null };
          }
          
          return { ...repo, screenshotUrl: imageUrl };
        }
        
        // If no markdown image found, try to get rendered HTML
        // This is more expensive, so we'll skip it for now and rely on markdown
        return { ...repo, screenshotUrl: null };
        
      } catch (error) {
        console.error(`Error extracting image from ${repo.name} README:`, error.message);
        return { ...repo, screenshotUrl: null };
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
  addScreenshotUrlsFromReadme
};