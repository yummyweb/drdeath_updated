# Admin Login Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Backend Server Status

First, verify the backend server is running:

```bash
cd backend-node
npm start
# or
node server.js
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://127.0.0.1:8000
```

### 2. Verify Environment Variables

**Backend (.env in `backend-node/`):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=legal_guardian
PORT=8000
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env in `frontend/`):**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

⚠️ **Important:** After adding/changing `.env` files, restart both frontend and backend servers!

### 3. Verify Admin User Exists

Check if the default admin user exists:

```bash
cd backend-node
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const User = require('./models/User'); (async () => { await mongoose.connect(\`\${process.env.MONGO_URL || 'mongodb://localhost:27017'}/\${process.env.DB_NAME || 'legal_guardian'}\`); const admin = await User.findOne({ role: 'admin' }); console.log(admin ? \`Admin found: \${admin.email}\` : 'No admin user found'); await mongoose.connection.close(); })();"
```

**Default Admin Credentials:**
- Email: `admin@admin.com`
- Password: `admin123`

### 4. Create Admin User (If Missing)

If no admin exists, create one:

```bash
cd backend-node
node scripts/create-admin.js admin@admin.com admin123 "Administrator"
```

### 5. Test Backend Connection

Test if the backend is accessible:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

### 6. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab:** Look for errors
- **Network tab:** Check if requests to `/api/auth/login` are:
  - Being sent (status 200, 401, 500, etc.)
  - Blocked (CORS errors, connection refused)
  - Timing out

### 7. Check CORS Configuration

If you see CORS errors in the browser console, verify the backend CORS settings in `backend-node/server.js`:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS.split(','),
  credentials: true
}));
```

Make sure `CORS_ORIGINS` includes your frontend URL (e.g., `http://localhost:3000`).

## Common Issues & Solutions

### Issue: "Cannot connect to backend server"

**Causes:**
- Backend server is not running
- Wrong `REACT_APP_BACKEND_URL` in frontend `.env`
- Backend is running on a different port

**Solutions:**
1. Start the backend server
2. Check `REACT_APP_BACKEND_URL` matches backend URL
3. Restart frontend dev server after changing `.env`

### Issue: "Invalid credentials"

**Causes:**
- Wrong email or password
- Admin user doesn't exist
- Password hash mismatch

**Solutions:**
1. Verify credentials: `admin@admin.com` / `admin123`
2. Create admin user using the script if missing
3. Reset admin password:
   ```bash
   cd backend-node
   node scripts/create-admin.js admin@admin.com newpassword123 "Administrator"
   ```

### Issue: CORS Error

**Causes:**
- Backend CORS not configured for frontend URL
- Backend not allowing credentials

**Solutions:**
1. Update backend `.env`:
   ```env
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001
   ```
2. Restart backend server
3. Clear browser cache and cookies

### Issue: "Admin access required" after login

**Causes:**
- User account doesn't have `role: 'admin'`
- Token not being stored correctly
- Role check failing

**Solutions:**
1. Verify user role in database:
   ```javascript
   // In MongoDB shell or via Node.js
   db.users.findOne({ email: "admin@admin.com" })
   // Should show: role: "admin"
   ```
2. Convert existing user to admin:
   ```bash
   cd backend-node
   node scripts/create-admin.js your@email.com yourpassword "Your Name"
   ```
3. Clear localStorage and cookies, then login again

### Issue: Token Expired / Invalid Token

**Causes:**
- Token expired (default JWT expiration)
- Token not being stored correctly
- JWT_SECRET mismatch

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Login again
3. Check `JWT_SECRET` is consistent in backend

### Issue: Database Connection Failed

**Causes:**
- MongoDB not running
- Wrong MongoDB URL
- Network issues

**Solutions:**
1. Start MongoDB:
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Docker
   docker run -d -p 27017:27017 mongo
   ```
2. Verify MongoDB URL in backend `.env`
3. Check MongoDB connection logs in backend console

## Step-by-Step Setup (First Time)

1. **Start MongoDB:**
   ```bash
   # Check if running
   mongosh
   ```

2. **Configure Backend:**
   ```bash
   cd backend-node
   # Create .env file if it doesn't exist
   echo "MONGO_URL=mongodb://localhost:27017" > .env
   echo "DB_NAME=legal_guardian" >> .env
   echo "PORT=8000" >> .env
   echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
   echo "CORS_ORIGINS=http://localhost:3000" >> .env
   ```

3. **Start Backend:**
   ```bash
   npm install  # if not already done
   npm start
   ```
   
   Look for:
   - `✅ MongoDB connected`
   - `✅ Default admin created: admin@admin.com / admin123`
   - `🚀 Server running on http://127.0.0.1:8000`

4. **Configure Frontend:**
   ```bash
   cd frontend
   # Create .env file if it doesn't exist
   echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
   ```

5. **Start Frontend:**
   ```bash
   npm install  # if not already done
   npm start
   ```

6. **Login:**
   - Navigate to `http://localhost:3000/login`
   - Email: `admin@admin.com`
   - Password: `admin123`
   - Should redirect to `/admin` after successful login

## Still Having Issues?

1. **Check logs:**
   - Backend console for errors
   - Browser console (F12) for errors
   - Browser Network tab for failed requests

2. **Verify versions:**
   ```bash
   node --version  # Should be 14+
   npm --version
   ```

3. **Test with curl:**
   ```bash
   # Test login endpoint directly
   curl -v -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@admin.com","password":"admin123"}'
   ```

4. **Reset everything:**
   ```bash
   # Clear database (⚠️ WARNING: Deletes all data!)
   mongosh legal_guardian --eval "db.dropDatabase()"
   
   # Restart backend (will recreate default admin)
   cd backend-node && npm start
   
   # Clear browser data
   # In browser: Settings > Clear browsing data > Cookies and cached data
   ```

## Security Notes

⚠️ **IMPORTANT:** Change default admin password immediately after first login!

1. Login with default credentials
2. Go to `/admin/settings`
3. Update admin credentials
4. Or create a new admin and delete the default one

## Support

If none of these solutions work, please provide:
1. Backend console logs
2. Browser console errors (screenshot)
3. Network tab showing the login request
4. Your `.env` file contents (without sensitive data)

