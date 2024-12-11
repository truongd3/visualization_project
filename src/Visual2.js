import React, { Component } from "react";
import * as d3 from "d3";

class Visual2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  createChart() {
    const data = this.props.csv_data;
    if (!data || data.length === 0) {
      return;
    }

    //console.log(data)

    // Normalize the data
    const normalizedData = data.map(d => ({
      credit_mix: d.credit_mix ? d.credit_mix.trim() : null,
      credit_score: d.credit_score ? d.credit_score : null,
    }));

    console.log(normalizedData)

    // Credit mix categories and scores
    const creditMixes = ["Bad", "Standard", "Good"];
    const creditScores = ["Low", "Average", "High"];

// Assuming credit_score values are "Bad", "Standard", and "Good"
const scoreMap = {
    'Low': 0,
    'Average': 1,
    'High': 2
  };
  
  // Group data by credit mix
  const groupedData = creditMixes.map((credit_mix) => {
    const filtered = normalizedData.filter(d => d.credit_mix === credit_mix);
  
    // Initialize the counts array for Bad, Standard, Good
    const counts = filtered.reduce((acc, curr) => {
      const scoreIndex = scoreMap[curr.credit_score]; // Map the credit score to an index
      //console.log(curr)
      //console.log('currcreditscore',curr.credit_score)
      //console.log(scoreIndex)
      if (scoreIndex !== undefined) {
        acc[scoreIndex] += 1;
      }
      return acc;
    }, [0, 0, 0]);  // [Bad, Standard, Good]
  
    const total = counts.reduce((sum, count) => sum + count, 0);
  
    return {
      credit_mix: credit_mix,
      Low: total ? (counts[0] / total) * 100 : 0,
      Average: total ? (counts[1] / total) * 100 : 0,
      High: total ? (counts[2] / total) * 100 : 0,
    };
  });
  

    // Set up chart dimensions and margins
    const svgWidth = 960, svgHeight = 400;
    const margin = { top: 20, right: 120, bottom: 50, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#stacked-bar-chart");
    svg.selectAll("*").remove();  // Remove any previous chart elements

    const chart = svg
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X and Y scales
    const xScale = d3.scaleBand()
      .domain(creditMixes)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Color scale for the credit scores
    const colorScale = d3.scaleOrdinal()
      .domain(creditScores)
      .range(["red", "orange", "green"]);

    // Stack data based on credit scores
    const stackGen = d3.stack().keys(["Low", "Average", "High"]);
    const stackedSeries = stackGen(groupedData);

    console.log('grouped data',groupedData)

    // Render stacked bars
    chart.selectAll(".layer")
      .data(stackedSeries)
      .join("g")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => xScale(d.data.credit_mix))
      .attr("y", d => yScale(d[1]))  // Y position based on the stacked value
      .attr("height", d => yScale(d[0]) - yScale(d[1]))  // Height of each segment
      .attr("width", xScale.bandwidth());

    // Add X axis (credit mix)
    chart.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Add Y axis (percentage)
    chart.append("g")
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}%`));

    // Add a legend
    const legend = chart.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    creditScores.forEach((score, index) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", index * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(score));

      legend.append("text")
        .attr("x", 20)
        .attr("y", index * 20 + 12)
        .text(score);
    });
  }

  render() {
    return (
      <div>
        <svg id="stacked-bar-chart"><g></g></svg>
      </div>
    );
  }
}

export default Visual2;
