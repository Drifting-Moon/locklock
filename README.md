# 🚦 Urban Intelligence Platform | Flipkart Gridlock Hackathon

![Dashboard Preview](https://img.shields.io/badge/Status-Live_Prototype-success?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Pandas-blue?style=for-the-badge)

A hyper-modern, AI-driven Command Center built to solve Bengaluru's traffic congestion crisis. This prototype leverages real **Bengaluru Traffic Police (BTP)** violation datasets to dynamically identify hotspots, calculate real-world economic damage, and automate the dispatch of BTP Interceptor tow trucks.

---

## 🎯 The Problem
Illegal parking—specifically near critical BMTC Bus Stops and main road arterial routes—creates localized bottlenecks that cascade into massive, city-wide traffic gridlock. Traditional ticketing is reactive; the city needs a proactive engine that calculates the *financial impact* of a blockage to prioritize towing and enforcement.

## 🚀 The Solution
This platform acts as the brain for traffic management. It ingests raw traffic violation data and translates it into actionable intelligence for city administrators and traffic wardens.

### ✨ Key Features

* **🗺️ Dynamic Hotspot Extraction:** 
  Actively parses the BTP violation dataset to identify the worst offenders. It automatically filters for highly specific violations like `PARKING NEAR BUSTOP` and `PARKING IN A MAIN ROAD` to generate a live map of the city's most critical chokepoints.

* **🛰️ Live Detection Engine (Haversine Proximity):**
  A live simulation engine that accepts incoming vehicle GPS pings (mimicking Vahan API or ANPR cameras). It uses the **Haversine Formula** to calculate the exact distance (in meters) between the vehicle and known BMTC bus stop hotspots. If a vehicle is detected loitering within a 25-meter radius, it automatically flags a violation.

* **💰 AI Severity & Economic Cost Math:**
  Not all parking tickets are equal. The AI engine grades each violation dynamically:
  * **Severity Score (0-100):** Factored using physical proximity to the bus stop, loitering dwell time, and the bus route density (buses per hour).
  * **Cost Impact (₹/hr):** Calculates the cascading economic loss to the city using the formula: `(Buses/hr × 65 Pax × Delay / 60) × ₹100 VoTT`.

* **🚓 BTP Interceptor Dispatch Queue:**
  When a critical violation is detected, it is immediately logged into the Dispatch Queue. The system calculates an "ROI Score" (Violations × Criticality / Tow ETA) to prioritize which vehicle the Tiger Towing units should impound first. Features a one-click CSV Export for instant warden deployment.

* **📈 Congestion Cost Engine (LWR Shockwave Theory):**
  An interactive, browser-based sandbox that allows administrators to use the **Lighthill-Whitham-Richards (LWR) Shockwave Theory**. Users can adjust lane widths and traffic flow to watch how a single illegally parked car creates a backward-propagating shockwave, culminating in lakhs of rupees of lost Value of Travel Time (VoTT).

---

## 🛠️ Technology Stack

* **Frontend:** Next.js (React), TailwindCSS (for utility), Vanilla CSS (for premium Glassmorphism & Dark Mode components).
* **Backend:** Python, FastAPI.
* **Data Engine:** Pandas (Data processing, filtering, and dynamic aggregation).
* **Geospatial:** Haversine physics algorithm for live distance tracking.

---

## 💻 How to Run Locally

This prototype requires both the Python backend and the Next.js frontend to be running simultaneously.

### 1. Start the Backend (Data Engine)
```bash
cd backend
pip install fastapi uvicorn pandas
uvicorn main:app --reload
```
*The API will be live at `http://localhost:8000`*

### 2. Start the Frontend (Command Center)
```bash
cd frontend
npm install
npm run dev
```
*The Dashboard will be live at `http://localhost:3000`*

---

### 🏆 Built for the Flipkart Gridlock Hackathon
