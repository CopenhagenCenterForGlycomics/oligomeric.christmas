const DEFAULT_ALLOWANCE = 30;
const UPKEEP_COST_PER_ELF = 1;
const DELIVERY_COST = 4;

// Tracks the metabolic cost of running the Golgi this tick: every
// assigned elf costs upkeep just for being staffed, every completed
// delivery costs more on top. Once spend crosses the allowance,
// factories stop accepting new deliveries until the next tick resets it.
class CostLedger {
  constructor(allowance = DEFAULT_ALLOWANCE) {
    this.allowance = allowance;
    this.spent = 0;
  }
  resetTick() {
    this.spent = 0;
  }
  get overBudget() {
    return this.spent >= this.allowance;
  }
  chargeUpkeep(elfCount) {
    this.spent += elfCount * UPKEEP_COST_PER_ELF;
  }
  chargeDelivery() {
    this.spent += DELIVERY_COST;
  }
}

export default CostLedger;
