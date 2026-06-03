const axios = require('axios');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class LocationService {
  constructor() {
    this.BASE_URL = 'https://provinces.open-api.vn/api/v2';
    this.CACHE_TTL = 24 * 60 * 60; // 24 hours
  }

  async getProvinces() {
    const cacheKey = 'location:provinces';
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const res = await axios.get(`${this.BASE_URL}/p/`);
      const provinces = res.data || [];

      await redisClient.set(cacheKey, JSON.stringify(provinces), { EX: this.CACHE_TTL });
      return provinces;
    } catch (err) {
      logger.error('LocationService.getProvinces error:', err);
      throw err;
    }
  }

  async getWards(provinceCode) {
    const cacheKey = `location:wards:${provinceCode}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const res = await axios.get(`${this.BASE_URL}/p/${provinceCode}?depth=2`);
      const wards = res.data?.wards || [];

      await redisClient.set(cacheKey, JSON.stringify(wards), { EX: this.CACHE_TTL });
      return wards;
    } catch (err) {
      logger.error(`LocationService.getWards error for province ${provinceCode}:`, err);
      throw err;
    }
  }
}

module.exports = new LocationService();
