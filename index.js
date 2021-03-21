class GUIConfig {
  constructor(kv, controls, onChange) {
    kv = kv || {};
    this._config = controls.reduce((obj, control) => {
      if (kv[control.key] !== undefined) {
        obj[control.key] = kv[control.key];
      } else {
        obj[control.key] = control.default;
      }
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
      if (entry.name) { control.name(entry.name); }

      control.onFinishChange(() => onChange(this.kv));
    });
    let datGuiElement = document.getElementsByClassName('dg main a')[0];
    console.log(datGuiElement.style);
    document.body.style.width = datGuiElement.offsetWidth + 'px';
    document.body.style.height = '300px';
    console.log('gui');
    console.log(this._gui);
    this._gui.__closeButton.hidden = true;
  }
  get kv() { return this._config; }
};

document.chronos= ((namespace)=>{
  namespace.postConfig = (config) => {
    Object.assign(config, { isConfig: true });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, config);
    });
  };

  namespace.defaultControls = [
    { 
      key: 'colorTheme',
      name: 'color theme',
      default: 'coolit',
      options: Object.keys(document.chronos_colors).sort()
    },
    {
      key: 'fontSize',
      name: 'font size',
      default: 24, min: 1, max: 64, step: 1
    },
    {
      key: 'margin',
      default: 80, min: 0, max: 100, step: 1},
    {
      key: 'backgroundColor',
      name: 'background',
      default: '#1B1B1B',
      type: 'color'
    },
    {
      key: 'textColor',
      name: 'text color',
      default: '#5c5c5c',
      type: 'color'
    },
    {
      key: 'font',
      default: 'Courier',
    },
    {
      key: 'alignment',
      default: 'center',
      options: ['center', 'left', 'right']
    },
    {
      key: 'dashOverride',
      name: 'override dash',
      default: '',
    },
    {
      key: 'undoChanges',
      name: 'Undo Changes',
      default: () => {
        namespace.gui._gui.__controllers.forEach(controller => {
          controller.setValue(controller.initialValue);
        });
      },
    },
    {
      key: 'resetToDefault',
      name: 'Reset to Defaults',
      default: () => {
        let defaultControlsMap = namespace.defaultControls.reduce((obj, control) => {
          obj[control.key] = control.default;
          return obj;
        }, {});
        namespace.gui._gui.__controllers.forEach(controller => {
          controller.setValue(defaultControlsMap[controller.property]);
        });
      },
    },
  ];

  onControlValuesChanged = (kv) => {
    namespace.postConfig(kv);
    chrome.storage.sync.set({config: kv}, (err) => {
      if (err) { console.log('error saving kv to storage'); }
    });
  };


  namespace.gui = new GUIConfig(namespace.loadedConfig, namespace.defaultControls, onControlValuesChanged);

  let run = (files, data) => chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (typeof files !== 'object') { return; }
    if (files.css) {
      files.css.forEach(file => chrome.tabs.insertCSS(tabs[0].id, {file: file}))
    }
    if (files.js) {
      files.js.forEach((file, i) => {
      
        let cb = (i === files.js.length-1) ? (args) => {
          if (data) { namespace.postConfig(data); }
        } : undefined;
        chrome.tabs.executeScript(tabs[0].id, {file: file, }, cb)
      });
    }
  });

  namespace.loadLibs = () => {
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
   
  namespace.inject = () => run({
    js: [
      '/js/inject.js',
    ],
  }, namespace.gui.kv);

  return namespace;
})

// chrome.storage.sync.set({config: {}}, ()=>{});
chrome.storage.sync.get('config', (retrieved) => {
  document.chronos = document.chronos({ loadedConfig: retrieved.config });
  document.chronos.loadLibs();
  document.chronos.inject();
});
