#!/bin/bash

# Import JSON files to MongoDB Atlas

echo "📥 Importing collections to MongoDB Atlas..."
echo ""

ATLAS_URI="mongodb+srv://teamelizian_db_user:1tupOoAn4UkgWIU3@cluster0.w1g4nom.mongodb.net/legal_guardian?retryWrites=true&w=majority"
JSON_DIR="./json-exports"

# Check if json-exports directory exists
if [ ! -d "$JSON_DIR" ]; then
  echo "❌ Error: json-exports directory not found!"
  echo "Please run ./export-collections.sh first"
  exit 1
fi

# Collections to import (file:collection mapping)
import_collection() {
  local json_file=$1
  local collection=$2
  local file_path="$JSON_DIR/$json_file"
  
  if [ -f "$file_path" ] && [ -s "$file_path" ]; then
    echo "Importing $json_file → $collection collection..."
    mongoimport --uri="$ATLAS_URI" --collection="$collection" --file="$file_path" 2>&1
    
    if [ $? -eq 0 ]; then
      echo "  ✅ Successfully imported $collection"
    else
      echo "  ❌ Failed to import $collection"
    fi
    echo ""
  else
    echo "⚠️  Skipping $json_file (file not found or empty)"
  fi
}

# Import each collection
import_collection "users.json" "users"
import_collection "stories.json" "stories"
import_collection "cases.json" "cases"
import_collection "advocates.json" "advocates"
import_collection "contacts.json" "contacts"
import_collection "merchandise.json" "merchandise"
import_collection "orders.json" "orders"
import_collection "settings.json" "settings"
import_collection "team_members.json" "team_members"

echo "✅ Import complete!"
echo ""
echo "Next steps:"
echo "1. Check MongoDB Atlas/Compass to verify data"
echo "2. Test your site at www.drdeath.in"
echo "3. Verify admin login works"

