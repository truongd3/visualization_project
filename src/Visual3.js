import React, { Component } from "react";
import * as d3 from "d3";

class Visual3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.createLineChart();
  }
  componentDidUpdate() {
    this.createLineChart();
  }

  createLineChart() {
    const data = this.props.csv_data;
    if (!data) return 0;
    console.log(data);

    const svgWidth = 800, svgHeight = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Parse data
    const parsedData = data;

    // Sort data by age to ensure line chart is smooth
    // parsedData.sort((a, b) => a.age - b.age);

    const xScale = d3.scaleLinear().domain(d3.extent(data, d => d.age)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.average_amount_invested)]).range([height, 0]);

    const lineGenerator = d3.line().x(d => xScale(d.age))
                                   .y(d => yScale(d.average_amount_invested))
                                   .curve(d3.curveCardinal);
    var pathData = lineGenerator(data);

    const svg = d3.select("#mysvg").attr("width", svgWidth).attr("height", svgHeight)
                                   .select("g")
                                   .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add the line path
    svg.selectAll("path").data([pathData]).join("path")
       .attr("fill", "none")
       .attr("stroke", "#b2df8a")
       .attr("stroke-width", 2)
       .attr("d", myd => myd);

    // X-axis
    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")))
       .append("text")
       .attr("x", width / 2)
       .attr("y", 40)
       .text("Age").style("fill", "black");
    // Y-axis
    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis')
       .call(d3.axisLeft(yScale))
       .append("text")
       .attr("x", -height / 2)
       .attr("y", -40)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .text("Average Amount Invested Monthly").style("fill", "black");

    // Add circles at data points
    svg.selectAll(".circle").data(parsedData).enter().append("circle")
              .attr("cx", d => xScale(d.age))
              .attr("cy", d => yScale(d.average_amount_invested))
              .attr("r", 4)
              .attr("fill", "red");
  }

  render() {
    return (
      <div className="child1">
        <svg id="mysvg"><g></g></svg>
      </div>
    );
  }
}

export default Visual3;
