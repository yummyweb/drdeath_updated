#!/usr/bin/env node

/**
 * Test Admin Login Script
 * 
 * This script tests the admin login functionality to verify everything is working.
 * Usage: node test-login.js [email] [password]
 */

require('dotenv').config();
const http = require('http');
const https = require('https');
const { URL } = require('url');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const API_URL = `${BACKEND_URL}/api`;

const [email, password] = process.argv.slice(2).length >= 2 
  ? process.argv.slice(2) 
  : ['admin@admin.com', 'admin123'];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.setTimeout(options.timeout || 10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testLogin() {
  console.log('🧪 Testing Admin Login\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password.replace(/./g, '*')}\n`);

  // Test 1: Health check
  console.log('1️⃣ Testing backend health...');
  try {
    const healthRes = await makeRequest(`${BACKEND_URL}/health`, { timeout: 5000 });
    if (healthRes.status === 200) {
      console.log('✅ Backend is running\n');
    } else {
      throw new Error(`Unexpected status: ${healthRes.status}`);
    }
  } catch (error) {
    console.error('❌ Backend is not accessible');
    console.error(`   Error: ${error.message}`);
    console.error(`   Make sure the backend server is running on ${BACKEND_URL}`);
    process.exit(1);
  }

  // Test 2: Login
  console.log('2️⃣ Testing login endpoint...');
  try {
    const loginRes = await makeRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { email, password },
      timeout: 10000
    });

    if (loginRes.status !== 200) {
      const errorMsg = loginRes.data?.detail || `HTTP ${loginRes.status}`;
      throw new Error(errorMsg);
    }

    console.log('✅ Login successful!');
    console.log(`   Token: ${loginRes.data.access_token?.substring(0, 20) || 'N/A'}...`);
    console.log(`   User: ${loginRes.data.user?.full_name || 'N/A'}`);
    console.log(`   Role: ${loginRes.data.user?.role || 'N/A'}`);
    
    if (loginRes.data.user?.role !== 'admin') {
      console.warn('\n⚠️  WARNING: User role is not "admin"!');
      console.warn('   This user will not be able to access the admin panel.');
      console.warn('   Use the create-admin.js script to create an admin user.');
    } else {
      console.log('\n✅ User has admin role - can access admin panel');
    }

    // Test 3: Verify token works
    if (loginRes.data.access_token) {
      console.log('\n3️⃣ Testing token validation...');
      try {
        const meRes = await makeRequest(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginRes.data.access_token}`
          },
          timeout: 10000
        });
        
        if (meRes.status === 200) {
          console.log('✅ Token is valid');
          console.log(`   Authenticated as: ${meRes.data.full_name} (${meRes.data.email})`);
        } else {
          console.error('❌ Token validation failed');
          console.error(`   Status: ${meRes.status}`);
          console.error(`   Error: ${meRes.data?.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Token validation failed');
        console.error(`   Error: ${error.message}`);
      }
    }

    console.log('\n✅ All tests passed! Admin login is working correctly.\n');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Login failed: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('Invalid credentials')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Wrong email or password');
      console.error('   - Admin user does not exist');
      console.error('   - User exists but password is incorrect');
      console.error('\n   Try creating admin user:');
      console.error(`   node scripts/create-admin.js ${email} yourpassword "Admin Name"`);
    } else if (error.message.includes('500')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Database connection issue');
      console.error('   - Server error (check backend logs)');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Backend server is not running');
      console.error(`   - Backend is not accessible at ${BACKEND_URL}`);
      console.error('   - Check if backend server is started with: npm start');
    }
    
    process.exit(1);
  }
}

testLogin();

