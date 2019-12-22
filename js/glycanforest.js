import GlycanTree from './glycantree';

import { Tween } from 'es6-tween';

const GROWTH_RATE = 1000;
const MATURATION_TIME = 3*60000;
const TREE_SLOTS = 10;
const TREE_SCALE = 0.5;

class GlycanForest {
  constructor(canvas) {
    this.canvas = canvas;
    this.trees = Array(10).fill(null);
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
    let new_tree = new GlycanTree('Gal(b1-4)Xyl');
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
  }

  targetsFor(residue) {
    let all_composition = this.activeTrees.map( t => [...t.sugar.composition()].map( r => { return { t, r }; } ) ).flat();
    let right_substrates = all_composition.filter( res => res.r.identifier === 'Gal');
    let not_crowded = right_substrates.filter( res => res.r.children.length < 3 );
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
    let dirty_trees = this.activeTrees.filter( tree => tree.dirty );    
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