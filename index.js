class GUIConfig {
  constructor(controls, onChange) {
    this._config = controls.reduce((obj, control) => {
      obj[control.key] = control.value;
      return obj;
    }, {});
    this._gui = new dat.GUI();
    controls.forEach(entry => {
      let method = (()=> {
        switch (entry.type) {
          case 'color':  return 'addColor';
          default: return 'add';
        }
      })();
      let control;
      if (entry.options) {
        control = this._gui[method](this.kv, entry.key, entry.options);
      } else if (entry.min && entry.max) {
        control = this._gui[method](this.kv, entry.key, entry.min, entry.max);
      } else {
        control = this._gui[method](this.kv, entry.key);
        if (entry.min) {
           control.min(entry.min); 
        } else if (entry.max) {
           control.max(entry.max); 
        }
      }
      if (entry.step) { control.min(entry.step); }

      control.onFinishChange(() => onChange(this.kv));
      console.dir(control);
    });
    console.dir(this._gui);
  }
  get kv() { return this._config; }
};

document.chronos = ((exports)=>{

  exports.postConfig = (config) => {
    Object.assign(config, { isConfig: true });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, config);
    });
  };

  exports.gui = new GUIConfig([
    { key: 'fontSize',            value: 24, min: 1, max: 64, step: 1 },
    { key: 'margin',              value: 80, min: 0, max: 100, step: 1},
    { key: 'backgroundColor',     value: '#1B1B1B',   type: 'color'},
    { key: 'textColor',           value: '#5c5c5c',   type: 'color' },
    { key: 'font',                value: 'Courier', },
    { key: 'alignment',           value: 'center', options: ['center', 'left', 'right']},
    { key: 'dashOverride',        value: '', },
    { key: 'colorTheme',          value: 'constructionpaper', options: Object.keys(document.chronos_colors).sort()},
  ], exports.postConfig);

  let run = (files, data) => chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (typeof files !== 'object') { return; }
    if (files.css) {
      files.css.forEach(file => chrome.tabs.insertCSS(tabs[0].id, {file: file}))
    }
    if (files.js) {
      files.js.forEach((file, i) => {
      
        let cb = (i === files.js.length-1) ? (args) => {
          if (data) { exports.postConfig(data); }
        } : undefined;
        chrome.tabs.executeScript(tabs[0].id, {file: file, }, cb)
      });
    }
  });

  exports.loadLibs = () => {
    run({
      js: [
        '/lib/extutil.js',
        '/js/ChronoTabColors.js',
        '/js/ChronoTabParser.js',
        '/js/ChronoTabStyler.js',
      ],
      css: [
        '/css/chronos.css',
      ]
    });
  }
   
  exports.simplify = () => run({
    js: [
      '/js/simplify.js',
    ],
  }, exports.gui.kv);

  return exports;
})({});





document.chronos.loadLibs();
document.chronos.simplify();
