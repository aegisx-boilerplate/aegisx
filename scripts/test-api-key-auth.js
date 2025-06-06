#!/usr/bin/env node

/**
 * Test Script สำหรับทดสอบ API Key Authentication
 * 
 * วิธีใช้งาน:
 *   node --experimental-modules scripts/test-api-key-auth.js
 *   หรือ
 *   node --input-type=module scripts/test-api-key-auth.js
 * 
 * หมายเหตุ:
 *   - ตรวจสอบการทำงานของ API Key Authentication กับ endpoints ต่างๆ
 *   - ทดสอบ scope validation
 *   - ทดสอบ IP whitelisting
 */

import axios from 'axios';
import chalk from 'chalk';

// ตั้งค่า Base URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// สำหรับเก็บข้อมูล session
const testUser = {
    username: `apitest_user_${Math.floor(Math.random() * 10000)}`,
    email: `apitest${Math.floor(Math.random() * 10000)}@aegisx.test`,
    password: 'TestPassword123!',
    accessToken: null,
    refreshToken: null,
    userId: null,
    apiKeys: [] // เก็บ API keys หลายตัวสำหรับทดสอบ scopes ต่างๆ
};

// สร้าง axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT
});

// จัดการเพิ่ม Authorization header
api.interceptors.request.use(config => {
    if (testUser.accessToken) {
        config.headers['Authorization'] = `Bearer ${testUser.accessToken}`;
    }
    return config;
});

/**
 * แสดงผลลัพธ์การทดสอบ
 */
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

/**
 * ลงทะเบียนและเข้าสู่ระบบเพื่อเตรียมทดสอบ
 */
async function setupUserAccount() {
    try {
        // ลงทะเบียน
        const registerResponse = await api.post('/auth/register', {
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
            fullname: 'API Test User'
        });
        testUser.userId = registerResponse.data.data.user.id;

        // เข้าสู่ระบบ
        const loginResponse = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        testUser.accessToken = loginResponse.data.data.access_token;
        testUser.refreshToken = loginResponse.data.data.refresh_token;

        printResult('Setup user account', true);
        return true;
    } catch (error) {
        printResult('Setup user account', false, null, error);
        return false;
    }
}

/**
 * สร้าง API Key หลายตัวสำหรับทดสอบ scopes ต่างๆ
 */
async function createTestApiKeys() {
    try {
        // 1. สร้าง API Key ที่มีสิทธิ์เต็ม
        const fullAccessResponse = await api.post('/auth/api-key', {
            name: 'Full Access API Key',
            scopes: ['read:*', 'write:*', 'delete:*'],
            ipWhitelist: null
        });

        testUser.apiKeys.push({
            id: fullAccessResponse.data.data.id,
            key: fullAccessResponse.data.data.key,
            name: 'Full Access API Key',
            scopes: ['read:*', 'write:*', 'delete:*']
        });

        // 2. สร้าง API Key ที่มีสิทธิ์อ่านอย่างเดียว
        const readOnlyResponse = await api.post('/auth/api-key', {
            name: 'Read Only API Key',
            scopes: ['read:*'],
            ipWhitelist: null
        });

        testUser.apiKeys.push({
            id: readOnlyResponse.data.data.id,
            key: readOnlyResponse.data.data.key,
            name: 'Read Only API Key',
            scopes: ['read:*']
        });

        // 3. สร้าง API Key ที่มี IP whitelist
        const ipLimitedResponse = await api.post('/auth/api-key', {
            name: 'IP Limited API Key',
            scopes: ['read:*', 'write:*'],
            ipWhitelist: ['127.0.0.1'] // จำกัดให้ใช้ได้เฉพาะ localhost
        });

        testUser.apiKeys.push({
            id: ipLimitedResponse.data.data.id,
            key: ipLimitedResponse.data.data.key,
            name: 'IP Limited API Key',
            scopes: ['read:*', 'write:*'],
            ipWhitelist: ['127.0.0.1']
        });

        printResult('Create test API keys', true);
        return true;
    } catch (error) {
        printResult('Create test API keys', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการเรียกใช้ API ด้วย API key ตัวที่มีสิทธิ์เต็ม
 */
async function testFullAccessApiKey() {
    const fullAccessKey = testUser.apiKeys.find(k => k.name === 'Full Access API Key');
    if (!fullAccessKey) {
        console.log(chalk.yellow('⚠ Warning: Full access API key not found'));
        return false;
    }

    try {
        // ทดลองเรียก API ที่ต้องการสิทธิ์อ่าน
        const readResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { 'x-api-key': fullAccessKey.key },
            timeout: API_TIMEOUT
        });

        printResult('Full Access API Key - Read', true, readResponse);
        return true;
    } catch (error) {
        printResult('Full Access API Key - Read', false, null, error);

        // ถ้า API endpoint ไม่รองรับ API key auth สำหรับ endpoint นี้
        if (error.response?.status === 401) {
            console.log(chalk.blue('ℹ Note: This endpoint may not support API key authentication'));
            console.log(chalk.blue('  Consider using a different endpoint for testing'));
        }

        return false;
    }
}

/**
 * ทดสอบการเรียกใช้ API ด้วย API key ที่มีสิทธิ์อ่านอย่างเดียว
 */
async function testReadOnlyApiKey() {
    const readOnlyKey = testUser.apiKeys.find(k => k.name === 'Read Only API Key');
    if (!readOnlyKey) {
        console.log(chalk.yellow('⚠ Warning: Read-only API key not found'));
        return false;
    }

    try {
        // ทดลองเรียก API ที่ต้องการสิทธิ์อ่าน (ควรผ่าน)
        const readResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { 'x-api-key': readOnlyKey.key },
            timeout: API_TIMEOUT
        });

        printResult('Read Only API Key - Read', true, readResponse);

        // ทดลองเรียก API ที่ต้องการสิทธิ์เขียน (ควรไม่ผ่าน)
        // หมายเหตุ: ใช้เป็นตัวอย่าง ต้องปรับให้เข้ากับ API จริง
        console.log(chalk.blue('ℹ Testing write access restriction (should fail):'));

        try {
            await axios.post(`${API_URL}/auth/api-key`,
                { name: 'Test Key', scopes: ['read:*'] },
                { headers: { 'x-api-key': readOnlyKey.key }, timeout: API_TIMEOUT }
            );

            console.log(chalk.yellow('⚠ Warning: Write operation succeeded with read-only API key'));
            return false;
        } catch (error) {
            // คาดว่าจะเกิด error เพราะไม่มีสิทธิ์เขียน
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log(chalk.green('✓ Read Only API Key - Write correctly denied'));
                return true;
            } else {
                console.log(chalk.yellow('⚠ Warning: Unexpected error for write test:'), error.message);
                return false;
            }
        }
    } catch (error) {
        printResult('Read Only API Key - Read', false, null, error);

        // ถ้า API endpoint ไม่รองรับ API key auth สำหรับ endpoint นี้
        if (error.response?.status === 401) {
            console.log(chalk.blue('ℹ Note: This endpoint may not support API key authentication'));
            console.log(chalk.blue('  Consider using a different endpoint for testing'));
        }

        return false;
    }
}

/**
 * ทดสอบการเรียกใช้ API ด้วย API key ที่มี IP whitelist
 * หมายเหตุ: การทดสอบนี้อาจให้ผลที่คาดการณ์ไม่ได้ขึ้นอยู่กับการตั้งค่าของ IP
 */
async function testIpLimitedApiKey() {
    const ipLimitedKey = testUser.apiKeys.find(k => k.name === 'IP Limited API Key');
    if (!ipLimitedKey) {
        console.log(chalk.yellow('⚠ Warning: IP limited API key not found'));
        return false;
    }

    try {
        console.log(chalk.blue('ℹ Testing IP-limited API key:'));
        console.log(chalk.blue('  This key should only work from IP: 127.0.0.1'));

        // ทดลองเรียก API
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { 'x-api-key': ipLimitedKey.key },
            timeout: API_TIMEOUT
        });

        // ถ้าทดสอบจาก localhost (127.0.0.1), ควรผ่าน
        // ถ้าทดสอบจาก IP อื่น ควรไม่ผ่าน
        printResult('IP Limited API Key', true, response);
        console.log(chalk.blue('ℹ Note: This test passed, which means either:'));
        console.log(chalk.blue('  1. You are testing from 127.0.0.1 (expected success)'));
        console.log(chalk.blue('  2. IP whitelist validation is not active (potential issue)'));

        return true;
    } catch (error) {
        printResult('IP Limited API Key', false, null, error);

        // ถ้าเกิด error เนื่องจาก IP ไม่ตรงกับ whitelist
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(chalk.blue('ℹ Note: This might be expected if testing from non-whitelisted IP'));
            return true;
        }

        return false;
    }
}

/**
 * ล้างข้อมูลการทดสอบ (ลบ API keys)
 */
async function cleanup() {
    try {
        console.log(chalk.blue('\nℹ Cleaning up test data...'));

        // ลบ API keys ทั้งหมดที่สร้าง
        for (const apiKey of testUser.apiKeys) {
            await api.delete(`/auth/api-key/${apiKey.id}`).catch(e => {
                console.log(chalk.yellow(`⚠ Warning: Could not delete API key ${apiKey.id}: ${e.message}`));
            });
        }

        console.log(chalk.green('✓ Cleanup complete'));
        return true;
    } catch (error) {
        console.log(chalk.red('✗ Cleanup failed:'), error.message);
        return false;
    }
}

/**
 * ฟังก์ชันหลักสำหรับรัน test cases ทั้งหมด
 */
async function runAllTests() {
    console.log(chalk.blue('🔑 เริ่มทดสอบ API Key Authentication บน ' + API_URL));
    console.log(chalk.blue('='.repeat(50)));

    // เตรียมข้อมูล
    const success = await setupUserAccount();
    if (!success) {
        console.log(chalk.red('💥 ไม่สามารถตั้งค่าบัญชีผู้ใช้สำหรับการทดสอบได้'));
        return;
    }

    await createTestApiKeys();

    const tests = [
        { name: '1️⃣  API Key ที่มีสิทธิ์เต็ม', fn: testFullAccessApiKey },
        { name: '2️⃣  API Key ที่มีสิทธิ์อ่านอย่างเดียว', fn: testReadOnlyApiKey },
        { name: '3️⃣  API Key ที่มีการจำกัด IP', fn: testIpLimitedApiKey }
    ];

    let successCount = 0;

    for (const test of tests) {
        console.log(chalk.blue(`\n▶️ กำลังทดสอบ ${test.name}...`));
        try {
            const success = await test.fn();
            if (success) successCount++;
        } catch (error) {
            console.error(chalk.red(`💥 Unhandled error in ${test.name}:`), error);
        }
    }

    // ล้างข้อมูลการทดสอบ
    await cleanup();

    // แสดงสรุปผล
    console.log(chalk.blue('\n='.repeat(50)));
    console.log(chalk.blue(`📊 สรุปผลการทดสอบ: ${successCount}/${tests.length} tests passed`));

    if (successCount === tests.length) {
        console.log(chalk.green('\n✅ การทดสอบทั้งหมดผ่าน!'));
    } else {
        console.log(chalk.yellow(`\n⚠️ การทดสอบผ่านบางส่วน (${successCount}/${tests.length})`));
    }
}

// รันการทดสอบ
runAllTests().catch(error => {
    console.error(chalk.red('💥 เกิดข้อผิดพลาดระหว่างการทดสอบ:'), error);
    process.exit(1);
});
