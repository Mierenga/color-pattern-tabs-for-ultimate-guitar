chrome.runtime.onInstalled.addListener(function() {
  setupRules();
});

function setupRules() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        // new chrome.declarativeContent.PageStateMatcher({
        //   pageUrl: {hostEquals: 'tabs.ultimate-guitar.com'},
        // }),
        true,
      ],
      actions: [
        new chrome.declarativeContent.ShowPageAction(),
      ]
    }]);
  });
}
