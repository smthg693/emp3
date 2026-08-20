# 🚀 Kepler's Crew — Earth–Mars Deep Space Mission Control

> An AI-assisted communication system that manages deep-space signal delays, optimizes data transmission queues, and provides autonomous safety procedures across the Earth–Mars radio link.

---

### 🌌 Unified Mission State Pipeline
```text
Orbital State (AU) ➔ Distance (km) ➔ Light-Time Latency ➔ Spacecraft Telemetry ➔ TF.js Autoencoder ➔ Per-Feature Attribution ➔ Safety Policy Engine ➔ DTN Storage ➔ 0/1 Dynamic Programming Knapsack ➔ Downlink
```

---

## 📌 What Is This Project?

When controlling spacecraft or rovers on Mars, radio signals take **3 to 22 minutes** to travel one way at the speed of light. That means a round-trip command takes **up to 44 minutes**, making real-time remote control impossible.

This web application simulates an **AI Mission Control System** designed to solve three major challenges:
1. **Predicting Delay**: Calculating real-time signal latency based on heliocentric orbital physics ($d^2 = r_E^2 + r_M^2 - 2 r_E r_M \cos\Delta\theta$).
2. **Optimizing Data Queue**: Packing high-priority data into contact windows using NASA's **Delay/Disruption Tolerant Networking (DTN)** store-and-forward philosophy combined with a **0/1 Dynamic Programming Knapsack Optimizer**.
3. **Autonomous Emergency Safety**: Offline client-side **TensorFlow.js Autoencoder Anomaly Attribution & Deterministic Safety Policy Engine** (100% offline, 0 API keys required).

---

## ✨ Features & Interactive Demos

| Feature | What It Does | Interactive Controls |
|---|---|---|
| **🌌 Orbital Visualizer** | Interactive 2D/3D map of Sun, Earth, and Mars orbits showing radio beam pulses. | Drag the **Synodic Orbit Slider** ($0 - 26$ months) or click **Blackout Demo** to watch distance and signal delay change dynamically. |
| **📈 Latency Forecast Chart** | Interactive SVG curve predicting one-way delay across the 26-month synodic cycle. | Hover over graph nodes to see distance and delay stats. Highlights the ~13-day solar blackout window. |
| **⚡ Data Queue Scheduler** | Optimization engine packing P1 to P5 priority payloads into available pass windows. | Compares **Baseline Greedy** vs **Kepler 0/1 DP Knapsack** to show measured value gains. |
| **🚨 Autonomous Response Pipeline** | 5-step fault recovery visualizer enforcing human-in-the-loop safety boundaries. | Evaluates ML recommendations against pre-approved rules (`RULE-TH-092`, `RULE-EPS-005`). |
| **🧠 TensorFlow.js Mission Advisor** | Offline client-side neural network per-feature reconstruction error attribution & explainable AI. | Evaluates live telemetry vectors locally without any external API keys or serverless dependencies. |
| **📡 DSN Radar Tracker** | 360° rotating radar dish tracking 3 ground station complexes ($120^\circ$ apart). | Switch between Goldstone (USA), Madrid (Spain), and Canberra (Australia). |
| **🔬 Research Center & Benchmarks** | Technical benchmark panel reporting measured ML precision, recall, F1, and response reduction. | Transparent data disclosures provided for all benchmark metrics. |

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

## 🧪 Running Unit Tests

Run the full Vitest unit test suite covering physics, ML pipeline, 0/1 knapsack optimizer, safety policy, and DTN queue:

```bash
npm test
```

---

## 🌐 1-Click Deployment Guide

This repository is **100% self-contained and offline-ready**. No API keys or environment variables are required!

### 1️⃣ Deploy to Vercel (Recommended)
1. Push this project to your GitHub account.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository — Vercel will deploy it instantly!

---

## 📜 License

MIT License — **Kepler's Crew** Research Team
