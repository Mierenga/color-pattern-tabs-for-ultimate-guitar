run();

function run() {
  const tabContainer = getTablatureContainerElement();
  applyBaseStyles(tabContainer);
  const unformattedLines = tabContainer.innerText.split('\n')
  const tabSheet = new ChronoTabParser(unformattedLines);


  styleFunctions = [];

  tabSheet.chronos.groupsList.forEach((group, groupIndex) => {
    group.items.sort((a, b) => a.position.x > b.position.y ? 1 : -1);
    group.items.sort((a, b) => a.position.x > b.position.y ? 1 : -1);
    group.items.forEach(item => {
      let x = item.position.x;
      let y = item.position.y;
      for (let i = 0; i < 6; i++) {
        styleFunctions.push({position: {x:x, y:y}, f: (lines)=>{
          let line = lines[i+x];
          lineReplacement = line;
          if (line[y] === 'x') { return; }
          let classes = ['chrono_column'];
          let color = getColorForIndex(group.groupIndex);
          if (line[y] !== '-') {
            classes.push('chrono_number');
            if (i === 0 || ['-', 'x'].some(symbol => tabSheet.raw.lines[i+x-1][y] === symbol)) {
              classes.push('top');
            }
            if (i === 5 || ['-', 'x'].some(symbol => tabSheet.raw.lines[i+x+1][y] === symbol)) {
              classes.push('bottom');
            }
            if (tabSheet.chronos.coordinateMap[x]) { 
              if (tabSheet.chronos.coordinateMap[x][y+1]) {
                let foundIndex = classes.indexOf('top');
                if (~foundIndex) { classes[foundIndex] = 'top_left'; }
                foundIndex = classes.indexOf('bottom')
                if (~foundIndex) { classes[foundIndex] = 'bottom_left'; }
                classes.push('double_left');
              } else if (tabSheet.chronos.coordinateMap[x][y-1]) {
                let foundIndex = classes.indexOf('top');
                if (~foundIndex) { classes[foundIndex] = 'top_right'; }
                foundIndex = classes.indexOf('bottom')
                if (~foundIndex) { classes[foundIndex] = 'bottom_right'; }
                classes.push('double_right');
              }
              lineReplacement = `${line.substring(0, y)}<span class="${classes.join(' ')}" style="background:${color}">${line[y]}</span>${line.substring(y+1)}`;
            } else {
              // TODO this isn't the right color to get
              // color = getColorForIndex(tabSheet.chronos.groupsList[groupIndex+1].groupIndex);
              lineReplacement = `${line.substring(0, y)}<span class="${classes.join(' ')}" style="background:${color}">${line[y]}</span>${line.substring(y+1)}`;
            }
          } else {
            classes.push('chrono_dash');
              lineReplacement = `${line.substring(0, y)}<span class="${classes.join(' ')}">${line[y]}</span>${line.substring(y+1)}`;

          }
          lines[i+x] = lineReplacement.trim();
        }});
      }
    });
  });


  var formattedLines = tabSheet.raw.lines.slice();

  // Start calling the style functions from the bottom-right
  styleFunctions.sort((a, b) => a.position.y > b.position.y ? 1 : -1);
  styleFunctions.sort((a, b) => a.position.x < b.position.x ? 1 : -1);
  styleFunctions.forEach(entry => entry.f(formattedLines));

  // Add all the padding onto the end of each line to make all lines the same length
  Object.keys(tabSheet.raw.linePaddings).forEach(indexKey => {
    formattedLines[indexKey] += ' '.repeat(tabSheet.raw.linePaddings[indexKey]);
  });

  // Recreate the single string of <pre> content
  tabContainer.innerHTML = formattedLines.join('\n');

  // Replace all the dashes with en-dashes so they look nicer
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

  // apply styles
  document.body.style.backgroundColor = bgColor;
  element.className += " chronos_main"
  element.style.padding = '80px';
  element.style.fontSize = '24px';
  element.style.margin = '0 auto';
  element.style.fontFamily = 'Courier, monospace';
  element.style.backgroundColor = bgColor;
  element.style.textAlign = 'center';
  element.style.color = 'white';
}

function getColorForIndex(i) {
  return document.chronos_colors[i%document.chronos_colors.length];
}

class EndOfRow extends Error { isEndOfRow = true; }
