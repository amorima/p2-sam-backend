import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// res.json is monkey-patched so the body can be captured and stored in cache
// before it is streamed to the client — the original send path is preserved.
export const setCache = (duration, key, visibility = 'private') => (req, res, next) => {
  const cacheKey = key || req.originalUrl;

  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    res.set("Cache-Control", `${visibility}, max-age=${duration}`);
    return res.json(cachedResponse);
  }

  const originalJson = res.json;
  res.json = function (body) {
    if (!res.headersSent && res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(cacheKey, body, duration);
      res.set("Cache-Control", `${visibility}, max-age=${duration}`);
    }
    return originalJson.call(this, body);
  };

  next();
};

export const deleteCache = (prefix) => (req, res, next) => {
  console.log(`Cache invalidate → ${prefix}`);
  const keys = cache.keys();
  keys.forEach((k) => {
    if (k.startsWith(prefix)) cache.del(k);
  });
  next();
};
