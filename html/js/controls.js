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

function clearFileBrowser(id) {
  // https://stackoverflow.com/a/832730
  $(`#${id}`).replaceWith($(`#${id}`).val('').clone(true));
}

function dumpObject(obj) {
  const keys = Object.keys(obj);
  const lines = keys.map(k => `${k}: ${obj[k]}`);
  setInfo(lines.join(', '));
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

function dumpCanvas(dc) {
  const {height} = dc.png;
  const array = dc.asArray(DumpFunctions[selectedDumpFn]);
  const numColumns = array.length / height;
  let rows = [];
  for (let y = 0; y < height; y++) {
    const row = array.slice(numColumns * y, numColumns * (y+1));
    rows.push(row.join(", "));
  }
  $('#textarea').html(rows.join(',\n'));
}

function populateControls() {
  function onChangeFileBrowser(values) {
    for (let i = 0; i < values.length; i += 1) {
      console.log(`${values[i].name}, uri: ${values[i].uri}`);
      DumperCanvas.createAsync(values[i]).then((dc) => {
        console.log(dc.png);
        dc.canvas.onclick = dumpCanvas.bind(null, dc);
        $('#canvases').append(dc.canvas);
      });
    }
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
  const filterPresets = Object.keys(DumpFunctions).map((k) => {
    return {name: k, value: k};
  });
  UiUtils.addGroup('gFilters', 'Filters', [
    UiUtils.createDropdownList('filterFn', filterPresets, (a) => {
      selectedDumpFn = a.value;
    }),
  ]);
}

$(document).ready(() => {
  populateControls();
});
