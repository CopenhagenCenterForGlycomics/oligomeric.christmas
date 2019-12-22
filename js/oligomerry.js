import DeliveryElf from './deliveryelf';
import GlycanForest from './glycanforest';

const generate_icon = () => {
  let canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  let ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'green';
  ctx.fill();
  return canvas;
};

window.forest = new GlycanForest(document.querySelector('#tree_canvas'));
window.forest.startGrowing();
setInterval(() => {
  window.forest.render();
},100);

const main_cargo = generate_icon();

window.elves = new Array(1).fill(0).map( () => {
  let elf = new DeliveryElf(document.querySelector('#elf_canvas'));
  elf.x = Math.floor(Math.random() * 25)*32;
  elf.y = Math.floor(Math.random() * 25)*32;
  elf.rotate = 0;
  elf.cargo = main_cargo;
  return elf;
});


setInterval( () => {
  for (let elf of window.elves) {
    if ( ! elf.busy ) {
      while (! elf.targx || Math.abs(elf.targx - elf.x) < 32 || Math.abs(elf.targy - elf.y) < 32 ) {
        elf.targx = 32+Math.floor(Math.random() * 25)*32;
        elf.targy = 32+Math.floor(Math.random() * 25)*32;
      }
      elf.cargo = main_cargo;
      elf.rotate = 0;
    }
    if (Math.random() < 0.5) {
      elf.deliverCargoAndReturn(elf.targx,elf.targy);
    }
  }
},5000);

setInterval( () => {

requestAnimationFrame(() => {
  window.elves[0].canvas.getContext('2d').clearRect(0, 0, window.elves[0].canvas.width, window.elves[0].canvas.height);
  for (let elf of window.elves) {
    elf.render();
  }
});
},100);
