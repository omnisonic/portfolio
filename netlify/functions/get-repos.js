const cache = require('./cache-utils');

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

  // Generate cache key
  const cacheKey = cache.generateCacheKey('get-repos', { username: GITHUB_USERNAME });

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
    const response = await fetch(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch repositories: ${response.statusText}` })
      };
    }

    const repositories = await response.json();

    // Add homepageUrl to each repository
    for (const repo of repositories) {
      repo.homepageUrl = repo.homepage || '';
    }

    // Sort repositories by date created (most recent first)
    repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Check if each repository has a README
    for (const repo of repositories) {
      try {
        const readmeResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/readme`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
          }
        });

        repo.hasReadme = readmeResponse.ok;
      } catch (readmeError) {
        console.error(`Error checking README for ${repo.name}:`, readmeError);
        repo.hasReadme = false;
      }
    }

    // Fetch languages for each repository
    for (const repo of repositories) {
      try {
        const langResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/languages`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
          }
        });

        if (langResponse.ok) {
          repo.languages = await langResponse.json();
        }
      } catch (langError) {
        console.error(`Error fetching languages for ${repo.name}:`, langError);
        repo.languages = {};
      }
    }

    // Cache the result
    cache.setInCache(cacheKey, repositories);

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
