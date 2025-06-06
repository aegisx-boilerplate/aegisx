#!/usr/bin/env node

/**
 * Quick Auth Test - Testing core auth endpoints without email dependencies
 */

import axios from 'axios';
import chalk from 'chalk';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_TIMEOUT = 5000; // 5 seconds

// Test with existing admin user
const testUser = {
    username: 'admin1',
    password: 'admin1',
    accessToken: null,
    refreshToken: null,
    apiKey: null,
    apiKeyId: null
};

const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT
});

// Add Authorization header interceptor
api.interceptors.request.use(config => {
    if (testUser.accessToken) {
        config.headers['Authorization'] = `Bearer ${testUser.accessToken}`;
    }
    return config;
});

function printResult(title, success, response = null, error = null) {
    if (success) {
        console.log(chalk.green(`✓ ${title}: สำเร็จ`));
        if (response && process.env.DEBUG) {
            console.log(chalk.gray('  Response:'), response.data);
        }
    } else {
        console.log(chalk.red(`✗ ${title}: ล้มเหลว`));
        if (error) {
            console.log(chalk.red('  Error:'), error.response?.data || error.message);
        }
    }
}

async function testLogin() {
    try {
        const response = await api.post('/auth/login', {
            username: testUser.username,
            password: testUser.password
        });

        testUser.accessToken = response.data.data.access_token;
        testUser.refreshToken = response.data.data.refresh_token;
        printResult('Login', true, response);
        return true;
    } catch (error) {
        printResult('Login', false, null, error);
        return false;
    }
}

async function testGetCurrentUser() {
    try {
        const response = await api.get('/auth/me');
        printResult('Get current user', true, response);
        return true;
    } catch (error) {
        printResult('Get current user', false, null, error);
        return false;
    }
}

async function testCreateApiKey() {
    try {
        const response = await api.post('/auth/api-key', {
            name: 'Quick Test API Key',
            scopes: ['read', 'write'],
            ipWhitelist: ['127.0.0.1']
        });

        testUser.apiKey = response.data.data.key;
        testUser.apiKeyId = response.data.data.id;
        printResult('Create API key', true, response);
        return true;
    } catch (error) {
        printResult('Create API key', false, null, error);
        return false;
    }
}

async function testListApiKeys() {
    try {
        const response = await api.get('/auth/api-key');
        printResult('List API keys', true, response);
        return true;
    } catch (error) {
        printResult('List API keys', false, null, error);
        return false;
    }
}

async function testRefreshToken() {
    try {
        const response = await api.post('/auth/refresh', {
            refresh_token: testUser.refreshToken
        });

        testUser.accessToken = response.data.data.access_token;
        printResult('Refresh token', true, response);
        return true;
    } catch (error) {
        printResult('Refresh token', false, null, error);
        return false;
    }
}

async function testRevokeApiKey() {
    try {
        const response = await api.delete(`/auth/api-key/${testUser.apiKeyId}`);
        printResult('Revoke API key', true, response);
        return true;
    } catch (error) {
        printResult('Revoke API key', false, null, error);
        return false;
    }
}

async function testLogout() {
    try {
        const response = await api.post('/auth/logout', {
            refresh_token: testUser.refreshToken
        });
        printResult('Logout', true, response);
        
        // Clear tokens
        testUser.accessToken = null;
        testUser.refreshToken = null;
        return true;
    } catch (error) {
        printResult('Logout', false, null, error);
        return false;
    }
}

async function runQuickTests() {
    console.log(chalk.blue('🚀 Quick Auth Test - Testing core endpoints'));
    console.log(chalk.blue('='.repeat(50)));
    console.log(chalk.blue(`API URL: ${API_URL}`));
    console.log(chalk.blue(`Test User: ${testUser.username}`));
    console.log(chalk.blue('='.repeat(50)));

    const tests = [
        { name: '1️⃣  การเข้าสู่ระบบ', fn: testLogin },
        { name: '2️⃣  การดูข้อมูลผู้ใช้ปัจจุบัน', fn: testGetCurrentUser },
        { name: '3️⃣  การสร้าง API key', fn: testCreateApiKey },
        { name: '4️⃣  การแสดงรายการ API keys', fn: testListApiKeys },
        { name: '5️⃣  การรีเฟรชโทเคน', fn: testRefreshToken },
        { name: '6️⃣  การลบ API key', fn: testRevokeApiKey },
        { name: '7️⃣  การออกจากระบบ', fn: testLogout }
    ];

    let successCount = 0;

    for (const test of tests) {
        console.log(chalk.blue(`\n▶️ กำลังทดสอบ ${test.name}...`));
        try {
            const success = await test.fn();
            if (success) successCount++;
        } catch (error) {
            console.error(chalk.red(`💥 Unhandled error in ${test.name}:`), error.message);
        }
    }

    console.log(chalk.blue('\n' + '='.repeat(50)));
    console.log(chalk.blue(`📊 สรุปผลการทดสอบ: ${successCount}/${tests.length} tests passed`));

    if (successCount === tests.length) {
        console.log(chalk.green('\n✅ การทดสอบทั้งหมดผ่าน!'));
        console.log(chalk.green('🎉 Authentication system is working perfectly!'));
    } else {
        console.log(chalk.yellow(`\n⚠️ การทดสอบผ่านบางส่วน (${successCount}/${tests.length})`));
    }
}

// Run the tests
runQuickTests().catch(console.error);
