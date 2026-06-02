const statisticsService = require('../services/statistics/statistics.service');

class StatisticsController {
  async getAdminStats(req, res) {
    try {
      const data = await statisticsService.getAdminStats();
      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new StatisticsController();
