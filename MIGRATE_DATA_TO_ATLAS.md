# How to Migrate Data from Local MongoDB to MongoDB Atlas

## Method 1: Using MongoDB Compass (Easier - GUI) ✅ RECOMMENDED

### Step 1: Install MongoDB Compass

1. Download from: https://www.mongodb.com/try/download/compass
2. Install the application
3. Open MongoDB Compass

### Step 2: Connect to Your Local MongoDB

1. In Compass, use connection string:
   ```
   mongodb://localhost:27017
   ```
2. Click "Connect"
3. You should see your `legal_guardian` database

### Step 3: Export Data from Local Database

#### Option A: Export Entire Database as JSON

1. In Compass, select the `legal_guardian` database
2. Click on each collection (users, stories, advocates, etc.)
3. For each collection:
   - Click the collection name (e.g., "users")
   - Click the "..." menu (three dots)
   - Select **"Export Collection"**
   - Choose format: **"JSON"**
   - Click "Export"
   - Save the file (e.g., `users.json`, `stories.json`)

#### Option B: Export All Collections at Once

1. Select the `legal_guardian` database
2. Click the database menu (three dots next to database name)
3. Select **"Export Collection"** (if available)
   OR manually export each collection one by one

**Collections you should export:**
- `users` - Your user accounts (including admin)
- `stories` - All stories
- `advocates` - Advocate registrations
- `grants` - Grant applications
- `contacts` - Contact form submissions
- `merchandise` - Store items
- `orders` - Orders
- `settings` - Site settings
- `cases` - Cases (if any)
- `teammembers` - Team members (if any)

### Step 4: Connect to MongoDB Atlas in Compass

1. In Compass, click "New Connection"
2. Use your Atlas connection string:
   ```
   mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority
   ```
3. Click "Connect"
4. You should now see the `legal_guardian` database (it will be empty or have default data)

### Step 5: Import Data into Atlas

For each JSON file you exported:

1. Select the `legal_guardian` database in Atlas connection
2. If the collection doesn't exist, create it:
   - Click "Create Collection"
   - Name it (e.g., "users")
   - Click "Create Collection"
3. Click on the collection name
4. Click **"Add Data"** → **"Import File"**
5. Select your JSON file (e.g., `users.json`)
6. Choose file type: **"JSON"**
7. Click "Import"
8. Repeat for all collections

### Step 6: Verify Data

1. Check each collection in Atlas
2. Verify document counts match your local database
3. Test a few documents to ensure data looks correct

---

## Method 2: Using Command Line (mongodump/mongorestore)

### Step 1: Export from Local MongoDB

```bash
# Export entire database
mongodump --uri="mongodb://localhost:27017/legal_guardian" --out=./mongodb-backup

# This creates a folder: ./mongodb-backup/legal_guardian/
```

### Step 2: Import to MongoDB Atlas

```bash
# Import to Atlas
mongorestore --uri="mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority" ./mongodb-backup/legal_guardian
```

**Note:** If you get authentication errors, make sure:
1. Your IP is whitelisted in Atlas Network Access
2. Your password doesn't have special characters that need URL encoding

---

## Method 3: Using mongoimport (Collection by Collection)

### Export as JSON (using mongoexport)

```bash
# Export users collection
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=users --out=users.json

# Export stories collection
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=stories --out=stories.json

# Repeat for other collections...
```

### Import to Atlas (using mongoimport)

```bash
# Import users
mongoimport --uri="mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority" --collection=users --file=users.json

# Import stories
mongoimport --uri="mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority" --collection=stories --file=stories.json

# Repeat for other collections...
```

---

## Quick Checklist

- [ ] Install MongoDB Compass
- [ ] Connect to local MongoDB
- [ ] Export all collections as JSON files
- [ ] Connect to MongoDB Atlas in Compass
- [ ] Import each JSON file into corresponding collection
- [ ] Verify data counts match
- [ ] Test your live site at www.drdeath.in

## Important Notes

1. **Backup First:** Make sure you have backups before importing
2. **Existing Data:** If Atlas already has some data, importing will add to it (not replace)
3. **User Accounts:** Make sure your admin account (`mailfornishantverma@gmail.com`) is imported
4. **Settings:** Don't forget to export/import the `settings` collection
5. **ID Conflicts:** If you have duplicate IDs, you may need to handle conflicts

## Troubleshooting

### "Authentication failed" in Compass
- Check username and password are correct
- Make sure IP is whitelisted in Atlas Network Access

### "Collection already exists" errors
- You can still import - it will add documents
- Or delete the collection first if you want a clean import

### Special characters in data
- JSON export/import handles most characters correctly
- If issues occur, check encoding

### Large files
- For very large collections, command line might be faster
- Compass has a size limit for imports (check current limits)

## After Migration

1. ✅ Test admin login on www.drdeath.in
2. ✅ Verify all data is visible
3. ✅ Check all features work
4. ✅ Update your local `.env` to use Atlas (optional - for testing)

