/**
 * Logger Utility
 * Centralized logging interface for the application
 */

interface LogContext {
    [key: string]: any;
}

export interface Logger {
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
}

// Default console logger implementation
class ConsoleLogger implements Logger {
    info(message: string, context?: LogContext): void {
        console.log(JSON.stringify({
            level: 'info',
            message,
            timestamp: new Date().toISOString(),
            ...context
        }));
    }

    warn(message: string, context?: LogContext): void {
        console.warn(JSON.stringify({
            level: 'warn',
            message,
            timestamp: new Date().toISOString(),
            ...context
        }));
    }

    error(message: string, context?: LogContext): void {
        console.error(JSON.stringify({
            level: 'error',
            message,
            timestamp: new Date().toISOString(),
            ...context
        }));
    }

    debug(message: string, context?: LogContext): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(JSON.stringify({
                level: 'debug',
                message,
                timestamp: new Date().toISOString(),
                ...context
            }));
        }
    }
}

// Export singleton logger instance
export const logger: Logger = new ConsoleLogger();

// For compatibility with existing code that might use default export
export default logger;
