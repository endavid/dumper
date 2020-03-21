import $ from './jquery.module.js';
import UiUtils from './uiutils.js';
import DumperCanvas from './dumperCanvas.js';
import ColorPalette from './colorPalette.js';

function setInfo(text) {
  $('#infoDiv').text(text);
}

function setWarning(text) {
  setInfo(`[WARNING] ${text}`);
}

function setError(e) {
  console.error(e);
  setInfo(`[ERROR] ${e}`);
}

function preseterize(obj) {
  return Object.keys(obj).map((k) => {
    return {name: k, value: k};
  });
}

function clearFileBrowser(id) {
  // https://stackoverflow.com/a/832730
  $(`#${id}`).replaceWith($(`#${id}`).val('').clone(true));
}

function objectToHtml(obj, depth = 0) {
  if (Array.isArray(obj)) {
    return `[${obj.map(a => objectToHtml(a, depth+1)).join(", ")}]`;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return obj.toString();
  }
  const st = depth === 0 ? 'rootkey' : 'key';
  const lines = keys.map(k => `<span class="${st}">${k}</span>: ${objectToHtml(obj[k], depth+1)}`);
  if (depth === 0) {
    return lines.join(',\n');
  }
  return `{${lines.join(", ")}}`;
}

function progressBarUpdate(ratio) {
  const percentage = Math.round(100 * ratio);
  $('#progressBar').css('width', `${percentage}%`);
}

let colorPalette = new ColorPalette([
  '#000000',
  '#c0c0c0',
  '#404040',
  '#ffffff',
  '#ff0000',
  '#ff8000',
  '#ffff00',
  '#008000',
  '#00ff00',
  '#40ffff',
  '#4040ff',
  '#ff40ff',
]);

const DumpFunctions = {
  identity: c => c,
  palette: c => {
    const v = c.map(a => a / 255);
    return colorPalette.findClosest(v);
  }
}
let selectedDumpFn = 'identity';

const Dumpers = {
  canvas: (dc) => {
    const {height} = dc.png;
    const array = dc.asArray(DumpFunctions[selectedDumpFn]);
    const numColumns = array.length / height;
    let rows = [];
    for (let y = 0; y < height; y++) {
      let row = array.slice(numColumns * y, numColumns * (y+1));
      row = row.map(v => '0x' + v.toString(16));
      rows.push(row.join(", "));
    }
    $('#textarea').html(rows.join(',\n'));
  },
  pixel: (dc, e) => {
    const p = dc.getMousePosition(e);
    const info = {
      'coordinates': p
    };
    const c = dc.getPixel(p);
    Object.keys(DumpFunctions).forEach((k) => {
      info[k] = DumpFunctions[k](c);
    })
    $('#textarea').html(objectToHtml(info));
  }
}
let selectedDumper = 'canvas';


function populateControls() {
  let dumperCanvasList = [];
  function onChangeFileBrowser(values) {
    const scale = parseInt($('#canvasScale').val());
    for (let i = 0; i < values.length; i += 1) {
      DumperCanvas.createAsync(values[i], scale).then((dc) => {
        dc.canvas.onclick = (e) => {
          Dumpers[selectedDumper](dc, e);
        };
        $('#canvases').append(dc.canvas);
        dumperCanvasList.push(dc);
      });
    }
    setInfo(`Loaded: ${values.map(a => a.name).join(', ')}`);
  }

  function onChangeColorPalette(e) {
    const {id, value} = e.target;
    const index = parseInt(id.split('.')[1])
    colorPalette.setColor(index, value);
  }

  // Create the UI controls
  // * File
  UiUtils.addGroup('gFile', 'File', [
    UiUtils.createFileBrowser('fileBrowser', 'load PNGs', true, onChangeFileBrowser),
  ]);
  UiUtils.addGroup('gPalette', 'Palette', [
    UiUtils.createColorPalette('colorPalette', colorPalette.palette, onChangeColorPalette),
  ]);
  UiUtils.addGroup('gCanvas', 'Canvas', [
    UiUtils.createDropdownList('dumpMode', preseterize(Dumpers), (a) => {
      selectedDumper = a.value;
    }),
    UiUtils.createSlider('canvasScale', 'scale', 1, 1, 10, 1, (s) => {
      dumperCanvasList.forEach(dc => dc.setScale(s));
    }),
    UiUtils.createDropdownList('filterFn', preseterize(DumpFunctions), (a) => {
      selectedDumpFn = a.value;
    }),
  ]);
}

$(document).ready(() => {
  populateControls();
});
