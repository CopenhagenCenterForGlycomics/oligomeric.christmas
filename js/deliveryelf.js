import Elf from './elf';
import { ELF_SIZE } from './elf';

import { Easing, Tween, autoPlay } from 'es6-tween';

const rad = (angle) => angle * (Math.PI / 180);

const dpr = window.devicePixelRatio || 1;

const CARGO_DISTANCE = 32*dpr;
const CARGO_ICON_SIZE = 32;
const CARGO_OUTPUT_SIZE = 32*dpr;

// How long an elf takes to cross a pixel of travel - the speed knob.
// Cisternae now span the full page width with workers at the edges and
// cargo in the middle, and deliveries have no safety net (factory.js),
// so this has to be fast enough that a delivery can plausibly beat the
// factory's exit roll, not just slow set-dressing.
const MS_PER_PIXEL = 3;

CanvasRenderingContext2D.prototype.roundRect = function(sx,sy,ex,ey,r) {
    var r2d = Math.PI/180;
    if( ( ex - sx ) - ( 2 * r ) < 0 ) { r = ( ( ex - sx ) / 2 ); } //ensure that the radius isn't too large for x
    if( ( ey - sy ) - ( 2 * r ) < 0 ) { r = ( ( ey - sy ) / 2 ); } //ensure that the radius isn't too large for y
    this.beginPath();
    this.moveTo(sx+r,sy);
    this.lineTo(ex-r,sy);
    this.arc(ex-r,sy+r,r,r2d*270,r2d*360,false);
    this.lineTo(ex,ey-r);
    this.arc(ex-r,ey-r,r,r2d*0,r2d*90,false);
    this.lineTo(sx+r,ey);
    this.arc(sx+r,ey-r,r,r2d*90,r2d*180,false);
    this.lineTo(sx,sy+r);
    this.arc(sx+r,sy+r,r,r2d*180,r2d*270,false);
    this.closePath();
};

const LABEL_IDLE = 'rgba(200,200,200,0.5)';
const LABEL_DELIVERING = 'rgba(70,190,90,0.85)';
const LABEL_DOOMED = 'rgba(210,60,60,0.85)';

const render_label = (label,x,y,canvas,fill=LABEL_IDLE) => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = fill;
  ctx.roundRect(-0.5*ELF_SIZE,0.5*ELF_SIZE,0.5*ELF_SIZE,ELF_SIZE,ELF_SIZE/10);
  ctx.fill();
  ctx.font=`${dpr*16}px Helvetica, sans-serif`;
  ctx.textAlign="center"; 
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(100,100,100,1)";
  ctx.fillText(label,0,0.75*ELF_SIZE);
  ctx.restore();
}

autoPlay(true); // simplify the your code


const go_to = function(x,y,outbound=true) {

  let coords = { x: this.x, y: this.y, rotate: this.rotate };
  let first_target = outbound ? { x: x, y: this.y } : { y: y, x: this.x };
  let total_distance = Math.abs(y - this.y) + Math.abs(x - this.x);
  let second_target = {x,y};
  let tween_first_target = new Tween(coords)
  .to(first_target, (MS_PER_PIXEL/dpr)*(Math.abs(first_target.x-this.x)+Math.abs(first_target.y-this.y)))
  .easing(Easing.Linear)
  .on('update', ({ x, y }) => {
    this.rotate = -90 + Math.atan2(first_target.y - this.y, first_target.x - this.x) * 180 / Math.PI;
    this.x = x;
    this.y = y;
    coords.rotate = this.rotate;
  });


  let tween_rotate = new Tween(coords)
  .to({ rotate: -90 + Math.atan2(y - first_target.y, x - first_target.x) * 180 / Math.PI },500)
  .on('update', ({rotate}) => {
    this.rotate = rotate;
  });


  let tween_final_target = new Tween(coords)
  .to({x,y},(MS_PER_PIXEL/dpr)*(Math.abs(first_target.x-x)+Math.abs(first_target.y-y)))
  .easing(Easing.Linear)
  .on('update', ({ x, y }) => {
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

  return new Promise( resolve => {
    tween_final_target.on('complete',resolve);
  });

}

// Need an ElfPack class - regulates the
// rate and number of elves that are
// active at any given time

class DeliveryElf extends Elf {
  constructor(canvas) {
    super(canvas);
  }
  // Set home
  // .home
  // (Move to new home if not at home)


  go_to(x,y) {
    go_to.call(this,x,y);
  }

  async deliverCargoAndReturn(x,y) {
    if (this.busy) {
      return;
    }
    let start = {x: this.x, y: this.y};
    this.busy = true;
    await go_to.call(this,x,y);
    if (this.ping) {
      this.ping();
    }
    this.cargo = null;
    await go_to.call(this,start.x,start.y,false);
    this.busy = false;
    if (this.home) {
      this.x = this.home.x;
      this.y = this.home.y;
    }
  }

  // .name

  // .cargo
  render() {
    super.render();
    let cargo_x = this.x + Math.floor(Math.cos(rad(this.rotate+90)) * CARGO_DISTANCE);
    let cargo_y = this.y + Math.floor(Math.sin(rad(this.rotate+90)) * CARGO_DISTANCE);
    let ctx = this.canvas.getContext('2d');
    if (this.name) {
      let fill = LABEL_IDLE;
      if (this.cargo) {
        let on_track = this.deliveryTarget && this.deliveryTarget.t.currentFactory === this.deliveryFactory;
        fill = on_track ? LABEL_DELIVERING : LABEL_DOOMED;
      }
      render_label(this.name,this.x,this.y,this.canvas,fill);
    }
    if (this.cargo) {
      ctx.drawImage(this.cargo,0,0,CARGO_ICON_SIZE,CARGO_ICON_SIZE,cargo_x - 0.5*CARGO_OUTPUT_SIZE,cargo_y - 0.5*CARGO_OUTPUT_SIZE,CARGO_OUTPUT_SIZE,CARGO_OUTPUT_SIZE );
    }
  }
}

export default DeliveryElf