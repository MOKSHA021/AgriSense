const otpStore = new Map();
const tempUserStore = new Map(); // ← ADD THIS

const redisClient = {
  setEx: (key, seconds, value) => {
    otpStore.set(key, value);
    setTimeout(() => otpStore.delete(key), seconds * 1000);
    return Promise.resolve();
  },
  get: (key) => Promise.resolve(otpStore.get(key) || null),
  del: (key) => {
    otpStore.delete(key);
    return Promise.resolve();
  },

  // ── Temp user storage ──
  setTempUser: (email, userData) => {
    tempUserStore.set(email, userData);
    setTimeout(() => tempUserStore.delete(email), 600 * 1000); // 10 min
    return Promise.resolve();
  },
  getTempUser: (email) => Promise.resolve(tempUserStore.get(email) || null),
  delTempUser: (email) => {
    tempUserStore.delete(email);
    return Promise.resolve();
  },
};

module.exports = redisClient;
