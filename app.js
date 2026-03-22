/**
 * Global Intel - News Dashboard Logic (Frontend API Consumer)
 */

const POLL_INTERVAL = 60000; // 60 seconds

let articles = [];
let filteredArticles = [];
let activeCategory = 'all';
let activeSources = new Set();
let activeSort = 'newest';
let searchQuery = '';

const newsGrid = document.getElementById('news-grid');
const loader = document.getElementById('loader');
const tickerContent = document.getElementById('ticker-content');
const sourceFiltersContainer = document.getElementById('source-filters');
const refreshBtn = document.getElementById('refresh-btn');
const categoryBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const nextPollDisplay = document.getElementById('next-poll');
const errorBanner = document.getElementById('error-banner');
const toggleAllBtn = document.getElementById('toggle-all-btn');

async function init() {
    showLoader(true);
    await fetchNews();
    if (articles.length > 0) {
        setupUI();
        applyFilters();
    } else {
        // Guarantee loader dismissal if API fails
        showLoader(false);
    }
    startPolling();
}

function showLoader(show) {
    if (show) {
        loader.classList.remove('hidden');
        newsGrid.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        newsGrid.classList.remove('hidden');
    }
}

async function fetchNews() {
    try {
        const res = await fetch('http://localhost:3000/api/news');
        if (!res.ok) throw new Error("Server disconnected");
        const data = await res.json();
        
        if (data.length === 0) {
            // Leave loader spinning visibly while backend incrementally caches
            document.getElementById('loader').innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                    <div class="spinner"></div>
                    <div style="color:var(--text-primary); font-size:1.1rem; font-family:monospace; font-weight:bold;">
                        System initializing... Scraping global intelligence streams...
                    </div>
                </div>
            `;
            return;
        }

        // Restore default layout if successfully scraped
        document.getElementById('loader').innerHTML = '<div class="spinner"></div>';
        
        articles = data.map(item => ({
            ...item,
            publishedAt: new Date(item.publishedAt)
        }));
        
        if (activeSources.size === 0) {
            articles.forEach(a => activeSources.add(a.source));
        }
        errorBanner.classList.add('hidden');
        updateTicker();
    } catch (err) {
        console.error("fetchNews Error:", err);
        errorBanner.classList.remove('hidden');
        showLoader(false); // Guarantee loader dismissal
    }
}

function setupUI() {
    // Inject Live Terminal Search in the header before the refreshBtn
    if (!document.getElementById('live-search')) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'live-search';
        searchInput.placeholder = 'Search intel...';
        searchInput.style.cssText = 'padding: 8px 16px; background: rgba(0,0,0,0.4); color: var(--text-primary, #fff); border: 1px solid var(--border-color, #444); border-radius: 20px; width: 250px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;';
        searchInput.onfocus = () => {
            searchInput.style.borderColor = 'var(--accent-primary, #1e90ff)';
            searchInput.style.boxShadow = '0 0 8px rgba(30, 144, 255, 0.5)';
        };
        searchInput.onblur = () => {
             searchInput.style.borderColor = 'var(--border-color, #444)';
             searchInput.style.boxShadow = 'none';
        };
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            applyFilters();
        });
        refreshBtn.parentNode.insertBefore(searchInput, refreshBtn);
    }

    // Inject "JARVIS" Audio Briefing Button in the header next to the refresh button
    if (!document.getElementById('jarvis-btn')) {
        const jarvisBtn = document.createElement('button');
        jarvisBtn.id = 'jarvis-btn';
        jarvisBtn.textContent = 'Play Briefing';
        jarvisBtn.style.cssText = 'padding: 8px 16px; background: var(--accent-primary, #1e90ff); background-color: rgba(30, 144, 255, 0.1); color: var(--accent-primary, #1e90ff); border: 1px solid var(--accent-primary, #1e90ff); border-radius: 4px; cursor: pointer; font-weight: bold; font-family: inherit; font-size: 0.9rem; transition: background 0.2s;';
        jarvisBtn.onmouseover = () => { jarvisBtn.style.backgroundColor = 'rgba(30, 144, 255, 0.2)'; };
        jarvisBtn.onmouseout = () => { jarvisBtn.style.backgroundColor = 'rgba(30, 144, 255, 0.1)'; };
        jarvisBtn.onclick = playAudioBriefing;
        refreshBtn.parentNode.insertBefore(jarvisBtn, refreshBtn.nextSibling);
    }

    const uniqueSources = [...new Set(articles.map(a => a.source))].sort();
    
    sourceFiltersContainer.innerHTML = '';
    uniqueSources.forEach(source => {
        const label = document.createElement('label');
        label.className = 'source-label';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = activeSources.has(source);
        cb.value = source;
        cb.addEventListener('change', (e) => {
            e.target.checked ? activeSources.add(source) : activeSources.delete(source);
            applyFilters();
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(source));
        sourceFiltersContainer.appendChild(label);
    });

    categoryBtns.forEach(btn => {
        if(!btn.dataset.category) return;
        btn.onclick = (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeCategory = e.target.dataset.category;
            applyFilters();
        };
    });

    sortSelect.onchange = (e) => {
        activeSort = e.target.value;
        applyFilters();
    };

    refreshBtn.onclick = async () => {
        showLoader(true);
        try {
            await fetch('http://localhost:3000/api/sync');
            await fetchNews();
            if (articles.length > 0) {
                setupUI(); 
                applyFilters();
            }
        } catch (e) {
            console.error("Manual sync failed", e);
            if (articles.length > 0) showLoader(false);
        }
    };

    if (toggleAllBtn) {
        toggleAllBtn.onclick = () => {
            const allChecked = activeSources.size === uniqueSources.length;
            const checkboxes = sourceFiltersContainer.querySelectorAll('input[type="checkbox"]');
            if (allChecked) {
                activeSources.clear();
                checkboxes.forEach(cb => cb.checked = false);
            } else {
                uniqueSources.forEach(s => activeSources.add(s));
                checkboxes.forEach(cb => cb.checked = true);
            }
            applyFilters();
        };
    }
}

function calculateRelevance(article) {
    let score = 100;
    const titleLower = article.title.toLowerCase();
    
    // Layer 2: Weighted NLP
    const tier1 = ['war', 'crisis', 'sanctions', 'breakthrough', 'emergency'];
    const tier2 = ['announces', 'summit', 'acquisition', 'unveils'];
    const penalties = ['opinion', 'review', 'rumor', 'best'];
    
    let tier1Hit = false;
    tier1.forEach(w => { 
        if(titleLower.includes(w)) {
            score += 50; 
            tier1Hit = true;
        }
    });
    tier2.forEach(w => { if(titleLower.includes(w)) score += 20; });
    penalties.forEach(w => { if(titleLower.includes(w)) score -= 40; });
    
    // Layer 3: Clickbait Filter
    if (article.title.length < 20 || (article.title.match(/!/g) || []).length >= 2) {
        score -= 30;
    }
    
    // Layer 5: Caps-Lock Penalty
    const upperWords = article.title.match(/\b[A-Z]{3,}\b/g) || [];
    if (upperWords.length >= 3) {
        score -= 30;
    }
    
    // Layer 6: Content Depth
    const summaryLen = article.summary ? article.summary.length : 0;
    if (summaryLen < 50) score -= 20;
    else if (summaryLen > 200) score += 15;
    
    // Layer 1: Source Authority
    let isTopTier = false;
    const tier1Sources = ["BBC World", "Al Jazeera", "Reuters", "Foreign Policy", "Wired", "TechCrunch", "NYT World", "Washington Post World", "Defense News", "Reuters World", "AP Top News"];
    if (tier1Sources.includes(article.source)) {
        score *= 1.5;
        isTopTier = true;
    }
    
    // Layer 8: Critical Impact Override
    article.isCritical = false;
    const baseScore = score;
    if (tier1Hit && isTopTier && baseScore >= 150) {
        article.isCritical = true;
    }
    
    // Layer 4: Logarithmic Time Decay
    const ageInHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    
    let finalScore;
    if (article.isCritical && ageInHours < 18) {
        // Bypass time decay entirely if under 18 hours old
        finalScore = baseScore;
    } else if (article.isCritical) {
        // Heavily reduced exponent for critical news decaying past 18 hours
        finalScore = baseScore / Math.pow(1.1, Math.max(0, ageInHours - 18));
    } else {
        // Normal decay
        finalScore = baseScore / Math.pow(1.5, Math.max(0, ageInHours));
    }
    
    return finalScore;
}

function applyFilters() {
    filteredArticles = articles.filter(a => {
        const catMatch = activeCategory === 'all' || a.category === activeCategory;
        const srcMatch = activeSources.has(a.source);
        
        // Add Terminal Search Filter checks
        const searchMatch = searchQuery === '' || 
                            a.title.toLowerCase().includes(searchQuery) || 
                            (a.summary && a.summary.toLowerCase().includes(searchQuery));
                            
        return catMatch && srcMatch && searchMatch;
    });

    if (activeSort === 'newest') {
        // Apply 8-Layer Heuristic Algorithm
        filteredArticles.forEach(a => {
            a.relevanceScore = calculateRelevance(a);
        });

        // Initial Sort by Relevance
        filteredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Layer 7: Event Deduplication
        const recentWords = [];
        filteredArticles.forEach(article => {
            const words = article.title.toLowerCase().match(/\b\w{5,}\b/g) || [];
            
            let overlapFound = false;
            for(let i = Math.max(0, recentWords.length - 2); i < recentWords.length; i++) {
                let shared = 0;
                const pastWords = recentWords[i];
                for (const w of words) {
                     if(pastWords.includes(w)) shared++;
                }
                if(shared >= 3) {
                    overlapFound = true;
                    break;
                }
            }
            
            if(overlapFound) {
                article.relevanceScore *= 0.4;
            }
            
            recentWords.push(words);
        });

        // Re-sort after deduplication
        filteredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else {
        // Archival Search (Oldest)
        filteredArticles.sort((a, b) => a.publishedAt - b.publishedAt);
    }

    renderCards();
    showLoader(false); 
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    
    return Math.floor(seconds) + "s ago";
}

function renderCards() {
    newsGrid.innerHTML = '';
    if (filteredArticles.length === 0) {
        newsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No intel found matching current filters.</div>';
        return;
    }

    filteredArticles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.id = `card-${article.id}`;
        const dateStr = new Date(article.publishedAt).toLocaleString();
        const catClass = article.category === 'geopolitics' ? 'tag-geopolitics' : 'tag-technology';
        
        card.innerHTML = `
            <div class="card-meta">
                <span class="card-source">${article.source}</span>
                <span class="cat-tag ${catClass}">${article.category.toUpperCase()}</span>
            </div>
            <div class="card-content">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 12px;">
                    <h3 style="margin-bottom: 0;">${article.title}</h3>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-primary); white-space: nowrap;">${getTimeAgo(article.publishedAt)}</span>
                </div>
                <div class="card-summary">${article.summary || 'Click to view full intelligence brief details...'}</div>
                <div class="card-actions">
                    <span style="font-size: 0.75rem; color: var(--text-muted)">${dateStr}</span>
                    <div style="display: flex; gap: 12px;">
                        <a href="${article.link}" target="_blank" class="read-more" onclick="event.stopPropagation()">Source Link <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                        <button class="close-btn" onclick="toggleCard(event, '${article.id}')">Close</button>
                    </div>
                </div>
            </div>
        `;
        card.addEventListener('click', () => {
            if (!card.classList.contains('expanded')) {
                document.querySelectorAll('.news-card.expanded').forEach(c => c.classList.remove('expanded'));
                card.classList.add('expanded');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        newsGrid.appendChild(card);
    });
}

window.toggleCard = function(event, id) {
    event.stopPropagation();
    const card = document.getElementById(`card-${id}`);
    if (card) card.classList.remove('expanded');
};

let countdown = 60;
function startPolling() {
    setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            nextPollDisplay.textContent = 'Syncing...';
            fetchNews().then(() => {
                if (articles.length > 0) {
                    setupUI();
                    applyFilters();
                }
                countdown = 60;
            });
        } else {
            nextPollDisplay.textContent = `Next sync in ${countdown}s`;
        }
    }, 1000);
}

function updateTicker() {
    const latest = [...articles].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 5);
    let tickerHtml = '<div class="ticker-content">';
    latest.forEach(item => tickerHtml += `<div class="ticker-item"><span class="source">${item.source} //</span> ${item.title}</div>`);
    latest.forEach(item => tickerHtml += `<div class="ticker-item"><span class="source">${item.source} //</span> ${item.title}</div>`);
    tickerHtml += '</div>';
    tickerContent.innerHTML = tickerHtml;
}

// JARVIS Audio Briefing Core Logic
function playAudioBriefing() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        removeJarvisModal();
        return; 
    }

    const utterance = new SpeechSynthesisUtterance("How can I help you?");
    utterance.rate = 1.0;
    
    // Attempt to use English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en'));
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    
    // When the greeting finishes, display the smart command modal
    utterance.onend = () => {
        showJarvisModal();
    };
    
    window.speechSynthesis.speak(utterance);
}

function showJarvisModal() {
    removeJarvisModal(); // Ensure no duplicates
    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'jarvis-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: rgba(30, 30, 30, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 30px;
        width: 300px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'JARVIS Intelligence';
    title.style.cssText = 'color: #fff; text-align: center; margin-bottom: 5px; margin-top: 0;';
    modalContent.appendChild(title);
    
    const btnStyle = `
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    `;
    
    const topBtn = document.createElement('button');
    topBtn.id = 'jarvis-top';
    topBtn.textContent = 'Read Top Briefings';
    topBtn.style.cssText = btnStyle;
    topBtn.onmouseover = () => { topBtn.style.background = 'rgba(30, 144, 255, 0.2)'; topBtn.style.borderColor = '#1e90ff'; };
    topBtn.onmouseout = () => { topBtn.style.background = 'rgba(255, 255, 255, 0.05)'; topBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)'; };
    topBtn.onclick = () => {
        removeJarvisModal();
        readArticles(filteredArticles.slice(0, 3));
    };
    
    const techBtn = document.createElement('button');
    techBtn.id = 'jarvis-tech';
    techBtn.textContent = 'Tech Update';
    techBtn.style.cssText = btnStyle;
    techBtn.onmouseover = () => { techBtn.style.background = 'rgba(30, 144, 255, 0.2)'; techBtn.style.borderColor = '#1e90ff'; };
    techBtn.onmouseout = () => { techBtn.style.background = 'rgba(255, 255, 255, 0.05)'; techBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)'; };
    techBtn.onclick = () => {
        removeJarvisModal();
        const techArticles = filteredArticles.filter(a => a.category === 'technology').slice(0, 3);
        readArticles(techArticles);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'jarvis-close';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = btnStyle;
    cancelBtn.style.marginTop = '10px';
    cancelBtn.onmouseover = () => { cancelBtn.style.background = 'rgba(255, 60, 60, 0.2)'; cancelBtn.style.borderColor = '#ff3c3c'; };
    cancelBtn.onmouseout = () => { cancelBtn.style.background = 'rgba(255, 255, 255, 0.05)'; cancelBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)'; };
    cancelBtn.onclick = () => {
        removeJarvisModal();
        window.speechSynthesis.cancel();
    };
    
    modalContent.appendChild(topBtn);
    modalContent.appendChild(techBtn);
    modalContent.appendChild(cancelBtn);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function removeJarvisModal() {
    const existing = document.getElementById('jarvis-modal-overlay');
    if (existing) existing.remove();
}

function readArticles(articlesList) {
    if (articlesList.length === 0) {
        const u = new SpeechSynthesisUtterance("No articles found for this briefing.");
        window.speechSynthesis.speak(u);
        return;
    }

    let textToRead = "Initializing... Here are your top updates. ";
    
    articlesList.forEach(article => {
        let summaryFirstSentence = "";
        if (article.summary) {
             summaryFirstSentence = article.summary.split('.')[0] + ".";
        }
        textToRead += `In ${article.category}, reporting from ${article.source}. ${article.title}. ${summaryFirstSentence} `;
    });

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95; 
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en'));
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// In case voices load late
window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};

init();