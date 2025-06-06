import { FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';
import { config } from '../config/config';

const redis = new Redis(config.redis.url);

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxAttempts: number; // Maximum attempts allowed in window
    blockDurationMs: number; // How long to block after exceeding limit
    keyGenerator?: (request: FastifyRequest) => string; // Custom key generator
    skipSuccessfulRequests?: boolean; // Don't count successful requests
    skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitInfo {
    totalHits: number;
    remainingPoints: number;
    msBeforeNext: number;
    isBlocked: boolean;
}

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const key = config.keyGenerator
            ? config.keyGenerator(request)
            : `rate_limit:${request.ip}`;

        try {
            const info = await getRateLimitInfo(key, config);

            // Add rate limit headers
            reply.header('X-RateLimit-Limit', config.maxAttempts);
            reply.header('X-RateLimit-Remaining', Math.max(0, info.remainingPoints));
            reply.header('X-RateLimit-Reset', new Date(Date.now() + info.msBeforeNext).toISOString());

            if (info.isBlocked) {
                reply.header('Retry-After', Math.ceil(info.msBeforeNext / 1000));
                return reply.code(429).send({
                    success: false,
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil(info.msBeforeNext / 1000),
                });
            }

            // Store rate limit info for post-processing
            (request as any).rateLimit = {
                key,
                config,
                info,
            };

        } catch (error) {
            // Log error but don't block request on rate limit failure
            console.error('Rate limit middleware error:', error);
        }
    };
}

/**
 * Post-request handler to update rate limit counters
 */
export async function updateRateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
    success: boolean
) {
    const rateLimitData = (request as any).rateLimit;
    if (!rateLimitData) return;

    const { key, config } = rateLimitData;

    // Skip counting based on configuration
    if (success && config.skipSuccessfulRequests) return;
    if (!success && config.skipFailedRequests) return;

    try {
        await incrementRateLimit(key, config);
    } catch (error) {
        console.error('Failed to update rate limit:', error);
    }
}

/**
 * Get current rate limit information for a key
 */
async function getRateLimitInfo(
    key: string,
    config: RateLimitConfig
): Promise<RateLimitInfo> {
    const multi = redis.multi();
    const blockKey = `${key}:blocked`;
    const countKey = `${key}:count`;

    // Check if currently blocked
    multi.get(blockKey);
    multi.get(countKey);
    multi.ttl(countKey);

    const results = await multi.exec();
    if (!results) throw new Error('Redis multi-exec failed');

    const [blockedResult, countResult, ttlResult] = results;
    const isBlocked = blockedResult[1] !== null;
    const currentCount = parseInt(countResult[1] as string || '0');
    const ttl = ttlResult[1] as number;

    if (isBlocked) {
        const blockTtl = await redis.ttl(blockKey);
        return {
            totalHits: currentCount,
            remainingPoints: 0,
            msBeforeNext: blockTtl * 1000,
            isBlocked: true,
        };
    }

    const remainingPoints = Math.max(0, config.maxAttempts - currentCount);
    const msBeforeNext = ttl > 0 ? ttl * 1000 : config.windowMs;

    return {
        totalHits: currentCount,
        remainingPoints,
        msBeforeNext,
        isBlocked: false,
    };
}

/**
 * Increment rate limit counter for a key
 */
async function incrementRateLimit(
    key: string,
    config: RateLimitConfig
): Promise<void> {
    const multi = redis.multi();
    const countKey = `${key}:count`;
    const blockKey = `${key}:blocked`;

    // Increment counter
    multi.incr(countKey);
    multi.expire(countKey, Math.ceil(config.windowMs / 1000));

    const results = await multi.exec();
    if (!results) throw new Error('Redis multi-exec failed');

    const newCount = results[0][1] as number;

    // Check if we should block
    if (newCount >= config.maxAttempts) {
        const blockSeconds = Math.ceil(config.blockDurationMs / 1000);
        await redis.setex(blockKey, blockSeconds, '1');
    }
}

/**
 * Reset rate limit for a specific key
 */
export async function resetRateLimit(key: string): Promise<void> {
    const multi = redis.multi();
    multi.del(`${key}:count`);
    multi.del(`${key}:blocked`);
    await multi.exec();
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
    // Strict rate limiting for authentication endpoints
    auth: {
        windowMs: config.rateLimiting.auth.windowMs,
        maxAttempts: config.rateLimiting.auth.maxAttempts,
        blockDurationMs: config.rateLimiting.auth.blockDurationMs,
        keyGenerator: (request: FastifyRequest) => `auth_rate_limit:${request.ip}`,
        skipSuccessfulRequests: true, // Only count failed login attempts
    },

    // More lenient for password reset
    passwordReset: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxAttempts: 3, // 3 attempts per hour
        blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
        keyGenerator: (request: FastifyRequest) => `pwd_reset_rate_limit:${request.ip}`,
    },

    // API rate limiting
    api: {
        windowMs: config.rateLimiting.api.windowMs,
        maxAttempts: config.rateLimiting.api.maxRequests,
        blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
        keyGenerator: (request: FastifyRequest) => {
            // Use API key if available, otherwise IP
            const apiKey = request.headers['x-api-key'] as string;
            return apiKey
                ? `api_rate_limit:key:${apiKey}`
                : `api_rate_limit:ip:${request.ip}`;
        },
    },

    // Registration rate limiting
    registration: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxAttempts: 5, // 5 registrations per hour per IP
        blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
        keyGenerator: (request: FastifyRequest) => `reg_rate_limit:${request.ip}`,
    },
};
