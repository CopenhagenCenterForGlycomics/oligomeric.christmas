import DeliveryElf from './deliveryelf';
import GlycanForest from './glycanforest';
import ElfPack from './elfpack';



window.forest = new GlycanForest(document.querySelector('#tree_canvas'));
window.forest.startGrowing();
setInterval(() => {
  window.forest.render();
},100);

let packs = [];

let pack = new ElfPack(document.querySelector('#elf_canvas'),3,'Man');
pack.x = 32;
pack.y = 32;
pack.interval = 4000;

pack.deliverTo(window.forest);

packs.push(pack);

pack = new ElfPack(document.querySelector('#elf_canvas'),3,'Xyl');
pack.x = 700;
pack.y = 500;
pack.interval = 6000;

pack.deliverTo(window.forest);

packs.push(pack);

pack = new ElfPack(document.querySelector('#elf_canvas'),2,'Gal');
pack.x = 700;
pack.y = 300;
pack.interval = 5000;

pack.deliverTo(window.forest);

packs.push(pack);


// window.elves = new Array(1).fill(0).map( () => {
//   let elf = new DeliveryElf(document.querySelector('#elf_canvas'));
//   elf.x = Math.floor(Math.random() * 25)*32;
//   elf.y = Math.floor(Math.random() * 25)*32;
//   elf.rotate = 0;
//   elf.cargo = main_cargo;
//   return elf;
// });


// setInterval( () => {
//   for (let elf of window.elves) {
//     if ( ! elf.busy ) {
//       while (! elf.targx || Math.abs(elf.targx - elf.x) < 32 || Math.abs(elf.targy - elf.y) < 32 ) {
//         elf.targx = 32+Math.floor(Math.random() * 25)*32;
//         elf.targy = 32+Math.floor(Math.random() * 25)*32;
//       }
//       elf.cargo = main_cargo;
//       elf.rotate = 0;
//     }
//   }
// },5000);

setInterval( () => {

requestAnimationFrame(() => {
  pack.canvas.getContext('2d').clearRect(0, 0, pack.canvas.width, pack.canvas.height);
  for (let pack of packs) {
    for (let elf of pack.elves) {
      elf.render();
    }
  }
});
},100);
