// scripts/replay-audit-offline.ts
// Replay offline audit logs to RabbitMQ (TypeScript version)

import fs from 'fs';
import path from 'path';

import { EventPublisher, eventBus } from '../src/core/event-bus';

const logFile = path.resolve(__dirname, '../logs/audit-offline.jsonl');


async function replay() {
    if (!fs.existsSync(logFile)) {
        console.log('No offline audit log file found.');
        return;
    }
    const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
    if (lines.length === 0) {
        console.log('No events to replay.');
        return;
    }

    // Ensure RabbitMQ is healthy before replay
    try {
        await eventBus.connect();
    } catch (err) {
        console.error('RabbitMQ is not available. Aborting replay.');
        return;
    }
    if (!eventBus.isConnectionOpen()) {
        console.error('RabbitMQ connection is not open. Aborting replay.');
        return;
    }

    let success = 0, fail = 0;
    for (const line of lines) {
        try {
            const event = JSON.parse(line);
            // รองรับ per-pod log file: ถ้าใช้ audit-offline-<pod>.jsonl, สามารถใช้ script นี้กับแต่ละไฟล์ได้
            await EventPublisher.auditLog(event);
            success++;
        } catch (err) {
            console.error('Failed to replay event:', err);
            fail++;
        }
    }

    // Check RabbitMQ health again before removing the file
    if (fail === 0 && eventBus.isConnectionOpen()) {
        fs.unlinkSync(logFile);
        console.log(`All ${success} events replayed and offline log removed.`);
    } else {
        console.log(`Replay finished: ${success} succeeded, ${fail} failed. Offline log kept.`);
        if (!eventBus.isConnectionOpen()) {
            console.error('RabbitMQ connection lost during replay. Offline log kept.');
        }
    }
}

replay();
