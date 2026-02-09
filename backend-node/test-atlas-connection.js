#!/usr/bin/env node

/**
 * Test MongoDB Atlas Connection
 * 
 * This script tests if your MongoDB Atlas connection string works.
 * Usage: node test-atlas-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'legal_guardian';

// For Atlas, if MONGO_URL already includes database name, use it directly
// Otherwise append database name
const connectionString = mongoUrl.includes('/' + dbName) || mongoUrl.includes('mongodb+srv://') && mongoUrl.includes('/?')
  ? mongoUrl.replace('/?', '/' + dbName + '?').replace('/?appName=', '/' + dbName + '?appName=')
  : mongoUrl.includes('mongodb+srv://') && !mongoUrl.includes('/' + dbName)
  ? mongoUrl.replace(/(mongodb\+srv:\/\/[^/]+)(\/[^?]*)?(\?.*)?$/, `$1/${dbName}$3`)
  : `${mongoUrl}/${dbName}`;

async function testConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection\n');
  console.log(`Connection String: ${mongoUrl.includes('mongodb+srv://') ? mongoUrl.replace(/:[^:@]+@/, ':****@') : mongoUrl}`);
  console.log(`Database Name: ${dbName}\n`);

  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Connect using the connection string
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Test database operations
    console.log('Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collection(s) in database`);
    
    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }

    console.log('\n✅ Connection test passed! Your MongoDB Atlas setup is working correctly.\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('authentication failed')) {
      console.error('💡 Possible issues:');
      console.error('   - Wrong username or password');
      console.error('   - User does not have access to the database');
      console.error('   - Check Database Access settings in Atlas');
    } else if (error.message.includes('IP')) {
      console.error('💡 Possible issues:');
      console.error('   - Your IP address is not whitelisted');
      console.error('   - Go to Atlas → Network Access → Add IP Address');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Possible issues:');
      console.error('   - Network connectivity issues');
      console.error('   - Check your internet connection');
      console.error('   - Cluster might be sleeping (free tier)');
    }
    
    process.exit(1);
  }
}

testConnection();

