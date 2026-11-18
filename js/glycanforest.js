import GlycanTree from './glycantree';

import { Tween } from 'es6-tween';

const dpr = window.devicePixelRatio || 1;


const GROWTH_RATE = 1000;
const MATURATION_TIME = 1*10000;
// HUD_TOP is where the golgi badge/card row starts (clear of the town
// skyline image); TOP_MARGIN is where it ends and trees/decor may begin.
const HUD_TOP = dpr * 170;
const TOP_MARGIN = dpr * 300;
const TREE_SLOTS = 3;
const TREE_SCALE = 0.5;
const TREE_WIDTH = 250;

// A planted tree's signalling relevance decays linearly over this many
// ageTrees() ticks (one per simulation tick), then it's dropped from
// plantedTrees entirely - keeps that list, and the epitope census scan,
// bounded to recently-planted trees rather than growing for the whole
// session.
const MAX_AGE_TICKS = 120;
const ACTIVITY_THRESHOLD = 0.3;

// How close two planted trees (in canvas pixels) have to be to count as
// the same local cluster for supply-transport purposes.
const CLUSTER_RADIUS = 150 * dpr;

const TREE_ROOTS = [
'GlcNAc(b1-4)GlcNAc',
'GalNAc',
'Man',
'Glc',
'Fuc'
];

// Planted trees scatter down a hillside band rather than all crowding
// just under TOP_MARGIN - depth (0 = far/small, 1 = near/large) picks
// both the vertical position and the scale together, so lower-on-screen
// trees read as closer and bigger, like a receding perspective.
const PLANT_BAND_FRACTION = 0.85;
const MIN_PLANT_SCALE = 0.12;
const MAX_PLANT_SCALE = 0.55;
const PLANT_BAND_GAP = 20;

const maybe_plant = (tree) => {
  if (tree.atTop && tree.pipelineDone && ! tree.planting) {
    tree.plant();
  }
};

const plant_tree = (tree,forest) => {
  tree.planting = true;
  forest.trees[forest.trees.indexOf(tree)] = null;
  tree.tween.stop();
  tree.scale = TREE_SCALE;
  tree.y = tree.y - TREE_SCALE*tree.canvas.height;
  tree.x = tree.x - TREE_SCALE*0.5*tree.canvas.width;
  let depth = Math.random();
  let target_y = TOP_MARGIN + PLANT_BAND_GAP*dpr + depth*(forest.canvas.height*PLANT_BAND_FRACTION - TOP_MARGIN);
  let target_scale = (MIN_PLANT_SCALE + depth*(MAX_PLANT_SCALE - MIN_PLANT_SCALE))*dpr;
  forest.planting_trees.push(tree);
  tree.tween = new Tween(tree)
  .to({y: target_y, x: Math.floor(Math.random()*forest.canvas.width), scale: target_scale  },1000)
  .on('complete', () => {
    forest.planting_trees.splice(forest.planting_trees.indexOf(tree),1);
    forest.planted_canvas.getContext('2d').drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width*tree.scale, tree.canvas.height*tree.scale );
    tree.age = 0;
    forest.plantedTrees.push(tree);
  })
  .start();
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
    this.plantedTrees = [];
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
    new_tree.atTop = false;
    new_tree.pipelineDone = true;
    new_tree.notifyPipelineDone = () => {
      new_tree.pipelineDone = true;
      maybe_plant(new_tree);
    };
    let tween = new Tween(new_tree).to({y: TOP_MARGIN},MATURATION_TIME).on('update', () => {
      new_tree.dirty = true;
      if ((new_tree.y - TREE_SCALE*new_tree.canvas.height) <= TOP_MARGIN) {
        tween.pause();
        new_tree.atTop = true;
        maybe_plant(new_tree);
      }
    }).start();
    new_tree.plant = plant_tree.bind(null,new_tree,this);
    new_tree.tween = tween;
    if (this.onTreeCreated) {
      this.onTreeCreated(new_tree);
    }
  }

  startGrowing() {
    this.growing = setInterval(() => {
      this.addTree();
    },GROWTH_RATE);
  }

  // One call per simulation tick. O(plantedTrees) - bounded, since trees
  // past MAX_AGE_TICKS are dropped here rather than kept around forever.
  ageTrees() {
    for (let tree of this.plantedTrees) {
      tree.age++;
    }
    this.plantedTrees = this.plantedTrees.filter( tree => this.activityOf(tree) > 0 );
  }

  activityOf(tree) {
    return Math.max(0, 1 - tree.age/MAX_AGE_TICKS);
  }

  // Densest local cluster of still-active planted trees displaying the
  // given epitope - the tree with the most same-epitope neighbours
  // within CLUSTER_RADIUS, and its neighbourhood's centroid/count. O(n^2)
  // in qualifying tree count, which stays small (ageTrees() prunes it),
  // so trivial - a handful of trees at most, not the whole session's worth.
  findDenseCluster(identifier) {
    let qualifying = this.plantedTrees.filter( tree =>
      this.activityOf(tree) > ACTIVITY_THRESHOLD &&
      [...tree.sugar.composition()].some( r => r.identifier === identifier )
    );
    let best = null;
    for (let tree of qualifying) {
      let neighbors = qualifying.filter( other => {
        let dx = other.x - tree.x;
        let dy = other.y - tree.y;
        return (dx*dx + dy*dy) <= CLUSTER_RADIUS*CLUSTER_RADIUS;
      });
      if ( ! best || neighbors.length > best.density) {
        best = {
          x: neighbors.reduce( (sum,t) => sum + t.x, 0 ) / neighbors.length,
          y: neighbors.reduce( (sum,t) => sum + t.y, 0 ) / neighbors.length,
          density: neighbors.length
        };
      }
    }
    return best;
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
export { TOP_MARGIN, HUD_TOP };