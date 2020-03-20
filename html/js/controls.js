import $ from './jquery.module.js';
import UiUtils from './uiutils.js';
import DumperCanvas from './dumperCanvas.js';

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

function dumpCanvas(dc) {
  const {width, height, colors} = dc.png;
  const wc = width * colors;
  const array = dc.asArray(a => a);
  let rows = [];
  for (let y = 0; y < height; y++) {
    const row = array.slice(wc * y, wc * (y+1));
    rows.push(row.join(", "));
  }
  $('#textarea').html(rows.join(',\n'));
}

function progressBarUpdate(ratio) {
  const percentage = Math.round(100 * ratio);
  $('#progressBar').css('width', `${percentage}%`);
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
    console.log(e);
  }

  // Create the UI controls
  // * File
  UiUtils.addGroup('gFile', 'File', [
    UiUtils.createFileBrowser('fileBrowser', 'load PNGs', true, onChangeFileBrowser),
  ]);
  UiUtils.addGroup('gPalette', 'Palette', [
    UiUtils.createColorPalette('colorPalette', [
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#ffffff',
      '#ff00ff',
      '#00ffff',
      '#aaff22',
      '#a0b080',
    ], onChangeColorPalette),
  ]);
}

$(document).ready(() => {
  populateControls();
});
