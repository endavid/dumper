const VMath = {
  sum(a, b) {
    const out = [];
    a.forEach((v, i) => {
      out.push(v + b[i]);
    });
    return out;
  },
  diff(a, b) {
    const out = [];
    a.forEach((v, i) => {
      out.push(v - b[i]);
    });
    return out;
  },
  dot(a, b) {
    let s = 0;
    a.forEach((c, i) => { s += c * b[i]; });
    return s;
  },
  distanceSqr(a, b) {
    const ab = VMath.diff(a, b);
    return VMath.dot(ab, ab);
  },
  distance(a, b) {
    return Math.sqrt(VMath.distanceSqr(a, b));
  },
  vectorToHexColor: (v) => {
    // can't use 'map' because it returns another Float32Array...
    let c = [];
    v.forEach(a => c.push(Math.round(255 * a).toString(16)));
    c = c.map((a) => {
      if (a.length === 1) return `0${a}`;
      return a;
    });
    return `#${c.join('')}`;
  },
  hexColorToNormalizedVector: (color) => {
    // e.g. #120e14
    let v = [
      color.slice(1, 3),
      color.slice(3, 5),
      color.slice(5, 7),
    ];
    v = v.map(a => parseInt(a, 16) / 255);
    return v;
  },
};
export { VMath as default };