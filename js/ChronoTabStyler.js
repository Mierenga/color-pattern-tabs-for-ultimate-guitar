(() => {
  class ChronoTabStyler {
    constructor(tabSheet, colorTheme) {
      this.tabSheet = tabSheet;
      this.colorTheme = colorTheme;
      this._makeFunctions();
    }

    _makeFunctions() {
      this.stylers = [];
      this.tabSheet.chronos.groupsList.forEach(group => {
        for (let itemIndex = 0; itemIndex < group.items.length; itemIndex++) {
          let item = group.items[itemIndex];
          for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            let type = (item.width === 1 ? 'single' : 'left');
            this.stylers.push(this._makeStyler(
              item.position.x,
              item.position.y,
              group,
              stringIndex,
              type
            ));
            for (let w = 1; w < item.width; w++) {
              let type = (w === item.width - 1 ? 'right' : 'middle');
              this.stylers.push(this._makeStyler(
                item.position.x,
                item.position.y+w,
                group,
                stringIndex,
                type,
              ));
            }
          }
        }
      });
    }

    isTop(stringIndex, x, y) {
      return (stringIndex === 0 || ['-', 'x'].some(char => this.tabSheet.raw.lines[stringIndex+x-1][y] === char));
    }
    isBottom(stringIndex, x, y) {
      return (stringIndex === 5 || ['-', 'x'].some(char => this.tabSheet.raw.lines[stringIndex+x+1][y] === char));
    }

    _makeStyler(x, y, group, stringIndex, type) {
      return {
        position: {x, y},
        mutate: lines => {
          const line = lines[stringIndex+x];
          if (line[y] === 'x') { return; }
          const classes = ['chrono_column', type];
          if (line[y] === '-') {
            classes.push('chrono_dash');
          } else {
            classes.push(...[
              'chrono_number',
              this.isTop(stringIndex, x, y) ? 'top' : undefined,
              this.isBottom(stringIndex, x, y) ? 'bottom' : undefined,
            ].filter(Boolean));
            let note = group.chrono.split(document.chronos.ChronoTabParser.chronoNoteSeparator)[stringIndex];
            if (type !== 'single' && !note.includes('-')) { classes.push('double'); }
          }
          const color = classes.includes('chrono_number') && this.constructor.getColor(group.groupIndex, this.colorTheme);
          const styledReplacement = `<span class="${classes.join(' ')}" ${color ? `style="background:${color}"` : ''}>${line[y]}</span>`;
          const head = line.substring(0,y);
          const tail = line.substring(y+1);
          lines[stringIndex+x] = head + styledReplacement + tail;
        },
      };
    }

    getStyledText() {
      let lines = this.tabSheet.raw.lines.slice()

      // Sort so that we start at the bottom
      this.stylers.sort((a, b) => a.position.y > b.position.y ? 1 : -1);
      this.stylers.sort((a, b) => a.position.x < b.position.x ? 1 : -1);
      this.stylers.forEach(styler => styler.mutate(lines));

      // Add padding to the end of each line to make all lines the same length
      Object.keys(this.tabSheet.raw.linePaddings).forEach(indexKey => {
        lines[indexKey] = lines[indexKey].replace('\n', '');
        lines[indexKey] = lines[indexKey].replace(String.fromCharCode(13), '');
        lines[indexKey] += ' '.repeat(this.tabSheet.raw.linePaddings[indexKey]);
      });
      return lines;
    }

    static getColor(i, colorTheme) {
      return document.chronos_colors[colorTheme][i%document.chronos_colors[colorTheme].length];
    }
  }
  document.extutil.addProperty('chronos', 'ChronoTabStyler', ChronoTabStyler, false);
})();

