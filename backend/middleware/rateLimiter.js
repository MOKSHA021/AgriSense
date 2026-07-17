const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default || require('rate-limit-redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const redisClientWrapper = require('../config/redis');

// ==========================================
// 1. GLOBAL FIXED WINDOW LIMITER (Fallback)
// ==========================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: { message: 'Too many requests, please try again after 15 minutes' },
  skip: (req, res) => process.env.NODE_ENV !== 'production',
  store: new RedisStore({
    sendCommand: (...args) => redisClientWrapper.rawClient.sendCommand(args),
  }),
});

// ==========================================
// 2. SPECIALIZED TOKEN BUCKET LIMITERS
// ==========================================
const createTokenBucket = (keyPrefix, points, duration, message) => {
  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClientWrapper.rawClient,
    keyPrefix: keyPrefix,
    points: points,     // Burst capacity
    duration: duration, // Time in seconds to completely refill the bucket
  });

  return (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      return next(); // Bypass rate limiting in development
    }
    
    rateLimiter.consume(req.ip, 1)
      .then((rateLimiterRes) => {
        res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
        next();
      })
      .catch((rateLimiterRes) => {
        res.setHeader('Retry-After', Math.round(rateLimiterRes.msBeforeNext / 1000));
        res.setHeader('X-RateLimit-Remaining', 0);
        res.status(429).json({ message: message || 'Too many requests, please try again later.' });
      });
  };
};

// POST /login -> Burst: 5, Refill: 1 token / 1 min -> Total refill time: 5 * 60 = 300s
const loginLimiter = createTokenBucket(
  'login_limit', 5, 300, 
  'Too many login attempts. Please wait 1 minute before trying again.'
);

// POST /register -> Burst: 3, Refill: 1 token / 15 mins -> Total refill time: 3 * 900 = 2700s
const registerLimiter = createTokenBucket(
  'register_limit', 3, 2700, 
  'Too many registration attempts. Please try again later.'
);

// POST /send-otp -> Burst: 3, Refill: 1 token / 10 mins -> Total refill time: 3 * 600 = 1800s
const sendOtpLimiter = createTokenBucket(
  'send_otp_limit', 3, 1800, 
  'Too many OTP requests. Please wait before requesting another.'
);

// POST /verify-otp -> Burst: 5, Refill: 1 token / 10 mins -> Total refill time: 5 * 600 = 3000s
const verifyOtpLimiter = createTokenBucket(
  'verify_otp_limit', 5, 3000, 
  'Too many failed attempts. Please wait before verifying again.'
);

// POST /predict/* -> Burst: 10, Refill: 1 token / 1 min -> Total refill time: 10 * 60 = 600s
const predictLimiter = createTokenBucket(
  'predict_limit', 10, 600, 
  'ML prediction rate limit exceeded. Please wait a moment before trying again.'
);

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  sendOtpLimiter,
  verifyOtpLimiter,
  predictLimiter
};
