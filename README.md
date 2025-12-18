# Ayrin-Digital
This repo contains the quiz app made for technical assessment for internship.

Here is the link: **https://Titiksha2012.github.io/Ayrin-Digital/**

<img width="1919" height="1001" alt="image" src="https://github.com/user-attachments/assets/009158a0-ca44-46de-a870-af21993c0a8b" />

<img width="1919" height="1003" alt="image" src="https://github.com/user-attachments/assets/f4525d3f-291d-409b-ad80-7759e6307759" />

<img width="1918" height="998" alt="image" src="https://github.com/user-attachments/assets/33b4e988-f38d-479d-ba19-72b888da0e8a" />

<img width="1919" height="997" alt="image" src="https://github.com/user-attachments/assets/88125f28-acad-4349-b19e-63bd89933846" />

## 🚀 Deployment

### Frontend (GitHub Pages)

The frontend is automatically deployed to GitHub Pages when you push to the `main` or `master` branch.

**Setup:**
1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow will automatically deploy on push

**Note:** Update the `base` path in `frontend/vite.config.js` if your repository name is different from `Ayrin-Digital`.

### Backend Deployment

The backend needs to be deployed to a Node.js hosting service. Recommended options:

#### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create a new project → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variable: `PORT=4000` (optional, Railway auto-assigns)
6. Deploy!

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty)
   - **Start Command:** `npm start`
5. Deploy!

### Environment Variables

After deploying the backend, update the frontend API URL:

1. Go to your repository Settings → Secrets and variables → Actions
2. Add a new secret: `VITE_API_URL` with your backend URL (e.g., `https://your-app.railway.app`)
3. The GitHub Actions workflow will use this when building

Or manually set it in `frontend/.env`:
```
VITE_API_URL=https://your-backend-url.com
```

## 📦 Local Development

```bash
# Install dependencies
npm install

# Run both frontend and backend
npm run dev

# Or run separately
npm run frontend  # Frontend only (port 5173)
npm run backend   # Backend only (port 4000)
```

## 🏗️ Build

```bash
# Build frontend for production
npm run build
```

