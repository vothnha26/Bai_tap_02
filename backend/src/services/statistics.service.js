const statisticsRepository = require('../repositories/statistics.repository');
const redisClient = require('../config/redis');

class StatisticsService {
  async getAdminStats() {
    const [topProducts, summary, emailQueueLen] = await Promise.all([
      statisticsRepository.getTopProductsBySoldCount(10),
      statisticsRepository.getOverallStats(),
      redisClient.lLen('email_queue').catch(() => 0)
    ]);

    // Tính toán thêm nếu cần (ví dụ: doanh thu từng sản phẩm)
    const formattedTopProducts = topProducts.map(p => {
      const price = p.discountPrice || p.price;
      return {
        ...p.toObject(),
        revenue: p.soldCount * price
      };
    });

    return {
      summary: {
        ...summary,
        emailQueueLen
      },
      topProducts: formattedTopProducts
    };
  }
}

module.exports = new StatisticsService();
