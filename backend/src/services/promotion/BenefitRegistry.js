/**
 * Abstract class for Benefit Strategies
 */
class BaseBenefitStrategy {
  /**
   * Apply the benefit logic
   * @param {Object} context - Data needed to apply benefit (membership, amount, etc)
   * @param {any} benefitValue - The value defined in Tier.benefits[].value
   */
  apply(context, benefitValue) {
    throw new Error('Strategy must implement apply() method');
  }
}

class PointMultiplierStrategy extends BaseBenefitStrategy {
  /**
   * @param {Object} context - { basePoints: number }
   * @param {number} multiplier - multiplier value
   */
  apply(context, multiplier) {
    const { basePoints } = context;
    return Math.floor(basePoints * (multiplier || 1.0));
  }
}

class BenefitRegistry {
  constructor() {
    this.strategies = new Map();
    this.registerDefaults();
  }

  register(code, strategy) {
    this.strategies.set(code.toUpperCase(), strategy);
  }

  get(code) {
    return this.strategies.get(code.toUpperCase());
  }

  registerDefaults() {
    this.register('POINT_MULTIPLIER', new PointMultiplierStrategy());
    // Other benefits like FREE_SHIPPING are usually handled in Checkout logic, 
    // but the registry provides the value.
  }
}

module.exports = new BenefitRegistry();
