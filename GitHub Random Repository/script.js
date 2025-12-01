// Select DOM elements
const languageSelect = document.getElementById('languageSelect');
const contentArea = document.getElementById('content-area');

// Initial State
renderEmptyState();

// Event Listener for Dropdown
languageSelect.addEventListener('change', function() {
    const selectedLanguage = this.value;
    if (selectedLanguage) {
        fetchRandomRepo(selectedLanguage);
    }
});

// --- Core Logic ---

async function fetchRandomRepo(language) {
    renderLoadingState();

    // GitHub Search API
    // We sort by stars to get decent repos, and order randomly-ish 
    // (Actual random from GitHub API is hard, so we pick a random page/item)
    const apiUrl = `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=100`;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // Pick a random index from the results
            const randomIndex = Math.floor(Math.random() * data.items.length);
            const repo = data.items[randomIndex];
            renderSuccessState(repo, language);
        } else {
            renderErrorState('No repositories found.');
        }

    } catch (error) {
        renderErrorState('Error fetching repositories');
    }
}

// --- Render Functions (UI States) ---

function renderEmptyState() {
    contentArea.innerHTML = `
        <div class="state-box">
            <p>Please select a language</p>
        </div>
    `;
}

function renderLoadingState() {
    contentArea.innerHTML = `
        <div class="state-box">
            <p>Loading, please wait...</p>
        </div>
    `;
}

function renderErrorState(message) {
    contentArea.innerHTML = `
        <div class="error-box">
            <p>${message}</p>
            <button class="retry-btn" onclick="retryFetch()">Click to retry</button>
        </div>
    `;
}

function renderSuccessState(repo, language) {
    // Determine language color (basic logic)
    const langColor = language === 'javascript' ? '#f1e05a' : 
                      language === 'python' ? '#3572A5' : '#ccc';

    contentArea.innerHTML = `
        <div class="repo-card">
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
            </div>
            <p class="repo-desc">${repo.description || 'No description available.'}</p>
            
            <div class="repo-stats">
                <div class="stat">
                    <span class="lang-circle" style="background-color: ${langColor}"></span>
                    ${repo.language || 'N/A'}
                </div>
                <div class="stat">★ ${formatNumber(repo.stargazers_count)}</div>
                <div class="stat">⑂ ${formatNumber(repo.forks_count)}</div>
                <div class="stat">ⓘ ${formatNumber(repo.open_issues_count)}</div>
            </div>
        </div>
        <button class="refresh-btn" onclick="retryFetch()">Refresh</button>
    `;
}

// --- Helper Functions ---

function retryFetch() {
    const language = languageSelect.value;
    if (language) {
        fetchRandomRepo(language);
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
}