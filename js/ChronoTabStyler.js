class ChronoTabStyler {
  constructor(tabSheet, colorTheme) {
    this.tabSheet = tabSheet;
    this.colorTheme = colorTheme;
    this._buildFunctions();
  }

  _buildFunctions() {
    this.styleFunctions = [];
    this.tabSheet.chronos.groupsList.forEach((group, groupIndex) => {
      for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
        let item = group.items[itemIndex];
        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
          this._pushStyleFunction(item.position.x, item.position.y, group, stringIndex, (item.width === 1 ? 'single' : 'left'));
          for (let w = 1; w < item.width; w++) {
            let type = (w === item.width - 1 ? 'right' : 'middle');
            this._pushStyleFunction(item.position.x, item.position.y+w, group, stringIndex, type);
          }
        }
      }
    });
  }

  _pushStyleFunction(x, y, group, stringIndex, type) {
    this.styleFunctions.push({position: {x:x, y:y}, f: (lines) => {
      let line = lines[stringIndex+x];
      let styledReplacement = line[y];
      if (line[y] === 'x') { return; }
      let classes = ['chrono_column'];
      let color = ChronoTabStyler.colorGenerator(group.groupIndex, this.colorTheme);
      if (line[y] !== '-') {
        classes.push('chrono_number');
        if (stringIndex === 0 || ['-', 'x'].some(symbol => this.tabSheet.raw.lines[stringIndex+x-1][y] === symbol)) {
          classes.push('top');
        }
        if (stringIndex === 5 || ['-', 'x'].some(symbol => this.tabSheet.raw.lines[stringIndex+x+1][y] === symbol)) {
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
  getStyledText() {
    let lines = this.tabSheet.raw.lines.slice()
    this.styleFunctions.sort((a, b) => a.position.y > b.position.y ? 1 : -1);
    this.styleFunctions.sort((a, b) => a.position.x < b.position.x ? 1 : -1);
    this.styleFunctions.forEach(entry => entry.f(lines));

    // Add all the padding onto the end of each line to make all lines the same length
    Object.keys(this.tabSheet.raw.linePaddings).forEach(indexKey => {
      lines[indexKey] = lines[indexKey].replace('\n', '');
      lines[indexKey] = lines[indexKey].replace(String.fromCharCode(13), '');
      lines[indexKey] += ' '.repeat(this.tabSheet.raw.linePaddings[indexKey]);
    });
    return lines.join('\n');
  }
  static colorGenerator(i, colorTheme) {
    return document.chronos_colors[colorTheme][i%document.chronos_colors[colorTheme].length];
  }
};

