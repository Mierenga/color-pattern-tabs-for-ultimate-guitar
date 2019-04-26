run();

function run() {

  let pres = document.getElementsByTagName('pre');
  if (!pres.length) { throw new Error('<pre> tag not found'); }
  let pre = pres[0];
  for (let child of document.body.children) {
    child.style.display = 'none';
  }

  let bgColor = '#1B1B1B'
  pre.style.display = 'block';
  document.body.innerHTML += '<link href="https://fonts.googleapis.com/css?family=Oxygen+Mono" rel="stylesheet">';

  let colors = document.chronos_colors;

  document.body.append(pre);
  document.body.style.backgroundColor = bgColor;
  pre.className += " chronos-main"
  pre.style.padding = '80px';
  pre.style.fontSize = '24px';
  pre.style.margin = '0 auto';
  pre.style.fontFamily = 'monospace';
  pre.style.backgroundColor = bgColor;
  pre.style.textAlign = 'center';
  pre.style.color = 'white';

  let preLines = pre.innerText.split('\n')
  let tabLineIndices = [];
  let tabRow = [];
  let tabLines = preLines.filter((line, i) => {
    if (isTabLine(line)) {
      tabRow.push(i);
      if (tabRow.length === 6) {
        tabLineIndices.push(tabRow.slice());
        tabRow = [];
      }
      return true;
    }
    return false;
  });

  let lineIndex = 0;
  let tabRows = [];
  tabRow = [];
  while (lineIndex < tabLines.length) {
    for (let i = 0; i < 6; i++) {
      let line = tabLines[lineIndex].trim();
      tabRow.push(line);
      lineIndex++;
    }
    tabRows.push(tabRow.slice());
    tabRow = [];
  }

  let linePaddings = {};
  let chronos = {};
  tabRows.forEach((row, tabRowIndex) => {

    let longest = row.reduce((longest, line) => line.length > longest ? line.length : longest, 0);
    row.forEach((line, i) => {
      linePaddings[tabLineIndices[tabRowIndex][i]] = (longest - line.length);
    })

    for (let chronoIndex = 0; chronoIndex < row[0].length; chronoIndex++) {
      chrono = (getChronoAt(chronoIndex, row));
      if (chrono !== null) {
        if (!chronos[chrono]) {
          chronos[chrono] = {
            instances: [],
            tabRow: row,
          };
        }
        chronos[chrono].instances.push({
          position: { x: tabLineIndices[tabRowIndex][0], y: chronoIndex}
        });
      }

    }
  });


  chronoTable = [];
  Object.keys(chronos).forEach((key, i) => {
    chronoTable.push({
      chrono: key,
      count: chronos[key].instances.length,
      items: chronos[key].instances,
      color: colors[i%colors.length],
      tabRow: chronos[key].tabRow,
    });
  });

  chronoTable.sort((a, b) => a.count < b.count ? 1 : -1);

  styleFunctions = [];

  chronoTable.forEach((group, groupIndex) => {
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
          if (line[y] !== '-') {
            classes = 'chrono '
            if (i === 0 || ['-', 'x'].some(symbol => lines[i+x-1][y] === symbol)) {
              classes += 'top ';
            }
            if (i === 5 || ['-', 'x'].some(symbol => lines[i+x+1][y] === symbol)) {
              classes += 'bottom ';
            }
            lineReplacement = `${line.substring(0, y)}<span class="${classes}" style="background:${group.color}">${line[y]}</span>${line.substring(y+1)}`;
          }
          lines[i+x] = lineReplacement.trim();
        }});
      }
    });
  });

  // Start calling the style functions from the bottom-right
  styleFunctions.sort((a, b) => a.position.y > b.position.y ? 1 : -1);
  styleFunctions.sort((a, b) => a.position.x < b.position.x ? 1 : -1);
  styleFunctions.forEach(entry => entry.f(preLines));

  // Add all the padding into each line 
  Object.keys(linePaddings).forEach(indexKey => {
    preLines[indexKey] = preLines[indexKey] + ' '.repeat(linePaddings[indexKey]);
  });

  // Recreate the single string of <pre> content
  pre.innerHTML = preLines.join('\n');

  // Replace all the dashes with en-dashes so they look nicer
  pre.innerHTML = pre.innerHTML.split('-').join('–');
}

function isTabLine(line) {
  return ((l) => { 
      return (/^[abcdefgABCDEFG][\|:][0-9(\-]/.exec(l) !== null) ||
             (/-[0-9)\s\-]*\|/.exec(l) !== null);
  })(line.trim());
}


function getChronoAt(index, tabRow) {
  if (index >= tabRow[0].length) { throw new EndOfRow(); }
  let chrono = tabRow.map(string => string[index]).join('');
  if (/[0-9]/.exec(chrono) === null) { return null; };
  return chrono;
}


class EndOfRow extends Error { isEndOfRow = true; }
