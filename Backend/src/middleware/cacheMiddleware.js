const { getCache, setCache } = require('../config/redis');

const cache = (ttlSeconds = 300) => {
  return (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    getCache(key).then(cached => {
      if (cached) {
        console.log(`⚡ REDIS CACHE HIT  → ${req.originalUrl} (${ttlSeconds}s TTL)`);
        return res.json(cached);
      }

      console.log(`❌ REDIS CACHE MISS → ${req.originalUrl} (guardando por ${ttlSeconds}s)`);
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        setCache(key, body, ttlSeconds);
        originalJson(body);
      };
      next();
    }).catch(() => next());
  };
};

const clearCacheFor = (...prefixes) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      originalJson(body);
      if (res.statusCode < 400) {
        const { invalidatePrefix } = require('../config/redis');
        prefixes.forEach(p => {
          console.log(`🗑️ REDIS CACHE CLEAR → ${p}*`);
          invalidatePrefix(p);
        });
      }
    };
    next();
  };
};

module.exports = { cache, clearCacheFor };
