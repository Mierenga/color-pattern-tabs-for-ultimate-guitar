if (!window.chronosInjected) {
  window.chronosInjected = true;

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.isConfig) { run(message); }
  });

  function run(config) {
    document.chronos.tabContainer = getTablatureContainerElement();
    if (!document.chronos.rawText) {
      hideOriginalPage();
      let rawText = document.chronos.tabContainer.innerText;
      document.extutil.addProperty('chronos', 'rawText', rawText);
    }

    const tabSheet = new document.chronos.ChronoTabParser(document.chronos.rawText);
    const tabStyler = new document.chronos.ChronoTabStyler(tabSheet, config.colorTheme || 'constructionpaper');
    const styledLines = tabStyler.getStyledText();

    const oldContainer = document.getElementsByClassName('chronos_main')[0];
    if (oldContainer) { oldContainer.remove(); }

    const container = document.createElement('pre');
    applyBaseStyles(container, config);
    container.className = 'chronos_main';
    container.style.display = 'block';
    container.innerHTML = concludingLineStyles(styledLines, config).join('\n');
    document.body.append(container);
  }

  function getTablatureContainerElement() {
    let pres = document.getElementsByTagName('pre');
    if (!pres.length) { throw new Error('<pre> tag not found'); }
    return pres[0];
  }

  function hideOriginalPage() {
    // hide everything
    for (let child of document.body.children) {
      child.style.display = 'none';
    }
  }

  function applyBaseStyles(element, config) {
    // apply styles
    let bgColor = config.backgroundColor || '#1B1B1B'
    document.body.style.backgroundColor = bgColor;
    element.style.backgroundColor = bgColor;
    element.style.padding = (config.margin || 80) + 'px';
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

}