// scripts/replay-audit-offline.ts
// Replay offline audit logs to RabbitMQ (TypeScript version)

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

import { EventPublisher, eventBus } from '../src/core/event-bus';

const logsDir = path.resolve(__dirname, '../logs');

async function replayAllOfflineLogs() {
    // Find all audit-offline-*.jsonl files (supports per-pod/container log files)
    const logPattern = path.join(logsDir, 'audit-offline-*.jsonl');
    const logFiles = await glob(logPattern);

    if (logFiles.length === 0) {
        console.log('No offline audit log files found.');
        return;
    }

    console.log(`Found ${logFiles.length} offline audit log file(s):`, logFiles.map(f => path.basename(f)));

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

    let totalSuccess = 0, totalFail = 0;
    const processedFiles: string[] = [];

    for (const logFile of logFiles) {
        console.log(`\nProcessing ${path.basename(logFile)}...`);

        if (!fs.existsSync(logFile)) {
            console.log(`File ${logFile} no longer exists, skipping.`);
            continue;
        }

        const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
        if (lines.length === 0) {
            console.log(`No events in ${path.basename(logFile)}.`);
            // Remove empty file
            fs.unlinkSync(logFile);
            processedFiles.push(logFile);
            continue;
        }

        let fileSuccess = 0, fileFail = 0;
        for (const line of lines) {
            try {
                const event = JSON.parse(line);
                await EventPublisher.auditLog(event);
                fileSuccess++;
                totalSuccess++;
            } catch (err) {
                console.error(`Failed to replay event from ${path.basename(logFile)}:`, err);
                fileFail++;
                totalFail++;
            }
        }

        // Check RabbitMQ health again before removing the file
        if (fileFail === 0 && eventBus.isConnectionOpen()) {
            fs.unlinkSync(logFile);
            processedFiles.push(logFile);
            console.log(`✅ ${path.basename(logFile)}: All ${fileSuccess} events replayed successfully, file removed.`);
        } else {
            console.log(`⚠️  ${path.basename(logFile)}: ${fileSuccess} succeeded, ${fileFail} failed. File kept.`);
            if (!eventBus.isConnectionOpen()) {
                console.error('RabbitMQ connection lost during replay. Remaining files kept.');
                break;
            }
        }
    }

    console.log(`\n=== Replay Summary ===`);
    console.log(`Total events: ${totalSuccess} succeeded, ${totalFail} failed`);
    console.log(`Processed files: ${processedFiles.length}/${logFiles.length}`);
    if (processedFiles.length > 0) {
        console.log('Successfully processed:', processedFiles.map(f => path.basename(f)));
    }
}

// Support legacy single file replay for backward compatibility
async function replayLegacyLog() {
    const legacyLogFile = path.resolve(__dirname, '../logs/audit-offline.jsonl');

    if (!fs.existsSync(legacyLogFile)) {
        return false;
    }

    console.log('Found legacy audit-offline.jsonl file, processing...');

    const lines = fs.readFileSync(legacyLogFile, 'utf-8').split('\n').filter(Boolean);
    if (lines.length === 0) {
        fs.unlinkSync(legacyLogFile);
        return true;
    }

    // Ensure RabbitMQ is healthy before replay
    try {
        await eventBus.connect();
    } catch (err) {
        console.error('RabbitMQ is not available. Aborting legacy replay.');
        return true;
    }

    let success = 0, fail = 0;
    for (const line of lines) {
        try {
            const event = JSON.parse(line);
            await EventPublisher.auditLog(event);
            success++;
        } catch (err) {
            console.error('Failed to replay legacy event:', err);
            fail++;
        }
    }

    if (fail === 0 && eventBus.isConnectionOpen()) {
        fs.unlinkSync(legacyLogFile);
        console.log(`✅ Legacy file: All ${success} events replayed and file removed.`);
    } else {
        console.log(`⚠️  Legacy file: ${success} succeeded, ${fail} failed. File kept.`);
    }

    return true;
}
async function replay() {
    // First check for legacy single file
    await replayLegacyLog();

    // Then process all per-pod files
    await replayAllOfflineLogs();
}

replay();
