const statisticsRepository = require('../repositories/statistics.repository');

class StatisticsService {
  async getAdminStats() {
    const [topProducts, summary] = await Promise.all([
      statisticsRepository.getTopProductsBySoldCount(10),
      statisticsRepository.getOverallStats()
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
      summary,
      topProducts: formattedTopProducts
    };
  }
}

module.exports = new StatisticsService();
