import Elf from './elf.mjs';

const rad = (angle) => angle * (Math.PI / 180);

const CARGO_DISTANCE = 32;
const CARGO_ICON_SIZE = 32;
const CARGO_OUTPUT_SIZE = 32;

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

const render_label = (label,x,y,canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = 'black';
  ctx.roundRect(-32,40,32,60,5);
  ctx.fill();
  ctx.font="16px Helvetica";
  ctx.textAlign="center"; 
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label,0,50);
  ctx.restore();
}

class DeliveryElf extends Elf {
  constructor(canvas) {
    super(canvas);
  }
  // Set home
  // .home
  // (Move to new home if not at home)



  //deliverCargoAndReturn(x,y)
  // tween to X
  // rotate in direction of Y
  // tween to y

  // .name

  // .cargo
  render() {
    super.render();
    let cargo_x = this.x + Math.floor(Math.cos(rad(this.rotate+90)) * CARGO_DISTANCE);
    let cargo_y = this.y + Math.floor(Math.sin(rad(this.rotate+90)) * CARGO_DISTANCE);
    let ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.cargo,0,0,CARGO_ICON_SIZE,CARGO_ICON_SIZE,cargo_x - 0.5*CARGO_OUTPUT_SIZE,cargo_y - 0.5*CARGO_OUTPUT_SIZE,CARGO_OUTPUT_SIZE,CARGO_OUTPUT_SIZE );
    render_label('FOO',this.x,this.y,this.canvas);
  }
}

export default DeliveryElf