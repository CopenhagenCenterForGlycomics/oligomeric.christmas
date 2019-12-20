
const MAP_URL = 'images/tilemap_elf.png';

const OUTPUT_SIZE = 64;
const INPUT_SIZE = 128;
const ROTATE_DELTA = 30;

const init_map = async () => {
  return fetch(MAP_URL)
  .then(res=>{return res.blob()})
  .then(blob=>{
    let img_data = URL.createObjectURL(blob);
    let image = new Image();
    image.src = img_data;
    return image;
  });
}

const IMAGE_MAP_PROMISE = init_map();


class Elf {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.rotate = 0;
  }
  async render() {
    let map = await IMAGE_MAP_PROMISE;
    let ctx = this.canvas.getContext('2d');
    if (this.rotate < 0) {
      this.rotate += 360;
    }
    let normalised_angle = (this.rotate % 360);
    ctx.drawImage(map,(Math.floor((this.rotate % 360) / ROTATE_DELTA) )*INPUT_SIZE,0,INPUT_SIZE,INPUT_SIZE,this.x - 0.5*OUTPUT_SIZE,this.y - 0.5*OUTPUT_SIZE,OUTPUT_SIZE,OUTPUT_SIZE );
  }
}

export default Elf