const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

export const LOCAL = true;

const drawViz = (message) => {
  const margin = {left: 75, right: 50, top: 50, bottom: 75};
  const height = dscc.getHeight();
  const width = dscc.getHeight();
  const chartHeight = height -25 - margin.top - margin.bottom;
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

  const square_length = 4

  // Add a scale for X
  const xScale = d3.scaleLinear()
      .domain([0, square_length])
      .range([0, chartWidth]);

  // Add a scale for Y
  const yScale = d3.scaleLinear()
      .domain([0, square_length])
      .range([chartHeight, 0]);

  // Add a scale for bubble size
  var zScale = d3.scaleLinear()
      //.domain([0, d3.max(message.tables.DEFAULT.map(function(d) { return d.sizeMetric; }))])
      .domain([0, 10000])
      .range([0, 0.08 * chartWidth]);

  // Add X axis
  svg.append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .attr("class", "axis")
      .call(d3.axisBottom(xScale).ticks(2))

  // Add Y axis
  svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).ticks(2));

  // gridlines in x axis function
  function make_x_gridlines() {
    return d3.axisBottom(xScale)
  }

  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(yScale)
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
  const myColor = d3.scaleOrdinal()
      // .domain(message.fields['xMetric'][0].name)
      // .domain(["Bilbao", "Durango", "Eibar", "Vitoria", "Donosti"])
      .range(["FF0B0B", "FF850B", "FFFF0B", "85FF0B"]);

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

  const bubble_opacity = message.style.bubble_opacity.value
      ? message.style.bubble_opacity.value
      : message.style.bubble_opacity.defaultValue;


  // Vertical half line
  svg.append('line')
      .attr('x1', xScale(square_length / 2 ))
      .attr('y1', yScale(0) )
      .attr('x2', xScale(square_length / 2 ))
      .attr('y2', yScale(square_length ))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)

  // Horizontal half line
  svg.append('line')
      .attr('y1', yScale(square_length / 2 ))
      .attr('x1', xScale(0) )
      .attr('y2', yScale(square_length / 2 ))
      .attr('x2', xScale(square_length ))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)

  // 4th Quadrant
  svg.append('rect')
      .attr('x', xScale(square_length)/2)
      .attr('y', yScale(square_length)/2)
      .attr('height', yScale(square_length/2))
      .attr('width', xScale(square_length/2))
      .attr('fill', '#ff0000')
      .attr("opacity", 0.2)

  // DATA
  svg.append("g")
      .selectAll("dot")
      .data(message.tables.DEFAULT)
      .enter()
      .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) { return xScale(d.xMetric); } )
        .attr("cy", function (d) { return yScale(d.yMetric); } )
        .attr("r", function (d) { if (true) return zScale(d.sizeMetric[1]); } )
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

  // LEGEND
  const legendData = d3.nest()
      .key(function(d) { return d.colorDimension})
      .entries(message.tables.DEFAULT)

  svg.selectAll("mydots")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cy", yScale(-0.2))
      .attr("cx", function(d,i){ return xScale(0.2 + i)})
      .attr("r", 4)
      .style("fill", function(d,i){ return myColor(i)})

  svg.selectAll("mylabels")
      .data(legendData)
      .enter()
      .append("text")
      .attr("y", yScale(-0.2))
      .attr("x", function(d,i){ return xScale(0.3 + i)}) // 100 is where the first dot appears. 25 is the distance between dots
      .text(function(d){ return d.key})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

  // HEADERS
  svg.append("text")
      .text("TITULO GENERAL")
      .attr("x", xScale(square_length / 2))
      .attr("y", yScale(0.1 + square_length))
      .attr("text-anchor", "middle")

  svg.append("text")
      .text("TITULO Y")
      .attr("text-anchor", "middle")
      .attr("transform", 'translate( '+xScale(-0.2)+' , '+yScale(2)+'),'+ 'rotate(-90)')

  svg.append("text")
      .text("TITULO X")
      .attr("x", xScale(square_length / 2))
      .attr("y", yScale(- 0.4))
      .attr("text-anchor", "middle")

};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}