# MongoDB Database Name - How It Works

## ❌ You DON'T Need to Create the Database in Atlas UI

**MongoDB creates databases automatically when you first use them!**

## How It Works:

1. **Specify database name in connection string:**
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/legal_guardian
   ```
   The `/legal_guardian` part is your database name.

2. **When your app connects and writes data:**
   - MongoDB automatically creates the `legal_guardian` database
   - It creates collections (tables) as needed
   - No manual setup required!

## Your Connection String Already Has It:

Your connection string is:
```
mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
                                                                        ^^^^^^^^^^^^^^
                                                                        This is your DB name
```

## When Will You See It in Atlas?

After your application:
1. Connects to Atlas using this connection string
2. Writes data (creates a user, story, etc.)

Then you'll see:
- Go to Atlas Dashboard → "Database" → "Browse Collections"
- You'll see the `legal_guardian` database
- You'll see collections like: `users`, `stories`, `advocates`, etc.

## Example Timeline:

**Now:**
- Database doesn't exist yet in Atlas UI
- That's completely normal! ✅

**After running your backend once:**
```bash
cd backend-node
npm start
```
- Backend connects to Atlas
- Creates default admin user (writes to database)
- `legal_guardian` database appears in Atlas
- `users` collection appears

**After that:**
- Every time you use the app, it uses this database
- All your data goes into `legal_guardian`

## Summary:

✅ **DO:** Use the connection string with `/legal_guardian` in it  
✅ **DO:** Start your backend - database will be created automatically  
❌ **DON'T:** Try to create database in Atlas UI (it's not needed)  
❌ **DON'T:** Worry if you don't see it yet (it appears after first use)

## To See Your Database After It's Created:

1. Go to Atlas Dashboard
2. Click **"Database"** in left sidebar
3. Click **"Browse Collections"** button
4. You'll see your `legal_guardian` database with collections

That's it! Just use your connection string and MongoDB handles the rest. 🎉

