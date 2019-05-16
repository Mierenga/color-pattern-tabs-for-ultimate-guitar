let ChronoTabParser = require('../js/ChronoTabParser');

console.assert(
  ChronoTabParser.mergeChronos('-|1|1|1|1|-', '-|1|2|2|3|-') === '--|11|12|12|13|--', 
0);
console.assert(
  ChronoTabParser.mergeChronos('-|1|1|9|x|-', '-|0|0|-|-|-') === '--|10|10|9-|x-|--',
1);
console.assert(
  ChronoTabParser.mergeChronos('-|1|-|4|2|-', '-|-|2|-|-|-') === null,
2);
