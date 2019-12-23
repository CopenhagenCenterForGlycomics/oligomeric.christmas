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


const update_pack_position = pack => {
  let elf_count = pack.elves.length;
  let elf_rows = chunk(pack.elves,2);
  let x = pack.x;
  let y = pack.y;
  let row_count = 0;
  for (let row of elf_rows) {
    row.forEach( (elf,i) => {
      elf.home = { x: x + i*ELF_PACK_HEIGHT, y: y + row_count*ELF_PACK_WIDTH };
      if ( ! elf.busy ) {
        elf.x = elf.home.x;
        elf.y = elf.home.y;
      }
    });
    row_count++;
  }
}

const make_delivery = async (elf,cargo,target) => {
  elf.ping = () => {
    target.t.addChild(target.r,3,cargo);
    target.t.deliverycount--;
    target.r.active = false;
    target.t.active = false;
    if (target.t.deliverycount < 1) {
      target.t.tween.play();
      target.t.paused = false;
      if ([...target.t.sugar.composition()].length >= 5) {
        target.t.plant();
      }
    }
    delete elf.ping;
  };
  elf.cargo = await get_cargo_icon(cargo);
  elf.deliverCargoAndReturn(target.t.x,target.t.y - 0.5*target.t.canvas.height);
  target.r.active = true;
  target.t.active = true;
  target.t.tween.pause();
  target.t.paused = true;
  target.t.deliverycount = (target.t.deliverycount || 0) + 1;
};

class ElfPack {
  constructor(canvas,population=1,cargo_type='Man') {
    this.canvas = canvas;
    this.elves = Array(population).fill(null);
    this.elves = this.elves.map( () => new DeliveryElf(canvas));
    this.elves.forEach( elf => {
      elf.name = cargo_type;
    });
    this.x = 0;
    this.y = 0;
    this._interval = 1000;
    this.cargo_type = cargo_type;
  }
  set population(size) {
    while (size > this.elves.length) {
      this.elves.push(new DeliveryElf(this.canvas));
    }
    update_pack_position(this);
  }
  get x() {
    return this.pack_center_x;
  }
  get y() {
    return this.pack_center_y;
  }
  set x(x) {
    this.pack_center_x = x;
    update_pack_position(this);
  }
  set y(y) {
    this.pack_center_y = y;
    update_pack_position(this);
  }
  set interval(interval) {
    window.clearInterval(this.deliveryService);
    this._interval = interval;
    if (this.deliveryService) {
      this.deliverTo(this.target);
    }
  }
  get interval() {
    return this._interval;
  }
  deliverTo(forest) {
    this.target = forest;
    this.deliveryService = setInterval(() => {
      let free_elf = this.elves.filter( elf => ! elf.busy ).shift();
      if ( ! free_elf ) {
        return;
      }
      let target = this.target.targetsFor(this.cargo_type);
      if ( ! target ) {
        return;
      }
      if (Math.random() < 0.5) {
        make_delivery(free_elf,this.cargo_type,target);
      }
    },this.interval);
  }
}

export default ElfPack;
export { ELF_PACK_WIDTH, ELF_PACK_HEIGHT };
