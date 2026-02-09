#!/bin/bash

# Export all collections from local MongoDB to JSON files

echo "📤 Exporting collections from local MongoDB..."
echo ""

DB_NAME="legal_guardian"
MONGO_URI="mongodb://localhost:27017/$DB_NAME"
OUTPUT_DIR="./json-exports"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Collections to export (note: team_members has underscore, not teammembers)
COLLECTIONS=("users" "stories" "advocates" "grants" "contacts" "merchandise" "orders" "settings" "cases" "team_members")

for collection in "${COLLECTIONS[@]}"; do
  echo "Exporting $collection..."
  mongoexport --uri="$MONGO_URI" --collection="$collection" --out="$OUTPUT_DIR/$collection.json" 2>/dev/null
  
  if [ $? -eq 0 ]; then
    # Check if file has data (more than just empty array)
    if [ -f "$OUTPUT_DIR/$collection.json" ] && [ -s "$OUTPUT_DIR/$collection.json" ]; then
      count=$(wc -l < "$OUTPUT_DIR/$collection.json" | tr -d ' ')
      file_size=$(wc -c < "$OUTPUT_DIR/$collection.json" 2>/dev/null | tr -d ' ')
      if [ "$count" -gt 0 ] && [ "$file_size" -gt 0 ]; then
        echo "  ✅ Exported $collection.json ($count lines, $file_size bytes)"
      else
        echo "  ⚠️  $collection.json is empty (collection might not exist or be empty)"
        rm -f "$OUTPUT_DIR/$collection.json" 2>/dev/null
      fi
    else
      echo "  ⚠️  $collection.json not created (collection might not exist)"
    fi
  else
    echo "  ❌ Failed to export $collection"
  fi
done

echo ""
echo "✅ Export complete! Files saved in: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Check the json-exports folder"
echo "2. Import these files to MongoDB Atlas using Compass or mongoimport"

