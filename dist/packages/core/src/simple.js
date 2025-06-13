"use strict";
/**
 * Simple AegisX Core - Minimal version for testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = getVersion;
exports.getPackageName = getPackageName;
exports.createAegisXSimple = createAegisXSimple;
exports.isAegisXAvailable = isAegisXAvailable;
exports.getFeatures = getFeatures;
function getVersion() {
    return '0.0.1';
}
function getPackageName() {
    return '@aegisx/core';
}
async function createAegisXSimple(config) {
    console.log('🔧 Initializing AegisX (Simple)...');
    console.log('📋 Config received:', config ? 'Yes' : 'No');
    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ AegisX (Simple) initialized successfully!');
}
function isAegisXAvailable() {
    return true;
}
function getFeatures() {
    return [
        'Simple Authentication',
        'Basic JWT Support',
        'Core Configuration',
        'Module Loading'
    ];
}
//# sourceMappingURL=simple.js.map