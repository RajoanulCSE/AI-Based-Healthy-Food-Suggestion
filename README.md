# 🍎 AI-Based Healthy Food Suggestion System

A full-stack application that provides personalized nutrition recommendations powered by artificial intelligence. The system analyzes user health data including BMI, activity level, and health goals to suggest optimal food choices.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3+-black?style=flat&logo=flask)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?style=flat&logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📱 Overview

This project includes:
- **Backend**: Flask-based REST API with AI food recommendation logic
- **Web Frontend**: Responsive HTML/CSS/JS interface
- **Mobile App**: React Native app for iOS and Android

---

## ✨ Features

### Core Features
- 📊 **BMI Calculator** - Calculate Body Mass Index from weight and height
- 🤖 **AI Food Suggestions** - Personalized food recommendations based on:
  - User's BMI category
  - Activity level (sedentary, moderate, active)
  - Health goals (weight loss, muscle gain, maintenance)
  - Dietary restrictions (allergies, skin conditions)
- 📈 **Health Tracking** - Track weight, height, and progress over time
- 💤 **Lifestyle Tracking** - Monitor sleep, exercise, and daily habits
- 📄 **PDF Reports** - Download personalized health recommendations
- 💬 **AI Chat** - Get answers to health-related questions

### Backend API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/calculate` | POST | Calculate BMI and get food suggestions |
| `/register` | POST | User registration |
| `/login` | POST | User authentication |
| `/save_health_data` | POST | Save health tracking data |
| `/get_health_history` | GET | Retrieve health history |
| `/get_health_insights` | GET | AI-generated health insights |
| `/get_personalized_recommendations` | GET | Full recommendation report |
| `/save_lifestyle_data` | POST | Save lifestyle data |
| `/get_lifestyle_data` | GET | Retrieve lifestyle data |
| `/chat` | POST | AI chat endpoint |
| `/download_recommendations_pdf` | GET | Download PDF report |

---

## 🛠️ Technology Stack

### Backend
- **Python 3.10+**
- **Flask** - Web framework
- **SQLite** - Database
- **ReportLab** - PDF generation

### Frontend (Web)
- **HTML5**
- **CSS3**
- **JavaScript**
- **Chart.js** - Data visualization

### Mobile App
- **React Native** (Expo)
- **React Navigation**
- **Axios** - HTTP client

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Expo Go (for mobile testing)

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors werkzeug reportlab

# Run the server
python app.py
```

The server will start at `http://localhost:5000`

### Web Frontend

Open `backend/frontend/index.html` in your browser, or visit:
- `http://127.0.0.1:5000` (when server is running)

### Mobile App Setup

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## 📁 Project Structure

```
AI-Based-Healthy-Food-Suggestion/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── users.db               # SQLite database
│   └── frontend/
│       ├── index.html         # Web UI
│       ├── script.js          # Frontend logic
│       └── style.css          # Styles
├── mobile/
│   ├── App.js                 # Main app component
│   ├── config.js              # API configuration
│   ├── index.js               # Entry point
│   ├── package.json           # Dependencies
│   └── screens/
│       ├── HomeScreen.js
│       ├── CalculatorScreen.js
│       ├── HealthTrackingScreen.js
│       ├── AIGuidanceScreen.js
│       ├── ProfileScreen.js
│       └── NetworkDebugScreen.js
├── README.md
└── .gitignore
```

---

## 🔧 Configuration

### Mobile App API URL

Edit `mobile/config.js` to change the server IP:

```javascript
export const API_BASE_URL = "http://YOUR_IP:5000";
```

### Network Access

For mobile app to connect to backend:
1. Ensure phone and computer are on the same WiFi
2. Use your computer's IP address (not localhost)
3. Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 📋 Food Recommendation Logic

### BMI Categories
| Category | BMI Range |
|----------|-----------|
| Underweight | < 18.5 |
| Normal | 18.5 - 24.9 |
| Overweight | 25 - 29.9 |
| Obese | ≥ 30 |

### Goals
- **Weight Loss** - Calorie-deficit foods
- **Muscle Gain** - High-protein foods
- **Maintenance** - Balanced nutrition

### Activity Levels
- **Low/Sedentary** - Light, low-calorie options
- **Medium/Light** - Balanced meals
- **High/Active** - Energy-rich foods

---

## ⚠️ Disclaimer

This application is for **informational purposes only**. The food recommendations are generated by AI algorithms based on general health guidelines. Please consult with a healthcare professional before making any significant changes to your diet or exercise routine.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

- **Name**: Rajoanul Islam Shuvo
- **GitHub**: [github.com/RajoanulCSE](https://github.com/RajoanulCSE)

---

