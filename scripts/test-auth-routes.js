#!/usr/bin/env node

/**
 * Test Script สำหรับทดสอบ Auth Routes ทั้งหมดของ AegisX
 * 
 * วิธีใช้งาน:
 *   node --experimental-modules scripts/test-auth-routes.js
 *   หรือ
 *   node --input-type=module scripts/test-auth-routes.js
 * 
 * จะทดสอบ endpoints ต่อไปนี้:
 *   1. Register - สร้างบัญชีผู้ใช้ใหม่
 *   2. Login - เข้าสู่ระบบและรับ tokens
 *   3. Me - ดูข้อมูลผู้ใช้ปัจจุบัน
 *   4. Change Password - เปลี่ยนรหัสผ่าน
 *   5. Logout - ออกจากระบบ
 *   6. Refresh Token - รีเฟรชโทเคน
 *   7. Forgot Password - ขอรีเซ็ตรหัสผ่าน
 *   8. Reset Password - ตั้งรหัสผ่านใหม่
 *   9. API Key - สร้าง/แสดง/ลบ API keys
 */

import axios from 'axios';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';

// ตั้งค่า Base URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// สำหรับเก็บข้อมูล session
const testUser = {
    username: `test_user_${Math.floor(Math.random() * 10000)}`,
    email: `test${Math.floor(Math.random() * 10000)}@aegisx.test`,
    password: 'TestPassword123!',
    newPassword: 'NewTestPassword123!',
    accessToken: null,
    refreshToken: null,
    userId: null,
    resetToken: null,
    apiKey: null,
    apiKeyId: null
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
 * ทดสอบการลงทะเบียนผู้ใช้ใหม่
 */
async function testRegister() {
    try {
        const response = await api.post('/auth/register', {
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
            fullname: 'Test User'
        });

        testUser.userId = response.data.data.user.id;
        printResult('Register', true, response);
        return true;
    } catch (error) {
        printResult('Register', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการเข้าสู่ระบบ
 */
async function testLogin() {
    try {
        // ทดสอบ login ด้วย username
        const responseUsername = await api.post('/auth/login', {
            username: testUser.username,
            password: testUser.password
        });

        testUser.accessToken = responseUsername.data.data.access_token;
        testUser.refreshToken = responseUsername.data.data.refresh_token;
        printResult('Login with username', true, responseUsername);

        // รีเซ็ต tokens
        testUser.accessToken = null;
        testUser.refreshToken = null;

        // ทดสอบ login ด้วย email
        const responseEmail = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });

        testUser.accessToken = responseEmail.data.data.access_token;
        testUser.refreshToken = responseEmail.data.data.refresh_token;
        printResult('Login with email', true, responseEmail);

        return true;
    } catch (error) {
        printResult('Login', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการดูข้อมูลผู้ใช้ปัจจุบัน (me)
 */
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

/**
 * ทดสอบการเปลี่ยนรหัสผ่าน
 */
async function testChangePassword() {
    try {
        const response = await api.post('/auth/change-password', {
            currentPassword: testUser.password,
            newPassword: testUser.newPassword
        });

        // อัพเดทรหัสผ่านปัจจุบันสำหรับการทดสอบต่อไป
        testUser.password = testUser.newPassword;
        printResult('Change password', true, response);
        return true;
    } catch (error) {
        printResult('Change password', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการลงชื่อออก
 */
async function testLogout() {
    try {
        const response = await api.post('/auth/logout', {
            refresh_token: testUser.refreshToken
        });
        printResult('Logout', true, response);

        // เคลียร์ tokens หลังจาก logout
        const oldToken = testUser.accessToken;
        testUser.accessToken = null;
        testUser.refreshToken = null;

        // ทดสอบว่าออกจากระบบจริงๆ โดยพยายามเรียกใช้ endpoint ที่ต้องการการยืนยันตัวตน
        try {
            // ใช้ token เก่าที่ควรจะถูก revoke ไปแล้ว
            await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${oldToken}` },
                timeout: API_TIMEOUT
            });
            // ถ้าไม่เกิด error แปลว่า logout ไม่สมบูรณ์
            console.log(chalk.yellow('⚠ Warning: Still able to access protected route after logout'));
            return false;
        } catch (error) {
            // เกิด error แสดงว่า token ถูก revoke แล้ว ซึ่งถูกต้อง
            console.log(chalk.green('✓ Logout validation: Token correctly invalidated'));
            return true;
        }
    } catch (error) {
        printResult('Logout', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการ login ใหม่หลังจาก logout
 */
async function testLoginAfterLogout() {
    try {
        const response = await api.post('/auth/login', {
            email: testUser.email,
            password: testUser.password
        });

        testUser.accessToken = response.data.data.access_token;
        testUser.refreshToken = response.data.data.refresh_token;
        printResult('Login after logout', true, response);
        return true;
    } catch (error) {
        printResult('Login after logout', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการรีเฟรช token
 */
async function testRefreshToken() {
    try {
        // เก็บ token เก่าเพื่อเปรียบเทียบ
        const oldAccessToken = testUser.accessToken;

        const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: testUser.refreshToken
        }, { timeout: API_TIMEOUT });

        // อัพเดท tokens
        testUser.accessToken = response.data.data.access_token;
        testUser.refreshToken = response.data.data.refresh_token;

        // ตรวจสอบว่า token ใหม่ต้องไม่เหมือนกับเก่า
        if (testUser.accessToken !== oldAccessToken) {
            printResult('Refresh token', true, response);
            return true;
        } else {
            console.log(chalk.yellow('⚠ Warning: Refresh token did not generate a new access token'));
            return false;
        }
    } catch (error) {
        printResult('Refresh token', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการขอรีเซ็ตรหัสผ่าน
 */
async function testForgotPassword() {
    try {
        const response = await api.post('/auth/forgot-password', {
            email: testUser.email
        });

        printResult('Forgot password', true, response);
        console.log(chalk.blue('ℹ Note: Check email verification in server logs'));

        // ตรวจสอบ response message
        if (response.data.message.includes('reset link')) {
            return true;
        } else {
            console.log(chalk.yellow('⚠ Warning: Unexpected response message for forgot password'));
            return false;
        }
    } catch (error) {
        printResult('Forgot password', false, null, error);
        return false;
    }
}

/**
 * Simulate การรีเซ็ตรหัสผ่าน (จำลอง token)
 * หมายเหตุ: ในการใช้งานจริง จะต้องได้ token จากอีเมล์
 */
async function testResetPassword() {
    try {
        console.log(chalk.yellow('⚠ Note: Reset password test will be simulated with a fake token'));
        console.log(chalk.yellow('   In a real scenario, you would get the token from the email'));

        // จำลอง token - ในการใช้งานจริงจะได้จากอีเมล์
        const simulatedToken = uuidv4();
        testUser.resetToken = simulatedToken;
        const newTestPassword = 'ResetPassword123!';

        // ใช้ resetToken ปลอม (จะไม่สำเร็จแต่เราจะทดสอบการเรียกใช้ endpoint)
        const response = await api.post('/auth/reset-password', {
            token: testUser.resetToken,
            password: newTestPassword
        }).catch(error => error.response);

        // แสดงผลการทดสอบ
        if (response.status === 400) {
            console.log(chalk.blue('ℹ Reset password tested successfully with expected error due to fake token'));
            console.log(chalk.blue('  Error message: ' + response.data.error));
            return true;
        } else {
            console.log(chalk.yellow('⚠ Unexpected response for reset password with fake token'));
            return false;
        }
    } catch (error) {
        printResult('Reset password', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการสร้าง API key
 */
async function testCreateApiKey() {
    try {
        const response = await api.post('/auth/api-key', {
            name: 'Test API Key',
            scopes: ['read:data', 'write:data'],
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

/**
 * ทดสอบการแสดงรายการ API keys
 */
async function testListApiKeys() {
    try {
        const response = await api.get('/auth/api-key');
        printResult('List API keys', true, response);

        // ตรวจสอบว่าพบ API key ที่เราสร้างไว้หรือไม่
        const found = response.data.data.some(key => key.id === testUser.apiKeyId);
        if (found) {
            return true;
        } else {
            console.log(chalk.yellow('⚠ Warning: Created API key not found in list'));
            return false;
        }
    } catch (error) {
        printResult('List API keys', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการลบ API key
 */
async function testRevokeApiKey() {
    try {
        if (!testUser.apiKeyId) {
            console.log(chalk.yellow('⚠ Warning: No API key ID available to revoke'));
            return false;
        }

        const response = await api.delete(`/auth/api-key/${testUser.apiKeyId}`);
        printResult('Revoke API key', true, response);

        // ตรวจสอบการลบโดยลองดึงรายการ API keys อีกครั้ง
        const listResponse = await api.get('/auth/api-key');
        const keyStillExists = listResponse.data.data.some(key =>
            key.id === testUser.apiKeyId && !key.revoked
        );

        if (!keyStillExists) {
            return true;
        } else {
            console.log(chalk.yellow('⚠ Warning: API key still active after revocation'));
            return false;
        }
    } catch (error) {
        printResult('Revoke API key', false, null, error);
        return false;
    }
}

/**
 * ทดสอบการเรียก APIs ที่ป้องกันด้วย API key
 * หมายเหตุ: ต้องปรับตามจุดประสงค์ของแต่ละโปรเจค
 */
async function testApiKeyAuthentication() {
    console.log(chalk.blue('ℹ Note: API key auth test would typically call a protected endpoint'));
    console.log(chalk.blue('  This requires a specific endpoint that accepts API key auth'));

    if (!testUser.apiKey) {
        console.log(chalk.yellow('⚠ Warning: No API key available to test authentication'));
        return false;
    }

    try {
        // ตัวอย่าง request ที่ใช้ API key แทน Bearer token
        // ต้องปรับตาม endpoints ที่รองรับ API key auth
        const testEndpoint = '/api/example'; // ต้องปรับตาม endpoint จริ���

        console.log(chalk.yellow('⚠ Note: API key auth test will be skipped as it requires a specific endpoint'));
        console.log(chalk.yellow('  Sample code: await axios.get(`${API_URL}${testEndpoint}`, { headers: { "x-api-key": testUser.apiKey } })'));

        return true;
    } catch (error) {
        printResult('API key authentication', false, null, error);
        return false;
    }
}

/**
 * ฟังก์ชันหลักสำหรับรัน test cases ทั้งหมด
 */
async function runAllTests() {
    console.log(chalk.blue('🚀 เริ่มทดสอบ Auth Routes ทั้งหมดบน ' + API_URL));
    console.log(chalk.blue('='.repeat(50)));

    // ข้อมูล test user
    console.log(chalk.blue('📝 Test User:'));
    console.log(chalk.blue(`  Username: ${testUser.username}`));
    console.log(chalk.blue(`  Email: ${testUser.email}`));
    console.log(chalk.blue(`  Password: ${testUser.password}`));
    console.log(chalk.blue('='.repeat(50)));

    const tests = [
        { name: '1️⃣  การลงทะเบียนผู้ใช้ใหม่', fn: testRegister },
        { name: '2️⃣  การเข้าสู่ระบบ', fn: testLogin },
        { name: '3️⃣  การดูข้อมูลผู้ใช้ปัจจุบัน', fn: testGetCurrentUser },
        { name: '4️⃣  การเปลี่ยนรหัสผ่าน', fn: testChangePassword },
        { name: '5️⃣  การออกจากระบบ', fn: testLogout },
        { name: '6️⃣  การเข้าสู่ระบบหลังจากออก', fn: testLoginAfterLogout },
        { name: '7️⃣  การรีเฟรชโทเคน', fn: testRefreshToken },
        { name: '8️⃣  การขอรีเซ็ตรหัสผ่าน', fn: testForgotPassword },
        { name: '9️⃣  การรีเซ็ตรหัสผ่าน (จำลอง)', fn: testResetPassword },
        { name: '🔑 การสร้าง API key', fn: testCreateApiKey },
        { name: '🔑 การแสดงรายการ API keys', fn: testListApiKeys },
        { name: '🔑 การลบ API key', fn: testRevokeApiKey },
        // { name: '🔑 การใช้ API key สำหรับการยืนยันตัวตน', fn: testApiKeyAuthentication }
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
