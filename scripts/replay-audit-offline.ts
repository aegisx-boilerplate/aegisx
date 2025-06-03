// scripts/replay-audit-offline.ts
// Replay offline audit logs to RabbitMQ (TypeScript version)

import fs from 'fs';
import path from 'path';
import { EventPublisher } from '../src/utils/event-bus';

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
    let success = 0, fail = 0;
    for (const line of lines) {
        try {
            const event = JSON.parse(line);
            await EventPublisher.auditLog(event);
            success++;
        } catch (err) {
            console.error('Failed to replay event:', err);
            fail++;
        }
    }
    // If all succeeded, remove the file
    if (fail === 0) {
        fs.unlinkSync(logFile);
        console.log(`All ${success} events replayed and offline log removed.`);
    } else {
        console.log(`Replay finished: ${success} succeeded, ${fail} failed. Offline log kept.`);
    }
}

replay();
