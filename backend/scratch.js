const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./src/config/mongoose');
const Promotion = require('./src/models/Promotion');
const promotionCalculatorFacade = require('./src/services/promotion/promotion.facade');

async function run() {
  await connectDB();
  console.log('--- Connected to MongoDB ---');

  const promotion = await Promotion.findOne({ code: 'ADDON50' });
  if (!promotion) {
    console.log('Promotion ADDON50 not found in DB!');
    process.exit(1);
  }

  const mockItems = [
    {
      productId: '6a1dafb18b414ce2e03f13c2', // iPhone 15 Pro Max
      name: 'iPhone 15 Pro Max',
      price: 19023949,
      quantity: 1
    },
    {
      productId: '6a1dafb18b414ce2e03f13c6', // AirPods Pro 2
      name: 'AirPods Pro 2',
      price: 9673254,
      quantity: 1
    }
  ];

  const result = await promotionCalculatorFacade.calculate(promotion, mockItems, 'user_test', 0);
  console.log('\nCalculate Result:', result);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
