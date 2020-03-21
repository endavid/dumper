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
        console.log(xhr.response);
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.status));
      }
    }
    xhr.send();
  });
}

class DumperCanvas {
  constructor(name, png) {
    this.png = png;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', name);
    canvas.width = png.width;
    canvas.height = png.height;
    this.canvas = canvas;
    this.applyFilter(a => a); // apply identity
  }

  static async createAsync(element) {
    const imgData = await getArrayBuffer(element.uri);
    const png = await parsePng(imgData);
    return new DumperCanvas(element.name, png);
  }

  applyFilter(fn) {
    const {width, height, pixels, colors} = this.png;
    const n = width * height;
    const outArray = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) {
      const c = pixels.slice(colors*i, colors*(i+1));
      outArray.set([255, 255, 255, 255], 4*i);
      outArray.set(fn(c), 4*i);
    }
    const imgData = new ImageData(outArray, width, height);
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

}

export { DumperCanvas as default };
