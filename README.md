# Global Intel | News Dashboard Setup Guide

This document outlines the steps to run and customize your premium news dashboard.

## 1. Quick Start

This application is built with pure HTML, CSS, and Vanilla JavaScript to ensure high performance and zero build-step overhead.

1. Open the folder containing these files.
2. Double-click `index.html` to open it in any modern web browser.
3. The dashboard will automatically fetch the latest geopolitics and tech news and begin background polling every 60 seconds.

## 2. Architecture & Features

- **Expandable Grid**: Click on any news card to expand it for a deep-dive reading view spanning the entire grid width.
- **Background Polling**: The JS runs a silent 60-second counter that seamlessly refreshes data in the background without shifting the UI unexpectedly.
- **Premium Aesthetics**: Engineered with deep dark-mode arrays (`#111827`, `#080c14`), smooth cubic-bezier transitions, and glassmorphism touches.
- **API Fetching**: By default, it uses high-quality RSS feeds passed through `rss2json` (to bypass frontend CORS restrictions). If the rate limit is hit, it will seamlessly fall back to local mock data so the UI remains pristine.

## 3. How to add custom API Keys (Currents API / NewsAPI)

If you prefer to use a specialized API like Currents API instead of RSS parsed data, update `app.js`:

1. Locate the `fetchNews()` function in `app.js`.
2. Replace the `promises` execution block with your API fetch:

```javascript
// Example replacing RSS fallback with Currents API
const apiKey = 'YOUR_CURRENTS_API_KEY';
const url = `https://api.currentsapi.services/v1/latest-news?language=en&category=technology&apiKey=${apiKey}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        const fetchedItems = data.news.map(item => ({
             title: item.title,
             summary: item.description,
             link: item.url,
             publishedAt: new Date(item.published),
             source: "Currents API",
             category: "technology"
        }));
        // Merge into articles...
    });
```

Enjoy this highly detailed, ultra-fast News Dashboard!
