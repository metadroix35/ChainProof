import Redis from 'ioredis';

// Allow mocking/ignoring Redis if not yet configured for local dev
const redisUrl = process.env.REDIS_URL || '';

// If we have a URL, create a client, else provide a mock implementation so it works silently
const getRedisClient = () => {
    if (redisUrl) {
        return new Redis(redisUrl);
    }
    console.warn("No REDIS_URL provided. Using an in-memory mock for local development.");
    const store = new Map<string, string>();
    return {
        get: async (key: string) => store.get(key) || null,
        set: async (key: string, value: string, _mode?: string, _duration?: number) => {
            store.set(key, value);
            return 'OK';
        }
    } as unknown as Redis;
};

export const redis = getRedisClient();
