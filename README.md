# 🌿 NutriZero AI — UN SDG 2 Zero Hunger Food & Nutrition Assistant

[![UN SDG 2: Zero Hunger](https://img.shields.io/badge/UN%20SDG-Goal%202%3A%20Zero%20Hunger-DDA63A?style=for-the-badge&logo=unitednations&logoColor=white)](https://sdgs.un.org/goals/goal2)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?style=for-the-badge&logo=githubpages&logoColor=white)](https://yashpanchal22.github.io/NutriZero-AI/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

> 🚀 **Live Demo on GitHub Pages:** **[https://yashpanchal22.github.io/NutriZero-AI/](https://yashpanchal22.github.io/NutriZero-AI/)**  
> Runs 100% standalone in the browser with offline-first UN SDG 2 AI knowledge and interactive tools!

**NutriZero AI** is an intelligent, high-impact web application dedicated to **United Nations Sustainable Development Goal 2 (SDG 2: Zero Hunger)**. It delivers accessible nutrition education, budget-conscious meal planning, pantry-ingredient cooking, food-waste reduction, and storage safety guidelines powered by **Google Gemini AI** with resilient domain fallback engines and automatic voice synthesis.

---

## 🌟 Key Modules & Features

| Module | Route | Capabilities |
| :--- | :--- | :--- |
| **🤖 AI Nutrition Chat** | `/chat` | Conversational assistant with markdown rendering, copy-to-clipboard, quick prompts, and **automatic voice readout** via the Web Speech API. |
| **🍳 Pantry Chef** | `/pantry-chef` | Interactive ingredient selector and custom tag input to generate zero-waste recipes using only items in your pantry. |
| **🍱 Budget Meal Planner** | `/meal-planner` | Tailored meal plans generated for customizable daily budgets (₹50–₹300+ / $1–$5 per person) and family sizes (1–6 people). |
| **♻️ Food Waste Rescue** | `/food-waste` | Upcycles vegetable scraps, stale bread, sour milk, and cooked leftovers into safe, delicious dishes. |
| **🧊 Food Storage & Safety** | `/food-storage` | Searchable shelf-life database, 2-hour safety rules, freezer protocols, and critical pantry separation tips. |
| **🔬 Nutrition Explorer** | `/nutrition` | Cost-per-gram protein analysis, staple nutritional profiles, and affordable superfood comparisons. |
| **🛒 Smart Grocery Planner** | `/grocery-planner` | Budget-capped categorized shopping lists organized by produce, grains, legumes, and dairy with cost tracking. |
| **🌍 SDG 2 Knowledge Hub** | `/sdg2` | Comprehensive guide on the 4 Pillars of Food Security (Availability, Access, Utilization, Stability) and UN 2030 targets. |
| **📊 Impact Dashboard** | `/dashboard` | Interactive charts (Recharts) visualizing monthly meals saved, food waste diverted, and carbon reduction metrics. |
| **⚙️ Settings & Diagnostics** | `/settings` | Live backend and Google Gemini connection health tests, dark/light theme toggle, and local storage management. |

---

## 🏗️ Architecture & Technology Stack

```
nutrizero-ai/
├── backend/                  # Python FastAPI REST API
│   ├── main.py               # Application endpoints, CORS, Pydantic validation
│   ├── gemini_service.py     # Official google-genai integration with retry & fallback
│   ├── requirements.txt      # Python dependencies
│   ├── run_tests.py          # Unit & automated test suites
│   ├── .env.example          # Environment variables template
│   └── .env                  # Local secret keys (ignored by git)
│
├── frontend/                 # React 18 + Vite + TypeScript Client
│   ├── src/
│   │   ├── api/client.ts     # Axios API client configured for backend
│   │   ├── components/       # Layout (Sidebar, Header, HistoryModal, MarkdownRenderer)
│   │   ├── pages/            # 10 comprehensive page views
│   │   ├── services/         # Web Speech voice readout & local storage management
│   │   └── types/            # TypeScript interfaces & API contracts
│   ├── package.json          # Node dependencies & build scripts
│   └── vite.config.ts        # Vite development & build configuration
│
├── .gitignore                # Production git ignore protecting secrets & build artifacts
├── package.json              # Monorepo convenience scripts
└── README.md                 # Project documentation
```

### Tech Stack Details
- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Lucide React (icons), Recharts (interactive data visualization), React Router v6.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, `google-genai` SDK (`gemini-flash-latest`, `gemini-3.6-flash`).
- **Security**: Strict client-server isolation. `GEMINI_API_KEY` is kept exclusively on the backend and is never exposed to the client or checked into git.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

---

### 1. Clone or Open the Repository
```bash
git clone https://github.com/<your-username>/nutrizero-ai.git
cd nutrizero-ai
```

---

### 2. Configure Backend & Environment

Navigate to the `backend/` folder and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file from the provided template:
```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `backend/.env` and add your Google Gemini API key:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Tip: You can obtain a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).*

Start the FastAPI server:
```bash
python -m uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000`. You can inspect interactive Swagger documentation at `http://localhost:8000/docs`.

---

### 3. Configure Frontend

In a new terminal window, navigate to the `frontend/` folder:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

### 4. Run Automated Tests

To run the backend test suite and verify Gemini API connectivity:
```bash
cd backend
python run_tests.py
python test_all_endpoints.py
```

To run a production frontend build:
```bash
cd frontend
npm run build
```

---

## 📤 Uploading This Project to GitHub

Follow these simple steps to publish your code to GitHub:

### Step 1: Initialize Git and Create Local Commit (if not already done)
```bash
# In the root directory (c:\Chatbot or project root):
git init
git add .
git commit -m "feat: complete rebuild of NutriZero AI (React + FastAPI + Google Gemini)"
```

### Step 2: Create a New GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click the **`+`** icon in the upper right corner and select **New repository**.
3. Name your repository (e.g. `nutrizero-ai`).
4. Choose **Public** or **Private**.
5. **Do NOT check** "Add a README file", ".gitignore", or "license" (we already have all of them locally).
6. Click **Create repository**.

### Step 3: Link and Push
In your terminal, run:
```bash
# Rename branch to main
git branch -M main

# Link your remote GitHub repository (replace with your actual GitHub repo URL)
git remote add origin https://github.com/<your-username>/nutrizero-ai.git

# Push your code
git push -u origin main
```

---

## 🔒 Security & Privacy

- **API Keys**: All API keys (`GEMINI_API_KEY`) are stored in `backend/.env` and are strictly ignored by `.gitignore`.
- **Public Safety**: Never commit `.env` or paste live API keys into issues or commits.
- **Medical Disclaimer**: NutriZero AI provides nutritional education and suggestions aligned with UN SDG 2. It does not provide medical diagnoses or replace licensed clinical healthcare providers.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add new regional staple recipes, multilingual support, or sustainability metrics:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <b>NutriZero AI</b> • Empowering Communities for UN SDG 2: Zero Hunger 🌱
</p>
