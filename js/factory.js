const HARD_RESIDUE_CAP = 30;

// Which substrate identifiers each donor's enzyme can land on. Shared by
// the in-factory substrate filter and by entry-stage routing (see
// `accepts`), so a tree's starting stage is derived from this table
// rather than a separate hard-coded assumption.
const SUBSTRATE_COMPATIBILITY = {
  Gal: ['GlcNAc','GalNAc','Fuc','Glc'],
  GalNAc: ['GlcNAc'],
  GlcA: ['Gal','GalNAc','Man','GlcNAc'],
  Man: ['GlcNAc','Man'],
  Xyl: ['Gal','Man'],
  Fuc: ['Gal','Man','Glc'],
  NeuAc: ['Gal'],
};

const accepts = (donor,identifier) => (SUBSTRATE_COMPATIBILITY[donor] || []).indexOf(identifier) >= 0;

const filter_substrate = (donor,substrate) => accepts(donor,substrate.r.identifier);

const filter_depth = (substrate) => {
  for (let kid of substrate.r.children) {
    if (kid.children.length > 0) {
      return false;
    }
  }
  return true;
};

// A Golgi compartment. Holds up to `capacity` glycans at a time; every
// tick each resident has `exitRate` odds of moving on to the next stage
// (or finishing, for the last one) - a constant per-tick exit chance is
// just a geometric dwell-time distribution, cheap to simulate without
// sampling anything upfront. While resident, this factory's assigned
// elf pack may attach its cargo residue, gated by the shared donor
// budget and cost ledger.
class Factory {
  constructor(cargoType, {capacity = 3, exitRate = 0.12} = {}) {
    this.cargoType = cargoType;
    this.capacity = capacity;
    this.exitRate = exitRate;
    this.residents = [];
    this.waiting = [];
    this.pack = null;
    this.onRelease = null;
  }

  get occupancy() {
    return this.residents.length;
  }

  assignPack(pack) {
    this.pack = pack;
  }

  admit(tree) {
    tree.currentFactory = this;
    if (this.residents.length < this.capacity) {
      this.residents.push(tree);
    } else {
      this.waiting.push(tree);
    }
  }

  _promoteWaiting() {
    while (this.waiting.length && this.residents.length < this.capacity) {
      this.residents.push(this.waiting.shift());
    }
  }

  release(tree) {
    let idx = this.residents.indexOf(tree);
    if (idx >= 0) {
      this.residents.splice(idx,1);
    }
    tree.currentFactory = null;
    this._promoteWaiting();
    if (this.onRelease) {
      this.onRelease(tree);
    }
  }

  // Per-tick residency roll. O(residents in this factory) - trivial,
  // capacity is a handful of trees at most. The hard cap exists purely
  // to protect render/layout cost: legra-glycan.js re-lays-out the whole
  // sugar on every residue added, so growing one glycan to n residues is
  // O(n^2) overall - fine at the sizes the budget/residency system is
  // meant to produce, not fine if something runs away to hundreds.
  tick(donorPool, costLedger) {
    if (this.pack) {
      costLedger.chargeUpkeep(this.pack.elves.length);
    }
    for (let tree of [...this.residents]) {
      if (tree.active) {
        continue;
      }
      let over_cap = [...tree.sugar.composition()].length >= HARD_RESIDUE_CAP;
      if (over_cap || Math.random() < this.exitRate) {
        this.release(tree);
      }
    }
  }

  targetFor() {
    let candidates = this.residents.map( t => [...t.sugar.composition()].map( r => { return { t, r }; } ) ).flat();
    let potential = [
      filter_substrate.bind(null,this.cargoType),
      filter_depth,
      res => res.r.children.length < 2,
      res => (! res.t.active) && (! res.r.active)
    ].reduce( (arr,func) => arr.filter(func) , candidates);
    return potential[Math.floor(Math.random()*potential.length)];
  }
}

export default Factory;
export { accepts };
