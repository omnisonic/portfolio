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
let userProfile = null;

// Initialize the application
async function init() {
    try {
        // Fetch both profile and repositories in parallel
        await Promise.all([
            fetchUserProfile(),
            loadRepositories()
        ]);
        setupEventListeners();
    } catch (error) {
        showError('Failed to initialize application. Please try again later.');
    }
}

// Load repositories - tries static data first, falls back to dynamic
async function loadRepositories() {
    console.log('Loading repositories...');
    
    // Try static data first
    try {
        const staticResponse = await fetch('/data/repos.json');
        if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            console.log('Static data found:', staticData);
            
            // Use repositories from static data
            repositories = staticData.repositories || [];
            filteredRepositories = [...repositories];
            
            console.log('Loaded', repositories.length, 'repositories from static data');
            renderRepositories();
            return;
        }
    } catch (error) {
        console.log('Static data not available, falling back to dynamic fetch:', error);
    }
    
    // Fallback to dynamic fetch
    console.log('Using dynamic fetch as fallback...');
    await fetchRepositories();
}

// Fetch user profile from GitHub API
async function fetchUserProfile() {
    console.log('Fetching user profile...');
    const profileLoading = document.getElementById('profile-loading');
    const profileImage = document.getElementById('profile-image');
    
    try {
        const response = await fetch(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}`);
        console.log('Profile response received:', response);

        if (!response.ok) {
            console.error('HTTP error! status:', response.status, 'statusText:', response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        userProfile = await response.json();
        console.log('User profile fetched:', userProfile);
        
        // Hide loading and show profile image
        if (profileLoading) profileLoading.style.display = 'none';
        if (profileImage && userProfile.avatar_url) {
            profileImage.src = userProfile.avatar_url;
            profileImage.style.display = 'block';
            profileImage.style.opacity = '0';
            
            // Fade in the image once it loads
            profileImage.onload = () => {
                profileImage.style.transition = 'opacity 0.5s ease-in';
                profileImage.style.opacity = '1';
            };
        }
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        if (profileLoading) {
            profileLoading.textContent = 'Profile unavailable';
            profileLoading.style.color = '#e74c3c';
        }
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
            
            // Try to parse as JSON to get detailed error info
            try {
                const errorText = await response.text();
                const errorJson = JSON.parse(errorText);
                console.error('Detailed error:', errorJson);
            } catch (e) {
                console.error('Could not parse error response as JSON');
            }
            
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
    
    // Set up navigation button listeners
    const homepageBtn = document.querySelector('.homepage-btn');
    const githubBtn = document.querySelector('.github-btn');
    const readmeBtn = document.querySelector('.readme-btn');
    
    if (homepageBtn) {
        homepageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Open portfolio homepage in new tab
            window.open('https://github.com/omnisonic/portfolio', '_blank');
        });
    }
    
    if (githubBtn) {
        githubBtn.addEventListener('click', (e) => {
            // GitHub link is already an anchor with target="_blank", so we don't prevent default
            console.log('GitHub button clicked - navigating to GitHub profile');
        });
    }
    
    if (readmeBtn) {
        readmeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Fetch and display the README for the portfolio repository
            fetchPortfolioReadme();
        });
    }
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

// Screenshot URL is now provided by the server-side matching
// No client-side detection needed

// Render repository cards
function renderRepositories() {
    if (filteredRepositories.length === 0) {
        showNoResults();
        return;
    }

    // Create all cards synchronously (no async needed anymore)
    const repoCards = filteredRepositories.map(repo => createRepoCard(repo));
    
    // Join and set HTML
    reposContainer.innerHTML = repoCards.join('');
}

// Create a repository card HTML
function createRepoCard(repo) {
    const formattedTitle = formatRepoTitle(repo.name);
    const homepageUrl = repo.homepage ? escapeHtml(repo.homepage) : '';
    const hasReadme = repo.hasReadme;
    const githubUrl = escapeHtml(repo.html_url);
    const originalRepoName = repo.name; // Keep original name for API calls
    const repoDescription = repo.description || ''; // Store description for preview
    
    // Use pre-matched screenshot URL from server
    const screenshotUrl = repo.screenshotUrl;
    
    return `
        <div class="repo-card" data-repo-name="${escapeHtml(originalRepoName)}" data-homepage="${homepageUrl}" data-has-readme="${hasReadme}" data-github="${githubUrl}" data-description="${escapeHtml(repoDescription)}" data-screenshot="${screenshotUrl || ''}">
            ${screenshotUrl ? `
                <div class="repo-screenshot">
                    <img src="${screenshotUrl}" alt="${escapeHtml(formattedTitle)} screenshot" loading="lazy" onload="this.classList.add('loaded')" onerror="this.parentElement.classList.add('missing'); this.style.display='none';">
                </div>
            ` : ''}
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
                        Created ${formatDate(repo.created_at)}
                    </span>
                </div>
                ${repo.homepage ? `
                    <button class="repo-homepage" title="Open in new tab">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <span>Open</span>
                    </button>
                ` : ''}
                ${repo.hasReadme ? `
                    <button class="repo-readme" title="View README">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>README</span>
                    </button>
                ` : ''}
                <a href="${githubUrl}" class="repo-link" target="_blank" rel="noopener noreferrer" title="View on GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
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
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Set up event delegation for repo card buttons
    document.addEventListener('click', (e) => {
        const repoCard = e.target.closest('.repo-card');
        if (!repoCard) return;
        
        const originalRepoName = repoCard.dataset.repoName;
        const homepageUrl = repoCard.dataset.homepage;
        const hasReadme = repoCard.dataset.hasReadme === 'true';
        const repoDescription = repoCard.dataset.description;
        
        // Get the formatted title for display purposes
        const formattedTitle = repoCard.querySelector('h2').textContent;
        
        // Homepage button - opens in new tab directly
        if (e.target.closest('.repo-homepage') && homepageUrl) {
            console.log('Homepage button clicked - opening in new tab:', homepageUrl);
            window.open(homepageUrl, '_blank');
        } 
        // README button - shows README modal
        else if (e.target.closest('.repo-readme') && hasReadme) {
            console.log('README button clicked for repo:', originalRepoName);
            openReadmeModal(originalRepoName, repoDescription);
        }
    });
});

// Modal for README display
function openReadmeModal(repoName, repoDescription) {
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

// Fetch and display the portfolio README
function fetchPortfolioReadme() {
    console.log('Fetching portfolio README...');
    const modal = document.createElement('div');
    modal.className = 'readme-modal';
    
    modal.innerHTML = `
        <div class="readme-modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Portfolio README</h2>
            <div class="readme-content" id="readme-content">Loading README...</div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Fetch the README from the portfolio repository
    fetch(`/.netlify/functions/get-readme?repo=portfolio`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const readmeContent = document.getElementById('readme-content');
            console.log('Portfolio README fetched successfully');
            if (data.content) {
                readmeContent.innerHTML = marked.parse(atob(data.content));
            } else {
                readmeContent.innerHTML = '<p>No README found for the portfolio repository.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching portfolio README:', error);
            const readmeContent = document.getElementById('readme-content');
            if (readmeContent) {
                readmeContent.innerHTML = '<p>Failed to load README. The portfolio repository may not have a README file.</p>';
            }
        });
}

// Add marked library for markdown parsing
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);
