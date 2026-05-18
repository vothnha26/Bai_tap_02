const Product = require('../models/Product');

class StatisticsRepository {
  async getTopProductsBySoldCount(limit = 10) {
    return await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(limit)
      .select('name price discountPrice soldCount viewCount images');
  }

  async getOverallStats() {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalSoldCount: { $sum: '$soldCount' },
          totalRevenue: { 
            $sum: { 
              $multiply: [
                '$soldCount', 
                { $ifNull: ['$discountPrice', '$price'] } 
              ] 
            } 
          },
          totalProducts: { $sum: 1 }
        }
      }
    ]);
    return stats[0] || { totalSoldCount: 0, totalRevenue: 0, totalProducts: 0 };
  }
}

module.exports = new StatisticsRepository();
