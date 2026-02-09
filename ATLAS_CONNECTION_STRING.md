# MongoDB Atlas Connection String for Your Project

## Your Connection Details

**Username:** `teamelizian_db_user`  
**Password:** `1tupOoAn4UkgWIU3` ⚠️ **SAVE THIS SECURELY - You won't see it again!**  
**Cluster:** `cluster0.w1g4nom.mongodb.net`  
**Database Name:** `legal_guardian`

## Connection String Format

### For Your Backend `.env` File:

```env
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

### Complete `.env` File Example:

```env
# MongoDB Atlas Connection
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian

# Server Configuration
PORT=8000
JWT_SECRET=your-secret-key-change-in-production

# CORS (adjust for your frontend URL)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Share with Your Developer

Share these environment variables **securely** (use password manager, encrypted message):

```
MONGO_URL=mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
DB_NAME=legal_guardian
```

## Test the Connection Locally

1. Update your `backend-node/.env` file with the connection string above

2. Test the connection:
   ```bash
   cd backend-node
   node test-atlas-connection.js
   ```

3. Or start your server:
   ```bash
   npm start
   ```
   
   You should see: `✅ MongoDB connected`

## Important Security Notes

1. ⚠️ **Never commit this to Git** - Add `.env` to `.gitignore`
2. 🔒 **Save the password securely** - You won't see it again in Atlas
3. 🔐 **Share credentials securely** - Use password managers or encrypted channels
4. 🌐 **Restrict IP Access** - In Atlas → Network Access, only allow necessary IPs
5. 🔄 **Change password periodically** - Rotate credentials for security

## If You Need to Reset the Password

If you lose the password:

1. Go to Atlas Dashboard → Database Access
2. Find `teamelizian_db_user`
3. Click "Edit" → "Edit Password"
4. Generate new password and update your connection string
5. Update all places where this connection string is used

## Troubleshooting

### "Authentication failed"
- Double-check username and password are correct
- Make sure database user exists in Atlas → Database Access
- Verify user has correct permissions

### "IP not whitelisted"
- Go to Atlas → Network Access
- Add your IP address (or `0.0.0.0/0` for development - NOT recommended for production)

### "Connection timeout"
- Check internet connection
- Verify cluster is running (check Atlas dashboard)
- Free tier clusters may pause after inactivity

## Next Steps

1. ✅ Save the password securely
2. ✅ Update your local `.env` file
3. ✅ Test the connection
4. ✅ Share connection string with developer (securely)
5. ✅ Restrict IP access in Atlas for production

