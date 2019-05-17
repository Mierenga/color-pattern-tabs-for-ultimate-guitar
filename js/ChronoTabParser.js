class ChronoTabParser {
  constructor(text) {
    this._rawLines = text.split('\n');
    this._groupLinesIntoStaffs();
    this._findAndGroupChronos();
  }

  _groupLinesIntoStaffs() {
    this._tabSheet = {
      tabLines: [],
      staffs: [],
      rawTabLineIndices: [],
      rawLinePaddings: {},
    };
    let currentStaffRawIndices = [];
    let currentStaff = [];
    let longestCurrentStaffLineLength = 0;
    this._tabSheet.tabLines = this._rawLines.filter((rawLine, rawLineIndex) => {
      if (ChronoTabParser.isTabLine(rawLine)) {
        console.log('found tab line');
        currentStaffRawIndices.push(rawLineIndex);
        let staffLine = rawLine.trim();
        currentStaff.push(staffLine);
        if (staffLine.length > longestCurrentStaffLineLength) {
          longestCurrentStaffLineLength = staffLine.length;
        }
        if (currentStaffRawIndices.length === 6) {
          this._tabSheet.rawTabLineIndices.push(currentStaffRawIndices.slice());
          this._tabSheet.staffs.push(currentStaff);
          currentStaff.forEach((line, i) => {
            this._tabSheet.rawLinePaddings[rawLineIndex-5+i] = longestCurrentStaffLineLength - line.length;
          })
          longestCurrentStaffLineLength = 0;
          currentStaffRawIndices = [];
          currentStaff = [];
        }
        return true;
      }
      return false;
    });
  }

  _findAndGroupChronos() {
    this._chronos = {
      groupsDict: {},
      groupsList: [],
      coordinateMap: {},
    };
    let chronoGroupIndex = 0;
    this._tabSheet.staffs.forEach((staff, staffIndex) => {
      for (let t = 0; t < staff[0].length; t++) {
        let chrono = ChronoTabParser.getChronoAt(t, staff);
        if (!chrono) { continue; }
        let adjacentChrono = ChronoTabParser.getChronoAt(t+1, staff);
        if (adjacentChrono) {
          let merged = ChronoTabParser.mergeChronos(chrono, adjacentChrono);
          if (merged) {
            chrono = merged;
          } else {
            adjacentChrono = null;
          }
        }
        if (!this._chronos.groupsDict[chrono]) {
          this._chronos.groupsDict[chrono] = {
            groupIndex: chronoGroupIndex,
          };
          this._chronos.groupsList.push({
            chrono: chrono,
            items: [],
            groupIndex: chronoGroupIndex,
          });
          chronoGroupIndex++;
        }
        let instance = {
          position: {
            x: this._tabSheet.rawTabLineIndices[staffIndex][0],
            y: t,
          },
          width: (adjacentChrono ? 2 : 1),
        };
        let groupIndex = this._chronos.groupsDict[chrono].groupIndex;
        this._chronos.groupsList[groupIndex].items.push(instance);

        if (!this._chronos.coordinateMap[instance.position.x]) {
          this._chronos.coordinateMap[instance.position.x] = {};
        }
        this._chronos.coordinateMap[instance.position.x][instance.position.y] = chrono;
        if (adjacentChrono) { t++; };
      }
    });
  }

  get tab() {
    return {
      lines: this._tabSheet.tabLines,
      staffs: this._tabSheet.staffs,
    }
  }

  get raw() {
    return {
      lines: this._rawLines,
      tabLineIndices: this._tabSheet.rawTabLineIndices,
      linePaddings: this._tabSheet.rawLinePaddings,
    }
  }

  get chronos() {
    return {
      groupsList: this._chronos.groupsList,
      coordinateMap: this._chronos.coordinateMap,
    };
  }

  /**
   * Return a two-deigit chrono merged from two adjacent
   * columns 
   * mergeChronos('-|1|1|1|1|-|-', '-|1|2|2|3|-|-') === '-|11|12|12|13|-|-'
   */
  static mergeChronos(chronoA, chronoB) {
    let a = chronoA.split(ChronoTabParser.chronoNoteSeparator);
    let b = chronoB.split(ChronoTabParser.chronoNoteSeparator);
    let merged = a.map((val, i) => val + b[i]);
    // Chronos that don't share any strings can't be merged
    if (merged.every(val => val.includes('-'))) { return null; } 
    return merged.join(ChronoTabParser.chronoNoteSeparator);
  }


  /**
   * Return the column representing a single note or chord in time if one
   * is found, otherwise return null.
   * @param {number} index the position in the `staff` to pull a chrono
   * @param {Array<string>} staff items representing discrete sequential musical notes or chords
   * @return {string|null} the sequence of numbers, dashes, and other special
   *  characters that make up the chrono
   */
  static getChronoAt(index, staff) {
    if (index >= staff[0].length) { return null; }
    let chrono = staff.map(string =>  string[index]).join('');
    if (/[0-9]/.exec(chrono) === null) { return null; };
    return chrono.split('').join(ChronoTabParser.chronoNoteSeparator);
  }

  /**
   * Determine if a line of raw text is formatted as a line of tablature.
   * @param {string} line the line of text to check for tab formatting
   * @returns {boolean} whether the text matches the known requirements for
   *   being a line of tablature
   */
  static isTabLine(line) {
    return ((l) => 
      (/^[abcdefgABCDEFG][\|:][0-9(\-]/.exec(l) !== null) ||
      (/-[0-9)\s\-]*\|/.exec(l) !== null)
    )(line.trim());
  }

  static get chronoNoteSeparator() {
    return '|';
  }
}

