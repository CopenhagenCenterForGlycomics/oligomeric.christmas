import DeliveryElf from './deliveryelf';
import GlycanForest from './glycanforest';
import { TOP_MARGIN } from './glycanforest';
import ElfPack from './elfpack';

console.log(TOP_MARGIN);


const size_canvases = () => {
  let size = document.querySelector('#forest').getBoundingClientRect();
  for (let canvas of document.querySelectorAll('#forest canvas')) {
    canvas.width = size.width;
    canvas.height = size.height;
  }
  return {w: size.width, h: size.height};
};

let canvas_size = size_canvases();

let forest = new GlycanForest(document.querySelector('#tree_canvas'));

forest.margin = 50;
forest.resize();

forest.startGrowing();

setInterval(() => {
  requestAnimationFrame( () => {
    forest.render();
  });
},100);



let construct_packs = () => {
  let packs = [];
  let pack = new ElfPack(document.querySelector('#elf_canvas'),3,'Man');
  pack.interval = 4000;
  pack.placement = {t: 1, l: 0};
  packs.push(pack);

  pack = new ElfPack(document.querySelector('#elf_canvas'),3,'Xyl');
  pack.placement = {t: 0, l: 0};
  pack.interval = 6000;
  packs.push(pack);

  pack = new ElfPack(document.querySelector('#elf_canvas'),3,'NeuAc');
  pack.placement = {t: 0, l: 1};
  pack.interval = 6000;
  packs.push(pack);


  pack = new ElfPack(document.querySelector('#elf_canvas'),2,'Gal');
  pack.placement = {t: 1, l: 1};
  pack.interval = 5000;

  packs.push(pack);

  pack = new ElfPack(document.querySelector('#elf_canvas'),2,'GlcA');
  pack.placement = {t: 0.5, l: 1};
  pack.interval = 5000;

  packs.push(pack);

  pack = new ElfPack(document.querySelector('#elf_canvas'),2,'GalNAc');
  pack.placement = {t: 0.5, l: 0};
  pack.interval = 5000;

  packs.push(pack);

  return packs;

};

const position_pack = (pack,canvas_size) => {
  pack.x = canvas_size.w*pack.placement.l + (pack.placement.l <= 0.5 ? 64 : -128 );
  pack.y = TOP_MARGIN + (canvas_size.h - TOP_MARGIN)*pack.placement.t + (pack.placement.t < 0.5 ? 64 : pack.placement.t === 0.5 ? 0 : -128 );
};

let packs = construct_packs();

for (let pack of packs) {
  pack.deliverTo(forest);
  position_pack(pack,canvas_size);
}

setInterval( () => {

requestAnimationFrame(() => {
  let canvas = document.querySelector('#elf_canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  for (let pack of packs) {
    for (let elf of pack.elves) {
      elf.render();
    }
  }
});
},100);
