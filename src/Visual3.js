import React, { Component } from "react";
import * as d3 from "d3";
import calculateAverageInvestedAmountByAge from "./calculateAverageInvestedAmountByAge";
import { sliderBottom } from "d3-simple-slider";

class Visual3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
  }
  componentDidUpdate() {
    this.createLineChart();
  }

  createLineChart() {
    const data = calculateAverageInvestedAmountByAge(this.props.csv_data);
    if (!data) return 0;
    console.log(data);

    const svgWidth = 500, svgHeight = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 500 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain(d3.extent(data, d => d.age)).range([0, width]);
    const yScale = d3.scaleLinear().domain([d3.min(data, d => d.average_amount_invested) - 10, d3.max(data, d => d.average_amount_invested)]).range([height, 0]);

    const lineGenerator = d3.line().x(d => xScale(d.age))
                                   .y(d => yScale(d.average_amount_invested))
                                   .curve(d3.curveCardinal);
    var pathData = lineGenerator(data);

    const svg = d3.select("#mysvg2").attr("width", svgWidth).attr("height", svgHeight)
                                   .select("g")
                                   .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.selectAll("*").remove();

    // Add the line path
    svg.selectAll("path").data([pathData]).join("path")
       .attr("fill", "none")
       .attr("stroke", "#f28b82")
       .attr("stroke-width", 3)
       .attr("d", myd => myd);

    // X-axis
    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")))
       .append("text")
       .attr("x", width / 2)
       .attr("y", 40)
       .text("Age").style("font-size", "16px").style("fill", "black").style("font-weight", "bold");
    // Y-axis
    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis')
       .call(d3.axisLeft(yScale))
       .append("text")
       .attr("x", -height / 2)
       .attr("y", -40)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .text("Average Amount Invested Monthly").style("font-size", "16px").style("fill", "black").style("font-weight", "bold");

    // Add circles at data points
    svg.selectAll(".circle").data(data).enter().append("circle")
              .attr("cx", d => xScale(d.age))
              .attr("cy", d => yScale(d.average_amount_invested))
              .attr("r", 3)
              .attr("fill", "#ea4335");

    const sliderRange = sliderBottom()
      .min(d3.min(data, d => d.age))
      .max(d3.max(data, d => d.age))
      .width(200)
      .ticks(3)
      .default([d3.min(data, d => d.age), d3.max(data, d => d.age)])
      .fill('#85bb65')
      .on('onchange', val => {
          const f_data = this.state.original_data.filter(d => d.age >= val[0] && d.age <= val[1]);
          this.setState({ filtered_data: f_data });
      });

    const gRange = d3.select('.slider-range')
      .attr('width', 200)
      .attr('height', 100)
      .selectAll('.slider-g')
      .data([null])
      .join('g')
      .attr('class', 'slider-g')
      .attr('transform', 'translate(90,30)');

  gRange.call(sliderRange);


  }

  render() {
    return (
      <div className="child1">
        <svg id="mysvg2"><g></g></svg>
        <svg className="slider-range"></svg>
      </div>
    );
  }
}

export default Visual3;
