# Ayrin-Digital Quiz App

A full-stack quiz application built for technical assessment. Users can take quizzes, view results, and see leaderboards with persistent data storage.

## 🌐 Live Demo

- **Frontend:** [View on GitHub Pages](https://Titiksha2012.github.io/Ayrin-Digital/)
- **Backend API:** Hosted on Railway

## 📸 Screenshots

<img width="1919" height="1001" alt="image" src="https://github.com/user-attachments/assets/009158a0-ca44-46de-a870-af21993c0a8b" />

<img width="1919" height="1003" alt="image" src="https://github.com/user-attachments/assets/f4525d3f-291d-409b-ad80-7759e6307759" />

<img width="1918" height="998" alt="image" src="https://github.com/user-attachments/assets/33b4e988-f38d-479d-ba19-72b888da0e8a" />

<img width="1919" height="997" alt="image" src="https://github.com/user-attachments/assets/88125f28-acad-4349-b19e-63bd89933846" />

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.10.1
- **HTTP Client:** Axios 1.13.2
- **Styling:** CSS3 with modern features (CSS Grid, Flexbox, Custom Properties)
- **Hosting:** GitHub Pages (via GitHub Actions)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **CORS:** cors 2.8.5
- **Data Storage:** JSON file-based database (`backend/data/db.json`)
- **Hosting:** Railway

## 🏗️ Project Structure

```
Ayrin-Digital/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── QuizListPage.jsx
│   │   │   ├── TakeQuizPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── LeaderboardPage.jsx
│   │   ├── api.js          # API client
│   │   ├── App.jsx         # Main app component
│   │   └── App.css         # Global styles
│   ├── public/             # Static assets
│   ├── dist/               # Production build output
│   └── vite.config.js      # Vite configuration
│
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── server.js       # Main server file
│   │   ├── store.js        # Database operations
│   │   └── seed.js         # Initial data seeding
│   └── data/
│       └── db.json         # JSON database file
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment
│
└── package.json            # Root package.json for monorepo
```

## ✨ Features

- 📝 **Quiz Management:** Create and take multiple quizzes
- ⏱️ **Timer Support:** Per-question or total time limits
- 🔀 **Question Shuffling:** Randomized question order
- 📊 **Results & Review:** Detailed answer review with correct/incorrect indicators
- 🏆 **Leaderboard:** Top scores with best score per player
- 🔗 **Shareable Results:** Share quiz results via unique URLs
- 📱 **Responsive Design:** Works on desktop and mobile devices
- 🎨 **Modern UI:** Dark theme with gradient accents

## 🔌 API Endpoints

### Quizzes
- `GET /api/quizzes` - List all quizzes
- `GET /api/quizzes/:id` - Get quiz details (without correct answers)
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/leaderboard` - Get leaderboard for a quiz

### Results
- `GET /api/results/:resultId` - Get specific result (for shareable links)

### Health
- `GET /api/health` - Health check endpoint

## 🚀 Deployment

### Frontend (GitHub Pages)

**Hosting:** GitHub Pages  
**URL:** `https://Titiksha2012.github.io/Ayrin-Digital/`

The frontend is automatically deployed via GitHub Actions when you push to the `main` or `master` branch.

**Setup:**
1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on push

**Configuration:**
- Build tool: Vite
- Output directory: `frontend/dist`
- Base path: Automatically set to `/Ayrin-Digital/` (configurable in `frontend/vite.config.js`)

### Backend (Railway)

**Hosting:** Railway  
**URL:** Generated automatically (e.g., `https://ayrin-digital-production-xxxx.up.railway.app`)

**Deployment Steps:**
1. Go to [railway.app](https://railway.app)
2. Create a new project → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js and use the `start` script from `package.json`
5. Generate a public domain in Railway's Networking settings
6. Copy the generated URL for frontend configuration

**Configuration Files:**
- `railway.json` - Railway deployment configuration
- `backend/package.json` - Contains `start` script: `node src/server.js`

### Environment Variables

**Frontend (GitHub Secrets):**
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add secret: `VITE_API_URL` = Your Railway backend URL
   - Format: `https://your-app.railway.app` (no trailing slash, no `/api` suffix)
3. The GitHub Actions workflow uses this when building the frontend

**Backend (Railway):**
- `PORT` - Automatically assigned by Railway (optional to set manually)

## 📦 Local Development

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Setup

```bash
# Install all dependencies (root, frontend, and backend)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Running the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# Frontend will be available at: http://localhost:5173
# Backend will be available at: http://localhost:4000
```

### Running Separately

```bash
# Frontend only (port 5173)
npm run frontend
# or
cd frontend && npm run dev

# Backend only (port 4000)
npm run backend
# or
cd backend && npm run dev
```

## 🏗️ Build

```bash
# Build frontend for production
npm run build
# or
npm run build:frontend

# Output will be in frontend/dist/
```

## 📝 Development Notes

- **Database:** The backend uses a JSON file (`backend/data/db.json`) for data persistence
- **CORS:** Backend has CORS enabled for all origins
- **Routing:** Frontend uses React Router with client-side routing
- **State Management:** React hooks (useState, useEffect) for local state
- **API Communication:** Axios for HTTP requests with automatic base URL configuration

## 🔧 Configuration

### Frontend API URL
- **Development:** `http://localhost:4000` (default)
- **Production:** Set via `VITE_API_URL` environment variable or GitHub Secret

### Backend Port
- **Development:** `4000` (default)
- **Production:** Automatically assigned by Railway

## 📄 License

This project was created for a technical assessment for internship at Ayrin Digital.

