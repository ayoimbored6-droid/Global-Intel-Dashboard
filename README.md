🌍 Global Intel Dashboard
Automated Geopolitical & Technical Intelligence Synthesis
Live Demo: https://global-intel-dashboard.onrender.com/

📌 Project Overview
The Global Intel Dashboard is a full-stack intelligence terminal designed to solve the problem of information overload. It aggregates over 65+ high-signal global news streams, processes them through a custom 8-layer prioritization algorithm, and maintains a rolling 30-day historical archive for deep analysis.

This project represents my first major leap into full-stack engineering, moving from simple local scripts to a production-grade cloud infrastructure.

🚀 Key Features
8-Layer Intelligence Scoring: A custom algorithm that ranks incoming data based on critical geopolitical and technical intelligence factors.

Persistent Cloud Archive: Integrated with MongoDB Atlas using a Time-To-Live (TTL) index to maintain a self-cleaning 30-day intelligence history.

Deep Archive Search: Server-side regex searching allowing for millisecond retrieval of keywords across thousands of archived documents.

Weekly SITREP Generator: A synthesis engine that identifies and summarizes the top 15 highest-scoring intelligence events from the past 7 days.

Tactical UI: A high-performance, dark-mode dashboard built for efficiency and "at-a-glance" situational awareness.

🛠️ Tech Stack
Backend: Node.js, Express.js

Database: MongoDB Atlas (NoSQL)

ORM: Mongoose

Deployment: Render (CI/CD via GitHub)

Frontend: HTML5, CSS3, Vanilla JavaScript

📈 The Engineering Journey (The "Growth" Story)
This project was a significant technical challenge for me as a 15-year-old developer. The journey involved:

Scaling from RAM to Disk: Transitioning from in-memory arrays to a persistent database required a complete rewrite of the backend architecture and a deep dive into Mongoose schemas.

DevOps & Deployment: Configuring environment variables, managing CORS, and setting up network access for a live cloud environment on Render.

Algorithmic Logic: Developing the scoring layers to ensure that "signal" is always prioritized over "noise."
