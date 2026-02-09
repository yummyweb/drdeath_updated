# How to Export Collections (Not Connections) from MongoDB Compass

## What You Got vs What You Need

**What you exported:** Compass connection settings (JSON file about your connections)  
**What you need:** Actual database collections (users, stories, etc.)

## Correct Way to Export Collections:

### Step 1: Connect to Your Local Database

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see your databases listed (including `legal_guardian`)

### Step 2: Open the Database

1. Click on the **`legal_guardian`** database
2. You should see a list of **Collections** like:
   - users
   - stories
   - advocates
   - grants
   - contacts
   - etc.

### Step 3: Export Each Collection

**IMPORTANT:** You need to export **each collection individually**, not the database or connections!

For each collection:

1. **Click on the collection name** (e.g., click "users")
   - This opens the collection view showing documents

2. **Look for the Export button:**
   - In the collection view, find the **"..." menu** (three dots) or **"Export" button**
   - OR look for **"Export Collection"** option
   - It's usually at the top of the collection view

3. **Alternative method if Export button not visible:**
   - Click on the collection name in the left sidebar
   - Right-click on the collection name
   - Look for "Export Collection" in the context menu

4. **Choose export options:**
   - Format: **JSON** or **JSON Array**
   - File location: Save as `users.json`, `stories.json`, etc.
   - Click "Export"

5. **Repeat for each collection:**
   - users → `users.json`
   - stories → `stories.json`
   - advocates → `advocates.json`
   - grants → `grants.json`
   - contacts → `contacts.json`
   - merchandise → `merchandise.json`
   - orders → `orders.json`
   - settings → `settings.json`
   - (and any other collections)

### What the JSON Files Should Look Like:

**Example `users.json` should contain:**
```json
[
  {
    "_id": {...},
    "id": "some-uuid",
    "email": "mailfornishantverma@gmail.com",
    "full_name": "Nishant Bharihoke",
    "role": "admin",
    ...
  },
  {
    "_id": {...},
    "email": "another@user.com",
    ...
  }
]
```

**NOT connection settings like you got!**

## Alternative: Use Command Line (Easier)

If Compass export is confusing, use command line instead:

### Export All Collections at Once:

```bash
# Navigate to your project
cd /Users/nishantverma/Documents/Projects/MedicalNegligence/backend-node

# Export each collection
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=users --out=users.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=stories --out=stories.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=advocates --out=advocates.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=grants --out=grants.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=contacts --out=contacts.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=merchandise --out=merchandise.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=orders --out=orders.json
mongoexport --uri="mongodb://localhost:27017/legal_guardian" --collection=settings --out=settings.json
```

This will create JSON files in your `backend-node` folder with all your data.

## Then Import to Atlas

Once you have the correct JSON files (with actual data), follow the import steps in `MIGRATE_DATA_TO_ATLAS.md` to import them into Atlas using Compass.

