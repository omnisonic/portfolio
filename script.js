// GitHub API Configuration
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = window.GITHUB_USERNAME || 'username'; // Read from environment or use placeholder

// Import utility functions
import { formatRepoTitle } from './utils.js';

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
    console.log('Starting fetchRepositories...');
    showLoading();

    try {
        const response = await fetch('/.netlify/functions/get-repos');
        console.log('Response received:', response);

        if (!response.ok) {
            console.error('HTTP error! status:', response.status, 'statusText:', response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        repositories = await response.json();
        console.log('Repositories fetched:', repositories.length, 'repositories');

        filteredRepositories = [...repositories];
        console.log('Repositories ready for rendering:', filteredRepositories.length);
        renderRepositories();
    } catch (error) {
        console.error('Error fetching repositories:', error);
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
    const formattedTitle = formatRepoTitle(repo.name);
    return `
        <div class="repo-card">
            <div class="repo-header">
                <h2>${escapeHtml(formattedTitle)}</h2>
                <div class="repo-stats">
                    <div class="language-badges">
                        ${getLanguageBadges(repo.languages)}
                    </div>
                </div>
            </div>
            <p class="repo-description">${escapeHtml(repo.description || 'No description provided')}</p>
            <div class="repo-footer">
                <div class="repo-info">
                    <span class="repo-updated">
                        Updated ${formatDate(repo.updated_at)}
                    </span>
                </div>
                ${repo.homepage ? `<button class="repo-homepage" onclick="openHomepageModal('${escapeHtml(repo.homepage)}', '${escapeHtml(formattedTitle)}')">Homepage</button>` : ''}
                ${repo.hasReadme ? `<button class="repo-readme" onclick="console.log('README button clicked for repo:', '${escapeHtml(formattedTitle)}'); openReadmeModal('${escapeHtml(formattedTitle)}')">README</button>` : ''}
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

// Modal for README display
function openReadmeModal(repoName) {
    console.log('Modal opened for repo:', repoName);
    const modal = document.createElement('div');
    modal.className = 'readme-modal';
    modal.innerHTML = `
        <div class="readme-modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${escapeHtml(repoName)}</h2>
            <div class="readme-content" id="readme-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Log modal and parent container sizes
    setTimeout(() => {
        const modalContent = modal.querySelector('.readme-modal-content');
        const modalRect = modalContent.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        console.log('=== README MODAL SIZES ===');
        console.log('Modal Content:', {
            width: modalRect.width,
            height: modalRect.height,
            top: modalRect.top,
            left: modalRect.left
        });
        console.log('Body Container:', {
            width: bodyRect.width,
            height: bodyRect.height
        });
        console.log('Viewport:', {
            width: viewportWidth,
            height: viewportHeight
        });
        console.log('==========================');
    }, 100);
    
    fetchReadme(repoName);
}

function fetchReadme(repoName) {
    fetch(`/.netlify/functions/get-readme?repo=${encodeURIComponent(repoName)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const readmeContent = document.getElementById('readme-content');
            console.log('README content fetched for repo:', repoName);
            if (data.content) {
                readmeContent.innerHTML = marked.parse(atob(data.content));
            } else {
                readmeContent.innerHTML = '<p>No README found for this repository.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching README:', error);
            document.getElementById('readme-content').innerHTML = '<p>Failed to load README.</p>';
        });
}

function closeModal() {
    const modal = document.querySelector('.readme-modal');
    if (modal) {
        modal.remove();
    }
}

// Add marked library for markdown parsing
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);

// Modal for homepage display
function openHomepageModal(url, repoName) {
    console.log('Homepage modal opened for repo:', repoName);
    const modal = document.createElement('div');
    modal.className = 'homepage-modal';
    modal.innerHTML = `
        <div class="homepage-modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>${escapeHtml(repoName)}</h2>
            <div class="homepage-content">
                <p class="homepage-url">${escapeHtml(url)}</p>
                <div class="homepage-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading website...</p>
                </div>
                <div class="homepage-preview" style="display: none;">
                    <iframe src="${escapeHtml(url)}" title="Homepage Preview" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
                </div>
                <div class="homepage-error" style="display: none;">
                    <p>Failed to load website. <button onclick="this.parentElement.previousElementSibling.firstElementChild.src='${escapeHtml(url)}'; this.parentElement.previousElementSibling.firstElementChild.contentWindow.location.reload(); this.parentElement.style.display='none'; this.parentElement.previousElementSibling.style.display='block'; this.parentElement.nextElementSibling.style.display='none';">Retry</button></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Log modal and parent container sizes
    setTimeout(() => {
        const modalContent = modal.querySelector('.homepage-modal-content');
        const modalRect = modalContent.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        console.log('=== HOMEPAGE MODAL SIZES ===');
        console.log('Modal Content:', {
            width: modalRect.width,
            height: modalRect.height,
            top: modalRect.top,
            left: modalRect.left
        });
        console.log('Body Container:', {
            width: bodyRect.width,
            height: bodyRect.height
        });
        console.log('Viewport:', {
            width: viewportWidth,
            height: viewportHeight
        });
        console.log('============================');
    }, 100);

    const iframe = modal.querySelector('iframe');
    const loading = modal.querySelector('.homepage-loading');
    const preview = modal.querySelector('.homepage-preview');
    const error = modal.querySelector('.homepage-error');

    iframe.addEventListener('load', () => {
        loading.style.display = 'none';
        preview.style.display = 'block';
    });

    iframe.addEventListener('error', () => {
        loading.style.display = 'none';
        preview.style.display = 'none';
        error.style.display = 'block';
    });
}
