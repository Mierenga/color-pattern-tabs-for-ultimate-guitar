document.chronos = ((exports)=>{
  exports.activeConfig = {
    isConfig: true,
    fontSize: 24,
    margin: 80,
    backgroundColor: '#1B1B1B',
    font: 'Courier',
    alignment: 'center',
    textColor: 'grey',
    longdashOverride: ' ',
    colorTheme: 'nature',
  };

  exports.postConfig = (config) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, config);
    });
  };

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
  }, exports.activeConfig);

  return exports;
})({});


let gui = new dat.GUI();
gui.add(document.chronos.activeConfig, 'colorTheme');

document.chronos.loadLibs();
document.chronos.simplify();
