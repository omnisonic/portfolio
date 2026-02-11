const path = require('path');
const fs = require('fs').promises;

/**
 * Repository processor for handling repository data transformations
 */
class RepositoryProcessor {
  /**
   * Create a new repository processor instance
   */
  constructor() {
    this.excludeTopics = [];
  }

  /**
   * Set topics to exclude from processing
   * @param {string[]} topics - Array of topics to exclude
   */
  setExcludeTopics(topics) {
    this.excludeTopics = topics.map(t => t.toLowerCase());
  }

  /**
   * Check if a repository should be excluded based on topics
   * @param {object} repo - Repository object
   * @returns {boolean} True if repository should be excluded
   */
  shouldExcludeRepository(repo) {
    if (!repo.topics || repo.topics.length === 0) {
      return false;
    }

    const repoTopics = repo.topics.map(t => t.toLowerCase());
    return this.excludeTopics.some(excluded => repoTopics.includes(excluded));
  }

  /**
   * Filter out forked repositories
   * @param {object[]} repositories - List of repositories
   * @returns {object[]} Filtered repositories
   */
  filterForks(repositories) {
    return repositories.filter(repo => !repo.fork);
  }

  /**
   * Add homepage URL to repositories
   * @param {object[]} repositories - List of repositories
   * @returns {object[]} Repositories with homepageUrl
   */
  addHomepageUrls(repositories) {
    return repositories.map(repo => ({
      ...repo,
      homepageUrl: repo.homepage || ''
    }));
  }

  /**
   * Sort repositories by creation date (newest first)
   * @param {object[]} repositories - List of repositories
   * @returns {object[]} Sorted repositories
   */
  sortByCreationDate(repositories) {
    return repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Process repository README content and extract screenshot URL
   * @param {object} repo - Repository object
   * @param {string} username - GitHub username
   * @returns {object} Repository with processed README and screenshot
   */
  async processReadmeAndScreenshot(repo, username) {
    if (!repo.hasReadme) {
      return { ...repo, screenshotUrl: null, readmeContent: null };
    }

    try {
      // Fetch README content
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/readme`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!readmeResponse.ok) {
        return { ...repo, screenshotUrl: null, readmeContent: null };
      }

      const readmeData = await readmeResponse.json();
      let readmeContent;

      if (readmeData.encoding === 'base64') {
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8');
      } else {
        readmeContent = readmeData.content;
      }

      // Extract first image from markdown
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
          imageUrl = `https://raw.githubusercontent.com/${username}/${repo.name}/main/${cleanPath}`;
        }

        // Skip data URLs
        if (!imageUrl.startsWith('data:')) {
          screenshotUrl = imageUrl;
        }
      }

      // Map GitHub raw URLs to local paths
      let localScreenshotUrl = null;

      if (screenshotUrl && screenshotUrl.startsWith('https://raw.githubusercontent.com/')) {
        const urlParts = screenshotUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        localScreenshotUrl = `/images/repos/${repo.name}${path.extname(filename)}`;
      } else if (screenshotUrl && !screenshotUrl.startsWith('data:')) {
        localScreenshotUrl = screenshotUrl;
      }

      return {
        ...repo,
        screenshotUrl: localScreenshotUrl,
        readmeContent: readmeContent
      };

    } catch (error) {
      console.error(`Error processing README for ${repo.name}:`, error.message);
      return { ...repo, screenshotUrl: null, readmeContent: null };
    }
  }

  /**
   * Process multiple repositories for README and screenshots
   * @param {object[]} repositories - List of repositories
   * @param {string} username - GitHub username
   * @returns {Promise<object[]>} Processed repositories
   */
  async processRepositories(repositories, username) {
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize);

      const batchPromises = batch.map(async (repo) => {
        return this.processReadmeAndScreenshot(repo, username);
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
}

module.exports = RepositoryProcessor;