import GlycanTree from './glycantree';

import { Tween } from 'es6-tween';

const GROWTH_RATE = 1000;
const MATURATION_TIME = 1*10000;
const TOP_MARGIN = 128;
const TREE_SLOTS = 3;
const TREE_SCALE = 0.5;
const TREE_WIDTH = 250;

const TREE_ROOTS = [
'GlcNAc(b1-4)GlcNAc',
'GalNAc',
'Man',
'Glc',
'Fuc'
];

const plant_tree = (tree,forest) => {
  tree.planting = true;
  forest.trees[forest.trees.indexOf(tree)] = null;
  tree.tween.stop();
  tree.scale = TREE_SCALE;
  tree.y = tree.y - TREE_SCALE*tree.canvas.height;
  tree.x = tree.x - TREE_SCALE*0.5*tree.canvas.width;
  let min_scale = Math.max(0.1,TREE_SCALE*Math.random()*0.5);
  forest.planting_trees.push(tree);
  tree.tween = new Tween(tree)
  .to({y: TOP_MARGIN - min_scale*tree.canvas.height, x: Math.floor(Math.random()*forest.canvas.width), scale: min_scale  },1000)
  .on('complete', () => {
    forest.planting_trees.splice(forest.planting_trees.indexOf(tree),1);
    forest.planted_canvas.getContext('2d').drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width*tree.scale, tree.canvas.height*tree.scale );
  })
  .start();
};

const filter_substrate = (donor,substrate) => {
  switch (donor) {
    case 'Gal':
      return ['GlcNAc','GalNAc','Fuc','Glc'].indexOf(substrate.r.identifier) >= 0;
    case 'GalNAc':
      return ['GlcNAc'].indexOf(substrate.r.identifier) >= 0;
    case 'GlcA':
      return ['Gal','GalNAc','Man','GlcNAc'].indexOf(substrate.r.identifier) >= 0;
    case 'Man':
      return ['GlcNAc','Man'].indexOf(substrate.r.identifier) >= 0;
    case 'Xyl':
      return ['Gal','Man'].indexOf(substrate.r.identifier) >= 0;
    case 'Fuc':
      return ['Gal','Man','Glc'].indexOf(substrate.r.identifier) >= 0;
    case 'NeuAc':
      return ['Gal'].indexOf(substrate.r.identifier) >= 0;
    default:
      return false;
  }
};

const filter_depth = (substrate) => {
  let r = substrate.r;
  let kids = r.children;
  for (let kid of r.children) {
    if (kid.children.length > 0) {
      return false;
    }
  }
  return true;
};

class GlycanForest {
  constructor(canvas) {
    this.canvas = canvas;
    this.planting_trees = [];
    this.planting_canvas = document.createElement('canvas');
    this.planting_canvas.width = canvas.width;
    this.planting_canvas.height = canvas.height;
    this.canvas.parentNode.appendChild(this.planting_canvas);

    this.planted_canvas = document.createElement('canvas');
    this.planted_canvas.width = canvas.width;
    this.planted_canvas.height = canvas.height;
    this.canvas.parentNode.appendChild(this.planted_canvas);

    this.trees = Array(TREE_SLOTS).fill(null);
  }

  resize() {
    let available_space = this.canvas.width - 2*this.margin;
    let slot_space = Math.floor(available_space / TREE_WIDTH);
    if (this.trees.length > Math.min(slot_space,TREE_SLOTS)) {
      this.trees = this.trees.slice( 0, Math.min(slot_space,TREE_SLOTS) );      
    } else {
      while (this.trees.length < Math.min(slot_space,TREE_SLOTS)) {
        this.trees.push(null);
      }
    }
    this.trees = this.trees.slice( 0, Math.min(slot_space,TREE_SLOTS) );
    this.activeTrees.forEach( (tree,slot) => {
      tree.x = this.margin + ((1 + slot) * (available_space / (this.trees.length + 1) )) ;
    });
  }

  get activeTrees() {
    return this.trees.filter( t => t );
  }

  addTree() {
    let free_slots = this.trees.map( (o,i) => (o === null) ?  i : null );
    if (free_slots.length === 0) {
      return;
    }
    let slot = free_slots[Math.floor(Math.random()*free_slots.length)];
    if ( ! slot && slot !== 0 ) {
      return;
    }
    let new_tree = new GlycanTree(TREE_ROOTS[Math.floor(Math.random()*TREE_ROOTS.length)]);
    new_tree.y = this.canvas.height;
    this.trees[slot] = new_tree;
    this.resize();
    let tween = new Tween(new_tree).to({y: TOP_MARGIN},MATURATION_TIME).on('update', () => {
      new_tree.dirty = true;
      if ((new_tree.y - TREE_SCALE*new_tree.canvas.height) <= TOP_MARGIN) {
        tween.pause();
        if ( ! new_tree.planting ) {
          setTimeout( () => {
            new_tree.plant();
          });
        }
      }
    }).start();
    new_tree.plant = plant_tree.bind(null,new_tree,this);
    new_tree.tween = tween;
  }

  targetsFor(residue) {
    let all_composition = this.activeTrees.map( t => [...t.sugar.composition()].map( r => { return { t, r }; } ) ).flat();
    let potential = [
      filter_substrate.bind(null,residue),
      filter_depth,
      res => res.r.children.length < 2,
      res => (! res.t.active) && (! res.r.active),
      res => [...res.t.sugar.composition()].length < 5
    ].reduce( (arr,func) => arr.filter(func) , all_composition );
    return potential[Math.floor(Math.random()*potential.length)];
  }

  startGrowing() {
    this.growing = setInterval(() => {
      this.addTree();
    },GROWTH_RATE);
  }

  render() {
    this.planting_canvas.getContext('2d').clearRect(0,0,this.planting_canvas.width,this.planting_canvas.height);
    for (let tree of this.planting_trees) {
      this.planting_canvas.getContext('2d').drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width*tree.scale, tree.canvas.height*tree.scale );
    }

    let dirty_trees = this.activeTrees.filter( tree => tree.dirty || tree.paused );    
    if (dirty_trees.length < 1) {
      return;
    }
    this.canvas.getContext('2d').clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let tree of dirty_trees) {
      const tree_size = { width: tree.canvas.width, height: tree.canvas.height };
      this.canvas.getContext('2d').drawImage(tree.canvas,
        0,
        0,
        tree_size.width,tree_size.height,
        tree.x - TREE_SCALE*0.5*tree_size.width,
        tree.y - TREE_SCALE*tree_size.height,
        TREE_SCALE*tree_size.width,TREE_SCALE*tree_size.height );
      tree.dirty = false;
    }
  }
}

export default GlycanForest;
export { TOP_MARGIN };