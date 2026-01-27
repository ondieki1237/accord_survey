
const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
    console.log('--- Testing Authentication Flow ---');

    // 1. Try to access protected route without token
    console.log('\n1. Accessing /employees without token...');
    try {
        const res = await fetch(`${BASE_URL}/employees`);
        console.log(`Status: ${res.status}`);
        if (res.status === 401) console.log('PASS: Correctly denied access');
        else console.log('FAIL: Should have been 401');
    } catch (e) { console.error(e); }

    // 2. Login with bad credentials
    console.log('\n2. Logging in with bad credentials...');
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
        });
        console.log(`Status: ${res.status}`);
        if (res.status === 401) console.log('PASS: Correctly denied login');
        else console.log('FAIL: Should have been 401');
    } catch (e) { console.error(e); }

    // 3. Login with correct credentials
    console.log('\n3. Logging in with correct credentials...');
    let token = '';
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' }),
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (res.status === 200 && data.token) {
            console.log('PASS: Login successful, token received');
            token = data.token;
        } else {
            console.log('FAIL: Login failed or no token');
            console.log(data);
        }
    } catch (e) { console.error(e); }

    if (!token) return;

    // 4. Access protected route with token
    console.log('\n4. Accessing /employees with token...');
    try {
        const res = await fetch(`${BASE_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`Status: ${res.status}`);
        if (res.status === 200) console.log('PASS: Access granted');
        else console.log('FAIL: Access denied');
    } catch (e) { console.error(e); }
}

testAuth();
