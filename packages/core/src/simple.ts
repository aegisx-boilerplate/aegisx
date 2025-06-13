/**
 * Simple AegisX Core - Minimal version for testing
 */

export function getVersion(): string {
    return '0.0.1';
}

export function getPackageName(): string {
    return '@aegisx/core';
}

export async function createAegisXSimple(config?: any): Promise<void> {
    console.log('🔧 Initializing AegisX (Simple)...');
    console.log('📋 Config received:', config ? 'Yes' : 'No');

    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('✅ AegisX (Simple) initialized successfully!');
}

export interface SimpleConfig {
    database?: {
        host: string;
        port: number;
        database: string;
    };
    jwt?: {
        secret: string;
        expiresIn?: string;
    };
}

export function isAegisXAvailable(): boolean {
    return true;
}

export function getFeatures(): string[] {
    return [
        'Simple Authentication',
        'Basic JWT Support',
        'Core Configuration',
        'Module Loading'
    ];
} 