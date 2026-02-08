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

  // Check if README content is available from get-repos.js
  const cachedRepos = cache.getFromCache(cache.generateCacheKey('get-repos', { 
    username: GITHUB_USERNAME,
    includeForks: false,
    perPage: 100,
    excludeTopics: []
  }));

  if (cachedRepos && cachedRepos.length > 0) {
    const repoData = cachedRepos.find(r => r.name === repo);
    if (repoData && repoData.readmeContent) {
      const result = {
        content: Buffer.from(repoData.readmeContent).toString('base64'),
        encoding: 'base64'
      };
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: {
          'X-Cache': 'HIT'
        }
      };
    }
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

    // Decode base64 content
    let readmeContent;
    if (readmeData.encoding === 'base64') {
      readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
    } else {
      readmeContent = readmeData.content;
    }

    // Convert relative image paths to GitHub raw URLs
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const convertedContent = readmeContent.replace(imageRegex, (match, url) => {
      // Skip if already an absolute URL or data URL
      if (url.startsWith('http') || url.startsWith('data:')) {
        return match;
      }

      // Handle common relative path patterns
      let cleanUrl = url;
      if (cleanUrl.startsWith('./')) {
        cleanUrl = cleanUrl.replace(/^\.\//, '');
      }

      // Convert to GitHub raw URL
      return `![${match.slice(2, match.indexOf(']'))}]` +
             `(https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo}/main/${cleanUrl})`;
    });

    const result = {
      content: Buffer.from(convertedContent).toString('base64'),
      encoding: 'base64'
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
