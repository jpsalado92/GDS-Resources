const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

export const LOCAL = true;

const drawViz = (message) => {
  const margin = {left: 100, right: 100, top: 100, bottom: 100};
  const height = dscc.getHeight();
  const width = height;
  const chartHeight = height - margin.top - margin.bottom;
  const chartWidth = width - margin.left - margin.right;

  // remove existing svgs
  d3.select("body")
      .selectAll("svg")
      .remove();

  // make a chartSvg
  const svg = d3.select("body")
      .append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

  // Add a scale for X
  const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, chartWidth]);

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
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(xScale));

  // Add Y axis
  svg.append("g")
      .call(d3.axisLeft(yScale));

  // gridlines in x axis function
  function make_x_gridlines() {
    return d3.axisBottom(xScale)
        .ticks(10)
  }

// gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(yScale)
        .ticks(10)
  }

  // add the X gridlines
  svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(make_x_gridlines()
          .tickSize(-chartHeight)
          .tickFormat("")
      )

  // add the Y gridlines
  svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-chartWidth)
          .tickFormat("")
      )

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal()
      // .domain(message.fields['xMetric'][0].name)
      // .domain(["Bilbao", "Durango", "Eibar", "Vitoria", "Donosti"])
      .range(["f94144", "f3722c", "f9c74f", "90be6d"]);

  // Add tooltip
    // -1- Create a tooltip div that is hidden by default:
  const tooltip = d3.select("body")
      .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")

  const showTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html(message.fields['xMetric'][0].name + ": " + d.xMetric + "<br />" +
                  message.fields['yMetric'][0].name + ": " + d.yMetric + "<br />" +
                  message.fields['sizeMetric'][0].name + ": " + d.yMetric + "<br />")
            .style("left", d3.event.pageX+30 + "px")
            .style("top", d3.event.pageY+30 + "px")
    }
  const moveTooltip = function(d) {
        tooltip
            .style("left", (d3.event.pageX+30) + "px")
            .style("top", (d3.event.pageY+30) + "px")
    }
  const hideTooltip = function(d) {
      tooltip
          .transition()
          .duration(200)
            .style("opacity", 0)
    }
  const bubble_color = message.style.bubble_color.value.color
      ? message.style.bubble_color.value.color
      : message.style.bubble_color.defaultValue;

  const bubble_opacity = message.style.bubble_opacity.value
      ? message.style.bubble_opacity.value
      : message.style.bubble_opacity.defaultValue;

  // add dots
  svg.append("g")
      .selectAll("dot")
      .data(message.tables.DEFAULT)
      .enter()
      .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) { return xScale(d.xMetric); } )
        .attr("cy", function (d) { return yScale(d.yMetric); } )
        .attr("r", function (d) { return zScale(d.sizeMetric); } )
        .style("stroke", "black")
        .style("opacity", bubble_opacity)
        .style("fill", function (d) { return myColor(d.colorDimension); } )
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )

  svg.append("g")
      .selectAll("text")
      .data(message.tables.DEFAULT)
      .enter()
      .append("text")
        .attr("x", function (d) {return xScale(d.xMetric); })
        .attr("y", function (d) {return yScale(d.yMetric); })
        .attr("text-anchor", "middle")
        .text(function (d) { return d.mainDimension; });
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}