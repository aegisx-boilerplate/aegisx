#!/usr/bin/env node

// Test script to verify per-pod audit log functionality
import { EventPublisher } from '../src/core/event-bus/EventPublisher';
import path from 'path';
import fs from 'fs';

// Mock EventBus that always fails to simulate RabbitMQ being down
class MockEventBus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async publishEvent(queue: string, event: any): Promise<void> {
        throw new Error('RabbitMQ is unavailable (simulated)');
    }
}

async function testPerPodAuditLogs() {
    console.log('🧪 Testing per-pod audit log functionality...\n');

    // Set up mock EventBus
    const mockEventBus = new MockEventBus();
    EventPublisher.setEventBus(mockEventBus as any);

    // Test different pod/container scenarios
    const testCases = [
        { env: { HOSTNAME: 'aegisx-app-1' }, expected: 'audit-offline-aegisx-app-1.jsonl' },
        { env: { POD_NAME: 'aegisx-deployment-abc123' }, expected: 'audit-offline-aegisx-deployment-abc123.jsonl' },
        { env: { CONTAINER_NAME: 'aegisx_app_2' }, expected: 'audit-offline-aegisx_app_2.jsonl' },
        { env: {}, expected: 'audit-offline-default.jsonl' }, // No env vars, fallback to default
    ];

    const logsDir = path.resolve(__dirname, '../logs');

    // Clean up any existing test files
    if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir).filter(f => f.startsWith('audit-offline-') && f.endsWith('.jsonl'));
        files.forEach(file => fs.unlinkSync(path.join(logsDir, file)));
    }

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Test ${i + 1}: Testing with env vars:`, Object.keys(testCase.env).length > 0 ? testCase.env : 'none');

        // Set environment variables for this test
        const originalEnv = { ...process.env };
        Object.keys(originalEnv).forEach(key => {
            if (['HOSTNAME', 'POD_NAME', 'CONTAINER_NAME'].includes(key)) {
                delete process.env[key];
            }
        });
        Object.assign(process.env, testCase.env);

        // Create test audit event
        const testEvent = {
            action: 'test_action',
            resource: 'test_resource',
            userId: 'test_user',
            metadata: { test: `case_${i + 1}` },
            timestamp: new Date().toISOString()
        };

        try {
            // This should fail and write to offline log
            await EventPublisher.auditLog(testEvent);

            // Check if the expected file was created
            const expectedFile = path.join(logsDir, testCase.expected);
            if (fs.existsSync(expectedFile)) {
                const content = fs.readFileSync(expectedFile, 'utf-8');
                const loggedEvent = JSON.parse(content.trim());

                console.log(`✅ Success: Created ${testCase.expected}`);
                console.log(`   Event logged:`, loggedEvent.metadata);
            } else {
                console.log(`❌ Failed: Expected file ${testCase.expected} was not created`);
            }
        } catch (err) {
            console.log(`❌ Error during test:`, (err as Error).message);
        }

        // Restore original environment
        process.env = originalEnv;
        console.log('');
    }

    console.log('🏁 Test completed! Check the logs directory for generated files.');

    // Show final state
    if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir).filter(f => f.startsWith('audit-offline-') && f.endsWith('.jsonl'));
        console.log('\nGenerated files:');
        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`  📄 ${file} (${stats.size} bytes)`);
        });
    }
}

testPerPodAuditLogs().catch(console.error);
