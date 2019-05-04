window.onload = function() {
  addGUI();
}

simplify();
// Automatically apply the simplify feature when the extension is clicked


console.log('did we get \'em?');
console.log(controls-gui);
console.log(State);

function simplify() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.insertCSS(
        tabs[0].id,
        {file: '/css/chronos-style.css'});
    chrome.tabs.executeScript(
        tabs[0].id,
        {file: '/js/chronos-colors.js'});
    chrome.tabs.executeScript(
        tabs[0].id,
        {file: '/js/simplify.js'});
  });
}

function addGUI() {
  let controls = new BasicControls();
  let gui = new dat.GUI();
  gui.add(controls, 'use_colors');
  gui.add(controls, 'color_schemes');
  gui.add(controls, 'text_size', 4, 64).step(1);
}

let BasicControls = function() {
  this.use_colors = true;
  this.text_size = 24;
  this.color_schemes = ['chill_out', 'star_brite', 'construction_paper'];
}

function wrapGUI (state, opts) {
  const root = document.createElement('div');
  const gui = GUI(state, Object.assign({
      root: root,
      containerCSS: "max-width:350px;padding:30px 0;",
      theme: Object.assign({}, (opts || {}).theme, {
        fontFamily: "'Helvetica', sans-serif",
        fontSize: '13px',
      }),
    }, opts || {}))
    .$onChanges(e => root.dispatchEvent(new CustomEvent("input")));
  root.value = state;
  return root;
}

