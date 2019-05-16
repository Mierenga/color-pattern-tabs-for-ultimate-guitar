chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.isConfig) { run(message); }
});

function run(config) {
  const tabContainer = getTablatureContainerElement();
  applyBaseStyles(tabContainer, config);
  const tabSheet = new ChronoTabParser(tabContainer.innerText);
  const tabStyler = new ChronoTabStyler(tabSheet, config.colorTheme || 'constructionpaper');
  const styledText = tabStyler.getStyledText();
  tabContainer.innerHTML = getTextModifications(styledText, config);
}

function getTablatureContainerElement() {
  let pres = document.getElementsByTagName('pre');
  if (!pres.length) { throw new Error('<pre> tag not found'); }
  return pres[0];
}

function applyBaseStyles(element, config) {
  // hide everything
  for (let child of document.body.children) {
    child.style.display = 'none';
  }

  let bgColor = config.backgroundColor || '#1B1B1B'
  element.style.display = 'block';
  // document.body.innerHTML += '<link href="https://fonts.googleapis.com/css?family=Oxygen+Mono" rel="stylesheet">';

  // add in the tab element
  document.body.append(element);
  element.className += " chronos_main"

  // apply styles
  document.body.style.backgroundColor = bgColor;
  element.style.backgroundColor = bgColor;
  element.style.padding = (config.margin || 80) + 'px';
  element.style.margin = '0 auto';
  element.style.fontSize = (config.fontSize || 24) + 'px';
  element.style.fontFamily = (config.font || 'Courier') + ', monospace';
  element.style.textAlign = config.alignment || 'center';
  element.style.color = config.textColor || 'grey';
}

function getTextModifications(text, config) {
  let modifiedText = text;
  // Replace all the dashes with en-dashes so they look nicer
  if (config.longDash) {
    modifiedText = modifiedText.split('-').join('–');
  }
  return modifiedText;

}
