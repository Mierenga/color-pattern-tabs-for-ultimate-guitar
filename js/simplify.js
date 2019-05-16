run();

function run() {
  const tabContainer = getTablatureContainerElement();
  applyBaseStyles(tabContainer);
  const unformattedLines = tabContainer.innerText.split('\n')
  const tabSheet = new ChronoTabParser(unformattedLines);

  // const tabStyler;

  styleFunctions = [];

  tabSheet.chronos.groupsList.forEach((group, groupIndex) => {
    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
      let item = group.items[itemIndex];
      for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        pushStyleFunction(item.position.x, item.position.y, group, stringIndex, (item.width === 1 ? 'single' : 'left'));
        for (let w = 1; w < item.width; w++) {
          let type = (w === item.width - 1 ? 'right' : 'middle');
          pushStyleFunction(item.position.x, item.position.y+w, group, stringIndex, type);
        }
      }
    }
  });

  function pushStyleFunction(x, y, group, stringIndex, type) {
    styleFunctions.push({position: {x:x, y:y}, f: (lines) => {
      let line = lines[stringIndex+x];
      let styledReplacement = line[y];
      if (line[y] === 'x') { return; }
      let classes = ['chrono_column'];
      let color = getColorForIndex(group.groupIndex);
      if (line[y] !== '-') {
        classes.push('chrono_number');
        if (stringIndex === 0 || ['-', 'x'].some(symbol => tabSheet.raw.lines[stringIndex+x-1][y] === symbol)) {
          classes.push('top');
        }
        if (stringIndex === 5 || ['-', 'x'].some(symbol => tabSheet.raw.lines[stringIndex+x+1][y] === symbol)) {
          classes.push('bottom');
        }
        let note = group.chrono.split(ChronoTabParser.chronoNoteSeparator)[stringIndex];
        if (type !== 'single' && !note.includes('-')) {
          if (type==='left') {
            let foundIndex = classes.indexOf('top');
            if (~foundIndex) { classes[foundIndex] = 'top_left'; }
            foundIndex = classes.indexOf('bottom')
            if (~foundIndex) { classes[foundIndex] = 'bottom_left'; }
            classes.push('double_left');
          } else if (type==='right' && line[y-1].match(/[0-9]/)) {
            let foundIndex = classes.indexOf('top');
            if (~foundIndex) { classes[foundIndex] = 'top_right'; }
            foundIndex = classes.indexOf('bottom')
            if (~foundIndex) { classes[foundIndex] = 'bottom_right'; }
            classes.push('double_right');
          }
        }
        styledReplacement = `<span class="${classes.join(' ')}" style="background:${color}">${line[y]}</span>`;
      } else {
        classes.push('chrono_dash');
        styledReplacement = `<span class="${classes.join(' ')}">${line[y]}</span>`;

      }
      let head = line.substring(0,y);
      let tail = line.substring(y+1);
      lines[stringIndex+x] = head + styledReplacement + tail;
    }});

  }


  var formattedLines = tabSheet.raw.lines.slice();

  // Start calling the style functions from the bottom-right
  styleFunctions.sort((a, b) => a.position.y > b.position.y ? 1 : -1);
  styleFunctions.sort((a, b) => a.position.x < b.position.x ? 1 : -1);
  styleFunctions.forEach(entry => entry.f(formattedLines));

  // Add all the padding onto the end of each line to make all lines the same length
  Object.keys(tabSheet.raw.linePaddings).forEach(indexKey => {
    // console.log(`padding: ${tabSheet.raw.linePaddings[indexKey]}`);
    // console.log(`a: ${formattedLines[indexKey].length}`);
    // formattedLines[indexKey].replace('\n', '');
    console.log(formattedLines[indexKey]);
    formattedLines[indexKey] += 'Z'.repeat(tabSheet.raw.linePaddings[indexKey]);
    // formattedLines[indexKey].replace('\n', '');
    // console.log(`b: ${formattedLines[indexKey].length}`);
  });

  // Recreate the single string of <pre> content
  let tabText = formattedLines.join('\n');
  tabContainer.innerHTML = tabText;

  // Replace all the dashes with en-dashes so they look nicer
  // TODO option
  tabContainer.innerHTML = tabContainer.innerHTML.split('-').join('–');
}

function getTablatureContainerElement() {
  let pres = document.getElementsByTagName('pre');
  if (!pres.length) { throw new Error('<pre> tag not found'); }
  return pres[0];
}

function applyBaseStyles(element) {
  // hide everything
  for (let child of document.body.children) {
    child.style.display = 'none';
  }

  let bgColor = '#1B1B1B'
  element.style.display = 'block';
  // document.body.innerHTML += '<link href="https://fonts.googleapis.com/css?family=Oxygen+Mono" rel="stylesheet">';

  // add in the tab element
  document.body.append(element);
  element.className += " chronos_main"

  // apply styles
  // TODO option
  document.body.style.backgroundColor = bgColor;
  element.style.backgroundColor = bgColor;
  // TODO option
  element.style.padding = '80px';
  // TODO option
  element.style.fontSize = '24px';
  element.style.margin = '0 auto';
  // TODO option
  element.style.fontFamily = 'Courier, monospace';
  // TODO option
  element.style.textAlign = 'center';
  // TODO option
  element.style.color = 'grey';
}

function getColorForIndex(i) {
  return document.chronos_colors[i%document.chronos_colors.length];
}

class EndOfRow extends Error { isEndOfRow = true; }
