"use strict";
(self["webpackChunkoligomerry"] = self["webpackChunkoligomerry"] || []).push([["oligomerry"],{

/***/ 646
/*!**************************************!*\
  !*** ./js/oligomerry.js + 9 modules ***!
  \**************************************/
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


;// ./js/elf.js
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var MAP_URL = 'images/tilemap_elf.png';
var dpr = window.devicePixelRatio || 1;
var OUTPUT_SIZE = dpr > 1 ? 48 * dpr : 64 * dpr;
var INPUT_SIZE = 128;
var ROTATE_DELTA = 30;
var init_map = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    return fetch(MAP_URL).then(res => {
      return res.blob();
    }).then(blob => {
      var img_data = URL.createObjectURL(blob);
      var image = new Image();
      image.src = img_data;
      return image;
    });
  });
  return function init_map() {
    return _ref.apply(this, arguments);
  };
}();
var IMAGE_MAP_PROMISE = init_map();
class Elf {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.rotate = 0;
  }
  render() {
    var _this = this;
    return _asyncToGenerator(function* () {
      var map = yield IMAGE_MAP_PROMISE;
      var ctx = _this.canvas.getContext('2d');
      if (_this.rotate < 0) {
        _this.rotate += 360;
      }
      var normalised_angle = _this.rotate % 360;
      ctx.drawImage(map, Math.floor(_this.rotate % 360 / ROTATE_DELTA) * INPUT_SIZE, 0, INPUT_SIZE, INPUT_SIZE, _this.x - 0.5 * OUTPUT_SIZE, _this.y - 0.5 * OUTPUT_SIZE, OUTPUT_SIZE, OUTPUT_SIZE);
    })();
  }
}

/* harmony default export */ const elf = (Elf);
// EXTERNAL MODULE: ./node_modules/es6-tween/bundled/Tween.min.js
var Tween_min = __webpack_require__(88);
;// ./js/deliveryelf.js
function deliveryelf_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function deliveryelf_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { deliveryelf_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { deliveryelf_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;


var rad = angle => angle * (Math.PI / 180);
var deliveryelf_dpr = window.devicePixelRatio || 1;
var CARGO_DISTANCE = 32 * deliveryelf_dpr;
var CARGO_ICON_SIZE = 32;
var CARGO_OUTPUT_SIZE = 32 * deliveryelf_dpr;

// How long an elf takes to cross a pixel of travel - the speed knob.
// Cisternae now span the full page width with workers at the edges and
// cargo in the middle, and deliveries have no safety net (factory.js),
// so this has to be fast enough that a delivery can plausibly beat the
// factory's exit roll, not just slow set-dressing.
var MS_PER_PIXEL = 3;
CanvasRenderingContext2D.prototype.roundRect = function (sx, sy, ex, ey, r) {
  var r2d = Math.PI / 180;
  if (ex - sx - 2 * r < 0) {
    r = (ex - sx) / 2;
  } //ensure that the radius isn't too large for x
  if (ey - sy - 2 * r < 0) {
    r = (ey - sy) / 2;
  } //ensure that the radius isn't too large for y
  this.beginPath();
  this.moveTo(sx + r, sy);
  this.lineTo(ex - r, sy);
  this.arc(ex - r, sy + r, r, r2d * 270, r2d * 360, false);
  this.lineTo(ex, ey - r);
  this.arc(ex - r, ey - r, r, r2d * 0, r2d * 90, false);
  this.lineTo(sx + r, ey);
  this.arc(sx + r, ey - r, r, r2d * 90, r2d * 180, false);
  this.lineTo(sx, sy + r);
  this.arc(sx + r, sy + r, r, r2d * 180, r2d * 270, false);
  this.closePath();
};
var LABEL_IDLE = 'rgba(200,200,200,0.5)';
var LABEL_DELIVERING = 'rgba(70,190,90,0.85)';
var LABEL_DOOMED = 'rgba(210,60,60,0.85)';
var render_label = function render_label(label, x, y, canvas) {
  var fill = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : LABEL_IDLE;
  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = fill;
  ctx.roundRect(-0.5 * OUTPUT_SIZE, 0.5 * OUTPUT_SIZE, 0.5 * OUTPUT_SIZE, OUTPUT_SIZE, OUTPUT_SIZE / 10);
  ctx.fill();
  ctx.font = "".concat(deliveryelf_dpr * 16, "px Helvetica, sans-serif");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(100,100,100,1)";
  ctx.fillText(label, 0, 0.75 * OUTPUT_SIZE);
  ctx.restore();
};
(0,Tween_min.autoPlay)(true); // simplify the your code

var go_to = function go_to(x, y) {
  var outbound = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var coords = {
    x: this.x,
    y: this.y,
    rotate: this.rotate
  };
  var first_target = outbound ? {
    x: x,
    y: this.y
  } : {
    y: y,
    x: this.x
  };
  var total_distance = Math.abs(y - this.y) + Math.abs(x - this.x);
  var second_target = {
    x,
    y
  };
  var tween_first_target = new Tween_min.Tween(coords).to(first_target, MS_PER_PIXEL / deliveryelf_dpr * (Math.abs(first_target.x - this.x) + Math.abs(first_target.y - this.y))).easing(Tween_min.Easing.Linear).on('update', _ref => {
    var x = _ref.x,
      y = _ref.y;
    this.rotate = -90 + Math.atan2(first_target.y - this.y, first_target.x - this.x) * 180 / Math.PI;
    this.x = x;
    this.y = y;
    coords.rotate = this.rotate;
  });
  var tween_rotate = new Tween_min.Tween(coords).to({
    rotate: -90 + Math.atan2(y - first_target.y, x - first_target.x) * 180 / Math.PI
  }, 500).on('update', _ref2 => {
    var rotate = _ref2.rotate;
    this.rotate = rotate;
  });
  var tween_final_target = new Tween_min.Tween(coords).to({
    x,
    y
  }, MS_PER_PIXEL / deliveryelf_dpr * (Math.abs(first_target.x - x) + Math.abs(first_target.y - y))).easing(Tween_min.Easing.Linear).on('update', _ref3 => {
    var x = _ref3.x,
      y = _ref3.y;
    this.rotate = -90 + Math.atan2(y - this.y, x - this.x) * 180 / Math.PI;
    this.x = x;
    this.y = y;
  });
  tween_rotate.on('complete', () => {
    tween_final_target.start();
  });
  tween_first_target.on('complete', () => {
    tween_rotate.start();
  });
  tween_first_target.start();
  return new Promise(resolve => {
    tween_final_target.on('complete', resolve);
  });
};

// Need an ElfPack class - regulates the
// rate and number of elves that are
// active at any given time

class DeliveryElf extends elf {
  constructor(canvas) {
    super(canvas);
  }
  // Set home
  // .home
  // (Move to new home if not at home)

  go_to(x, y) {
    go_to.call(this, x, y);
  }
  deliverCargoAndReturn(x, y) {
    var _this = this;
    return deliveryelf_asyncToGenerator(function* () {
      if (_this.busy) {
        return;
      }
      var start = {
        x: _this.x,
        y: _this.y
      };
      _this.busy = true;
      yield go_to.call(_this, x, y);
      if (_this.ping) {
        _this.ping();
      }
      _this.cargo = null;
      yield go_to.call(_this, start.x, start.y, false);
      _this.busy = false;
      if (_this.home) {
        _this.x = _this.home.x;
        _this.y = _this.home.y;
      }
    })();
  }

  // .name

  // .cargo
  render() {
    super.render();
    var cargo_x = this.x + Math.floor(Math.cos(rad(this.rotate + 90)) * CARGO_DISTANCE);
    var cargo_y = this.y + Math.floor(Math.sin(rad(this.rotate + 90)) * CARGO_DISTANCE);
    var ctx = this.canvas.getContext('2d');
    if (this.name) {
      var fill = LABEL_IDLE;
      if (this.cargo) {
        var on_track = this.deliveryTarget && this.deliveryTarget.t.currentFactory === this.deliveryFactory;
        fill = on_track ? LABEL_DELIVERING : LABEL_DOOMED;
      }
      render_label(this.name, this.x, this.y, this.canvas, fill);
    }
    if (this.cargo) {
      ctx.drawImage(this.cargo, 0, 0, CARGO_ICON_SIZE, CARGO_ICON_SIZE, cargo_x - 0.5 * CARGO_OUTPUT_SIZE, cargo_y - 0.5 * CARGO_OUTPUT_SIZE, CARGO_OUTPUT_SIZE, CARGO_OUTPUT_SIZE);
    }
  }
}
/* harmony default export */ const deliveryelf = (DeliveryElf);
// EXTERNAL MODULE: ./node_modules/glycan.js/js/main.js + 34 modules
var main = __webpack_require__(724);
// EXTERNAL MODULE: ./node_modules/legra-glycan.js/js/main.js + 2 modules
var js_main = __webpack_require__(312);
;// ./js/glycantree.js


var Iupac = main.CondensedIupac.IO;
class IupacSugar extends Iupac(main.Sugar) {}
class PackedLayout extends main.SugarAwareLayout {
  static get DELTA_X() {
    return super.DELTA_X;
  }
  static get DELTA_Y() {
    return 0.5;
  }
}
class PaintWatcher extends js_main.LegraCanvasRenderer {
  paint() {
    js_main.LegraCanvasRenderer.prototype.paint.call(this);
    if (this.onpaint) {
      this.onpaint();
    }
  }
}
var renderSugar = seq => {
  var res = document.createElement('canvas');
  res.setAttribute('width', '32px');
  res.setAttribute('height', '32px');
  var res_canv = document.createElement('canvas');
  var sugar = new IupacSugar();
  sugar.sequence = seq;
  var renderer = new PaintWatcher(res, PackedLayout);
  var result = renderer.ready.then(() => {
    return new Promise(resolve => {
      renderer.onpaint = () => {
        setTimeout(() => {
          res_canv.width = 32;
          res_canv.height = 32;
          res_canv.getContext('2d').drawImage(res, 50, 50, 100, 100, 0, 0, 32, 32);
          resolve(res_canv);
        }, 0);
      };
    });
  });
  renderer.addSugar(sugar);
  renderer.refresh();
  return result;
};

// Properties x & y

class GlycanTree {
  constructor(sequence) {
    this.canvas = document.createElement('canvas');
    var sugar = new IupacSugar();
    sugar.sequence = sequence;
    this.sugar = sugar;
    main.SugarAwareLayout.LINKS = false;
    var renderer = new PaintWatcher(this.canvas, PackedLayout);
    renderer.onpaint = () => {
      this.dirty = true;
    };
    this.renderer = renderer;
    renderer.addSugar(sugar);
    renderer.refresh();
  }
  addChild() {
    var res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.sugar.root;
    var link = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;
    var seq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Gal';
    var mono_clazz = this.sugar.constructor.Monosaccharide;
    var mono = new mono_clazz(seq);
    mono.anomer = 'u';
    mono.parent_linkage = 1;
    res.addChild(link, mono);
    this.renderer.refresh();
  }
}
/* harmony default export */ const glycantree = (GlycanTree);

;// ./js/glycanforest.js


var glycanforest_dpr = window.devicePixelRatio || 1;
var GROWTH_RATE = 1000;
// HUD_TOP is where the golgi badge/card row starts (clear of the town
// skyline image); TOP_MARGIN is where the stack/forest are allowed to
// start, so they never render under the HUD.
var HUD_TOP = glycanforest_dpr * 170;
var TOP_MARGIN = glycanforest_dpr * 300;
var TREE_SCALE = 0.5;

// Classical Golgi stack geometry: cis sits at the bottom of the page,
// trans at the vertical middle - cargo climbs the stack a cisterna at
// a time rather than growing continuously, so its height always
// reflects which factory currently holds it.
var STACK_GAP = glycanforest_dpr * 24;

// Display forest - where finished glycans end up - is a thin strip
// pinned just above the trans face rather than sprawling across most
// of the screen, so the stack below it (the actual factory) gets the
// bulk of the space. Smaller band, same tree count, so it also reads
// denser for free.
var FOREST_HEIGHT = glycanforest_dpr * 200;
var FOREST_GAP = glycanforest_dpr * 24;

// How long a stage-to-stage climb takes - quick relative to a
// factory's multi-second dwell time, so it reads as "stepping up into
// the next cisterna" rather than a slow drift.
var STAGE_TRANSIT_TIME = 900;

// Concurrently-growing (unplanted) trees are capped at this multiple
// of the number of pipeline stages - keeps canvas render cost bounded
// while still allowing more than one glycan in flight per cisterna.
var MAX_GROWING_PER_STAGE = 2;

// A planted tree's signalling relevance decays linearly over this many
// ageTrees() ticks (one per simulation tick), then it's dropped from
// plantedTrees entirely - keeps that list, and the epitope census scan,
// bounded to recently-planted trees rather than growing for the whole
// session.
var MAX_AGE_TICKS = 120;
var ACTIVITY_THRESHOLD = 0.3;

// How close two planted trees (in canvas pixels) have to be to count as
// the same local cluster for supply-transport purposes.
var CLUSTER_RADIUS = 150 * glycanforest_dpr;
var TREE_ROOTS = ['GlcNAc(b1-4)GlcNAc', 'GalNAc', 'Man', 'Glc', 'Fuc'];

// Planted trees scatter through the (narrow) forest strip rather than
// all crowding at one edge - depth (0 = far/small, 1 = near/large)
// picks both the vertical position and the scale together, so
// lower-in-the-strip trees read as closer and bigger, like a receding
// perspective.
var MIN_PLANT_SCALE = 0.12;
var MAX_PLANT_SCALE = 0.55;
var PLANT_BAND_GAP = 20;
var LIFETIME_BAR_WIDTH = 34 * glycanforest_dpr;
var LIFETIME_BAR_HEIGHT = 5 * glycanforest_dpr;
var LIFETIME_BAR_GAP = 4 * glycanforest_dpr;

// How much of its expected dwell time (1/exitRate ticks) a resident
// has used up, as a 0 (just arrived) to 1 (overdue to move on)
// fraction - separate from GlycanForest's own planted-tree `age`,
// which only starts once a glycan has left the pipeline for good.
// Tree.stageAge is maintained by Factory.tick()/admit().
var draw_lifetime_bar = (ctx, tree, bounds) => {
  if (!tree.currentFactory) {
    return;
  }
  var max_age = 1 / tree.currentFactory.exitRate;
  var fraction = Math.max(0, 1 - (tree.stageAge || 0) / max_age);
  var x = tree.x - LIFETIME_BAR_WIDTH / 2;
  var raw_y = tree.y - TREE_SCALE * tree.canvas.height - LIFETIME_BAR_GAP - LIFETIME_BAR_HEIGHT;
  // Clamped to its own cisterna for the same reason the sprite is
  // clipped there - a tall glycan shouldn't push its bar up into the
  // compartment above.
  var y = bounds ? Math.max(bounds.top, raw_y) : raw_y;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x, y, LIFETIME_BAR_WIDTH, LIFETIME_BAR_HEIGHT);
  ctx.fillStyle = fraction <= 0 ? '#c44' : fraction < 0.4 ? '#d93' : '#4a8';
  ctx.fillRect(x, y, LIFETIME_BAR_WIDTH * fraction, LIFETIME_BAR_HEIGHT);
};
var plant_tree = (tree, forest) => {
  tree.planting = true;
  forest.trees.splice(forest.trees.indexOf(tree), 1);
  if (tree.stageTween) {
    tree.stageTween.stop();
  }
  tree.scale = TREE_SCALE;
  tree.y = tree.y - TREE_SCALE * tree.canvas.height;
  tree.x = tree.x - TREE_SCALE * 0.5 * tree.canvas.width;
  var depth = Math.random();
  var target_scale = (MIN_PLANT_SCALE + depth * (MAX_PLANT_SCALE - MIN_PLANT_SCALE)) * glycanforest_dpr;
  // Planted sprites are drawn top-left anchored (see the drawImage call
  // below), so they extend *downward* from y by their full scaled
  // height - without reserving that height here, a well-grown glycan's
  // sprite spills past forestBottom and over the top cisternae.
  var sprite_height = tree.canvas.height * target_scale;
  var band_top = forest.forestTop + PLANT_BAND_GAP * glycanforest_dpr;
  var band_bottom = Math.max(band_top, forest.forestBottom - PLANT_BAND_GAP * glycanforest_dpr - sprite_height);
  var target_y = band_top + depth * (band_bottom - band_top);
  var target_x = forest.margin + Math.random() * (forest.canvas.width - 2 * forest.margin);
  forest.planting_trees.push(tree);
  tree.tween = new Tween_min.Tween(tree).to({
    y: target_y,
    x: target_x,
    scale: target_scale
  }, 1000).on('complete', () => {
    forest.planting_trees.splice(forest.planting_trees.indexOf(tree), 1);
    forest.planted_canvas.getContext('2d').drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width * tree.scale, tree.canvas.height * tree.scale);
    tree.age = 0;
    forest.plantedTrees.push(tree);
  }).start();
};
class GlycanForest {
  constructor(canvas) {
    var stageCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
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
    return this.stackBottom - this.bandHeight * stage;
  }

  // [top,bottom) of the cisterna for `stage` - used to hard-clip cargo
  // rendering so a glycan that outgrows its band's headroom is cropped
  // rather than bleeding into a neighbouring compartment.
  bandBounds(stage) {
    return {
      top: this.stackBottom - this.bandHeight * (stage + 1),
      bottom: this.bandFloorY(stage)
    };
  }

  // Several pipeline stages can share one (taller) cisterna - each
  // still gets its own worker sub-row within that shared band, evenly
  // splitting its height, so two factories' packs don't land on top of
  // each other.
  subRowCenterY(stage, indexInGroup, groupSize) {
    var bounds = this.bandBounds(stage);
    var row_h = (bounds.bottom - bounds.top) / groupSize;
    return bounds.top + row_h * (indexInGroup + 0.5);
  }
  get forestBottom() {
    return this.stackTop - FOREST_GAP;
  }
  get forestTop() {
    return Math.max(TOP_MARGIN, this.forestBottom - FOREST_HEIGHT);
  }
  resize() {
    this.activeTrees.forEach(tree => {
      if (tree.stage !== undefined) {
        tree.x = this.canvas.width * 0.5 + (tree.jitterX || 0);
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
  setTreeStage(tree, stage) {
    tree.stage = stage;
    var target = {
      x: this.canvas.width * 0.5 + (tree.jitterX || 0),
      y: this.bandFloorY(stage)
    };
    if (tree.stageTween) {
      tree.stageTween.stop();
    }
    if (tree.y === undefined) {
      tree.x = target.x;
      tree.y = target.y;
      tree.dirty = true;
      return;
    }
    tree.stageTween = new Tween_min.Tween(tree).to(target, STAGE_TRANSIT_TIME).on('update', () => {
      tree.dirty = true;
    }).start();
  }
  addTree() {
    if (this.trees.length >= this.stageCount * MAX_GROWING_PER_STAGE) {
      return;
    }
    var new_tree = new glycantree(TREE_ROOTS[Math.floor(Math.random() * TREE_ROOTS.length)]);
    new_tree.jitterX = (Math.random() - 0.5) * 0.3 * this.canvas.width;
    this.trees.push(new_tree);
    new_tree.pipelineDone = false;
    new_tree.notifyPipelineDone = () => {
      new_tree.pipelineDone = true;
      if (!new_tree.planting) {
        new_tree.plant();
      }
    };
    new_tree.plant = plant_tree.bind(null, new_tree, this);
    if (this.onTreeCreated) {
      this.onTreeCreated(new_tree);
    }
  }
  startGrowing() {
    this.growing = setInterval(() => {
      this.addTree();
    }, GROWTH_RATE);
  }

  // One call per simulation tick. O(plantedTrees) - bounded, since trees
  // past MAX_AGE_TICKS are dropped here rather than kept around forever.
  ageTrees() {
    for (var tree of this.plantedTrees) {
      tree.age++;
    }
    this.plantedTrees = this.plantedTrees.filter(tree => this.activityOf(tree) > 0);
  }
  activityOf(tree) {
    return Math.max(0, 1 - tree.age / MAX_AGE_TICKS);
  }

  // Densest local cluster of still-active planted trees displaying the
  // given epitope - the tree with the most same-epitope neighbours
  // within CLUSTER_RADIUS, and its neighbourhood's centroid/count. O(n^2)
  // in qualifying tree count, which stays small (ageTrees() prunes it),
  // so trivial - a handful of trees at most, not the whole session's worth.
  findDenseCluster(identifier) {
    var qualifying = this.plantedTrees.filter(tree => this.activityOf(tree) > ACTIVITY_THRESHOLD && [...tree.sugar.composition()].some(r => r.identifier === identifier));
    var best = null;
    var _loop = function _loop(tree) {
      var neighbors = qualifying.filter(other => {
        var dx = other.x - tree.x;
        var dy = other.y - tree.y;
        return dx * dx + dy * dy <= CLUSTER_RADIUS * CLUSTER_RADIUS;
      });
      if (!best || neighbors.length > best.density) {
        best = {
          x: neighbors.reduce((sum, t) => sum + t.x, 0) / neighbors.length,
          y: neighbors.reduce((sum, t) => sum + t.y, 0) / neighbors.length,
          density: neighbors.length
        };
      }
    };
    for (var tree of qualifying) {
      _loop(tree);
    }
    return best;
  }
  render() {
    var pctx = this.planting_canvas.getContext('2d');
    pctx.clearRect(0, 0, this.planting_canvas.width, this.planting_canvas.height);
    // A glycan can be large when it graduates out of the stack, and
    // converting it from bottom-anchored to top-left-anchored at that
    // moment can leave it starting well above (or spanning well below)
    // the forest strip - clip to the forest band itself so the
    // one-second flight into it never sprawls into the HUD above or
    // the trans cisterna below.
    pctx.save();
    pctx.beginPath();
    pctx.rect(0, this.forestTop, this.planting_canvas.width, this.forestBottom - this.forestTop);
    pctx.clip();
    for (var tree of this.planting_trees) {
      pctx.drawImage(tree.canvas, tree.x, tree.y, tree.canvas.width * tree.scale, tree.canvas.height * tree.scale);
    }
    pctx.restore();

    // Full clearRect below means every active tree has to be redrawn
    // whenever ANY of them is dirty, not just the dirty ones - most
    // trees now sit still between stage transitions, so redrawing only
    // the dirty subset was erasing the stationary rest and never
    // putting them back.
    if (!this.activeTrees.some(tree => tree.dirty)) {
      return;
    }
    var ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var _tree of this.activeTrees) {
      var tree_size = {
        width: _tree.canvas.width,
        height: _tree.canvas.height
      };
      // Clip to the tree's own cisterna - a glycan can keep gaining
      // residues (and canvas height) while it sits in one band, so
      // without this a big enough one bleeds into the band above.
      var bounds = _tree.stage !== undefined ? this.bandBounds(_tree.stage) : null;
      ctx.save();
      if (bounds) {
        ctx.beginPath();
        ctx.rect(0, bounds.top, this.canvas.width, bounds.bottom - bounds.top);
        ctx.clip();
      }
      ctx.drawImage(_tree.canvas, 0, 0, tree_size.width, tree_size.height, _tree.x - TREE_SCALE * 0.5 * tree_size.width, _tree.y - TREE_SCALE * tree_size.height, TREE_SCALE * tree_size.width, TREE_SCALE * tree_size.height);
      ctx.restore();
      draw_lifetime_bar(ctx, _tree, bounds);
      _tree.dirty = false;
    }
  }
}
/* harmony default export */ const glycanforest = (GlycanForest);

;// ./js/elfpack.js
function elfpack_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function elfpack_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { elfpack_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { elfpack_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;


var ELF_PACK_HEIGHT = OUTPUT_SIZE;
var ELF_PACK_WIDTH = OUTPUT_SIZE;
var chunk = (arr, size) => Array.from({
  length: Math.ceil(arr.length / size)
}, (v, i) => arr.slice(i * size, i * size + size));
var cargo_map = new Map();
var get_cargo_icon = /*#__PURE__*/function () {
  var _ref = elfpack_asyncToGenerator(function* (cargo) {
    if (cargo_map.has(cargo)) {
      return cargo_map.get(cargo);
    }
    var res = yield renderSugar(cargo);
    cargo_map.set(cargo, res);
    return res;
  });
  return function get_cargo_icon(_x) {
    return _ref.apply(this, arguments);
  };
}();
get_cargo_icon('Xyl');
get_cargo_icon('Man');
get_cargo_icon('Glc');
get_cargo_icon('Gal');
get_cargo_icon('GalNAc');
get_cargo_icon('Fuc');
get_cargo_icon('GlcA');
get_cargo_icon('NeuAc');

// Workers idle at the two ends of their cisterna, not clustered in the
// middle where the cargo actually sits - half the pack stacked at the
// left edge, half at the right, both at the cisterna's height.
var update_pack_position = pack => {
  var half = Math.ceil(pack.elves.length / 2);
  var left = pack.elves.slice(0, half);
  var right = pack.elves.slice(half);
  var place = (group, x) => {
    group.forEach((elf, i) => {
      elf.home = {
        x,
        y: pack.y + (i - (group.length - 1) / 2) * ELF_PACK_HEIGHT
      };
      if (!elf.busy) {
        elf.x = elf.home.x;
        elf.y = elf.home.y;
      }
    });
  };
  place(left, pack.leftX);
  place(right, pack.rightX);
};

// No safety net: the cargo is a live reference to wherever the tree
// currently is, and the factory keeps rolling its exit chance while
// the elf is in flight. If the glycan has already moved to another
// cisterna by the time the elf lands, the delivery is wasted - the
// donor was already spent and the elf comes home empty-handed.
var make_delivery = /*#__PURE__*/function () {
  var _ref2 = elfpack_asyncToGenerator(function* (elf, cargo, target, factory) {
    // Exposed so DeliveryElf.render() can show, live, whether this
    // delivery is still on track (target.t.currentFactory === factory)
    // or already doomed - the label colour is just that check read back.
    elf.deliveryTarget = target;
    elf.deliveryFactory = factory;
    elf.ping = () => {
      if (target.t.currentFactory === factory) {
        target.t.addChild(target.r, 3, cargo);
      }
      target.r.active = false;
      target.t.active = false;
      delete elf.ping;
      elf.deliveryTarget = null;
      elf.deliveryFactory = null;
    };
    elf.cargo = yield get_cargo_icon(cargo);
    target.r.active = true;
    target.t.active = true;
    elf.deliverCargoAndReturn(target.t.x, target.t.y - 0.5 * target.t.canvas.height);
  });
  return function make_delivery(_x2, _x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();
class ElfPack {
  constructor(canvas) {
    var population = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var cargo_type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Man';
    this.canvas = canvas;
    this.elves = Array(population).fill(null);
    this.elves = this.elves.map(() => new deliveryelf(canvas));
    // Only the first elf on each side carries a name tag - with several
    // elves stacked tight within one (narrow) cisterna band, every elf
    // relabelling the same cargo type on top of each other just blurs
    // into illegible repeated text.
    this.elves.forEach((elf, i) => {
      elf.name = i === 0 || i === Math.ceil(population / 2) ? cargo_type : null;
    });
    this.left_x = 0;
    this.right_x = 0;
    this.pack_y = 0;
    this._interval = 1000;
    this.cargo_type = cargo_type;
  }
  get population() {
    return this.elves.length;
  }
  set population(size) {
    while (size > this.elves.length) {
      this.elves.push(new deliveryelf(this.canvas));
    }
    if (size < this.elves.length) {
      this.elves.length = size;
    }
    update_pack_position(this);
  }
  get leftX() {
    return this.left_x;
  }
  set leftX(x) {
    this.left_x = x;
    update_pack_position(this);
  }
  get rightX() {
    return this.right_x;
  }
  set rightX(x) {
    this.right_x = x;
    update_pack_position(this);
  }
  get y() {
    return this.pack_y;
  }
  set y(y) {
    this.pack_y = y;
    update_pack_position(this);
  }
  set interval(interval) {
    window.clearInterval(this.deliveryService);
    this._interval = interval;
    if (this.deliveryService && this.factory) {
      this.deliverToFactory(this.factory, this.donorPool, this.costLedger);
    }
  }
  get interval() {
    return this._interval;
  }
  deliverToFactory(factory, donorPool, costLedger) {
    this.factory = factory;
    this.donorPool = donorPool;
    this.costLedger = costLedger;
    window.clearInterval(this.deliveryService);
    this.deliveryService = setInterval(() => {
      if (costLedger.overBudget) {
        return;
      }
      var free_elf = this.elves.filter(elf => !elf.busy).shift();
      if (!free_elf) {
        return;
      }
      var target = factory.targetFor();
      if (!target) {
        return;
      }
      if (Math.random() >= 0.5) {
        return;
      }
      if (!donorPool.withdraw(this.cargo_type)) {
        return;
      }
      costLedger.chargeDelivery();
      make_delivery(free_elf, this.cargo_type, target, factory);
    }, this.interval);
  }
}
/* harmony default export */ const elfpack = (ElfPack);

;// ./js/factory.js
var HARD_RESIDUE_CAP = 30;

// Which substrate identifiers each donor's enzyme can land on. Shared by
// the in-factory substrate filter and by entry-stage routing (see
// `accepts`), so a tree's starting stage is derived from this table
// rather than a separate hard-coded assumption.
var SUBSTRATE_COMPATIBILITY = {
  Gal: ['GlcNAc', 'GalNAc', 'Fuc', 'Glc'],
  GalNAc: ['GlcNAc'],
  GlcA: ['Gal', 'GalNAc', 'Man', 'GlcNAc'],
  Man: ['GlcNAc', 'Man'],
  Xyl: ['Gal', 'Man'],
  Fuc: ['Gal', 'Man', 'Glc'],
  NeuAc: ['Gal']
};
var accepts = (donor, identifier) => (SUBSTRATE_COMPATIBILITY[donor] || []).indexOf(identifier) >= 0;
var filter_substrate = (donor, substrate) => accepts(donor, substrate.r.identifier);
var filter_depth = substrate => {
  for (var kid of substrate.r.children) {
    if (kid.children.length > 0) {
      return false;
    }
  }
  return true;
};

// A Golgi compartment. Holds up to `capacity` glycans at a time; every
// tick each resident has `exitRate` odds of moving on to the next stage
// (or finishing, for the last one) - a constant per-tick exit chance is
// just a geometric dwell-time distribution, cheap to simulate without
// sampling anything upfront. While resident, this factory's assigned
// elf pack may attach its cargo residue, gated by the shared donor
// budget and cost ledger.
class Factory {
  constructor(cargoType) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$capacity = _ref.capacity,
      capacity = _ref$capacity === void 0 ? 3 : _ref$capacity,
      _ref$exitRate = _ref.exitRate,
      exitRate = _ref$exitRate === void 0 ? 0.12 : _ref$exitRate;
    this.cargoType = cargoType;
    this.capacity = capacity;
    this.exitRate = exitRate;
    this.residents = [];
    this.waiting = [];
    this.pack = null;
    this.onRelease = null;
  }
  get occupancy() {
    return this.residents.length;
  }
  assignPack(pack) {
    this.pack = pack;
  }
  admit(tree) {
    tree.currentFactory = this;
    // Reset here, not just on promotion out of `waiting` - a fresh
    // arrival should read as "full lifetime remaining" immediately,
    // and it only starts counting down once tick() below actually
    // starts rolling for it (i.e. once resident).
    tree.stageAge = 0;
    if (this.residents.length < this.capacity) {
      this.residents.push(tree);
    } else {
      this.waiting.push(tree);
    }
  }
  _promoteWaiting() {
    while (this.waiting.length && this.residents.length < this.capacity) {
      this.residents.push(this.waiting.shift());
    }
  }
  release(tree) {
    var idx = this.residents.indexOf(tree);
    if (idx >= 0) {
      this.residents.splice(idx, 1);
    }
    tree.currentFactory = null;
    this._promoteWaiting();
    if (this.onRelease) {
      this.onRelease(tree);
    }
  }

  // Per-tick residency roll. O(residents in this factory) - trivial,
  // capacity is a handful of trees at most. The hard cap exists purely
  // to protect render/layout cost: legra-glycan.js re-lays-out the whole
  // sugar on every residue added, so growing one glycan to n residues is
  // O(n^2) overall - fine at the sizes the budget/residency system is
  // meant to produce, not fine if something runs away to hundreds.
  //
  // The exit roll fires regardless of whether an elf is currently
  // mid-flight to this tree - there's no "hold the tree still" safety
  // net. A delivery dispatched here can still land after the tree has
  // moved on to the next cisterna; the elfpack checks on arrival and
  // the delivery is simply wasted if so.
  tick(donorPool, costLedger) {
    if (this.pack) {
      costLedger.chargeUpkeep(this.pack.elves.length);
    }
    for (var tree of [...this.residents]) {
      // Drives the on-screen lifetime bar - how long this tree has
      // spent as a resident here, against this factory's expected
      // (1/exitRate) dwell time. Separate from GlycanForest's
      // planted-tree `age`, which tracks supply-transport relevance
      // after a glycan has left the pipeline entirely.
      tree.stageAge = (tree.stageAge || 0) + 1;
      tree.dirty = true;
      var over_cap = [...tree.sugar.composition()].length >= HARD_RESIDUE_CAP;
      if (over_cap || Math.random() < this.exitRate) {
        this.release(tree);
      }
    }
  }
  targetFor() {
    var candidates = this.residents.map(t => [...t.sugar.composition()].map(r => {
      return {
        t,
        r
      };
    })).flat();
    var potential = [filter_substrate.bind(null, this.cargoType), filter_depth, res => res.r.children.length < 2, res => !res.t.active && !res.r.active].reduce((arr, func) => arr.filter(func), candidates);
    return potential[Math.floor(Math.random() * potential.length)];
  }
}
/* harmony default export */ const factory = (Factory);

;// ./js/donorpool.js
var DEFAULT_BUDGET_PER_TYPE = 5;

// One shared pool of nucleotide-sugar donors per monosaccharide type,
// refilled every simulation tick. A factory has to withdraw a unit here
// before it's allowed to actually attach a residue - this is the hard,
// system-wide cap on throughput that staffing levels can't buy past.
class DonorPool {
  constructor(types) {
    var budgetPerType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_BUDGET_PER_TYPE;
    this.budgetPerType = budgetPerType;
    this.remaining = {};
    types.forEach(type => {
      this.remaining[type] = budgetPerType;
    });
  }
  resetTick() {
    Object.keys(this.remaining).forEach(type => {
      this.remaining[type] = this.budgetPerType;
    });
  }
  withdraw(type) {
    if ((this.remaining[type] || 0) <= 0) {
      return false;
    }
    this.remaining[type]--;
    return true;
  }
  // Adds to one type's remaining budget for the current tick only -
  // resetTick() wipes it back to baseline next tick, so a supply
  // transport has to keep earning this rather than ratcheting it up
  // permanently.
  boost(type, amount) {
    this.remaining[type] = (this.remaining[type] || 0) + amount;
  }
}
/* harmony default export */ const donorpool = (DonorPool);
;// ./js/costledger.js
var DEFAULT_ALLOWANCE = 30;
var UPKEEP_COST_PER_ELF = 1;
var DELIVERY_COST = 4;

// Tracks the metabolic cost of running the Golgi this tick: every
// assigned elf costs upkeep just for being staffed, every completed
// delivery costs more on top. Once spend crosses the allowance,
// factories stop accepting new deliveries until the next tick resets it.
class CostLedger {
  constructor() {
    var allowance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ALLOWANCE;
    this.allowance = allowance;
    this.spent = 0;
  }
  resetTick() {
    this.spent = 0;
  }
  get overBudget() {
    return this.spent >= this.allowance;
  }
  chargeUpkeep(elfCount) {
    this.spent += elfCount * UPKEEP_COST_PER_ELF;
  }
  chargeDelivery() {
    this.spent += DELIVERY_COST;
  }
}
/* harmony default export */ const costledger = (CostLedger);
;// ./js/supplytransport.js
// Two independent ways for one of these to deliver a nutrient boost to
// its paired donor type this tick:
//  - a flat per-tick random roll - the "basically fires randomly" floor,
//    independent of anything else happening in the forest.
//  - a charge circle that fills while a dense local cluster of this
//    transport's epitope persists (fill speed scales with density - a
//    denser cluster pays off faster), firing and resetting once full.
//    If the cluster breaks up before completing, the charge decays back
//    down gradually rather than snapping to zero.
// Both re-evaluated fresh every tick off live forest state - nothing
// here accumulates permanently, matching how DonorPool.boost() itself
// only ever applies for the current tick.
var AMBIENT_FIRE_CHANCE = 0.02;
var MIN_CLUSTER_DENSITY = 2;
var FILL_RATE_PER_DENSITY = 0.05;
var DECAY_RATE = 0.04;
class SupplyTransport {
  constructor(epitope) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$donor = _ref.donor,
      donor = _ref$donor === void 0 ? epitope : _ref$donor,
      _ref$bonus = _ref.bonus,
      bonus = _ref$bonus === void 0 ? 2 : _ref$bonus;
    this.epitope = epitope;
    this.donor = donor;
    this.bonus = bonus;
    this.chargeProgress = 0;
    this.clusterCenter = null;
    this.justFired = null;
  }
  tick(cluster, donorPool) {
    this.justFired = null;
    if (Math.random() < AMBIENT_FIRE_CHANCE) {
      donorPool.boost(this.donor, this.bonus);
      this.justFired = 'ambient';
    }
    if (cluster && cluster.density >= MIN_CLUSTER_DENSITY) {
      this.clusterCenter = cluster;
      this.chargeProgress += FILL_RATE_PER_DENSITY * cluster.density;
      if (this.chargeProgress >= 1) {
        this.chargeProgress = 0;
        donorPool.boost(this.donor, this.bonus);
        this.justFired = this.justFired || 'charge';
      }
    } else {
      this.chargeProgress = Math.max(0, this.chargeProgress - DECAY_RATE);
      if (this.chargeProgress <= 0) {
        this.clusterCenter = null;
      }
    }
  }
}
/* harmony default export */ const supplytransport = (SupplyTransport);
;// ./js/oligomerry.js
function oligomerry_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function oligomerry_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { oligomerry_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { oligomerry_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
;







var TICK_INTERVAL = 1000;
var TOTAL_ELF_POOL = 15;
var MAX_PACK_POPULATION = 4;
var NUTRIENT_BONUS = 2;

// The Golgi stack: a tree moves through these in order. Each stage is a
// compartment (Factory) with its own residency odds and headcount -
// NeuAc capping a glycan is the most "trans"/terminal step biologically,
// so it sits last, after Gal has had a chance to create its substrate.
var PIPELINE_DEFS = [{
  cargo: 'Man',
  population: 3,
  capacity: 3,
  exitRate: 0.18
}, {
  cargo: 'GalNAc',
  population: 2,
  capacity: 3,
  exitRate: 0.16
}, {
  cargo: 'GlcA',
  population: 2,
  capacity: 3,
  exitRate: 0.14
}, {
  cargo: 'Xyl',
  population: 3,
  capacity: 2,
  exitRate: 0.14
}, {
  cargo: 'Gal',
  population: 2,
  capacity: 2,
  exitRate: 0.12
}, {
  cargo: 'NeuAc',
  population: 3,
  capacity: 2,
  exitRate: 0.10
}];

// cis -> trans accent colour per stage, matching the golgi-stack gradient
// in index.html, so each card visually belongs to its stretch of the stack.
var STAGE_COLORS = ['#3fa9c9', '#55b299', '#6cba6c', '#8ebf55', '#b8b24a', '#e3a33c'];

// Adjacent pairs of pipeline stages share one (double-height) cisterna -
// Man+GalNAc, GlcA+Xyl, Gal+NeuAc - rather than each stage getting its
// own thin band. Each stage still keeps its own Factory/donor
// pool/elf pack; only the visual compartment is shared.
var CISTERNA_GROUP_SIZE = 2;
var group_of = stage => Math.floor(stage / CISTERNA_GROUP_SIZE);
var CISTERNA_COUNT = Math.ceil(PIPELINE_DEFS.length / CISTERNA_GROUP_SIZE);
var CISTERNA_COLORS = PIPELINE_DEFS.map((_, i) => i).filter(i => i % CISTERNA_GROUP_SIZE === 0).map(i => STAGE_COLORS[i]);
var hex_to_rgba = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(alpha, ")");
};
var oligomerry_dpr = window.devicePixelRatio || 1;
var CHARGE_ARC_RADIUS = 40 * oligomerry_dpr;
var size_canvases = () => {
  var size = document.querySelector('#forest').getBoundingClientRect();
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  size.width = size.width * dpr;
  size.height = size.height * dpr;
  for (var canvas of document.querySelectorAll('#forest canvas')) {
    canvas.width = size.width;
    canvas.height = size.height;
  }
  return {
    w: size.width,
    h: size.height
  };
};
var canvas_size = size_canvases();
var forest = new glycanforest(document.querySelector('#tree_canvas'), CISTERNA_COUNT);
forest.margin = 1.5 * ELF_PACK_WIDTH;
forest.resize();
var donorPool = new donorpool(PIPELINE_DEFS.map(def => def.cargo));
var costLedger = new costledger();

// One supply transport per pipeline stage - each watches its own cargo
// type as an epitope and feeds its own donor type. Epitope and donor
// happen to be the same type for every stage today, but the pairing is
// independent (SupplyTransport takes them separately) so a future stage
// could watch one epitope and pay out a different donor.
var supplyTransports = PIPELINE_DEFS.map(def => new supplytransport(def.cargo, {
  donor: def.cargo,
  bonus: NUTRIENT_BONUS
}));
var factories = PIPELINE_DEFS.map(def => new factory(def.cargo, {
  capacity: def.capacity,
  exitRate: def.exitRate
}));
factories.forEach((factory, i) => {
  var next = factories[i + 1];
  factory.onRelease = next ? tree => {
    next.admit(tree);
    forest.setTreeStage(tree, group_of(i + 1));
  } : tree => tree.notifyPipelineDone();
});

// A tree's root chemistry decides where it enters the stack, rather
// than every root squatting in Man's capacity regardless of whether Man
// can do anything with it - first stage (in cis->trans order) whose
// enzyme actually accepts this root, falling back to the first stage.
var entry_stage_for = identifier => {
  var idx = factories.findIndex(factory => accepts(factory.cargoType, identifier));
  return idx >= 0 ? idx : 0;
};
forest.onTreeCreated = tree => {
  var stage = entry_stage_for(tree.sugar.root.identifier);
  factories[stage].admit(tree);
  forest.setTreeStage(tree, group_of(stage));
};
forest.startGrowing();
setInterval(() => {
  requestAnimationFrame(() => {
    forest.render();
  });
}, 100);
setInterval(() => {
  donorPool.resetTick();
  costLedger.resetTick();
  forest.ageTrees();
  for (var transport of supplyTransports) {
    transport.tick(forest.findDenseCluster(transport.epitope), donorPool);
  }
  for (var factory of factories) {
    factory.tick(donorPool, costLedger);
  }
  update_hud();
}, TICK_INTERVAL);
fetch('images/tree.png').then(res => {
  return res.blob();
}).then(blob => {
  var img_data = URL.createObjectURL(blob);
  var image = new Image();
  var res = new Promise(resolve => {
    image.onload = () => {
      resolve(image);
    };
  });
  image.src = img_data;
  return res;
}).then(image => {
  var canv = forest.planted_canvas;
  for (var i = 0; i < 10; i++) {
    canv.getContext('2d').drawImage(image, 1.5 * ELF_PACK_WIDTH + Math.random() * (canv.width - 3 * ELF_PACK_WIDTH), forest.forestTop + Math.random() * (forest.forestBottom - forest.forestTop), ELF_PACK_WIDTH, ELF_PACK_WIDTH);
  }
});
var elf_pool_remaining = () => TOTAL_ELF_POOL - factories.reduce((sum, factory) => sum + factory.pack.population, 0);
var adjust_population = (factory, delta) => {
  var next = factory.pack.population + delta;
  if (next < 1 || next > MAX_PACK_POPULATION) {
    return;
  }
  if (delta > 0 && elf_pool_remaining() <= 0) {
    return;
  }
  factory.pack.population = next;
  update_hud();
};
var hud = document.querySelector('#hud-cards');
var set_bar = (bar_el, fraction) => {
  bar_el.style.width = "".concat(Math.max(0, Math.min(1, fraction)) * 100, "%");
  bar_el.classList.toggle('empty', fraction <= 0);
  bar_el.classList.toggle('low', fraction > 0 && fraction < 0.4);
};
var build_hud = () => {
  hud.innerHTML = '';
  factories.forEach((factory, i) => {
    var card = document.createElement('div');
    card.className = 'factory-card';
    card.style.borderTopColor = STAGE_COLORS[i];
    var dots = Array.from({
      length: factory.capacity
    }, () => '<span class="dot"></span>').join('');
    card.innerHTML = "\n      <div class=\"factory-name\"><span class=\"factory-icon\" data-role=\"icon\"></span>".concat(factory.cargoType, "</div>\n      <div class=\"factory-dots\" data-role=\"dots\">").concat(dots, "</div>\n      <div class=\"factory-waiting\" data-role=\"waiting\"></div>\n      <div class=\"bar\"><div class=\"bar-fill\" data-role=\"donor-fill\"></div></div>\n      <div class=\"factory-elves\">\n        <button type=\"button\" data-action=\"dec\">-</button>\n        <span data-role=\"population\"></span>\n        <button type=\"button\" data-action=\"inc\">+</button>\n      </div>\n    ");
    card.querySelector('[data-action="dec"]').addEventListener('click', () => adjust_population(factory, -1));
    card.querySelector('[data-action="inc"]').addEventListener('click', () => adjust_population(factory, 1));
    hud.appendChild(card);
    get_cargo_icon(factory.cargoType).then(icon => {
      card.querySelector('[data-role="icon"]').appendChild(icon);
    });
  });
  var cost_card = document.createElement('div');
  cost_card.className = 'factory-card cost-card';
  cost_card.innerHTML = "\n    <div class=\"factory-name\">Cell upkeep</div>\n    <div class=\"bar\"><div class=\"bar-fill\" data-role=\"cost-fill\"></div></div>\n    <div data-role=\"pool\"></div>\n  ";
  hud.appendChild(cost_card);
  update_hud();
};
var update_hud = () => {
  factories.forEach((factory, i) => {
    var card = hud.children[i];
    if (!card) {
      return;
    }
    var dots = card.querySelectorAll('[data-role="dots"] .dot');
    dots.forEach((dot, slot) => dot.classList.toggle('filled', slot < factory.occupancy));
    card.querySelector('[data-role="waiting"]').textContent = factory.waiting.length ? "+".concat(factory.waiting.length, " waiting") : '';
    set_bar(card.querySelector('[data-role="donor-fill"]'), donorPool.remaining[factory.cargoType] / donorPool.budgetPerType);
    card.querySelector('[data-role="population"]').textContent = factory.pack.population;
    card.querySelector('[data-action="dec"]').disabled = factory.pack.population <= 1;
    card.querySelector('[data-action="inc"]').disabled = factory.pack.population >= MAX_PACK_POPULATION || elf_pool_remaining() <= 0;
  });
  var cost_card = hud.children[factories.length];
  if (!cost_card) {
    return;
  }
  set_bar(cost_card.querySelector('[data-role="cost-fill"]'), 1 - costLedger.spent / costLedger.allowance);
  cost_card.querySelector('[data-role="pool"]').textContent = "".concat(elf_pool_remaining(), " elves free") + (costLedger.overBudget ? ' - over budget!' : '');
};

// Each cisterna is a full-width horizontal band shared by a couple of
// factories - every factory still gets its own worker sub-row within
// that shared band, idling at the two ends of the page rather than
// clustered in the middle where the cargo itself travels.
var position_pack = (pack, index, canvas_size) => {
  pack.leftX = forest.margin;
  pack.rightX = canvas_size.w - forest.margin;
  pack.y = forest.subRowCenterY(group_of(index), index % CISTERNA_GROUP_SIZE, CISTERNA_GROUP_SIZE);
};
var packs = PIPELINE_DEFS.map((def, i) => {
  var pack = new elfpack(document.querySelector('#elf_canvas'), def.population, def.cargo);
  pack.interval = 2500 + i * 300;
  factories[i].assignPack(pack);
  pack.deliverToFactory(factories[i], donorPool, costLedger);
  return pack;
});
build_hud();

// Tone.js (~100KB) and tinsel-glycan.js's music module are only ever
// fetched here, on first play - never from the page's main bundle.
// tinsel-glycan.js/music expects a UMD-style `window.Tone` global (see
// its own header comment on why), but webpack's module system means a
// plain `import 'tone'` never attaches one - `tone`'s package.json
// only has a CJS/UMD browser build, no ES module, so the import below
// resolves to its `module.exports`, which we attach ourselves before
// the music module's own `import 'tone'` runs and reads it back.
var musicPlaying = false;
document.getElementById('play-music').addEventListener('click', /*#__PURE__*/oligomerry_asyncToGenerator(function* () {
  if (musicPlaying) {
    var _music = yield Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_tone_build_Tone_js"), __webpack_require__.e("tinsel-glycan_js_js_music_js")]).then(() => (__webpack_require__(/*! tinsel-glycan.js/music */ 410)));
    _music.stop();
    musicPlaying = false;
    return;
  }
  var Tone = yield __webpack_require__.e(/*! import() */ "vendors-node_modules_tone_build_Tone_js").then(() => (__webpack_require__(/*! tone */ 907)));
  window.Tone = window.Tone || Tone.default || Tone;
  var music = yield Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_tone_build_Tone_js"), __webpack_require__.e("tinsel-glycan_js_js_music_js")]).then(() => (__webpack_require__(/*! tinsel-glycan.js/music */ 410)));
  yield music.start();
  musicPlaying = true;
}));
var set_positions = () => {
  var canvas_size = size_canvases();
  forest.resize();
  packs.forEach((pack, i) => position_pack(pack, i, canvas_size));
};
set_positions();
window.addEventListener("orientationchange", function () {
  setTimeout(() => {
    set_positions();
  }, 100);
}, false);
setInterval(() => {
  requestAnimationFrame(() => {
    var canvas = document.querySelector('#elf_canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_stack(ctx, canvas);
    for (var pack of packs) {
      for (var elf of pack.elves) {
        elf.render();
      }
    }
    supplyTransports.forEach((transport, i) => draw_charge_arc(ctx, transport, STAGE_COLORS[i]));
  });
}, 100);

// The classical stack diagram, drawn as flat bands: cis cisterna at
// the foot of the page, trans at the middle, each tinted so it reads
// as a distinct compartment even before any cargo is in it. Each band
// is shared by a pair of factories, so a thin divider marks the
// worker sub-row boundary between them.
function draw_stack(ctx, canvas) {
  for (var group = 0; group < CISTERNA_COUNT; group++) {
    var bounds = forest.bandBounds(group);
    var top = bounds.top;
    var height = bounds.bottom - bounds.top;
    ctx.fillStyle = hex_to_rgba(CISTERNA_COLORS[group], 0.07);
    ctx.fillRect(0, top, canvas.width, height);
    ctx.strokeStyle = hex_to_rgba(CISTERNA_COLORS[group], 0.25);
    ctx.lineWidth = Math.max(1, oligomerry_dpr);
    ctx.strokeRect(0, top, canvas.width, height);
    ctx.beginPath();
    ctx.moveTo(0, top + height / 2);
    ctx.lineTo(canvas.width, top + height / 2);
    ctx.strokeStyle = hex_to_rgba(CISTERNA_COLORS[group], 0.12);
    ctx.stroke();
  }
}

// Minimal: a faint full ring plus a coloured arc growing clockwise from
// 12 o'clock as chargeProgress fills, centred on the transport's current
// densest cluster. Nothing to draw once there's no cluster at all.
function draw_charge_arc(ctx, transport, color) {
  if (!transport.clusterCenter) {
    return;
  }
  var _transport$clusterCen = transport.clusterCenter,
    x = _transport$clusterCen.x,
    y = _transport$clusterCen.y;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, CHARGE_ARC_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 4 * oligomerry_dpr;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, CHARGE_ARC_RADIUS, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * transport.chargeProgress);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * oligomerry_dpr;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(646)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);