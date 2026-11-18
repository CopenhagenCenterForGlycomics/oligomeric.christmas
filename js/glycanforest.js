import GlycanTree from './glycantree';

import { Tween } from 'es6-tween';

const dpr = window.devicePixelRatio || 1;


const GROWTH_RATE = 1000;
// HUD_TOP is where the golgi badge/card row starts (clear of the town
// skyline image); TOP_MARGIN is where the stack/forest are allowed to
// start, so they never render under the HUD.
const HUD_TOP = dpr * 170;
const TOP_MARGIN = dpr * 300;
const TREE_SCALE = 0.5;

// Classical Golgi stack geometry: cis sits at the bottom of the page,
// trans at the vertical middle - cargo climbs the stack a cisterna at
// a time rather than growing continuously, so its height always
// reflects which factory currently holds it.
const STACK_GAP = dpr * 24;

// Display forest - where finished glycans end up - is a thin strip
// pinned just above the trans face rather than sprawling across most
// of the screen, so the stack below it (the actual factory) gets the
// bulk of the space. Smaller band, same tree count, so it also reads
// denser for free.
const FOREST_HEIGHT = dpr * 200;
const FOREST_GAP = dpr * 24;

// How long a stage-to-stage climb takes - quick relative to a
// factory's multi-second dwell time, so it reads as "stepping up into
// the next cisterna" rather than a slow drift.
const STAGE_TRANSIT_TIME = 900;

// Concurrently-growing (unplanted) trees are capped at this multiple
// of the number of pipeline stages - keeps canvas render cost bounded
// while still allowing more than one glycan in flight per cisterna.
const MAX_GROWING_PER_STAGE = 2;

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

// Planted trees scatter through the (narrow) forest strip rather than
// all crowding at one edge - depth (0 = far/small, 1 = near/large)
// picks both the vertical position and the scale together, so
// lower-in-the-strip trees read as closer and bigger, like a receding
// perspective.
const MIN_PLANT_SCALE = 0.12;
const MAX_PLANT_SCALE = 0.55;
const PLANT_BAND_GAP = 20;

const LIFETIME_BAR_WIDTH = 34*dpr;
const LIFETIME_BAR_HEIGHT = 5*dpr;
const LIFETIME_BAR_GAP = 4*dpr;

// How much of its expected dwell time (1/exitRate ticks) a resident
// has used up, as a 0 (just arrived) to 1 (overdue to move on)
// fraction - separate from GlycanForest's own planted-tree `age`,
// which only starts once a glycan has left the pipeline for good.
// Tree.stageAge is maintained by Factory.tick()/admit().
const draw_lifetime_bar = (ctx,tree,bounds) => {
  if ( ! tree.currentFactory) {
    return;
  }
  let max_age = 1 / tree.currentFactory.exitRate;
  let fraction = Math.max(0, 1 - (tree.stageAge || 0) / max_age);
  let x = tree.x - LIFETIME_BAR_WIDTH/2;
  let raw_y = tree.y - TREE_SCALE*tree.canvas.height - LIFETIME_BAR_GAP - LIFETIME_BAR_HEIGHT;
  // Clamped to its own cisterna for the same reason the sprite is
  // clipped there - a tall glycan shouldn't push its bar up into the
  // compartment above.
  let y = bounds ? Math.max(bounds.top,raw_y) : raw_y;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x,y,LIFETIME_BAR_WIDTH,LIFETIME_BAR_HEIGHT);
  ctx.fillStyle = fraction <= 0 ? '#c44' : (fraction < 0.4 ? '#d93' : '#4a8');
  ctx.fillRect(x,y,LIFETIME_BAR_WIDTH*fraction,LIFETIME_BAR_HEIGHT);
};

const plant_tree = (tree,forest) => {
  tree.planting = true;
  forest.trees.splice(forest.trees.indexOf(tree),1);
  if (tree.stageTween) {
    tree.stageTween.stop();
  }
  tree.scale = TREE_SCALE;
  tree.y = tree.y - TREE_SCALE*tree.canvas.height;
  tree.x = tree.x - TREE_SCALE*0.5*tree.canvas.width;
  let depth = Math.random();
  let target_scale = (MIN_PLANT_SCALE + depth*(MAX_PLANT_SCALE - MIN_PLANT_SCALE))*dpr;
  // Planted sprites are drawn top-left anchored (see the drawImage call
  // below), so they extend *downward* from y by their full scaled
  // height - without reserving that height here, a well-grown glycan's
  // sprite spills past forestBottom and over the top cisternae.
  let sprite_height = tree.canvas.height * target_scale;
  let band_top = forest.forestTop + PLANT_BAND_GAP*dpr;
  let band_bottom = Math.max(band_top, forest.forestBottom - PLANT_BAND_GAP*dpr - sprite_height);
  let target_y = band_top + depth*(band_bottom - band_top);
  let target_x = forest.margin + Math.random()*(forest.canvas.width - 2*forest.margin);
  forest.planting_trees.push(tree);
  tree.tween = new Tween(tree)
  .to({y: target_y, x: target_x, scale: target_scale  },1000)
  .on('complete', () => {
    forest.planting_trees.splice(forest.planting_trees.indexOf(tree),1);
    forest.planted_canvas.getContext('2d').drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width*tree.scale, tree.canvas.height*tree.scale );
    tree.age = 0;
    forest.plantedTrees.push(tree);
  })
  .start();
};

class GlycanForest {
  constructor(canvas,stageCount=1) {
    this.canvas = canvas;
    this.stageCount = stageCount;
    this.margin = 0;
    this.planting_trees = [];
    this.planting_canvas = document.createElement('canvas');
    this.planting_canvas.width = canvas.width;
    this.planting_canvas.height = canvas.height;
    this.canvas.parentNode.appendChild(this.planting_canvas);

    this.planted_canvas = document.createElement('canvas');
    this.planted_canvas.width = canvas.width;
    this.planted_canvas.height = canvas.height;
    this.canvas.parentNode.appendChild(this.planted_canvas);

    this.trees = [];
    this.plantedTrees = [];
  }

  // cis-face cisterna sits here, right at the foot of the page.
  get stackBottom() {
    return this.canvas.height - STACK_GAP;
  }

  // trans-face cisterna sits here - literally the vertical middle of
  // the page, per the classical stack diagram.
  get stackTop() {
    return this.canvas.height * 0.5;
  }

  get bandHeight() {
    return (this.stackBottom - this.stackTop) / this.stageCount;
  }

  // Cargo is drawn bottom-anchored (sprite grows upward from this y as
  // residues are added), so it belongs at the cisterna's floor, not
  // its centre - anchoring at the centre only leaves half a band's
  // worth of headroom before a grown glycan pokes into the band above.
  bandFloorY(stage) {
    return this.stackBottom - this.bandHeight*stage;
  }

  // [top,bottom) of the cisterna for `stage` - used to hard-clip cargo
  // rendering so a glycan that outgrows its band's headroom is cropped
  // rather than bleeding into a neighbouring compartment.
  bandBounds(stage) {
    return { top: this.stackBottom - this.bandHeight*(stage + 1), bottom: this.bandFloorY(stage) };
  }

  // Several pipeline stages can share one (taller) cisterna - each
  // still gets its own worker sub-row within that shared band, evenly
  // splitting its height, so two factories' packs don't land on top of
  // each other.
  subRowCenterY(stage,indexInGroup,groupSize) {
    let bounds = this.bandBounds(stage);
    let row_h = (bounds.bottom - bounds.top) / groupSize;
    return bounds.top + row_h*(indexInGroup + 0.5);
  }

  get forestBottom() {
    return this.stackTop - FOREST_GAP;
  }

  get forestTop() {
    return Math.max(TOP_MARGIN, this.forestBottom - FOREST_HEIGHT);
  }

  resize() {
    this.activeTrees.forEach( tree => {
      if (tree.stage !== undefined) {
        tree.x = this.canvas.width*0.5 + (tree.jitterX || 0);
        tree.y = this.bandFloorY(tree.stage);
        tree.dirty = true;
      }
    });
  }

  get activeTrees() {
    return this.trees;
  }

  // Moves `tree` into the cisterna for pipeline stage `stage`. First
  // placement (no prior stage) snaps straight there; later moves glide,
  // which is what reads on screen as the glycan passing up through
  // each compartment in turn.
  setTreeStage(tree,stage) {
    tree.stage = stage;
    let target = { x: this.canvas.width*0.5 + (tree.jitterX || 0), y: this.bandFloorY(stage) };
    if (tree.stageTween) {
      tree.stageTween.stop();
    }
    if (tree.y === undefined) {
      tree.x = target.x;
      tree.y = target.y;
      tree.dirty = true;
      return;
    }
    tree.stageTween = new Tween(tree).to(target,STAGE_TRANSIT_TIME).on('update', () => {
      tree.dirty = true;
    }).start();
  }

  addTree() {
    if (this.trees.length >= this.stageCount * MAX_GROWING_PER_STAGE) {
      return;
    }
    let new_tree = new GlycanTree(TREE_ROOTS[Math.floor(Math.random()*TREE_ROOTS.length)]);
    new_tree.jitterX = (Math.random() - 0.5) * 0.3 * this.canvas.width;
    this.trees.push(new_tree);
    new_tree.pipelineDone = false;
    new_tree.notifyPipelineDone = () => {
      new_tree.pipelineDone = true;
      if ( ! new_tree.planting) {
        new_tree.plant();
      }
    };
    new_tree.plant = plant_tree.bind(null,new_tree,this);
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
    let pctx = this.planting_canvas.getContext('2d');
    pctx.clearRect(0,0,this.planting_canvas.width,this.planting_canvas.height);
    // A glycan can be large when it graduates out of the stack, and
    // converting it from bottom-anchored to top-left-anchored at that
    // moment can leave it starting well above (or spanning well below)
    // the forest strip - clip to the forest band itself so the
    // one-second flight into it never sprawls into the HUD above or
    // the trans cisterna below.
    pctx.save();
    pctx.beginPath();
    pctx.rect(0,this.forestTop,this.planting_canvas.width,this.forestBottom - this.forestTop);
    pctx.clip();
    for (let tree of this.planting_trees) {
      pctx.drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width*tree.scale, tree.canvas.height*tree.scale );
    }
    pctx.restore();

    // Full clearRect below means every active tree has to be redrawn
    // whenever ANY of them is dirty, not just the dirty ones - most
    // trees now sit still between stage transitions, so redrawing only
    // the dirty subset was erasing the stationary rest and never
    // putting them back.
    if ( ! this.activeTrees.some( tree => tree.dirty ) ) {
      return;
    }
    let ctx = this.canvas.getContext('2d');
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let tree of this.activeTrees) {
      const tree_size = { width: tree.canvas.width, height: tree.canvas.height };
      // Clip to the tree's own cisterna - a glycan can keep gaining
      // residues (and canvas height) while it sits in one band, so
      // without this a big enough one bleeds into the band above.
      let bounds = tree.stage !== undefined ? this.bandBounds(tree.stage) : null;
      ctx.save();
      if (bounds) {
        ctx.beginPath();
        ctx.rect(0,bounds.top,this.canvas.width,bounds.bottom - bounds.top);
        ctx.clip();
      }
      ctx.drawImage(tree.canvas,
        0,
        0,
        tree_size.width,tree_size.height,
        tree.x - TREE_SCALE*0.5*tree_size.width,
        tree.y - TREE_SCALE*tree_size.height,
        TREE_SCALE*tree_size.width,TREE_SCALE*tree_size.height );
      ctx.restore();
      draw_lifetime_bar(ctx,tree,bounds);
      tree.dirty = false;
    }
  }
}

export default GlycanForest;
export { TOP_MARGIN, HUD_TOP };
