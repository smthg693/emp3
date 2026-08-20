# 🚀 Kepler's Crew — Earth–Mars Deep Space Mission Control

> An AI-assisted communication system that manages deep-space signal delays, optimizes data transmission queues, and provides autonomous safety procedures across the Earth–Mars radio link.

---

## 📌 What Is This Project?

When controlling spacecraft or rovers on Mars, radio signals take **3 to 22 minutes** to travel one way at the speed of light. That means a round-trip command takes **up to 44 minutes**, making real-time remote control impossible.

This web application simulates an **AI Mission Control System** designed to solve three major challenges:
1. **Predicting Delay**: Calculating real-time signal latency based on planetary orbital physics.
2. **Optimizing Data Queue**: Packing high-priority data (emergency telemetry) first during short contact windows using NASA's **Delay/Disruption Tolerant Networking (DTN)** store-and-forward philosophy.
3. **Autonomous Emergency Safety**: Allowing onboard spacecraft software to execute pre-approved emergency procedures immediately when a fault happens on Mars, rather than waiting up to 44 minutes for Earth to respond.

---

## ✨ Features & Interactive Demos

| Feature | What It Does | Interactive Controls |
|---|---|---|
| **🌌 Orbital Visualizer** | Interactive 2D/3D map of Sun, Earth, and Mars orbits showing radio beam pulses. | Drag the **Synodic Orbit Slider** ($0 - 26$ months) or click **Auto Orbit** to watch distance and signal delay change dynamically. |
| **📈 Latency Forecast Chart** | Interactive SVG curve predicting one-way delay across the 26-month synodic cycle. | Hover over graph nodes to see distance and delay stats. Highlights the ~13-day solar blackout window. |
| **⚡ Data Queue Scheduler** | Optimization engine packing P1 to P5 priority payloads into available pass windows. | Click **Run AI Scheduler** to pack data and buffer unsent files into the NASA DTN outbox. |
| **🚨 Autonomous Response Pipeline** | 5-step fault recovery visualizer enforcing human-in-the-loop safety boundaries. | Click preset fault buttons (**Thermal**, **Antenna**, **Battery**) to watch the 5-step recovery sequence in action. |
| **📡 DSN Radar Tracker** | 360° rotating radar dish tracking 3 ground station complexes ($120^\circ$ apart). | Switch between Goldstone (USA), Madrid (Spain), and Canberra (Australia) to inspect azimuth, elevation, and signal lock metrics. |
| **🔬 Research Center** | Technical research notes on deep-space physics, solar conjunctions, and flight precedents. | Explore four dedicated research tabs in the top navigation bar. |

---

## ⚡ Quick Start (Run Locally)

You can run this project locally in **2 simple steps**:

```bash
# 1. Install dependencies
npm install

# 2. Start the local server
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## 🌐 1-Click Deployment Guide

This repository includes pre-configured settings for instant 1-click cloud deployment:

### 1️⃣ Deploy to Vercel (Recommended)
1. Push this project to your GitHub account.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository — Vercel will automatically detect `vercel.json` and deploy it instantly!

### 2️⃣ Deploy to Netlify
1. Log in to [Netlify.com](https://netlify.com).
2. Drag & drop the `dist` folder directly onto Netlify, or connect your GitHub repository (pre-configured with `netlify.toml`).

### 3️⃣ Deploy to GitHub Pages
1. Push this project to GitHub.
2. In your repository settings, go to **Pages** $\rightarrow$ **Source** $\rightarrow$ select **GitHub Actions**.
3. Every push to `main` will automatically build and publish your site!

---

## 📂 Project Directory Structure

```
c:\Users\soham\OneDrive\Desktop\oo\
├── src/
│   ├── components/
│   │   ├── Header.tsx                   # Top navigation bar & telemetry metrics
│   │   ├── OrbitalVisualizer.tsx        # 2D/3D canvas orbit map
│   │   ├── LatencyPredictionChart.tsx   # SVG 26-month latency forecast curve
│   │   ├── DataScheduler.tsx            # AI payload queue optimization table
│   │   ├── AutonomousEmergencyHandler.tsx # 5-step emergency response pipeline
│   │   ├── MissionAdvisor.tsx           # Anomaly detection & explainable AI
│   │   ├── RadarTracker.tsx             # 360° DSN ground antenna tracker
│   │   ├── NetworkInfrastructure.tsx    # NASA DTN precedents & data rates
│   │   ├── ResearchCenter.tsx           # Technical research briefing notes
│   │   └── ConsoleLogger.tsx            # Live telemetry packet stream
│   ├── types/
│   │   └── mission.ts                   # TypeScript data models
│   ├── App.tsx                          # Main application layout & state
│   └── main.tsx                         # React entry point with ErrorBoundary
├── dist/                                # Production build output
├── preview.html                         # Standalone single-file version
├── vercel.json                          # Vercel deployment config
├── netlify.toml                         # Netlify deployment config
└── README.md                            # You are here!
```

---

## 📄 References & Research Sources

- **NASA Deep Space Network (DSN)**: *science.nasa.gov/mars/mars-relay-network*
- **NASA DTN (Delay/Disruption Tolerant Networking)**: *nasa.gov/communicating-with-missions* (PACE 2024 mission precedent & ISS 2009 flight testing)
- **ESA Mars Express Time-Delay Technical Notes**

---

## 📜 License

MIT License — **Kepler's Crew** Research Team
