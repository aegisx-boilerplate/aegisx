#!/usr/bin/env node

const http = require('http');

// Test user registration
const testRegistration = async () => {
    const userData = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'TestPassword123!',
    };

    const postData = JSON.stringify(userData);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: result,
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData);
        req.end();
    });
};

// Test if server is running
const checkServerHealth = async () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/health',
        method: 'GET',
    };

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.end();
    });
};

const main = async () => {
    console.log('🧪 Testing User Registration...\n');

    // Check if server is running
    console.log('1. Checking server health...');
    const isServerRunning = await checkServerHealth();

    if (!isServerRunning) {
        console.log('❌ Server is not running. Please start the server first with: npm run dev');
        process.exit(1);
    }

    console.log('✅ Server is running\n');

    // Test registration
    console.log('2. Testing user registration...');
    try {
        const response = await testRegistration();

        console.log('Status Code:', response.statusCode);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.statusCode === 200 || response.statusCode === 201) {
            console.log('\n✅ User registration test PASSED');

            // Check if user has access token (auto-login worked)
            if (response.data.access_token) {
                console.log('✅ Auto-login after registration PASSED');
            } else {
                console.log('⚠️  Auto-login after registration might have issues');
            }

            // Check if user has roles/permissions
            if (response.data.user && response.data.user.roles) {
                console.log('✅ User has roles/permissions assigned');
                console.log('   Roles/Permissions:', response.data.user.roles);
            } else {
                console.log('⚠️  User might not have default role assigned');
            }

        } else {
            console.log('\n❌ User registration test FAILED');
            console.log('   Unexpected status code:', response.statusCode);
        }

    } catch (error) {
        console.log('\n❌ User registration test FAILED');
        console.log('   Error:', error.message);
    }
};

main().catch(console.error);
