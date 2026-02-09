# Import JSON Files into MongoDB Atlas using Compass

## Your Exported Files:
- ✅ `users.json` (3 documents)
- ✅ `stories.json` (2 documents)
- ✅ `cases.json` (2 documents)

## Step-by-Step Import in Compass:

### For Each Collection (users, stories, cases):

1. **In Compass, click on the collection name** in the left sidebar
   - For example: Click "users" collection
   - This opens the collection view

2. **Click "Add Data" button** (top right of the collection view)
   - It's a green button with "+" icon
   - OR click the three dots "..." menu → "Import File"

3. **Select "Import File"** from the dropdown menu

4. **Choose your JSON file:**
   - Navigate to: `/Users/nishantverma/Documents/Projects/MedicalNegligence/backend-node/json-exports/`
   - Select the file (e.g., `users.json`)

5. **Confirm file type:**
   - Format should auto-detect as "JSON" or "JSON Array"
   - Make sure it says "JSON" format

6. **Click "Import"**
   - Wait for the import to complete
   - You'll see a success message with document count

7. **Repeat for other collections:**
   - Import `stories.json` → `stories` collection
   - Import `cases.json` → `cases` collection

### After Import:

1. Click the refresh button (circular arrow icon) to see updated document counts
2. Click on each collection to verify the data imported correctly
3. Check that document counts match:
   - `users` should have 3 documents (or more if you had duplicates)
   - `stories` should have 2 documents
   - `cases` should have 2 documents

## Important Notes:

⚠️ **Users Collection:** You already have 3 users in Atlas. Importing `users.json` will add 3 more, giving you 6 total. If you want to replace them instead:
- Delete the existing `users` collection first (right-click → Drop Collection)
- Then import your `users.json`

✅ **Other Collections:** Stories and cases should import fine since they're currently empty (0 documents).

