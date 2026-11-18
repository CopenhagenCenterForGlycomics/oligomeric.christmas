import DeliveryElf from './deliveryelf';
import GlycanForest from './glycanforest';
import { TOP_MARGIN, HUD_TOP } from './glycanforest';
import ElfPack from './elfpack';
import { ELF_PACK_WIDTH, ELF_PACK_HEIGHT, get_cargo_icon } from './elfpack';
import Factory, { accepts } from './factory';
import DonorPool from './donorpool';
import CostLedger from './costledger';
import SupplyTransport from './supplytransport';

const TICK_INTERVAL = 1000;
const TOTAL_ELF_POOL = 15;
const MAX_PACK_POPULATION = 4;
const NUTRIENT_BONUS = 2;

// The Golgi stack: a tree moves through these in order. Each stage is a
// compartment (Factory) with its own residency odds and headcount -
// NeuAc capping a glycan is the most "trans"/terminal step biologically,
// so it sits last, after Gal has had a chance to create its substrate.
const PIPELINE_DEFS = [
  { cargo: 'Man',    population: 3, capacity: 3, exitRate: 0.18 },
  { cargo: 'GalNAc', population: 2, capacity: 3, exitRate: 0.16 },
  { cargo: 'GlcA',   population: 2, capacity: 3, exitRate: 0.14 },
  { cargo: 'Xyl',    population: 3, capacity: 2, exitRate: 0.14 },
  { cargo: 'Gal',    population: 2, capacity: 2, exitRate: 0.12 },
  { cargo: 'NeuAc',  population: 3, capacity: 2, exitRate: 0.10 },
];

// cis -> trans accent colour per stage, matching the golgi-stack gradient
// in index.html, so each card visually belongs to its stretch of the stack.
const STAGE_COLORS = ['#3fa9c9','#55b299','#6cba6c','#8ebf55','#b8b24a','#e3a33c'];

const dpr = window.devicePixelRatio || 1;
const CHARGE_ARC_RADIUS = 40 * dpr;

const size_canvases = () => {
  let size = document.querySelector('#forest').getBoundingClientRect();
  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  size.width = size.width * dpr;
  size.height = size.height * dpr;

  for (let canvas of document.querySelectorAll('#forest canvas')) {
    canvas.width = size.width;
    canvas.height = size.height;
  }

  return {w: size.width, h: size.height};
};

let canvas_size = size_canvases();


let forest = new GlycanForest(document.querySelector('#tree_canvas'));

forest.margin = 1.5*ELF_PACK_WIDTH;
forest.resize();

const donorPool = new DonorPool(PIPELINE_DEFS.map( def => def.cargo ));
const costLedger = new CostLedger();

// One supply transport per pipeline stage - each watches its own cargo
// type as an epitope and feeds its own donor type. Epitope and donor
// happen to be the same type for every stage today, but the pairing is
// independent (SupplyTransport takes them separately) so a future stage
// could watch one epitope and pay out a different donor.
const supplyTransports = PIPELINE_DEFS.map( def => new SupplyTransport(def.cargo,{donor: def.cargo, bonus: NUTRIENT_BONUS}) );

const factories = PIPELINE_DEFS.map( def => new Factory(def.cargo,{capacity: def.capacity, exitRate: def.exitRate}) );
factories.forEach( (factory,i) => {
  let next = factories[i+1];
  factory.onRelease = next
    ? (tree) => next.admit(tree)
    : (tree) => tree.notifyPipelineDone();
});

// A tree's root chemistry decides where it enters the stack, rather
// than every root squatting in Man's capacity regardless of whether Man
// can do anything with it - first stage (in cis->trans order) whose
// enzyme actually accepts this root, falling back to the first stage.
const entry_stage_for = (identifier) => {
  let idx = factories.findIndex( factory => accepts(factory.cargoType,identifier) );
  return idx >= 0 ? idx : 0;
};

forest.onTreeCreated = (tree) => {
  tree.pipelineDone = false;
  let stage = entry_stage_for(tree.sugar.root.identifier);
  factories[stage].admit(tree);
};

forest.startGrowing();

setInterval(() => {
  requestAnimationFrame( () => {
    forest.render();
  });
},100);

setInterval(() => {
  donorPool.resetTick();
  costLedger.resetTick();
  forest.ageTrees();
  for (let transport of supplyTransports) {
    transport.tick(forest.findDenseCluster(transport.epitope),donorPool);
  }
  for (let factory of factories) {
    factory.tick(donorPool,costLedger);
  }
  update_hud();
},TICK_INTERVAL);

fetch('images/tree.png')
  .then(res=>{return res.blob()})
  .then(blob=>{
    let img_data = URL.createObjectURL(blob);
    let image = new Image();
    let res = new Promise( resolve => {
      image.onload = () => {
        resolve(image);
      };
    });
    image.src = img_data;
    return res;
  }).then( image => {
    let canv = forest.planted_canvas;
    for (let i = 0; i < 10; i++) {
      canv.getContext('2d').drawImage(image,1.5*ELF_PACK_WIDTH + (Math.random()*(canv.width-3*(ELF_PACK_WIDTH))), TOP_MARGIN + (Math.random()*(canv.height-TOP_MARGIN)),ELF_PACK_WIDTH,ELF_PACK_WIDTH);
    }
  });


const elf_pool_remaining = () => TOTAL_ELF_POOL - factories.reduce( (sum,factory) => sum + factory.pack.population, 0 );

const adjust_population = (factory,delta) => {
  let next = factory.pack.population + delta;
  if (next < 1 || next > MAX_PACK_POPULATION) {
    return;
  }
  if (delta > 0 && elf_pool_remaining() <= 0) {
    return;
  }
  factory.pack.population = next;
  update_hud();
};

const hud = document.querySelector('#hud-cards');

const set_bar = (bar_el,fraction) => {
  bar_el.style.width = `${Math.max(0,Math.min(1,fraction))*100}%`;
  bar_el.classList.toggle('empty',fraction <= 0);
  bar_el.classList.toggle('low', fraction > 0 && fraction < 0.4);
};

const build_hud = () => {
  hud.innerHTML = '';
  factories.forEach( (factory,i) => {
    let card = document.createElement('div');
    card.className = 'factory-card';
    card.style.borderTopColor = STAGE_COLORS[i];
    let dots = Array.from({length: factory.capacity}, () => '<span class="dot"></span>').join('');
    card.innerHTML = `
      <div class="factory-name"><span class="factory-icon" data-role="icon"></span>${factory.cargoType}</div>
      <div class="factory-dots" data-role="dots">${dots}</div>
      <div class="factory-waiting" data-role="waiting"></div>
      <div class="bar"><div class="bar-fill" data-role="donor-fill"></div></div>
      <div class="factory-elves">
        <button type="button" data-action="dec">-</button>
        <span data-role="population"></span>
        <button type="button" data-action="inc">+</button>
      </div>
    `;
    card.querySelector('[data-action="dec"]').addEventListener('click', () => adjust_population(factory,-1));
    card.querySelector('[data-action="inc"]').addEventListener('click', () => adjust_population(factory,1));
    hud.appendChild(card);
    get_cargo_icon(factory.cargoType).then( icon => {
      card.querySelector('[data-role="icon"]').appendChild(icon);
    });
  });
  let cost_card = document.createElement('div');
  cost_card.className = 'factory-card cost-card';
  cost_card.innerHTML = `
    <div class="factory-name">Cell upkeep</div>
    <div class="bar"><div class="bar-fill" data-role="cost-fill"></div></div>
    <div data-role="pool"></div>
  `;
  hud.appendChild(cost_card);
  update_hud();
};

const update_hud = () => {
  factories.forEach( (factory,i) => {
    let card = hud.children[i];
    if ( ! card ) {
      return;
    }
    let dots = card.querySelectorAll('[data-role="dots"] .dot');
    dots.forEach( (dot,slot) => dot.classList.toggle('filled', slot < factory.occupancy) );
    card.querySelector('[data-role="waiting"]').textContent = factory.waiting.length ? `+${factory.waiting.length} waiting` : '';
    set_bar(card.querySelector('[data-role="donor-fill"]'), donorPool.remaining[factory.cargoType] / donorPool.budgetPerType);
    card.querySelector('[data-role="population"]').textContent = factory.pack.population;
    card.querySelector('[data-action="dec"]').disabled = factory.pack.population <= 1;
    card.querySelector('[data-action="inc"]').disabled = factory.pack.population >= MAX_PACK_POPULATION || elf_pool_remaining() <= 0;
  });
  let cost_card = hud.children[factories.length];
  if ( ! cost_card ) {
    return;
  }
  set_bar(cost_card.querySelector('[data-role="cost-fill"]'), 1 - (costLedger.spent / costLedger.allowance));
  cost_card.querySelector('[data-role="pool"]').textContent =
    `${elf_pool_remaining()} elves free` + (costLedger.overBudget ? ' - over budget!' : '');
};

const position_pack = (pack,index,canvas_size) => {
  let slot_width = canvas_size.w / factories.length;
  pack.x = slot_width * (index + 0.5);
  pack.y = HUD_TOP + 0.55*(TOP_MARGIN - HUD_TOP);
};

const packs = PIPELINE_DEFS.map( (def,i) => {
  let pack = new ElfPack(document.querySelector('#elf_canvas'),def.population,def.cargo);
  pack.interval = 2500 + i*300;
  factories[i].assignPack(pack);
  pack.deliverToFactory(factories[i],donorPool,costLedger);
  return pack;
});

build_hud();

const set_positions = () => {
  let canvas_size = size_canvases();
  forest.resize();
  packs.forEach( (pack,i) => position_pack(pack,i,canvas_size) );
}
set_positions();

window.addEventListener("orientationchange", function() {
  setTimeout( () => {
    set_positions();
  },100);
}, false);

setInterval( () => {

requestAnimationFrame(() => {
  let canvas = document.querySelector('#elf_canvas');
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let pack of packs) {
    for (let elf of pack.elves) {
      elf.render();
    }
  }
  supplyTransports.forEach( (transport,i) => draw_charge_arc(ctx,transport,STAGE_COLORS[i]) );
});
},100);

// Minimal: a faint full ring plus a coloured arc growing clockwise from
// 12 o'clock as chargeProgress fills, centred on the transport's current
// densest cluster. Nothing to draw once there's no cluster at all.
function draw_charge_arc(ctx,transport,color) {
  if ( ! transport.clusterCenter) {
    return;
  }
  let { x, y } = transport.clusterCenter;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x,y,CHARGE_ARC_RADIUS,0,Math.PI*2);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 4*dpr;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x,y,CHARGE_ARC_RADIUS,-Math.PI/2,-Math.PI/2 + Math.PI*2*transport.chargeProgress);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4*dpr;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}
