// random number generator
const rand = (n = 99) => Math.round( Math.random() * n );

// Shareholder chart color palette:
const colours = [
  ['#F478A0', '#F693B3', '#F8AEC6', '#FAC9D9', '#FCE4EC'], // pink
  ['#A7E16D', '#B8E78A', '#CAEDA7', '#DBF3C4', '#EDF9E1'], // lime
  ['#4AC8E2', '#6ED3E7', '#92DEED', '#B6E9F3', '#DAF4F9'], // cyan
  ['#F9C364', '#FACF83', '#FBDBA2', '#FCE7C1', '#FDF3E0'], // gold
  ['#6A77EA', '#8792EE', '#A5ADF2', '#C3C8F6', '#E1E3FA'], // purple
  ['#ED8EEE', '#F0A4F1', '#F4BBF4', '#F7D1F8', '#FBE8FB'] // mauve
];

const maxLevels = 3;

const makeRow = (i, rowCount) => {
  let dataRow = [],
    x0 = 0;
  rowCount = rowCount || rand(20);

  for (let ii = 0; ii < rowCount; ii++) {
    let val = rand();
    let item = {
      val,
      level: i,
      color: colours[i%colours.length][ii%colours[i%colours.length].length],
      x0: x0,
      x1: x0 += val,
    };
    if (i < maxLevels) {
      item.children = makeRow(i+1);
    }
    dataRow.push(item);
  }
  return dataRow;
};

// Make random data
var data = makeRow(0, 7);

console.log(data);


const chart = d3.select('#chart');

const { width } = chart.node().getBoundingClientRect(),
  height = width / 2;

let x = d3.scale.linear()
  .domain([0, d3.max(data.map(d => d.x1))])
  .range([0, width]);

const y = d3.scale.ordinal()
  .domain([0,1,2,3])
  .rangeRoundBands([0, height], 0.2);

let addRow = (d) => {
  if (!d.children) {
    return;
  }
  d3.selectAll('.row' + d.level)
    .transition()
    .attr('opacity', 0);

  let row = svg.append('g')
    .attr('class', 'row row' + d.level);

  row.attr('opacity', 0)
    .attr('transform', `translate(0,${ y(d.level) })`)
    .transition()
    .duration(777)
    .attr('opacity', 1)
    .attr('transform', `translate(0,${ y(d.level + 1) })`);

  let rect = row.selectAll('rect')
    .data(d.children)
    .enter()
    .append('rect')
    .attr('fill', dd => dd.color)
    .attr('x',  x(d.x0))
    .attr('width',  x(d.val))
    .attr('y', 0)
    .attr('height', 100)
    .on('click', addRow);

  x.domain([0, d3.max(d.children.map(dd => dd.x1))]);

  rect.transition()
    .duration(777)
    .attr('width',  dd => x(dd.val))
    .attr('x',  dd => x(dd.x0));
};

let svg = chart.append('svg')
  .attr('width', width)
  .attr('height', height);

let row = svg.append('g')
  .attr('class', 'row')
  .attr('transform', `translate(0,${ y(0) })`);

row.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('fill', d => d.color)
  .attr('y', 0)
  .attr('height', 100)
  .attr('x',  0)
  .attr('width',  0)
  .on('click', addRow)
  .transition()
  .duration(777)
  .attr('width',  d => x(d.val))
  .attr('x',  d => x(d.x0));
