const { createClient } = require('redis');
require('dotenv').config();

// 1. Connect to the real Redis server
const client = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.connect().catch(console.error);

// 2. Create our Wrapper so authController.js doesn't break
const redisClientWrapper = {
  // ── Standard Redis Methods ──
  setEx: async (key, seconds, value) => {
    await client.setEx(key, seconds, String(value));
  },
  get: async (key) => {
    return await client.get(key);
  },
  del: async (key) => {
    await client.del(key);
  },

  // ── Custom Temp User Storage ──
  setTempUser: async (email, userData) => {
    // Redis only stores strings, so we must convert the object to a JSON string!
    const dataString = JSON.stringify(userData);
    await client.setEx(`temp_user:${email}`, 600, dataString);
  },
  
  getTempUser: async (email) => {
    const dataString = await client.get(`temp_user:${email}`);
    if (!dataString) return null;
    return JSON.parse(dataString);
  },
  
  delTempUser: async (email) => {
    await client.del(`temp_user:${email}`);
  },
  
  // ── Expose raw client for rate-limit-redis ──
  rawClient: client
};

module.exports = redisClientWrapper;
