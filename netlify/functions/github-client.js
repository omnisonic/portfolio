// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com';

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

/**
 * GitHub API client for handling all GitHub interactions
 */
class GitHubClient {
  /**
   * Create a new GitHub client instance
   * @param {string} username - GitHub username
   * @param {string} token - GitHub personal access token (optional)
   */
  constructor(username, token = null) {
    this.username = username;
    this.token = token;
  }

  /**
   * Make a request to the GitHub API
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<object>} API response
   */
  async request(endpoint, options = {}) {
    // Get fetch function (initializes on first use)
    const fetch = await getFetch();
    
    const url = `${GITHUB_API_URL}${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...(this.token ? { 'Authorization': `token ${this.token}` } : {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorDetails = `${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing body
        }
        throw new Error(`GitHub API error: ${errorDetails}`);
      }

      return response.json();
    } catch (error) {
      console.error(`GitHub API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch all repositories for the user
   * @param {object} params - Query parameters
   * @returns {Promise<object[]>} List of repositories
   */
  async fetchRepositories(params = {}) {
    const defaultParams = {
      per_page: 100,
      sort: 'created',
      direction: 'desc'
    };

    const allParams = { ...defaultParams, ...params };
    const queryString = new URLSearchParams(allParams).toString();

    return this.request(`/users/${this.username}/repos?${queryString}`);
  }

  /**
   * Fetch repository details
   * @param {string} repoName - Repository name
   * @returns {Promise<object>} Repository details
   */
  async fetchRepositoryDetails(repoName) {
    return this.request(`/repos/${this.username}/${repoName}`);
  }

  /**
   * Fetch repository topics
   * @param {string} repoName - Repository name
   * @returns {Promise<object>} Topics data
   */
  async fetchRepositoryTopics(repoName) {
    return this.request(`/repos/${this.username}/${repoName}/topics`, {
      headers: {
        'Accept': 'application/vnd.github.mercy-preview+json'
      }
    });
  }

  /**
   * Fetch repository README
   * @param {string} repoName - Repository name
   * @returns {Promise<object>} README data
   */
  async fetchRepositoryReadme(repoName) {
    return this.request(`/repos/${this.username}/${repoName}/readme`);
  }

  /**
   * Fetch repository languages
   * @param {string} repoName - Repository name
   * @returns {Promise<object>} Languages data
   */
  async fetchRepositoryLanguages(repoName) {
    return this.request(`/repos/${this.username}/${repoName}/languages`);
  }
}

module.exports = GitHubClient;