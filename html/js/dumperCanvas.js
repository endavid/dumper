import VMath from './math.js';

// Unfortunately, I wasn't able to import pngreader as a module
const { PNGReader } = window;

function parsePng(imgData) {
  const reader = new PNGReader(imgData);
  return new Promise((resolve, reject) => {
    reader.parse((err, png) => {
      if (err) {
        reject(err);
      } else {
        resolve(png)
      }
    });
  });
}

function getArrayBuffer(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.status));
      }
    }
    xhr.send();
  });
}

class DumperCanvas {
  constructor(name, png, scale) {
    this.png = png;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', name);
    this.canvas = canvas;
    this.setScale(scale);
  }

  static async createAsync(element, scale = 1) {
    const imgData = await getArrayBuffer(element.uri);
    const png = await parsePng(imgData);
    return new DumperCanvas(element.name, png, scale);
  }

  getPixel(p) {
    const {width, pixels, colors} = this.png;
    const i = p.y * width + p.x;
    const c = pixels.slice(colors * i, colors * (i+1));
    return Array.prototype.slice.call(c);
  }

  setScale(s) {
    this.scale = s;
    this.canvas.width = this.png.width * s;
    this.canvas.height = this.png.height * s;
    this.applyFilter(a => a); // apply identity
  }

  applyFilter(fn) {
    const {width, height, pixels, colors} = this.png;
    const s = this.scale;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const outArray = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const inIndex = i * width + j;
        const c = pixels.slice(colors*inIndex, colors*(inIndex+1));
        for (let y = 0; y < s; y++) {
          for (let x = 0; x < s; x++) {
            const index = 4 * ((i * s + y) * w + j * s + x);
            outArray.set([255, 255, 255, 255], index);
            outArray.set(fn(c), index);
          }
        }
      }
    }
    const imgData = new ImageData(outArray, this.canvas.width, this.canvas.height);
    const ctx = this.canvas.getContext('2d');
    ctx.putImageData(imgData, 0, 0);
  }

  asArray(filter) {
    const {width, height, pixels, colors} = this.png;
    const n = width * height;
    let out = [];
    for (let i = 0; i < n; i++) {
      let c = pixels.slice(colors*i, colors*(i+1));
      c = Array.prototype.slice.call(c);
      out = out.concat(filter(c));
    }
    return out;
  }

  // https://stackoverflow.com/a/17130415/1765629
  getMousePosition(evt) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = evt.clientX - rect.left;
    const sy = evt.clientY - rect.top;
    const x = Math.floor(sx / this.scale);
    const y = Math.floor(sy / this.scale);
    // normalized coordinates
    const u = VMath.round(x / this.png.width, 6);
    const v = VMath.round(1 - y / this.png.height, 6);
    return {
      sx, sy, x, y, u, v
    };
  }

}

export { DumperCanvas as default };
