#!/usr/bin/env node

/**
 * Migrate Data from Local MongoDB to MongoDB Atlas
 * 
 * This script exports data from local MongoDB and imports it to Atlas
 * 
 * Usage: node migrate-to-atlas.js
 * 
 * Prerequisites:
 * 1. mongodump and mongorestore must be installed
 * 2. Local MongoDB must be running
 * 3. Atlas connection string must be in .env
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const LOCAL_URI = process.env.LOCAL_MONGO_URL || 'mongodb://localhost:27017/legal_guardian';
const ATLAS_URI = process.env.MONGO_URL 
  ? `${process.env.MONGO_URL}/${process.env.DB_NAME || 'legal_guardian'}?retryWrites=true&w=majority`
  : null;

const BACKUP_DIR = path.join(__dirname, 'mongodb-backup');

if (!ATLAS_URI) {
  console.error('❌ Error: MONGO_URL not found in .env file');
  console.error('Please add your Atlas connection string to .env:');
  console.error('MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net');
  process.exit(1);
}

// Collections to migrate
const COLLECTIONS = [
  'users',
  'stories',
  'advocates',
  'grants',
  'contacts',
  'merchandise',
  'orders',
  'settings',
  'cases',
  'teammembers'
];

async function migrate() {
  console.log('🚀 Starting Migration from Local MongoDB to Atlas\n');
  console.log(`Local: ${LOCAL_URI}`);
  console.log(`Atlas: ${ATLAS_URI.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    // Step 1: Export from local
    console.log('📤 Step 1: Exporting from local MongoDB...');
    
    if (fs.existsSync(BACKUP_DIR)) {
      console.log('   Cleaning up old backup...');
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }

    const exportCmd = `mongodump --uri="${LOCAL_URI}" --out="${BACKUP_DIR}"`;
    console.log(`   Running: mongodump...`);
    execSync(exportCmd, { stdio: 'inherit' });
    console.log('✅ Export completed\n');

    // Step 2: Import to Atlas
    console.log('📥 Step 2: Importing to MongoDB Atlas...');
    console.log('   ⚠️  Make sure your IP is whitelisted in Atlas Network Access!\n');

    const importCmd = `mongorestore --uri="${ATLAS_URI}" --drop "${BACKUP_DIR}/legal_guardian"`;
    console.log(`   Running: mongorestore...`);
    console.log('   (This may take a few minutes depending on data size)\n');
    
    execSync(importCmd, { stdio: 'inherit' });
    console.log('\n✅ Import completed\n');

    // Step 3: Verify
    console.log('✅ Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Check MongoDB Atlas dashboard to verify data');
    console.log('2. Test your site at www.drdeath.in');
    console.log('3. Verify admin login works\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('authentication')) {
      console.error('💡 Possible issues:');
      console.error('   - Wrong username or password in connection string');
      console.error('   - IP address not whitelisted in Atlas Network Access');
      console.error('   - User does not have proper permissions');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Possible issues:');
      console.error('   - Local MongoDB is not running');
      console.error('   - Wrong local connection string');
    } else if (error.message.includes('not found')) {
      console.error('💡 Possible issues:');
      console.error('   - mongodump or mongorestore not installed');
      console.error('   - Install MongoDB Database Tools:');
      console.error('     https://www.mongodb.com/try/download/database-tools');
    }
    
    process.exit(1);
  }
}

// Check if mongodump exists
try {
  execSync('mongodump --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ mongodump not found!');
  console.error('\nPlease install MongoDB Database Tools:');
  console.error('macOS: brew install mongodb-database-tools');
  console.error('Or download: https://www.mongodb.com/try/download/database-tools');
  process.exit(1);
}

migrate();

