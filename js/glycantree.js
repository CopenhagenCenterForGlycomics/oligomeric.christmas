import { LegraCanvasRenderer, CondensedIupac, SugarAwareLayout, Sugar } from 'glycan.js';

let Iupac = CondensedIupac.IO;

class IupacSugar extends Iupac(Sugar) {}

class PackedLayout extends SugarAwareLayout {
  static get DELTA_X() {
    return super.DELTA_X;
  }

  static get DELTA_Y() {
    return 0.5;
  }

}

class PaintWatcher extends LegraCanvasRenderer {
  paint() {
    LegraCanvasRenderer.prototype.paint.call(this);
    if (this.onpaint) {
      this.onpaint();
    }
  }
}

const renderSugar = (seq) => {
  const res = document.createElement('canvas');
  res.setAttribute('width','32px');
  res.setAttribute('height','32px');
  const res_canv = document.createElement('canvas');
  let sugar = new IupacSugar();
  sugar.sequence = seq;
  let renderer = new PaintWatcher(res,PackedLayout);
  let result = new Promise( resolve => {
    renderer.onpaint = () => {
      setTimeout( () => {
        res_canv.width = 32;
        res_canv.height = 32;
        res_canv.getContext('2d').drawImage(res,50,50,100,100,0,0,32,32);
        resolve(res_canv);        
      },0);
    }
  });
  renderer.addSugar(sugar);
  renderer.refresh();
  return result;
};

// Properties x & y

class GlycanTree {
  constructor(sequence) {
    this.canvas = document.createElement('canvas');
    let sugar = new IupacSugar();
    sugar.sequence = sequence;
    this.sugar = sugar;
    SugarAwareLayout.LINKS = false;
    let renderer = new PaintWatcher(this.canvas,PackedLayout);
    renderer.onpaint = () => {
      this.dirty = true;
    };
    this.renderer = renderer;
    renderer.addSugar(sugar);
    renderer.refresh();
  }
  addChild(res=this.sugar.root,link=3,seq='Gal') {
    let mono_clazz = this.sugar.constructor.Monosaccharide;
    let mono = new mono_clazz(seq);
    mono.anomer = 'u';
    mono.parent_linkage = 1;
    res.addChild(link,mono);
    this.renderer.refresh();
  }
}

export default GlycanTree;

export { renderSugar };
