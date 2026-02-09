# Production Deployment Checklist - www.drdeath.in

## 🎉 Your Site is Live: www.drdeath.in

## Critical Setup Steps for Production:

### 1. MongoDB Atlas Network Access (IMPORTANT!)

Your production server needs access to MongoDB Atlas:

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. You have two options:

   **Option A: Add Your Server's IP**
   - Ask your developer/hosting provider for your server's IP address
   - Add that specific IP
   - Most secure ✅
   
   **Option B: Temporarily Allow All (For Testing)**
   - Click "Allow Access from Anywhere" 
   - Adds `0.0.0.0/0`
   - ⚠️ Less secure but works immediately
   - Recommended: Use temporarily, then restrict to specific IP

### 2. Backend Environment Variables (Share with Developer)

Your developer needs these environment variables on the production server:

```env
# MongoDB Atlas Connection
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian

# Server Configuration
PORT=8000
JWT_SECRET=your-strong-secret-key-change-this-in-production

# CORS - Allow your frontend domain
CORS_ORIGINS=https://www.drdeath.in,https://drdeath.in

# Optional: Email configuration (if using email features)
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASS=...
```

### 3. Frontend (Vite) – Build and Serve Static Files

The frontend uses **Vite**. For production you must **build** and **serve the built files**; do **not** run the dev server (`npm run dev` or `npm start`) in production—it is for development only and can cause the site to go down or become unstable.

**Build and deploy:**

```bash
cd frontend
# Set backend URL for the build (use your production API URL)
export VITE_BACKEND_URL=https://api.drdeath.in
npm run build
```

This creates a `dist` folder. **Serve that folder** with a proper static file server, for example:

- **Nginx / Apache:** Point the document root to `frontend/dist` and configure SPA fallback (all routes → `index.html`).
- **Node (serve):** `npx serve -s dist` (the `-s` option is for single-page app routing).
- **Vercel / Netlify / similar:** Set build output to `frontend/dist` and use the same `VITE_BACKEND_URL` as a build environment variable.

**Frontend environment variable (set at build time):**

```env
VITE_BACKEND_URL=https://api.drdeath.in
# OR if backend is on same domain:
# VITE_BACKEND_URL=https://www.drdeath.in
```

**Note:** Replace `api.drdeath.in` with your actual backend URL. Only variables prefixed with `VITE_` are available in the frontend.

### 4. Security Checklist

- [ ] MongoDB Atlas IP whitelisted (your server IP)
- [ ] Strong JWT_SECRET (not the default)
- [ ] CORS_ORIGINS set to your domain only
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured (not in code)
- [ ] Default admin password changed
- [ ] MongoDB password saved securely

### 5. Test Production Connection

After deployment, test:

1. **Backend Health:**
   ```
   curl https://api.drdeath.in/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend Loading:**
   - Visit: https://www.drdeath.in
   - Check browser console (F12) for errors
   - Verify API calls are working

3. **Admin Login:**
   - Try logging in at: https://www.drdeath.in/login
   - Use: `mailfornishantverma@gmail.com` / `Elizian@123`
   - Should redirect to admin panel

### 6. Domain Setup Questions for Your Developer

Ask your developer:

1. **Backend API URL:** Where is the backend API hosted?
   - Is it `https://api.drdeath.in`?
   - Or `https://www.drdeath.in/api`?
   - Or another subdomain?

2. **Server IP:** What is the production server's IP address?
   - Needed for MongoDB Atlas Network Access

3. **SSL Certificate:** Is HTTPS configured?
   - Your site should use `https://` not `http://`

4. **Environment Variables:** Are they set securely?
   - Should not be in code repository
   - Should use environment variables or secrets manager

### 7. MongoDB Connection String (Share Securely)

**⚠️ IMPORTANT: Share this securely with your developer (password manager, encrypted message):**

```
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

### 8. Post-Deployment Steps

After everything is deployed:

1. **Test admin login:**
   - Go to https://www.drdeath.in/login
   - Login with your admin credentials
   - Verify admin panel loads

2. **Change default passwords:**
   - If default admin exists, change password or delete it
   - Update your admin password if needed

3. **Monitor:**
   - Check MongoDB Atlas dashboard for connections
   - Monitor server logs for errors
   - Test all major features

4. **Backup:**
   - Verify MongoDB Atlas backups are enabled (free tier includes this)
   - Document your deployment setup

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
- **Solution:** Add server IP to Atlas Network Access
- **Solution:** Verify connection string is correct

### Issue: CORS errors in browser
- **Solution:** Update CORS_ORIGINS to include `https://www.drdeath.in`

### Issue: API calls failing
- **Solution:** Set `VITE_BACKEND_URL` at build time and rebuild the frontend
- **Solution:** Verify backend is running and accessible

### Issue: Site goes down shortly after going live
- **Solution:** Do not run `npm run dev` or `npm start` in production. Build with `npm run build` and serve the `dist` folder with Nginx, Apache, or `npx serve -s dist`.

### Issue: Admin login not working
- **Solution:** Verify admin user exists in database
- **Solution:** Check JWT_SECRET is set
- **Solution:** Clear browser cache and localStorage

## Support Contacts

- **MongoDB Atlas:** https://www.mongodb.com/support
- **Your Developer:** [Their contact]
- **Hosting Provider:** [Their support]

## Quick Reference

**Your Site:** https://www.drdeath.in  
**MongoDB User:** teamelizian_db_user  
**Database:** legal_guardian  
**MongoDB Cluster:** cluster0.w1g4nom.mongodb.net

---

✅ Once all these steps are complete, your production site should be fully functional!

