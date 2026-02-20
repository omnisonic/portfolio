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


// Load repositories - tries static data first, falls back to dynamic
async function loadRepositories() {
    console.log('Loading repositories...');
    
    // Try static data first
    try {
        const staticResponse = await fetch('data/repos.json');
        if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            console.log('Static data found:', staticData);
            
            // Display server logs if available
            if (staticData.logs) {
                console.log('=== SERVER LOGS ===');
                staticData.logs.forEach(log => {
                    console.log(`[${log.timestamp}] ${log.message}`);
                });
                console.log('=== END SERVER LOGS ===');
            }
            
            // Store static data globally for other functions to use
            window.staticData = staticData;
            
            // Use repositories from static data
            repositories = staticData.repositories || [];
            
            // Apply exclude topics filtering from static data metadata
            if (staticData.metadata && staticData.metadata.excludeTopics) {
                const excludeTopics = staticData.metadata.excludeTopics;
                console.log(`Exclude topics configured: ${excludeTopics.length > 0 ? excludeTopics.join(', ') : '(none)'}`);
                
                if (excludeTopics.length > 0) {
                    const beforeFilter = repositories.length;
                    repositories = repositories.filter(repo => {
                        const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
                        const hasExcludedTopic = excludeTopics.some(excluded => repoTopics.includes(excluded));
                        
                        // Log when a repository is excluded
                        if (hasExcludedTopic) {
                            const excludedTopic = excludeTopics.find(excluded => repoTopics.includes(excluded));
                            console.log(`Excluding repository "${repo.name}" because it contains excluded topic "${excludedTopic}". Repository topics: ${repoTopics.join(', ')}`);
                        }
                        
                        return !hasExcludedTopic;
                    });
                    const afterFilter = repositories.length;
                    console.log(`Applied exclude topics filter from static data: ${beforeFilter - afterFilter} repositories filtered out, ${afterFilter} remaining.`);
                }
            }
            
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


// Fetch user profile from static data
async function fetchUserProfile() {
    console.log('Fetching user profile...');
    const profileLoading = document.getElementById('profile-loading');
    const profileImage = document.getElementById('profile-image');
    
    try {
        // Try to get user profile from static data
        if (window.staticData && window.staticData.metadata && window.staticData.metadata.userProfile) {
            userProfile = window.staticData.metadata.userProfile;
            console.log('User profile loaded from static data:', userProfile);
        } else {
            // Fallback to API if static data not available
            console.log('Static user profile not available, falling back to API...');
            const response = await fetch(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            userProfile = await response.json();
            console.log('User profile fetched from API:', userProfile);
        }
        
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

        // Apply exclude topics filtering from static data metadata if available
        if (window.staticData && window.staticData.metadata && window.staticData.metadata.excludeTopics) {
            const excludeTopics = window.staticData.metadata.excludeTopics;
            console.log(`Exclude topics configured: ${excludeTopics.length > 0 ? excludeTopics.join(', ') : '(none)'}`);
            
            if (excludeTopics.length > 0) {
                const beforeFilter = repositories.length;
                repositories = repositories.filter(repo => {
                    const repoTopics = (repo.topics || []).map(t => t.toLowerCase());
                    const hasExcludedTopic = excludeTopics.some(excluded => repoTopics.includes(excluded));
                    
                    // Log when a repository is excluded
                    if (hasExcludedTopic) {
                        const excludedTopic = excludeTopics.find(excluded => repoTopics.includes(excluded));
                        console.log(`Excluding repository "${repo.name}" because it contains excluded topic "${excludedTopic}". Repository topics: ${repoTopics.join(', ')}`);
                    }
                    
                    return !hasExcludedTopic;
                });
                const afterFilter = repositories.length;
                console.log(`Applied exclude topics filter from API response: ${beforeFilter - afterFilter} repositories filtered out, ${afterFilter} remaining.`);
            }
        }

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
    return colors[language] || '#95a5a5';
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

// Display server logs from API responses
function displayServerLogs(data) {
    if (data.logs) {
        console.log('=== SERVER LOGS ===');
        data.logs.forEach(log => {
            console.log(`[${log.timestamp}] ${log.message}`);
        });
        console.log('=== END SERVER LOGS ===');
    }
}

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
    // Use static README content from repos.json
    const repo = repositories.find(r => r.name === repoName);
    const readmeContent = document.getElementById('readme-content');
    
    if (!repo) {
        console.error('Repository not found:', repoName);
        readmeContent.innerHTML = '<p>Repository not found.</p>';
        return;
    }
    
    console.log('Using static README content for repo:', repoName);
    
    if (repo.readmeContent) {
        // Process README content to convert relative image URLs to absolute GitHub URLs
        let processedContent = repo.readmeContent;
        
        // Convert relative image paths to GitHub raw URLs
        // Match markdown images: ![alt](path) or HTML images: <img src="path">
        const username = window.staticData?.metadata?.username || GITHUB_USERNAME;
        
        // Convert markdown image references
        processedContent = processedContent.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (match, alt, url) => {
                // If URL is already absolute (http/https), keep it as is
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                    return match;
                }
                // Convert relative path to GitHub raw URL
                const cleanUrl = url.replace(/^\.\//, '');
                const absoluteUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${cleanUrl}`;
                return `![${alt}](${absoluteUrl})`;
            }
        );
        
        // Convert HTML img src attributes
        processedContent = processedContent.replace(
            /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi,
            (match, before, url, after) => {
                // If URL is already absolute, keep it as is
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                    return match;
                }
                // Convert relative path to GitHub raw URL
                const cleanUrl = url.replace(/^\.\//, '');
                const absoluteUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${cleanUrl}`;
                return `<img${before}src="${absoluteUrl}"${after}>`;
            }
        );
        
        // Check if marked library is available
        if (typeof marked !== 'undefined') {
            readmeContent.innerHTML = marked.parse(processedContent);
        } else {
            // Fallback: display raw content or basic HTML
            readmeContent.innerHTML = `<pre>${escapeHtml(processedContent)}</pre>`;
        }
    } else {
        readmeContent.innerHTML = '<p>No README found for this repository.</p>';
    }
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

    // Display server logs if available
    if (repositories && repositories.length > 0 && repositories[0].logs) {
        console.log('=== SERVER LOGS ===');
        repositories[0].logs.forEach(log => {
            console.log(`[${log.timestamp}] ${log.message}`);
        });
        console.log('=== END SERVER LOGS ===');
    }
    
    modal.innerHTML = `
        <div class="readme-modal-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Portfolio README</h2>
            <div class="readme-content" id="readme-content">Loading README...</div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Find portfolio repository in static data
    const portfolioRepo = repositories.find(r => r.name === 'portfolio');
    const readmeContent = document.getElementById('readme-content');
    
    if (!portfolioRepo) {
        console.error('Portfolio repository not found in static data');
        readmeContent.innerHTML = '<p>Portfolio repository not found.</p>';
        return;
    }
    
    console.log('Using static README content for portfolio repository');
    
    if (portfolioRepo.readmeContent) {
        // Process README content to convert relative image URLs to absolute GitHub URLs
        let processedContent = portfolioRepo.readmeContent;
        
        // Convert relative image paths to GitHub raw URLs
        const username = window.staticData?.metadata?.username || GITHUB_USERNAME;
        const repoName = 'portfolio';
        
        // Convert markdown image references
        processedContent = processedContent.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (match, alt, url) => {
                // If URL is already absolute (http/https), keep it as is
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                    return match;
                }
                // Convert relative path to GitHub raw URL
                const cleanUrl = url.replace(/^\.\//, '');
                const absoluteUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${cleanUrl}`;
                return `![${alt}](${absoluteUrl})`;
            }
        );
        
        // Convert HTML img src attributes
        processedContent = processedContent.replace(
            /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi,
            (match, before, url, after) => {
                // If URL is already absolute, keep it as is
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                    return match;
                }
                // Convert relative path to GitHub raw URL
                const cleanUrl = url.replace(/^\.\//, '');
                const absoluteUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${cleanUrl}`;
                return `<img${before}src="${absoluteUrl}"${after}>`;
            }
        );
        
        // Check if marked library is available
        if (typeof marked !== 'undefined') {
            readmeContent.innerHTML = marked.parse(processedContent);
        } else {
            // Fallback: display raw content or basic HTML
            readmeContent.innerHTML = `<pre>${escapeHtml(processedContent)}</pre>`;
        }
    } else {
        readmeContent.innerHTML = '<p>No README found for the portfolio repository.</p>';
    }
}

// Add marked library for markdown parsing
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);

// Add user-triggered update checking
function checkForUpdatesOnReload() {
    console.log('=== UPDATE CHECK START ===');
    console.log('Checking for updates on page reload...');
    console.log('Timestamp:', new Date().toISOString());
    
    // First check if static data exists
    fetch('/.netlify/functions/get-repos?mode=check')
        .then(response => {
            console.log('=== UPDATE CHECK RESPONSE ===');
            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response headers:', {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length')
            });
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                console.error('Response not OK, attempting to read error body...');
                return response.text().then(text => {
                    console.error('Error response body:', text);
                    throw new Error(`HTTP error! status: ${response.status}`);
                });
            }
            
            console.log('Response OK, parsing JSON...');
            return response.json();
        })
        .then(data => {
            console.log('=== UPDATE CHECK DATA RECEIVED ===');
            console.log('Data:', JSON.stringify(data, null, 2));
            console.log('Data type:', typeof data);
            console.log('Data keys:', Object.keys(data || {}));
            
            if (data.error) {
                console.error('Error in response:', data.error);
                console.error('Error details:', data.details || 'No details provided');
                return;
            }
            
            if (!data.success && data.needsFullFetch !== true) {
                console.error('Update check failed - success is false and needsFullFetch is not true');
                console.error('Response data:', data);
                return;
            }
            
            // If no static data exists, perform full fetch
            // BUT: Only do this if we don't already have valid static data loaded on the client
            if (data.needsFullFetch) {
                // Check if we already have valid static data loaded
                if (window.staticData && window.staticData.repositories && window.staticData.repositories.length > 0) {
                    console.log('Server indicates no static data, but client has valid static data loaded');
                    console.log('Skipping full fetch - using existing client-side data');
                    console.log('Reason from server:', data.reason || 'Unknown');
                    return;
                }
                
                console.log('No static data found, performing full fetch...');
                fetch('/.netlify/functions/get-repos?mode=full')
                    .then(response => {
                        console.log('Full fetch response status:', response.status);
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('Full fetch error body:', text);
                                throw new Error(`HTTP error! status: ${response.status}`);
                            });
                        }
                        return response.json();
                    })
                    .then(fullData => {
                        console.log('Full data fetched successfully');
                        console.log('Repositories count:', fullData.repositories?.length || 'N/A');
                    })
                    .catch(error => {
                        console.error('Error fetching full data:', error);
                        console.error('Error message:', error.message);
                        console.error('Error stack:', error.stack);
                    });
            } else if (data.changedRepos && data.changedRepos.length > 0) {
                // If changes found, update only changed repositories
                console.log(`Found ${data.changedRepos.length} changed repositories, updating...`);
                console.log('Changed repos:', data.changedRepos.map(r => r.name));
                
                fetch('/.netlify/functions/get-repos?mode=update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        changedRepos: data.changedRepos.map(repo => repo.name)
                    })
                })
                .then(response => {
                    console.log('Update response status:', response.status);
                    if (!response.ok) {
                        return response.text().then(text => {
                            console.error('Update error body:', text);
                            throw new Error(`HTTP error! status: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(updateData => {
                    console.log('Repository update result:', updateData);
                    if (updateData.success) {
                        console.log(`Updated ${updateData.updatedRepos} repositories`);
                        
// Merge updated repositories into the displayed list
                        if (updateData.repositories && updateData.repositories.length > 0) {
                            console.log('Merging updated repositories into display...');

                            // Create a map of existing repos by name
                            const repoMap = new Map(repositories.map(r => [r.name, r]));

                            // Update or add the new repos
                            updateData.repositories.forEach(updatedRepo => {
                                console.log(`Updating repo: ${updatedRepo.name}`);
                                repoMap.set(updatedRepo.name, updatedRepo);
                            });

                            // Convert map back to array
                            repositories = Array.from(repoMap.values());
                            filteredRepositories = [...repositories];

                            // Re-sort by creation date (newest first)
                            repositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                            filteredRepositories = [...repositories];

                            // Re-render the display
                            console.log('Re-rendering repositories with updated data...');
                            renderRepositories();

                            // Also update window.staticData if it exists
                            if (window.staticData && window.staticData.repositories) {
                                window.staticData.repositories = repositories;
                            }
                        }
                    } else {
                        console.error('Failed to update repositories:', updateData);
                    }
                })
                .catch(error => {
                    console.error('Error updating repositories:', error);
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                });
            } else {
                console.log('No changes found, static data is up to date');
                console.log('Unchanged repos count:', data.unchangedRepos?.length || 0);
            }
        })
        .catch(error => {
            console.error('=== UPDATE CHECK ERROR ===');
            console.error('Error checking for updates:', error);
            console.error('Error message:', error.message);
            console.error('Error type:', error.constructor.name);
            console.error('Error stack:', error.stack);
        });
}

// Initialize the application
async function init() {
    try {
        // Load repositories first to get static data
        await loadRepositories();
        
        // Then fetch user profile (will use static data if available)
        await fetchUserProfile();
        
        setupEventListeners();
        
        // Check for updates on page reload
        checkForUpdatesOnReload();
    } catch (error) {
        showError('Failed to initialize application. Please try again later.');
    }
}