// Two independent ways for one of these to deliver a nutrient boost to
// its paired donor type this tick:
//  - a flat per-tick random roll - the "basically fires randomly" floor,
//    independent of anything else happening in the forest.
//  - a charge circle that fills while a dense local cluster of this
//    transport's epitope persists (fill speed scales with density - a
//    denser cluster pays off faster), firing and resetting once full.
//    If the cluster breaks up before completing, the charge decays back
//    down gradually rather than snapping to zero.
// Both re-evaluated fresh every tick off live forest state - nothing
// here accumulates permanently, matching how DonorPool.boost() itself
// only ever applies for the current tick.
const AMBIENT_FIRE_CHANCE = 0.02;
const MIN_CLUSTER_DENSITY = 2;
const FILL_RATE_PER_DENSITY = 0.05;
const DECAY_RATE = 0.04;

class SupplyTransport {
  constructor(epitope,{donor = epitope, bonus = 2} = {}) {
    this.epitope = epitope;
    this.donor = donor;
    this.bonus = bonus;
    this.chargeProgress = 0;
    this.clusterCenter = null;
    this.justFired = null;
  }
  tick(cluster,donorPool) {
    this.justFired = null;
    if (Math.random() < AMBIENT_FIRE_CHANCE) {
      donorPool.boost(this.donor,this.bonus);
      this.justFired = 'ambient';
    }
    if (cluster && cluster.density >= MIN_CLUSTER_DENSITY) {
      this.clusterCenter = cluster;
      this.chargeProgress += FILL_RATE_PER_DENSITY * cluster.density;
      if (this.chargeProgress >= 1) {
        this.chargeProgress = 0;
        donorPool.boost(this.donor,this.bonus);
        this.justFired = this.justFired || 'charge';
      }
    } else {
      this.chargeProgress = Math.max(0,this.chargeProgress - DECAY_RATE);
      if (this.chargeProgress <= 0) {
        this.clusterCenter = null;
      }
    }
  }
}

export default SupplyTransport;
