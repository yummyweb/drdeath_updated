# How to Access Backend and Frontend in Chrome

## Step-by-Step Guide

### 1. Start MongoDB (if not already running)

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })" 2>/dev/null || echo "MongoDB is not running"

# If not running, start it:
brew services start mongodb-community@7.0

# Or manually:
mongod --dbpath ~/data/db --logpath ~/data/log/mongod.log --fork
```

### 2. Start the Backend Server

Open a terminal and run:

```bash
cd backend-node
npm start
```

You should see:
```
🚀 Server running on http://127.0.0.1:8000
✅ MongoDB connected
```

**Backend URL:** http://127.0.0.1:8000 or http://localhost:8000

You can test it by opening in Chrome:
- **API Root:** http://localhost:8000/
- **Settings API:** http://localhost:8000/api/settings
- **Health Check:** http://localhost:8000/health

### 3. Start the Frontend Server

Open a **NEW terminal window/tab** (keep the backend running) and run:

```bash
cd frontend
npm start
```

The frontend will automatically open in Chrome at:
- **Frontend URL:** http://localhost:3000

If it doesn't open automatically, manually open Chrome and go to:
```
http://localhost:3000
```

### 4. Access Both in Chrome

#### Backend (API):
- **Main API:** http://localhost:8000/api/settings
- **Public Stats:** http://localhost:8000/api/stats/public
- **Health Check:** http://localhost:8000/health

#### Frontend (Web App):
- **Main App:** http://localhost:3000
- **Home Page:** http://localhost:3000/
- **Admin Login:** http://localhost:3000/login (admin@admin.com / admin123)
- **Shop:** http://localhost:3000/shop

### Quick Test Commands

```bash
# Test backend
curl http://localhost:8000/api/settings

# Test frontend (should return HTML)
curl http://localhost:3000
```

## Troubleshooting

### Backend won't start:
1. Make sure MongoDB is running
2. Check if port 8000 is already in use: `lsof -i :8000`
3. Check `.env` file exists in `backend-node/`

### Frontend won't start:
1. Make sure backend is running first
2. Check if port 3000 is already in use: `lsof -i :3000`
3. Check `frontend/.env` has `REACT_APP_BACKEND_URL=http://127.0.0.1:8000`

### CORS errors in browser:
- Make sure backend CORS is configured to allow `http://localhost:3000`
- Check `backend-node/.env` has `CORS_ORIGINS=*` (for development)

## Default Admin Credentials

- **Email:** admin@admin.com
- **Password:** admin123

⚠️ **Change these in production!**

