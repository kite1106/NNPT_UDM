#!/usr/bin/env node

/**
 * Test script for role change endpoint
 * Usage: node test-role-change.js <userId> <newRole> <accessToken>
 */

const API_URL = 'http://localhost:5000';

async function testRoleChange(userId, newRole, accessToken) {
  try {
    console.log('🔄 Testing role change endpoint...');
    console.log(`URL: PATCH ${API_URL}/api/admin/users/${userId}/role`);
    console.log(`Role: ${newRole}`);
    console.log(`Token: ${accessToken.substring(0, 20)}...`);
    
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    console.log(`\n📊 Response Status: ${res.status}`);
    
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (res.ok) {
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// Get arguments from command line
const [, , userId, newRole, accessToken] = process.argv;

if (!userId || !newRole || !accessToken) {
  console.error('❌ Usage: node test-role-change.js <userId> <newRole> <accessToken>');
  console.error('Example: node test-role-change.js 64f8c3e4a5b2c1d8f9e3a4b 0 admin eyJhbGc...');
  process.exit(1);
}

testRoleChange(userId, newRole, accessToken);
