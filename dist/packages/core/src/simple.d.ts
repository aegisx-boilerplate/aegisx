/**
 * Simple AegisX Core - Minimal version for testing
 */
export declare function getVersion(): string;
export declare function getPackageName(): string;
export declare function createAegisXSimple(config?: any): Promise<void>;
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
export declare function isAegisXAvailable(): boolean;
export declare function getFeatures(): string[];
//# sourceMappingURL=simple.d.ts.map