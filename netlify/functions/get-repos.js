exports.handler = async function (event, context) {
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_API_URL = 'https://api.github.com';

  if (!GITHUB_USERNAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GitHub username not configured' })
    };
  }

  try {
    const response = await fetch(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch repositories: ${response.statusText}` })
      };
    }

    const repositories = await response.json();

    // Sort repositories by date created (most recent first)
    repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Fetch languages for each repository
    for (const repo of repositories) {
      try {
        const langResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/languages`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
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

    return {
      statusCode: 200,
      body: JSON.stringify(repositories)
    };
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch repositories' })
    };
  }
};