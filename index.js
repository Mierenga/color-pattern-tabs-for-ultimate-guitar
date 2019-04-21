simplify();

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
