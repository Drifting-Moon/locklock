# 🚦 Gridlock: Urban Intelligence Platform
**Moving cities forward with physics-driven analytics and Generative AI.**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-F4B400?logo=google)](https://deepmind.google/technologies/gemini/)

> **Submission for the Flipkart Gridlock Hackathon**
> 
> **Live Demo:** [https://gridlockk.vercel.app](https://gridlockk.vercel.app)

---

## 📖 Table of Contents
1. [The Problem](#-the-problem)
2. [Our Solution](#-our-solution)
3. [Key Features](#-key-features)
4. [Flipkart & E-Commerce Impact](#-flipkart--e-commerce-impact)
5. [Tech Stack](#-tech-stack)
6. [Screenshots](#-screenshots)
7. [Local Installation](#-local-installation)
8. [Environment Variables](#-environment-variables)
9. [The Team](#-the-team)

---

## 🚨 The Problem
Imagine it's 6 PM in Bangalore. It just started raining. A Flipkart delivery truck is trying to reach Whitefield but gets completely stuck near the Silk Board junction. Standard GPS applications only highlight traffic *after* the jam has already formed. They react to the past, instead of predicting the future.

This blind spot costs cities billions of dollars in lost productivity, fuel wastage, and destroyed supply chain SLAs.

---

## 💡 Our Solution
**Gridlock** is an advanced, physics-driven Urban Command Center designed for city administrators and logistics networks. 

Instead of guessing where traffic will be, Gridlock integrates the **BPR (Bureau of Public Roads) mathematical equation** to calculate the exact capacity-breaking point of a road segment. When combined with our simulated live CCTV metrics and **Google Gemini 2.5 Flash**, the platform doesn't just show you traffic—it tells you exactly how to fix it in real-time.

---

## 🚀 Key Features
- **📊 BPR Physics Engine:** Live, mathematical calculation of Volume-to-Capacity (V/C) ratios and exponential delay times.
- **🗺️ Interactive Spatial Mapping:** High-performance MapLibre heatmaps that visually flag critical city bottlenecks.
- **📷 CCTV Vision Intelligence:** Real-time simulated telemetry tracking illegal parking, bus lane blocks, and average speeds at specific city nodes.
- **🤖 Generative AI Traffic Analyst:** Direct integration with Google Gemini to analyze critical intersections and generate military-grade tactical dispatch recommendations.
- **💬 Conversational AI Assistant:** A context-aware chatbot capable of answering standard operating procedure (SOP) queries for traffic wardens.
- **📈 Economic & Analytic Dashboards:** Deep tracking of the exact financial cost of fuel wasted during specific gridlock events.

---

## 📦 Flipkart & E-Commerce Impact
For a massive logistics network like Flipkart, Gridlock is a game-changer. By licensing the Gridlock API, delivery fleets can pull live BPR delay calculations and AI predictions to reroute drivers *before* they hit a bottleneck. This ensures perfect delivery SLAs, maximizes fuel efficiency, and cuts down on massive operational losses in dense cities like Bangalore.

---

## 🛠️ Tech Stack
### Frontend (UI/UX)
* **Framework:** Next.js (React 19) with App Router
* **Styling:** Tailwind CSS v4, Lucide-React Icons
* **Mapping:** MapLibre-GL, React-Map-GL
* **Deployment:** Vercel Edge Network

### Backend (Engine)
* **Framework:** Python, FastAPI (Asynchronous processing)
* **Math Engine:** Custom BPR implementation in pure Python
* **AI Integration:** `google-genai` SDK for Gemini 2.5 Flash
* **Deployment:** Render Web Services

---

## 📸 Screenshots

*(Note: Upload your screenshots to your GitHub repo, then replace the placeholder links below!)*

### 1. The Command Center & Live Heatmaps
> *Showcases the dark-mode MapLibre UI with BPR-driven congestion heatmaps.*

![Command Center](https://placehold.co/800x400?text=Insert+Dashboard+Screenshot+Here)

### 2. CCTV Vision Intelligence
> *Simulated live telemetry feeds pulling lane blockage and speed metrics.*

![CCTV Intel](https://placehold.co/800x400?text=Insert+CCTV+Dashboard+Screenshot+Here)

### 3. Gemini AI Tactical Analysis
> *Google Gemini acting as an automated traffic warden generating dispatch recommendations.*

![Gemini AI](https://placehold.co/800x400?text=Insert+Gemini+AI+Screenshot+Here)

### 4. Financial Cost & Economics Dashboard
> *Tracking the literal dollar cost of fuel wasted in standstill traffic.*

![Economics](https://placehold.co/800x400?text=Insert+Economics+Screenshot+Here)

---

## 💻 Local Installation

Want to run Gridlock locally? Follow these steps:

### Prerequisites
* Node.js (v18 or higher)
* Python (3.9 or higher)
* A Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/Gridlock.git
cd Gridlock
```

### 2. Setup the Backend (FastAPI)
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
*The backend will now be running on `http://localhost:8000`*

### 3. Setup the Frontend (Next.js)
Open a new terminal window:
```bash
cd frontend

# Install packages
npm install

# Run the development server
npm run dev
```
*The frontend will now be running on `http://localhost:3000`*

---

## 🔑 Environment Variables
Create a `.env` file in the **backend** directory:
```env
GEMINI_API_KEY=your_google_gemini_key_here
```

Create a `.env.local` file in the **frontend** directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 👨‍💻 The Team
* **[Your Name]** - Full Stack Developer & AI Integration
  * [GitHub](https://github.com/YourUsername)
  * [LinkedIn](https://linkedin.com/in/YourProfile)

---
*Built with ❤️ for the Flipkart Gridlock Hackathon*
