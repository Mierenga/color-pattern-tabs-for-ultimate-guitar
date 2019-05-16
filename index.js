let chronos = ((exports)=>{

  let run = files => chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    files.css.forEach(file => chrome.tabs.insertCSS(tabs[0].id, {file: file}))
    files.js.forEach(file => chrome.tabs.executeScript( tabs[0].id, {file: file}));
  });
   
  exports.simplify = () => run({
    js: [
      '/js/chronos-colors.js',
      '/js/ChronoTabParser.js',
      '/js/simplify.js',
    ],
    css: [
      '/css/chronos-style.css',
    ]
  });

  return exports;
})({});

chronos.simplify();
