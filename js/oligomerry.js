import DeliveryElf from '../modules/deliveryelf.mjs'


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

const main_cargo = generate_icon();

window.elves = new Array(60).fill(0).map( () => {
  let elf = new DeliveryElf(document.querySelector('canvas'));
  elf.x = Math.floor(Math.random() * 25)*32;
  elf.y = Math.floor(Math.random() * 25)*32;
  elf.direction = (Math.random() < 0.5 ? -1 : 1);
  elf.cargo = main_cargo;
  return elf;
});

setInterval( () => {
requestAnimationFrame(() => {
  window.elves[0].canvas.getContext('2d').clearRect(0, 0, window.elves[0].canvas.width, window.elves[0].canvas.height);
  for (let elf of window.elves) {
    if (Math.random() < 0.01) {
      elf.direction = (Math.random() < 0.5 ? -1 : 1);
    }

    elf.rotate += elf.direction * 30;
    elf.render();
  }
});
},100);
