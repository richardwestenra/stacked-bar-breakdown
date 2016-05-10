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

const maxLevels = 5;

const chart = d3.select('#chart');

const { width } = chart.node().getBoundingClientRect(),
  height = width / 2;


// Make random data
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
      item.x = d3.scale.linear()
        .domain([0, d3.max(item.children.map(d => d.x1))])
        .range([0, width]);
    }
    dataRow.push(item);
  }
  return dataRow;
};

let data = makeRow(0, 7);

let x = d3.scale.linear()
  .domain([0, d3.max(data.map(d => d.x1))])
  .range([0, width]);

const y = d3.scale.ordinal()
  .domain([0,1,2,3,4,5])
  .rangeRoundBands([0, height], 0.2);

let svg = chart.append('svg')
  .attr('width', width)
  .attr('height', height);


const addRow = (d, x) => {
  if (!d.children) {
    return;
  }

  // Remove existing rows
  svg.selectAll('.row')
    .filter(dd => dd >= d.level)
    .transition()
    .attr('opacity', 0)
    .remove();

  let row = svg.append('g')
    .datum(d.level)
    .attr('class', 'row');

  row.attr('opacity', 0)
    .attr('transform', `translate(0,${ y(d.level) || 0 })`)
    .transition()
    .duration(777)
    .attr('opacity', 1)
    .attr('transform', `translate(0,${ y(d.level + 1) })`);

  let rect = row.selectAll('rect')
    .data(d.children)
    .enter()
    .append('rect')
    .attr('fill', dd => dd.color)
    .attr('x',  x(d.x0 || 0))
    .attr('width',  x(d.val || 0))
    .attr('y', 0)
    .attr('height', y.rangeBand())
    .on('click', dd => addRow(dd, d.x))
    .on('mouseover', (dd) => {
      if (d.level+2 < colours.length) {
        rect.filter(ddd => dd === ddd).attr('fill', colours[d.level+2][0]);
      }
    })
    .on('mouseout', () => {
      rect.attr('fill', dd => dd.color);
    });

  rect.transition()
    .duration(777)
    .attr('width',  dd => d.x(dd.val))
    .attr('x',  dd => d.x(dd.x0));
};

addRow({
  children: data,
  level: -1,
  x
}, x);

