import { createClient } from 'redis';

let lastRedisErrorLogAt = 0;

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-12758.c301.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 12758,
        reconnectStrategy: (retries) => Math.min(retries * 250, 3000),
        keepAlive: 5000
    }
});

redisClient.on('error', (err) => {
    const now = Date.now();
    if (now - lastRedisErrorLogAt > 10000) {
        console.error('Redis Client Error:', err?.code || err?.message || err);
        lastRedisErrorLogAt = now;
    }
});

redisClient.on('reconnecting', () => {
    console.warn('Redis reconnecting...');
});

redisClient.on('ready', () => {
    console.log('Redis client ready.');
});
