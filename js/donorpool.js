const DEFAULT_BUDGET_PER_TYPE = 5;

// One shared pool of nucleotide-sugar donors per monosaccharide type,
// refilled every simulation tick. A factory has to withdraw a unit here
// before it's allowed to actually attach a residue - this is the hard,
// system-wide cap on throughput that staffing levels can't buy past.
class DonorPool {
  constructor(types, budgetPerType = DEFAULT_BUDGET_PER_TYPE) {
    this.budgetPerType = budgetPerType;
    this.remaining = {};
    types.forEach( type => { this.remaining[type] = budgetPerType; });
  }
  resetTick() {
    Object.keys(this.remaining).forEach( type => { this.remaining[type] = this.budgetPerType; });
  }
  withdraw(type) {
    if ((this.remaining[type] || 0) <= 0) {
      return false;
    }
    this.remaining[type]--;
    return true;
  }
  // Adds to one type's remaining budget for the current tick only -
  // resetTick() wipes it back to baseline next tick, so a supply
  // transport has to keep earning this rather than ratcheting it up
  // permanently.
  boost(type,amount) {
    this.remaining[type] = (this.remaining[type] || 0) + amount;
  }
}

export default DonorPool;
