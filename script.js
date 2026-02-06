// GitHub API Configuration
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'username'; // Replace with your GitHub username
const USE_PUBLIC_API = true; // Set to true to use public API (60 requests/hour)

// DOM Elements
const searchInput = document.getElementById('searchInput');
const languageFilter = document.getElementById('languageFilter');
const reposContainer = document.getElementById('repos-container');

// State
let repositories = [];
let filteredRepositories = [];

// Initialize the application
async function init() {
    try {
        await fetchRepositories();
        setupEventListeners();
    } catch (error) {
        showError('Failed to initialize application. Please try again later.');
    }
}

// Fetch repositories from GitHub API
async function fetchRepositories() {
    showLoading();

    try {
        const headers = {};
        const usePublicApi = true; // Set to false if you have a GitHub token

        if (!usePublicApi) {
            const token = window.GITHUB_TOKEN; // Read from window object
            if (token) {
                headers['Authorization'] = `token ${token}`;
            }
        }

        const response = await fetch(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos`, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        repositories = await response.json();
        // Sort repositories by date created (most recent first)
        repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Fetch languages for each repository
        for (const repo of repositories) {
            try {
                const headers = {};
                if (!usePublicApi) {
                    const token = window.GITHUB_TOKEN; // Read from window object
                    if (token) {
                        headers['Authorization'] = `token ${token}`;
                    }
                }
                const langResponse = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_USERNAME}/${repo.name}/languages`, { headers });
                if (langResponse.ok) {
                    repo.languages = await langResponse.json();
                }
            } catch (langError) {
                console.error(`Error fetching languages for ${repo.name}:`, langError);
                repo.languages = {};
            }
        }

        filteredRepositories = [...repositories];
        renderRepositories();
    } catch (error) {
        showError('Failed to fetch repositories. Please check your connection or try again later.');
        console.error('Error fetching repositories:', error);
    }
}

// Set up event listeners for search
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// Handle search input
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredRepositories = repositories.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm) ||
        repo.description?.toLowerCase().includes(searchTerm)
    );
    renderRepositories();
}

// Render repository cards
function renderRepositories() {
    if (filteredRepositories.length === 0) {
        showNoResults();
        return;
    }

    const repoCards = filteredRepositories.map(repo => createRepoCard(repo)).join('');
    reposContainer.innerHTML = repoCards;
}

// Create a repository card HTML
function createRepoCard(repo) {
    return `
        <div class="repo-card">
            <div class="repo-header">
                <h2>${escapeHtml(repo.name)}</h2>
                <div class="repo-stats">
                    <div class="language-badges">
                        ${getLanguageBadges(repo.languages)}
                    </div>
                </div>
            </div>
            <p class="repo-description">${escapeHtml(repo.description || 'No description provided')}</p>
            <div class="repo-footer">
                <div class="repo-info">
                    <div class="language-badges">
                        ${getLanguageBadges(repo.languages)}
                    </div>
                    <span class="repo-updated">
                        Updated ${formatDate(repo.updated_at)}
                    </span>
                </div>
                <a href="${escapeHtml(repo.html_url)}" class="repo-link" target="_blank" rel="noopener noreferrer">
                    View on GitHub
                </a>
            </div>
        </div>
    `;
}

// Get language badges HTML
function getLanguageBadges(languages) {
    if (!languages || Object.keys(languages).length === 0) {
        return '<span class="language-badge">Unknown</span>';
    }

    return Object.keys(languages)
        .map(lang => {
            const color = getLanguageColor(lang);
            return `<span class="language-badge" style="background: ${color};">${escapeHtml(lang)}</span>`;
        })
        .join('');
}

// Get language color based on programming language
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'TypeScript': '#2b7489',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Java': '#b07219',
        'C': '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Swift': '#ffac45',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Kotlin': '#F18E33',
        'Scala': '#c22d40',
        'R': '#198ce7',
        'Shell': '#89e051',
        'PowerShell': '#012456',
        'Vue': '#2c3e50',
        'Svelte': '#ff3e00'
    };
    return colors[language] || '#95a5a6';
}

// Show loading state
function showLoading() {
    reposContainer.innerHTML = '<div class="loading">Loading repositories...</div>';
}

// Show error message
function showError(message) {
    reposContainer.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

// Show no results message
function showNoResults() {
    reposContainer.innerHTML = '<div class="no-results">No repositories found matching your criteria.</div>';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date to readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);