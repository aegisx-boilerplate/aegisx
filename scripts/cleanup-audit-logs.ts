#!/usr/bin/env node

// Cleanup script for old audit log files
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface CleanupConfig {
    maxAgeDays: number;
    dryRun: boolean;
    keepMinFiles: number;
}

async function cleanupAuditLogs(config: CleanupConfig = { maxAgeDays: 7, dryRun: false, keepMinFiles: 3 }) {
    const logsDir = path.resolve(__dirname, '../logs');
    
    if (!fs.existsSync(logsDir)) {
        console.log('No logs directory found, nothing to cleanup.');
        return;
    }

    console.log(`🧹 Cleaning up audit logs older than ${config.maxAgeDays} days...`);
    if (config.dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be deleted\n');
    }

    // Find all audit log files (including rotated/archived ones)
    const logPattern = path.join(logsDir, 'audit-offline-*.jsonl*');
    const logFiles = await glob(logPattern);
    
    if (logFiles.length === 0) {
        console.log('No audit log files found.');
        return;
    }

    console.log(`Found ${logFiles.length} audit log file(s):`);
    
    const now = new Date();
    const cutoffTime = now.getTime() - (config.maxAgeDays * 24 * 60 * 60 * 1000);
    const filesToDelete: string[] = [];
    const filesToKeep: string[] = [];

    // Analyze each file
    for (const logFile of logFiles) {
        const stats = fs.statSync(logFile);
        const fileAge = now.getTime() - stats.mtime.getTime();
        const ageInDays = Math.floor(fileAge / (24 * 60 * 60 * 1000));
        
        const fileName = path.basename(logFile);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (stats.mtime.getTime() < cutoffTime) {
            filesToDelete.push(logFile);
            console.log(`🗑️  ${fileName} (${ageInDays}d old, ${sizeKB}KB) - WILL DELETE`);
        } else {
            filesToKeep.push(logFile);
            console.log(`📄 ${fileName} (${ageInDays}d old, ${sizeKB}KB) - keeping`);
        }
    }

    // Apply minimum files policy
    if (filesToKeep.length < config.keepMinFiles) {
        const sortedByAge = filesToDelete.sort((a, b) => {
            const aStats = fs.statSync(a);
            const bStats = fs.statSync(b);
            return bStats.mtime.getTime() - aStats.mtime.getTime(); // Newest first
        });

        const toPreserve = sortedByAge.slice(0, config.keepMinFiles - filesToKeep.length);
        toPreserve.forEach(file => {
            const index = filesToDelete.indexOf(file);
            if (index > -1) {
                filesToDelete.splice(index, 1);
                filesToKeep.push(file);
                console.log(`🛡️  ${path.basename(file)} - preserved (minimum files policy)`);
            }
        });
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Files to keep: ${filesToKeep.length}`);
    console.log(`   Files to delete: ${filesToDelete.length}`);

    if (filesToDelete.length === 0) {
        console.log('✅ No files need to be deleted.');
        return;
    }

    if (!config.dryRun) {
        console.log('\n🗑️  Deleting old files...');
        let deletedCount = 0;
        let deletedSize = 0;

        for (const file of filesToDelete) {
            try {
                const stats = fs.statSync(file);
                fs.unlinkSync(file);
                deletedCount++;
                deletedSize += stats.size;
                console.log(`   ✅ Deleted ${path.basename(file)}`);
            } catch (err) {
                console.log(`   ❌ Failed to delete ${path.basename(file)}:`, (err as Error).message);
            }
        }

        const sizeMB = Math.round(deletedSize / (1024 * 1024) * 100) / 100;
        console.log(`\n🎉 Cleanup completed: ${deletedCount} files deleted, ${sizeMB}MB freed`);
    } else {
        console.log('\n🔍 DRY RUN - No files were actually deleted');
        console.log('   Run with --execute to perform the cleanup');
    }
}

// CLI handling
const args = process.argv.slice(2);
const config: CleanupConfig = {
    maxAgeDays: 7,
    dryRun: !args.includes('--execute'),
    keepMinFiles: 3
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--days' && i + 1 < args.length) {
        config.maxAgeDays = parseInt(args[i + 1], 10) || 7;
    } else if (arg === '--keep' && i + 1 < args.length) {
        config.keepMinFiles = parseInt(args[i + 1], 10) || 3;
    }
}

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Audit Log Cleanup Tool

Usage: npx ts-node scripts/cleanup-audit-logs.ts [options]

Options:
  --execute           Actually delete files (default: dry run)
  --days <number>     Delete files older than N days (default: 7)
  --keep <number>     Keep at least N files (default: 3)
  --help, -h          Show this help message

Examples:
  npx ts-node scripts/cleanup-audit-logs.ts                # Dry run with defaults
  npx ts-node scripts/cleanup-audit-logs.ts --execute      # Actually delete files
  npx ts-node scripts/cleanup-audit-logs.ts --days 14      # Keep files for 14 days
  npx ts-node scripts/cleanup-audit-logs.ts --keep 5       # Keep at least 5 files
`);
    process.exit(0);
}

cleanupAuditLogs(config).catch(console.error);
