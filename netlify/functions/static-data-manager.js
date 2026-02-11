const path = require('path');
const fs = require('fs').promises;

/**
 * Static data manager for handling reading/writing static data files
 */
class StaticDataManager {
  /**
   * Create a new static data manager instance
   * @param {string} dataPath - Path to data directory
   */
  constructor(dataPath = 'public/data') {
    this.dataPath = dataPath;
  }

  /**
   * Get the path to the repositories data file
   * @returns {string} Full path to repos.json
   */
  getReposDataPath() {
    return path.join(this.dataPath, 'repos.json');
  }

  /**
   * Load existing static data from file
   * @returns {object} Static data object
   */
  async loadStaticData() {
    const dataPath = this.getReposDataPath();
    // __dirname is netlify/functions, so we need to go up 2 levels to reach project root
    const fullPath = path.join(__dirname, '..', '..', dataPath);

    console.log('Loading static data...');
    console.log('__dirname:', __dirname);
    console.log('dataPath:', dataPath);
    console.log('fullPath:', fullPath);

    try {
      const dataRaw = await fs.readFile(fullPath, 'utf8');
      const data = JSON.parse(dataRaw);
      console.log(`Loaded existing static data with ${data.repositories?.length || 0} repositories`);
      return data;
    } catch (error) {
      console.log('No existing static data found, will perform full fetch');
      console.log('Error details:', error.message);
      return null;
    }
  }

  /**
   * Save static data to file
   * @param {object} data - Static data to save
   */
  async saveStaticData(data) {
    const dataPath = this.getReposDataPath();
    // __dirname is netlify/functions, so we need to go up 2 levels to reach project root
    const outputPath = path.join(__dirname, '..', '..', dataPath);
    const outputDir = path.dirname(outputPath);

    console.log('Saving static data...');
    console.log('__dirname:', __dirname);
    console.log('dataPath:', dataPath);
    console.log('outputPath:', outputPath);
    console.log('outputDir:', outputDir);

    // Ensure directory exists before writing file
    try {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(`Ensured directory exists: ${outputDir}`);
    } catch (error) {
      console.error(`Error creating directory ${outputDir}:`, error.message);
      throw error;
    }

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`Static data saved with ${data.repositories.length} repositories`);
  }

  /**
   * Create static data structure from repositories
   * @param {object[]} repositories - List of repositories
   * @param {string} username - GitHub username
   * @param {string[]} excludeTopics - Topics to exclude
   * @returns {object} Static data structure
   */
  createStaticData(repositories, username, excludeTopics) {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        username: username,
        totalRepos: repositories.length,
        excludeTopics: excludeTopics
      },
      repositories: repositories
    };
  }

  /**
   * Update static data with new repositories
   * @param {object} existingData - Existing static data
   * @param {object[]} newRepositories - New repositories to add
   * @returns {object} Updated static data
   */
  updateStaticData(existingData, newRepositories) {
    const existingRepoMap = new Map(existingData.repositories.map(r => [r.name, r]));

    for (const newRepo of newRepositories) {
      existingRepoMap.set(newRepo.name, newRepo);
    }

    const updatedRepositories = Array.from(existingRepoMap.values());

    existingData.repositories = updatedRepositories;
    existingData.metadata.generatedAt = new Date().toISOString();
    existingData.metadata.lastUpdate = {
      timestamp: new Date().toISOString(),
      changedRepos: newRepositories.map(r => r.name),
      totalRepos: updatedRepositories.length
    };

    return existingData;
  }
}

module.exports = StaticDataManager;