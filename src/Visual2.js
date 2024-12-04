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
  
    const normalizedData = data.map(d => ({
      occupation: d.occupation ? d.occupation.trim().toLowerCase() : null,
      credit_score: d.credit_score ? parseInt(d.credit_score, 10) : null,
    }));
  
  
    const occupations = ["doctor", "teacher", "lawyer", "engineer", "other"];
    const creditScores = ["Poor", "Standard", "Good"];
  
    const groupedData = occupations.map((occupation) => {
      const filtered = normalizedData.filter(d => d.occupation === occupation.toLowerCase());
  
      const counts = filtered.reduce((acc, curr) => {
        if (curr.credit_score !== null && curr.credit_score >= 0 && curr.credit_score < 3) {
          acc[curr.credit_score] += 1;
        }
        return acc;
      }, [0, 0, 0]);
  
      const total = counts.reduce((sum, count) => sum + count, 0);
  
      const percentages = {
        occupation,
        Poor: total ? (counts[0] / total) * 100 : 0,
        Standard: total ? (counts[1] / total) * 100 : 0,
        Good: total ? (counts[2] / total) * 100 : 0,
      };
  
      return percentages;
    });
  
  

    const svgWidth = 960, svgHeight = 400;
    const margin = { top: 20, right: 120, bottom: 50, left: 50 }, 
          width = svgWidth - margin.left - margin.right,
          height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#stacked-bar-chart");
    svg.selectAll("*").remove();

    const chart = svg
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
                     .domain(occupations)
                     .range([0, width])
                     .padding(0.2);

    const yScale = d3.scaleLinear()
                     .domain([0, 100])
                     .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
                         .domain(creditScores)
                         .range(["red", "orange", "green"]); 

    const stackGen = d3.stack().keys(["Poor", "Standard", "Good"]);
    const stackedSeries = stackGen(groupedData);

    chart.selectAll(".layer")
      .data(stackedSeries)
      .join("g")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => xScale(d.data.occupation))
      .attr("y", d => {
        return yScale(d[1]);
      })
      .attr("height", d => {
        return yScale(d[0]) - yScale(d[1]);
      })
      .attr("width", xScale.bandwidth());

    chart.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append("g")
      .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${d}%`));

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
