import GlycanTree from './glycantree';

import { Tween } from 'es6-tween';

const GROWTH_RATE = 1000;
const MATURATION_TIME = 3*60000;
const TREE_SLOTS = 3;
const TREE_SCALE = 0.5;

const TREE_ROOTS = [
'GlcNAc(b1-4)GlcNAc',
'GalNAc',
'Man',
'Glc',
'Fuc'
];

const filter_substrate = (donor,substrate) => {
  switch (donor) {
    case 'Gal':
      return ['GlcNAc','GalNAc'].indexOf(substrate.r.identifier) >= 0;
    case 'Man':
      return ['GlcNAc','Man'].indexOf(substrate.r.identifier) >= 0;
    case 'Xyl':
      return ['Gal','Man'].indexOf(substrate.r.identifier) >= 0;
    case 'Fuc':
      return ['Gal','Man','Glc'].indexOf(substrate.r.identifier) >= 0;
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
    this.trees = Array(TREE_SLOTS).fill(null);
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
    new_tree.x = (1 + slot) * (this.canvas.width / (TREE_SLOTS + 1) ) ;
    this.trees[slot] = new_tree;
    let tween = new Tween(new_tree).to({y: 0},MATURATION_TIME).on('update', () => {
      new_tree.dirty = true;
      if ((new_tree.y - TREE_SCALE*new_tree.canvas.height) < 0) {
        Object.defineProperty(new_tree, 'dirty', {
          get: () => true,
          set: () => {}
        });
        tween.pause();
      }
    }).start();
    new_tree.tween = tween;
  }

  targetsFor(residue) {
    let all_composition = this.activeTrees.map( t => [...t.sugar.composition()].map( r => { return { t, r }; } ) ).flat();
    let right_substrates = all_composition.filter( filter_substrate.bind(null,residue) );
    let not_deep = right_substrates.filter( filter_depth );
    let not_crowded = not_deep.filter( res => res.r.children.length < 3 );
    let not_busy = not_crowded.filter( res => ! res.r.active );
    let potential = not_busy;
    return potential[Math.floor(Math.random()*potential.length)];
  }

  startGrowing() {
    this.growing = setInterval(() => {
      this.addTree();
    },GROWTH_RATE);
  }

  render() {
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