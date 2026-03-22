require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Parser = require('rss-parser');
const mongoose = require('mongoose');

const app = express();
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
  }
});
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Mongoose Schema & Model
const ArticleSchema = new mongoose.Schema({
    title: String,
    summary: String,
    link: { type: String, unique: true },
    publishedAt: Number,
    source: String,
    category: String
});
const Article = mongoose.model('Article', ArticleSchema);

const FEEDS = [
    // GEOPOLITICS & GLOBAL NEWS
    { name: "BBC World", category: "geopolitics", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "Al Jazeera", category: "geopolitics", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "The Guardian", category: "geopolitics", url: "https://www.theguardian.com/world/rss" },
    { name: "NPR World", category: "geopolitics", url: "https://feeds.npr.org/1004/rss.xml" },
    { name: "Defense News", category: "geopolitics", url: "https://www.defensenews.com/arc/outboundfeeds/rss/" },
    { name: "Reuters World", category: "geopolitics", url: "http://feeds.reuters.com/Reuters/worldNews" },
    { name: "AP Top News", category: "geopolitics", url: "https://tass.com/rss/v2.xml" },
    { name: "Al-Monitor", category: "geopolitics", url: "https://www.al-monitor.com/rss.xml" },
    { name: "Foreign Policy", category: "geopolitics", url: "https://foreignpolicy.com/feed/" },
    { name: "NYT World", category: "geopolitics", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
    { name: "Washington Post World", category: "geopolitics", url: "https://feeds.washingtonpost.com/rss/world" },
    { name: "War on the Rocks", category: "geopolitics", url: "https://warontherocks.com/feed/" },
    { name: "The Diplomat", category: "geopolitics", url: "https://thediplomat.com/feed/" },
    { name: "SCMP Global", category: "geopolitics", url: "https://www.scmp.com/rss/91/feed" },
    { name: "Amnesty International", category: "geopolitics", url: "https://www.amnesty.org/en/rss/" },
    { name: "Human Rights Watch", category: "geopolitics", url: "https://www.hrw.org/rss/news" },
    { name: "Politico", category: "geopolitics", url: "https://rss.politico.com/politics-news.xml" },
    { name: "France 24", category: "geopolitics", url: "https://www.france24.com/en/rss" },
    { name: "DW News", category: "geopolitics", url: "https://rss.dw.com/rdf/rss-en-world" },
    { name: "CNBC International", category: "geopolitics", url: "https://www.cnbc.com/id/100727362/device/rss/rss.html" },
    { name: "Japan Times", category: "geopolitics", url: "https://www.japantimes.co.jp/feed/" },
    { name: "Times of India", category: "geopolitics", url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms" },
    { name: "Sydney Morning Herald", category: "geopolitics", url: "https://www.smh.com.au/rss/world.xml" },
    { name: "The Globe and Mail", category: "geopolitics", url: "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/world/" },
    { name: "The Independent", category: "geopolitics", url: "https://www.independent.co.uk/news/world/rss" },
    { name: "Sky News", category: "geopolitics", url: "https://feeds.skynews.com/feeds/rss/world.xml" },
    { name: "CBC World", category: "geopolitics", url: "https://www.cbc.ca/cmlink/rss-world" },
    { name: "VOA News", category: "geopolitics", url: "https://www.voanews.com/api/epiqq" },
    { name: "Jerusalem Post", category: "geopolitics", url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx" },
    { name: "AllAfrica", category: "geopolitics", url: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf" },
    { name: "Defense One", category: "geopolitics", url: "https://www.defenseone.com/rss/all/" },

    // TECHNOLOGY, CYBERSECURITY & AI
    { name: "TechCrunch", category: "technology", url: "https://techcrunch.com/feed/" },
    { name: "Ars Technica", category: "technology", url: "http://feeds.arstechnica.com/arstechnica/index" },
    { name: "Wired", category: "technology", url: "https://www.wired.com/feed/rss" },
    { name: "The Verge", category: "technology", url: "https://www.theverge.com/rss/index.xml" },
    { name: "MIT Tech Review", category: "technology", url: "https://www.technologyreview.com/feed/" },
    { name: "IEEE Spectrum", category: "technology", url: "https://spectrum.ieee.org/feeds/feed.rss" },
    { name: "Hackaday", category: "technology", url: "https://hackaday.com/blog/feed/" },
    { name: "Space.com", category: "technology", url: "https://www.space.com/feeds/all" },
    { name: "The Register", category: "technology", url: "https://www.theregister.com/headlines.atom" },
    { name: "Engadget", category: "technology", url: "https://www.engadget.com/rss.xml" },
    { name: "CNET", category: "technology", url: "https://www.cnet.com/rss/news/" },
    { name: "Mashable", category: "technology", url: "https://mashable.com/feeds/rss/all" },
    { name: "ZDNet", category: "technology", url: "https://www.zdnet.com/news/rss.xml" },
    { name: "VentureBeat", category: "technology", url: "https://venturebeat.com/feed/" },
    { name: "SiliconANGLE", category: "technology", url: "https://siliconangle.com/feed/" },
    { name: "GeekWire", category: "technology", url: "https://www.geekwire.com/feed/" },
    { name: "TechRadar", category: "technology", url: "https://www.techradar.com/rss" },
    { name: "DeepMind Blog", category: "technology", url: "https://deepmind.google/blog/rss.xml" },
    { name: "BleepingComputer", category: "technology", url: "https://www.bleepingcomputer.com/feed/" },
    { name: "Dark Reading", category: "technology", url: "https://www.darkreading.com/rss.xml" },
    { name: "The Hacker News", category: "technology", url: "https://feeds.feedburner.com/TheHackersNews" },
    { name: "CyberScoop", category: "technology", url: "https://www.cyberscoop.com/feed/" },
    { name: "SecurityWeek", category: "technology", url: "https://www.securityweek.com/feed/" },
    { name: "Schneier on Security", category: "technology", url: "https://www.schneier.com/blog/atom.xml" },
    { name: "XDA Developers", category: "technology", url: "https://www.xda-developers.com/feed/" },
    { name: "Android Police", category: "technology", url: "https://www.androidpolice.com/feed/" },
    { name: "9to5Mac", category: "technology", url: "https://9to5mac.com/feed/" },
    { name: "MacRumors", category: "technology", url: "https://feeds.macrumors.com/MacRumors-All" },
    { name: "Windows Central", category: "technology", url: "https://www.windowscentral.com/rss" },
    { name: "Phoronix", category: "technology", url: "https://www.phoronix.com/rss.php" },
    { name: "Tom's Hardware", category: "technology", url: "https://www.tomshardware.com/feeds/all" },
    { name: "InfoQ", category: "technology", url: "https://feed.infoq.com/" },
    { name: "Slashdot", category: "technology", url: "http://rss.slashdot.org/Slashdot/slashdotMain" },
    { name: "Rest of World", category: "technology", url: "https://restofworld.org/feed/" }
];

async function pollNews() {
    console.log(`[${new Date().toISOString()}] Polling ${FEEDS.length} feeds incrementally...`);
    
    const fetchPromises = FEEDS.map(async (feed) => {
        try {
            const parsed = await parser.parseURL(feed.url);
            
            for (const item of parsed.items) {
                if (!item.link) continue;
                let summary = item.contentSnippet || item.summary || item.content || '';
                summary = summary.replace(/<[^>]*>?/gm, '').substring(0, 300); // Strip HTML
                
                const articleObj = {
                    title: item.title,
                    summary: summary,
                    link: item.link,
                    publishedAt: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
                    source: feed.name,
                    category: feed.category
                };

                await Article.updateOne(
                    { link: item.link },
                    { $set: articleObj },
                    { upsert: true }
                );
            }
        } catch (error) {
            console.log(`Skipped ${feed.name}: ${error.message}`);
        }
    });

    try {
        await Promise.allSettled(fetchPromises);
        const count = await Article.countDocuments();
        console.log(`[${new Date().toISOString()}] Incremental pass complete. DB Cache size: ${count}`);
    } catch(err) {
        console.error('Error during global poll:', err);
    }
}

// Poll every 10 minutes (600,000 ms)
setInterval(pollNews, 600000);

// Initial poll on startup
pollNews();

app.get('/api/news', async (req, res) => {
    try {
        const articles = await Article.find().sort({ publishedAt: -1 }).limit(2000);
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: "Internal DB Error" });
    }
});

app.get('/api/sync', async (req, res) => {
    await pollNews();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`News Dashboard Server running on http://localhost:${PORT}`);
});
