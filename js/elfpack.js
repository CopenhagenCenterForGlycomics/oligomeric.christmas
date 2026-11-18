import DeliveryElf from './deliveryelf';
import { ELF_SIZE } from './elf';

import { renderSugar } from './glycantree';

const ELF_PACK_HEIGHT = ELF_SIZE;
const ELF_PACK_WIDTH = ELF_SIZE;

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const cargo_map = new Map();

const get_cargo_icon = async (cargo) => {
  if (cargo_map.has(cargo)) {
    return cargo_map.get(cargo);
  }
  let res = await renderSugar(cargo);
  cargo_map.set(cargo,res);
  return res;
};

get_cargo_icon('Xyl');
get_cargo_icon('Man');
get_cargo_icon('Glc');
get_cargo_icon('Gal');
get_cargo_icon('GalNAc');
get_cargo_icon('Fuc');
get_cargo_icon('GlcA');
get_cargo_icon('NeuAc');


// Workers idle at the two ends of their cisterna, not clustered in the
// middle where the cargo actually sits - half the pack stacked at the
// left edge, half at the right, both at the cisterna's height.
const update_pack_position = pack => {
  let half = Math.ceil(pack.elves.length / 2);
  let left = pack.elves.slice(0,half);
  let right = pack.elves.slice(half);
  let place = (group,x) => {
    group.forEach( (elf,i) => {
      elf.home = { x, y: pack.y + (i - (group.length - 1)/2) * ELF_PACK_HEIGHT };
      if ( ! elf.busy ) {
        elf.x = elf.home.x;
        elf.y = elf.home.y;
      }
    });
  };
  place(left,pack.leftX);
  place(right,pack.rightX);
}

// No safety net: the cargo is a live reference to wherever the tree
// currently is, and the factory keeps rolling its exit chance while
// the elf is in flight. If the glycan has already moved to another
// cisterna by the time the elf lands, the delivery is wasted - the
// donor was already spent and the elf comes home empty-handed.
const make_delivery = async (elf,cargo,target,factory) => {
  // Exposed so DeliveryElf.render() can show, live, whether this
  // delivery is still on track (target.t.currentFactory === factory)
  // or already doomed - the label colour is just that check read back.
  elf.deliveryTarget = target;
  elf.deliveryFactory = factory;
  elf.ping = () => {
    if (target.t.currentFactory === factory) {
      target.t.addChild(target.r,3,cargo);
    }
    target.r.active = false;
    target.t.active = false;
    delete elf.ping;
    elf.deliveryTarget = null;
    elf.deliveryFactory = null;
  };
  elf.cargo = await get_cargo_icon(cargo);
  target.r.active = true;
  target.t.active = true;
  elf.deliverCargoAndReturn(target.t.x,target.t.y - 0.5*target.t.canvas.height);
};

class ElfPack {
  constructor(canvas,population=1,cargo_type='Man') {
    this.canvas = canvas;
    this.elves = Array(population).fill(null);
    this.elves = this.elves.map( () => new DeliveryElf(canvas));
    // Only the first elf on each side carries a name tag - with several
    // elves stacked tight within one (narrow) cisterna band, every elf
    // relabelling the same cargo type on top of each other just blurs
    // into illegible repeated text.
    this.elves.forEach( (elf,i) => {
      elf.name = (i === 0 || i === Math.ceil(population/2)) ? cargo_type : null;
    });
    this.left_x = 0;
    this.right_x = 0;
    this.pack_y = 0;
    this._interval = 1000;
    this.cargo_type = cargo_type;
  }
  get population() {
    return this.elves.length;
  }
  set population(size) {
    while (size > this.elves.length) {
      this.elves.push(new DeliveryElf(this.canvas));
    }
    if (size < this.elves.length) {
      this.elves.length = size;
    }
    update_pack_position(this);
  }
  get leftX() {
    return this.left_x;
  }
  set leftX(x) {
    this.left_x = x;
    update_pack_position(this);
  }
  get rightX() {
    return this.right_x;
  }
  set rightX(x) {
    this.right_x = x;
    update_pack_position(this);
  }
  get y() {
    return this.pack_y;
  }
  set y(y) {
    this.pack_y = y;
    update_pack_position(this);
  }
  set interval(interval) {
    window.clearInterval(this.deliveryService);
    this._interval = interval;
    if (this.deliveryService && this.factory) {
      this.deliverToFactory(this.factory,this.donorPool,this.costLedger);
    }
  }
  get interval() {
    return this._interval;
  }
  deliverToFactory(factory,donorPool,costLedger) {
    this.factory = factory;
    this.donorPool = donorPool;
    this.costLedger = costLedger;
    window.clearInterval(this.deliveryService);
    this.deliveryService = setInterval(() => {
      if (costLedger.overBudget) {
        return;
      }
      let free_elf = this.elves.filter( elf => ! elf.busy ).shift();
      if ( ! free_elf ) {
        return;
      }
      let target = factory.targetFor();
      if ( ! target ) {
        return;
      }
      if (Math.random() >= 0.5) {
        return;
      }
      if ( ! donorPool.withdraw(this.cargo_type) ) {
        return;
      }
      costLedger.chargeDelivery();
      make_delivery(free_elf,this.cargo_type,target,factory);
    },this.interval);
  }
}

export default ElfPack;
export { ELF_PACK_WIDTH, ELF_PACK_HEIGHT, get_cargo_icon };
