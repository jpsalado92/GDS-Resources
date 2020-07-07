const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

const drawViz = (message) => {
  const margin = { left: 100, right: 100, top: 100, bottom: 100 };
  const height = dscc.getHeight();
  const width = dscc.getWidth();
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;


  // remove existing svg
  d3.select("body")
      .selectAll("svg")
      .remove();

  // make a chartSvg
  const svg = d3
      .select("body")
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add a scale for X
  const xScale = d3.scaleLinear()
      .domain([0, 20])
      .range([ 0, chartWidth]);

  // Add a scale for Y
  const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([chartHeight, 0]);

  // Add a scale for bubble size
  const zScale = d3.scaleLinear()
      .domain([0, 10])
      .range([1, 50]);

  // Add X axis
  svg.append("g")
      .attr("transform", "translate(0," + chartHeight+ ")")
      .call(d3.axisBottom(xScale));

  // Add Y axis
  svg.append("g")
      .call(d3.axisLeft(yScale));

  // add dots
  const bubbles = svg.append("g")
      .selectAll("circle")
      .data(message.tables.DEFAULT)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return xScale(d.xMetric);
      })
      .attr("cy", function (d) {
        return yScale(d.yMetric);
      })
      .attr("r", function (d) {
        return zScale(d.sizeMetric);
      })
      .style("fill", "#b3698c")
      .style("opacity", "0.7")
      .attr("stroke", "black");

  const text = svg.append("g")
      .selectAll("text")
      .data(message.tables.DEFAULT)
      .enter()
      .append("text")
      .attr("x", function (d) { return xScale(d.xMetric); })
      .attr("y", function (d) { return yScale(d.yMetric); })
      .attr("text-anchor", "middle")
      .attr('font-size',20)
      .text(function (d) { return d.dimension;});
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}