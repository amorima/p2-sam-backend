import NodeCache from "node-cache";

// stdTTL: seconds before an entry expires automatically
// checkperiod: how often (seconds) the auto-cleanup runs
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * setCache(duration, key?)
 * Middleware that serves from server cache when available, otherwise
 * fetches from DB and stores the result. Also sets HTTP Cache-Control
 * so the client can cache the response for `duration` seconds.
 */
export const setCache = (duration, key) => (req, res, next) => {
  const cacheKey = key || req.originalUrl;

  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    console.log(`Cache hit  → ${cacheKey}`);
    res.set("Cache-Control", `public, max-age=${duration}`);
    return res.json(cachedResponse);
  }

  console.log(`Cache miss → ${cacheKey}`);

  // Intercept res.json so the response body is stored before being sent
  res.originalJSON = res.json.bind(res);
  res.json = (body) => {
    cache.set(cacheKey, body, duration);
    res.set("Cache-Control", `public, max-age=${duration}`);
    return res.originalJSON(body);
  };

  next();
};

/**
 * deleteCache(prefix)
 * Middleware that removes all cached entries whose key starts with `prefix`.
 * Handles paginated endpoints where the key includes query params
 * (e.g. "/needs?limit=25&offset=0").
 */
export const deleteCache = (prefix) => (req, res, next) => {
  console.log(`Cache invalidate → ${prefix}`);
  const keys = cache.keys();
  keys.forEach((k) => {
    if (k.startsWith(prefix)) cache.del(k);
  });
  next();
};
