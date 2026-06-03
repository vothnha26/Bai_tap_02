const locationService = require('../services/location.service');
const logger = require('../utils/logger');

class LocationController {
  async getProvinces(req, res) {
    try {
      const provinces = await locationService.getProvinces();
      res.json(provinces);
    } catch (err) {
      logger.error('LocationController.getProvinces error:', err);
      res.status(500).json({ message: 'Lỗi tải danh sách tỉnh thành' });
    }
  }

  async getWards(req, res) {
    const { provinceCode } = req.params;
    try {
      const wards = await locationService.getWards(provinceCode);
      res.json(wards);
    } catch (err) {
      logger.error('LocationController.getWards error:', err);
      res.status(500).json({ message: 'Lỗi tải danh sách phường xã' });
    }
  }
}

module.exports = new LocationController();
