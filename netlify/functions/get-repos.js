const cache = require('./cache-utils');
const { addScreenshotUrls } = require('./screenshot-utils');

exports.handler = async function (event, context) {
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_API_URL = 'https://api.github.com';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  // Check for cache clear request
  if (event.queryStringParameters && event.queryStringParameters.clear === 'true') {
    const cleared = cache.clearCache();
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Cache cleared successfully',
        clearedEntries: cleared 
      })
    };
  }

  if (!GITHUB_USERNAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub username not configured' })
    };
  }

  // Generate cache key - include pagination and filtering parameters
  const cacheKey = cache.generateCacheKey('get-repos', { 
    username: GITHUB_USERNAME,
    includeForks: false,
    perPage: 100
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

    // Add screenshot URLs using server-side matching
    repositories = addScreenshotUrls(repositories);

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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch repositories' })
    };
  }
};
