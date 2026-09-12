# 🚀 FutureHub — Manual Startup Guide

> This guide explains how to start the FutureHub project manually step by step.
> The project has two parts: a **Backend (Node.js)** and a **Frontend (React + Vite)**.
> You need **two separate terminal windows** to run both at the same time.

---

## ✅ Prerequisites (Install Once)

Make sure the following are installed on your system:

| Tool       | Required Version | Download                          |
| :--------- | :--------------- | :-------------------------------- |
| Node.js    | v24.x or higher  | https://nodejs.org                |
| npm        | v10.x or higher  | Comes with Node.js                |

Verify your installation:
```powershell
node -v
npm.cmd -v
```

---

## 📂 Project Location

```
C:\Users\ritu gupta\OneDrive\Documents\antigravity\
```

---

## 🗂️ Step 1 — Open PowerShell & Navigate to Project

Open a **PowerShell** or **Command Prompt** terminal and run:

```powershell
cd "C:\Users\ritu gupta\OneDrive\Documents\antigravity"
```

---

## 📦 Step 2 — Install Dependencies (First Time Only)

> ⚠️ You only need to do this **once** when setting up the project for the first time.

```powershell
# Install backend (server) dependencies
npm.cmd --prefix server install

# Install frontend (client) dependencies
npm.cmd --prefix client install
```

---

## 🗄️ Step 3 — Copy Database (First Time Only)

> ⚠️ You only need to do this **once** when setting up for the first time.

The database file must be placed inside the `server` folder:

```powershell
Copy-Item "futurehub.db" "server\futurehub.db" -Force
```

---

## ⚙️ Step 4 — Start the Backend Server

> Open **Terminal 1** and run the following:

```powershell
cd "C:\Users\ritu gupta\OneDrive\Documents\antigravity"
npm.cmd --prefix server run dev
```

### ✅ Expected Output:
```
=======================================================
 FutureHub REST API Server running on port 5000
 Health check: http://localhost:5000/api/health
=======================================================
```

> 🔒 Keep this terminal **open and running**.

---

## 🌐 Step 5 — Start the Frontend Client

> Open a **second Terminal 2** (new PowerShell window) and run:

```powershell
cd "C:\Users\ritu gupta\OneDrive\Documents\antigravity"
npm.cmd --prefix client run dev
```

### ✅ Expected Output:
```
  VITE v6.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> 🔒 Keep this terminal **open and running**.

---

## ✔️ Step 6 — Verify Both Servers Are Running

Open a third PowerShell window and run:

```powershell
# Check backend health (should return: status = ok)
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Check frontend (should return: StatusCode = 200)
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing | Select-Object StatusCode
```

---

## 🌍 Step 7 — Open in Browser

Open your browser and go to:

```
http://localhost:5173
```

---

## 📋 Port Reference

| Service              | URL                              | Description                |
| :------------------- | :------------------------------- | :------------------------- |
| Frontend (React)     | http://localhost:5173            | Student-facing web app     |
| Backend API          | http://localhost:5000            | REST API server            |
| API Health Check     | http://localhost:5000/api/health | Server health endpoint     |
| API via Vite Proxy   | http://localhost:5173/api/*      | Proxied to backend on 5000 |

---

## 🛑 How to Stop the Servers

Press **Ctrl + C** in each terminal window to stop the servers.

---

## 🔁 Quick Restart (After First-Time Setup)

Once you have done Steps 2 and 3, next time you just need:

```powershell
# Terminal 1 — Backend
cd "C:\Users\ritu gupta\OneDrive\Documents\antigravity"
npm.cmd --prefix server run dev

# Terminal 2 — Frontend
cd "C:\Users\ritu gupta\OneDrive\Documents\antigravity"
npm.cmd --prefix client run dev
```

Then open **http://localhost:5173** in your browser. Done! ✅

---

## ❌ Common Errors and Fixes

| Error | Cause | Fix |
| :--- | :--- | :--- |
| Port 5000 already in use | Another process using port 5000 | Run: netstat -ano | findstr :5000 and kill the process |
| Port 5173 already in use | Another process using port 5173 | Run: netstat -ano | findstr :5173 and kill the process |
| Cannot find module | Dependencies not installed | Re-run Step 2 (npm.cmd install) |
| futurehub.db not found | Database not copied to server folder | Re-run Step 3 (Copy-Item command) |
| JWT_SECRET not set | .env file missing in server folder | The server\.env file must exist with JWT_SECRET value |

---

## 📁 Project Structure Overview

```
antigravity/
├── HOW_TO_RUN.md          <- This file
├── futurehub.db           <- Source database (copy to server/)
├── package.json           <- Root orchestration scripts
├── README.md              <- Full technical documentation
├── .env.example           <- Environment config template
|
├── server/                <- Backend (Node.js + Express + TypeScript)
│   ├── .env               <- Backend environment variables
│   ├── futurehub.db       <- Active database used by the server
│   ├── src/               <- TypeScript source code
│   └── package.json
|
└── client/                <- Frontend (React 19 + Vite + Tailwind CSS)
    ├── src/               <- React source code
    └── package.json
```

---

FutureHub — Production Career Guidance & Student Profile Platform
