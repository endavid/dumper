import VMath from './math.js';

function hexToVectors(array) {
  return array.map(v => VMath.hexColorToNormalizedVector(v));
}

class ColorPalette {
  constructor(hexValues) {
    this.palette = hexValues;
    this.paletteVectors = hexToVectors(hexValues);
  }
  setColor(i, hexValue) {
    this.palette[i] = hexValue;
    this.paletteVectors[i] = VMath.hexColorToNormalizedVector(hexValue);
  }
  findClosest(normalizedColor) {
    let minDistance = Number.MAX_VALUE;
    let index = -1;
    this.paletteVectors.forEach((v, i) => {
      const d = VMath.distanceSqr(v, normalizedColor);
      if (d < minDistance) {
        minDistance = d;
        index = i;
      }
    });
    return index;
  }
}

export {ColorPalette as default};
