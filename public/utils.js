// Utility functions for cleaning and formatting repository titles

/**
 * Cleans repository titles by removing special characters and normalizing spacing
 * @param {string} title - The repository title to clean
 * @returns {string} - The cleaned title
 */
export function cleanRepoTitle(title) {
    if (!title) return '';
    
    return title
        .replace(/[-_]/g, ' ')           // Replace hyphens and underscores with spaces
        .replace(/[.]/g, '')             // Remove periods
        .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace any other special characters with spaces
        .replace(/\s+/g, ' ')            // Normalize multiple spaces to single space
        .trim();                         // Remove leading/trailing whitespace
}

/**
 * Capitalizes words in a title
 * @param {string} title - The title to capitalize
 * @returns {string} - The capitalized title
 */
export function capitalizeTitle(title) {
    if (!title) return '';
    
    const wordsToSkip = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of', 'with'];
    
    return title.split(' ')
        .map((word, index) => {
            // Always capitalize first word
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            
            // Skip capitalization for small words unless they're the first word
            if (wordsToSkip.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            
            // Capitalize all other words
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

/**
 * Formats repository title by cleaning and capitalizing
 * @param {string} title - The raw repository title
 * @returns {string} - The formatted title
 */
export function formatRepoTitle(title) {
    if (!title) return '';
    return capitalizeTitle(cleanRepoTitle(title));
}

/**
 * Formats multiple repository titles
 * @param {string[]} titles - Array of repository titles
 * @returns {string[]} - Array of formatted titles
 */
export function formatRepoTitles(titles) {
    return titles.map(formatRepoTitle);
}