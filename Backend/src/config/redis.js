let Redis;
let redisClient = null;

const REDIS_URL = process.env.REDIS_URL || process.env.REDISTOGO_URL || process.env.REDISCLOUD_URL || process.env.REDIS_TLS_URL;

if (REDIS_URL) {
  Redis = require('ioredis');
  const url = REDIS_URL;
  const useTLS = url.includes('upstash.io') || url.startsWith('rediss://');
  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    ...(useTLS ? { tls: {} } : {})
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected');
  });
} else {
  Redis = require('ioredis-mock');
  redisClient = new Redis({ data: {} });
  console.log('Using mock Redis (in-memory cache)');
}

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err.message);
    return null;
  }
};

const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.error('Redis set error:', err.message);
  }
};

const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error('Redis clear error:', err.message);
  }
};

const invalidatePrefix = async (prefix) => {
  await clearCache(`${prefix}*`);
};

module.exports = { redisClient, getCache, setCache, clearCache, invalidatePrefix };
