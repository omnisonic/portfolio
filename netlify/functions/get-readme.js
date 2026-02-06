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

  const { repo } = event.queryStringParameters;

  if (!repo) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Repository name is required' })
    };
  }

  // Generate cache key
  const cacheKey = cache.generateCacheKey('get-readme', { username: GITHUB_USERNAME, repo: repo });

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
    const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch README: ${response.statusText}` })
      };
    }

    const readmeData = await response.json();

    const result = {
      content: readmeData.content,
      encoding: readmeData.encoding
    };

    // Cache the result
    cache.setInCache(cacheKey, result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'X-Cache': 'MISS'
      }
    };
  } catch (error) {
    console.error('Error fetching README:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch README' })
    };
  }
};
