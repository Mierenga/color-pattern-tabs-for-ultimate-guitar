document.chronos = ((exports)=>{
  let testConfig = {
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

  let run = files => chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    files.css.forEach(file => chrome.tabs.insertCSS(tabs[0].id, {file: file}))
    files.js.forEach((file, i) => {
      let cb = (i === files.js.length-1) ? (args) => {
        exports.postConfig(testConfig);
      } : undefined;
      chrome.tabs.executeScript(tabs[0].id, {file: file, }, cb)
    });
  });
   
  exports.simplify = () => run({
    js: [
      '/js/ChronoTabColors.js',
      '/js/ChronoTabParser.js',
      '/js/ChronoTabStyler.js',
      '/js/simplify.js',
    ],
    css: [
      '/css/chronos.css',
    ]
  });

  return exports;
})({});

document.chronos.simplify();
