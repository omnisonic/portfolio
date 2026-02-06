exports.handler = async function (event, context) {
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
  const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: readmeData.content,
        encoding: readmeData.encoding
      })
    };
  } catch (error) {
    console.error('Error fetching README:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch README' })
    };
  }
};