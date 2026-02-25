<div align="center">

# PowerSense
### Smart Campus Energy Monitoring System

<br/>

[![Full Stack](https://img.shields.io/badge/Full%20Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![AI Powered](https://img.shields.io/badge/AI%20Powered-Prophet%20ML-FF6B35?style=for-the-badge&logo=python&logoColor=white)](https://facebook.github.io/prophet/)
[![Real-Time Monitoring](https://img.shields.io/badge/Real--Time-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Hackathon Project](https://img.shields.io/badge/-Hackathon%20Project-gold?style=for-the-badge)](/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

<br/>

> **PowerSense** is a full-stack, AI-powered energy monitoring platform built for institutional campuses.  
> It detects anomalies, infers active devices, and alerts administrators — all in real time.

<br/>

[Live Demo](#demo) • [Screenshots](#screenshots) • [Architecture](#system-architecture) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started)

</div>

---

## Problem Statement

Institutional campuses (schools, colleges, offices) **waste significant energy** due to:

- Devices left ON after working hours
- No room-level power consumption visibility
- Lack of automated anomaly detection or alerting
- No centralized energy analytics or reporting system

Energy waste translates to **higher costs, higher carbon footprint, and zero accountability**.

---

## Solution

**PowerSense** is a full-stack web application that:

| Feature | Description |
|---|---|
| **Real-Time Monitoring** | Reads live wattage from smart meters per room via Socket.io |
| **Device Inference** | Uses subset-sum algorithm to identify active devices from total load |
| **Anomaly Detection** | Prophet ML model detects abnormal energy patterns |
| **After-Hours Detection** | Flags devices active outside configured working hours |
| **Alert System** | Generates incident alerts with device matching profiles |
| **Impact Forensics** | Calculates energy leak in kWh, financial deficit in ₹, CO₂ footprint in kg |
| **Infrastructure Map** | Interactive floor-plan showing live room status (Standby / Operational / Priority Alert) |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    PowerSense Architecture                    │
└──────────────────────────────────────────────────────────────┘

  [Smart Meters / IoT Sensors]
           │  (wattage readings)
           ▼
  [REST API — Express.js + Node.js]
     ├──► [MongoDB — Institution, Building, Room, Device, Alert Data]
     ├──► [Socket.io — Real-Time Push to Frontend]
     ├──► [Prophet ML Model — Anomaly Detection]
     └──► [Load Inference Engine — Subset-Sum Algorithm]
                    │
                    ▼
         [React Dashboard — Vite + TailwindCSS]
           ├── Insights    (Live Intelligence + Global Consumption Flow)
           ├── Infrastructure  (Spatial Map — Floor Plan Alpha)
           ├── Anomalies   (Incident Alerts + Device Matching Profiles)
           ├── Impact      (Impact Forensics — kWh / ₹ / CO₂)
           └── Terminal    (System Configuration — Institutions / Buildings / Rooms / Devices)
```

---

## How It Works

```
Step 1 → Smart meter sends real-time wattage data to the REST API
Step 2 → System checks wattage against device database (subset-sum matching)
Step 3 → Prophet model analyzes historical patterns → detects anomaly
Step 4 → Engine cross-references room data + working hours schedule
Step 5 → Alert is triggered & pushed to admin dashboard via Socket.io
Step 6 → Impact Forensics calculates energy waste in kWh, ₹, and CO₂
Step 7 → Admin resolves incidents from the Anomalies page
```

---

## Features

### Insights — Live Intelligence
- KPI cards: **Network Nodes**, **Active Anomalies**, **Real-Time Load (kW)**, **System Health (%)**
- **Global Consumption Flow** — real-time wattage oscillation chart across all sectors (Live Stream)
- Building sector cards showing status (NORMAL / WARNING / CRITICAL) per floor

### Infrastructure — Spatial Intelligence
- **Floor Plan Alpha** — interactive campus map per building floor
- Color-coded rooms: **Grey (Standby/Idle)** · **Blue (Operational)** · **Red (Priority Alert)**
- **Spatial Metrics** panel: Area Coverage %, Engine Integrity %
- Building/floor selector dropdown

### Anomalies — Incident Management
- Active incident list with room name, timestamp, wattage reading
- **Matching Profiles** — device combinations that account for the measured load
- One-click **Resolve** workflow for each incident

### Impact Forensics
- **Total Energy Leak** (kWh) · **Financial Deficit** (₹) · **CO₂ Footprint** (kg)
- **Sectoral Waste Distribution** — bar chart per room/sector
- **Fiscal Leakage Sources** — donut chart breakdown per room
- Time range filter (Last 7 Days / Custom) + Export Intelligence button

### Terminal — System Configuration
- Four-tab setup wizard: **Institutions → Buildings → Rooms → Devices**
- Device inventory: Name + Wattage per room (Computers 250W, Fans 70W, Lights 40W)
- Map position (X, Y) + dimension (Width, Height) per room for spatial rendering

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | v19 | UI Framework |
| **Vite** | v7 | Build tool & Dev Server |
| **TailwindCSS** | v4 | Utility-first Styling |
| **Recharts** | v3 | Data Visualization (Charts) |
| **Chart.js** | v4 | Additional Chart Components |
| **Framer Motion** | v12 | Animations & Transitions |
| **Socket.io-client** | v4 | Real-Time WebSocket |
| **React Router** | v7 | Client-side Routing |
| **Electron** | v28 | Desktop App Wrapper |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | Runtime |
| **Express.js** | v5 | REST API Framework |
| **Socket.io** | v4 | Real-Time Push Server |
| **MongoDB** | — | NoSQL Database |
| **Mongoose** | v9 | ODM / Schema Modeling |
| **JWT + bcryptjs** | — | Authentication |
| **Morgan** | — | HTTP Request Logging |

### AI / ML
| Technology | Purpose |
|---|---|
| **Prophet (Facebook/Meta)** | Time-series anomaly detection on energy readings |
| **Subset-Sum Algorithm** | Device load inference — maps total wattage to device combinations |
| **Custom Cron Service** | Scheduled ML inference pipeline |
| **Analyzer Service** | Ongoing energy pattern analysis |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Backend containerization |
| **Firebase Hosting** | Frontend deployment |
| **Cloud Run** | Backend deployment |
| **dotenv** | Environment configuration |

---

## Screenshots

### Live Intelligence Dashboard
> Real-time KPI cards + Global Consumption Flow (live watt oscillation across all sectors)

![Live Intelligence Dashboard](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/dashboard.png)

![Live Intelligence - Consumption Flow](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/dashboard2.png)

### Infrastructure Map — Floor Plan
> Spatial map with color-coded rooms (Standby / Operational / Priority Alert)

![Infrastructure Map - 1st Floor](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/infrastructure_floor1.png)

![Infrastructure Map - Ground Floor](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/infrastructure_ground.png)

### Anomalies — Incident Management
> Active incidents with matching device profiles and Resolve workflow

![Anomalies / Alerts](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/alerts.png)

### Impact Forensics
> Energy leak (kWh), Financial deficit (₹), CO₂ footprint, Sectoral waste distribution

![Impact Forensics](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/impact.png)

### Terminal — System Configuration
> Multi-tab setup: Institutions, Buildings, Rooms, Devices (with wattage profiles)

![System Config - Institutions](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/setup_institutions.png)

![System Config - Rooms](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/setup_rooms.png)

![System Config - Devices](https://raw.githubusercontent.com/Godwin-Sajeev/Power_Sense/main/images/setup_devices.png)

---

## Demo

>  **Live App:** *Coming Soon  
>  **Demo Video:** *Coming Soon 

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Python 3.x (for Prophet ML service)

### Clone the Repo
```bash
git clone https://github.com/Godwin-Sajeev/Power_Sense.git
cd Power_Sense
```

### Backend Setup
```bash
cd backend
cp .env.example .env   # fill in your MongoDB URI, JWT_SECRET, etc.
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://<your-cluster>
JWT_SECRET=your_jwt_secret
ENABLE_ML=true
```

### Docker (Optional)
```bash
cd backend
docker build -t powersense-backend .
docker run -p 5000:5000 powersense-backend
```

---

## Project Structure

```
power_sense/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers (alerts, readings, devices…)
│   ├── models/         # Mongoose schemas (Institution, Building, Room, Device, Alert…)
│   ├── routes/         # API endpoints
│   ├── services/       # ML service, load analyzer, cron jobs, analyzer
│   ├── utils/          # Helper utilities
│   ├── server.js       # Main Express + Socket.io server
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/      # Insights, Infrastructure, Anomalies, Impact, Terminal, Setup…
│   │   ├── components/ # Reusable UI components
│   │   ├── services/   # API call layer
│   │   └── socket.js   # Socket.io client setup
│   └── vite.config.js
├── images/             # App screenshots for this README
└── README.md
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reading` | Get live meter readings |
| `GET` | `/api/alerts` | Get all active alerts |
| `POST` | `/api/alerts` | Create new alert |
| `GET` | `/api/room` | List all rooms |
| `GET` | `/api/device` | List all devices |
| `GET` | `/api/building` | Get building hierarchy |
| `POST` | `/api/reading` | Push new meter reading |
| `GET` | `/api/institution` | Get institution data |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

**Godwin Sajeev**  
[![GitHub](https://img.shields.io/badge/GitHub-Godwin--Sajeev-181717?style=flat&logo=github)](https://github.com/Godwin-Sajeev)

---

## License

This project is licensed under the **ISC License**.

---

<div align="center">

Made for smarter, greener campuses

**Star this repo if you find it useful!**

</div>