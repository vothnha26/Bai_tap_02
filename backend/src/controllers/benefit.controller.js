const BenefitMaster = require('../models/BenefitMaster');

class BenefitController {
  async getAllBenefits(req, res) {
    try {
      const benefits = await BenefitMaster.find({}).sort({ code: 1 });
      res.json({ status: 'success', data: benefits });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async createBenefit(req, res) {
    try {
      const benefit = await BenefitMaster.create(req.body);
      res.status(201).json({ status: 'success', data: benefit });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateBenefit(req, res) {
    try {
      const benefit = await BenefitMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!benefit) return res.status(404).json({ status: 'error', message: 'Benefit not found' });
      res.json({ status: 'success', data: benefit });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new BenefitController();
