chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.isConfig) { run(message); }
});

function run(config) {
  const tabContainer = getTablatureContainerElement();
  applyBaseStyles(tabContainer, config);
  const tabSheet = new ChronoTabParser(tabContainer.innerText);
  const tabStyler = new ChronoTabStyler(tabSheet, config.colorTheme || 'constructionpaper');
  const styledLines = tabStyler.getStyledText();
  tabContainer.innerHTML = concludingLineStyles(styledLines, config).join('\n');;
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

function formatLegend(lines) {
  let inTable = false;
  let tableWidth = 0;
  return lines.map(line => {
    if (line.match(/^\s*\*+\s*$/)) {
      line = line.trim()
        .replace(String.fromCharCode(13), '')
        .replace(/\*/g, '–');
      inTable = !inTable;
      tableWidth = line.length;
    } else if (inTable) {
      if (line.length < tableWidth) {
        line = line.replace(String.fromCharCode(13), '');
        line += ' '.repeat(tableWidth - line.length);
      }
    }
    return line;
  });
}

function concludingLineStyles(lines, config) {
  lines = formatLegend(lines);
  if (config.dashOverride !== '-') {
    lines = lines.map(line => line.replace(/-/g, config.dashOverride || '–'));
  }
  return lines;
}
