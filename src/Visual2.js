import React, { Component } from "react";
import * as d3 from "d3";

class Visual2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
        yAxis: 'count',
    };
  }

  handleRadioClick = (event) => {
    //console.log(event.target.value)
    this.setState({
        yAxis: event.target.value,
    })
  };

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
      credit_score: d.credit_score ? d.credit_score : null, //credit_score: d.credit_score ? d.credit_score : null,
    }));

    //console.log(normalizedData)

    // Credit mix categories and scores
    const creditMixes = ["Bad", "Standard", "Good"];
    const creditScores = ["High", "Average", "Low"];

// Assuming credit_score values are "Bad", "Standard", and "Good"
const scoreMap = {
    'Low': 0,
    'Average': 1,
    'High': 2
  };
  

  var maxValue = d3.mean(data, d => parseFloat(d[this.state.yAxis])) * 4;

  // Group data by credit mix
  const groupedData = creditMixes.map((credit_mix) => {
    const filtered = normalizedData.filter(d => d.credit_mix === credit_mix);
  
    // Initialize the counts array for Bad, Standard, Good
    const counts = filtered.reduce((acc, curr) => {
      const scoreIndex = scoreMap[curr.credit_score]; // Map the credit score to an index

      if (scoreIndex !== undefined) {
        acc[scoreIndex] += 1;
      }
      return acc;
    }, [0, 0, 0]);  // [Bad, Standard, Good]
  
    const total = counts.reduce((sum, count) => sum + count, 0);
    
    if (this.state.yAxis === 'count'){
        return {
        credit_mix: credit_mix,
        Low: total ? (counts[0] / total) * 100 : 0,
        Average: total ? (counts[1] / total) * 100 : 0,
        High: total ? (counts[2] / total) * 100 : 0,
        };
    }
    else{
        console.log({
            credit_mix: credit_mix,
            Low: d3.mean(data.filter(d => d.credit_score === "Low"), d => parseFloat(d[this.state.yAxis])),
            Average: d3.mean(data.filter(d => d.credit_score === "Average"), d => d[this.state.yAxis]),
            High: d3.mean(data.filter(d => d.credit_score === "High"), d => d[this.state.yAxis]),
            }
        )
        return {
            credit_mix: credit_mix,
            Low: d3.mean(data.filter(d => d.credit_score === "Low"), d => parseFloat(d[this.state.yAxis])),
            Average: d3.mean(data.filter(d => d.credit_score === "Average"), d => parseFloat(d[this.state.yAxis])),
            High: d3.mean(data.filter(d => d.credit_score === "High"), d => parseFloat(d[this.state.yAxis])),
            };
    }
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
      .domain(this.state.yAxis === 'count' ? [0, 100] : [0, maxValue])
      .range([height, 0]);

    // Color scale for the credit scores
    const colorScale = d3.scaleOrdinal()
      .domain(creditScores)
      .range(["green", "orange", "red"]);

    // Stack data based on credit scores
    const stackGen = d3.stack().keys(["Low", "Average", "High"]);
    const stackedSeries = stackGen(groupedData);
    console.log(groupedData);

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

    const radioKeys = [
        {name: 'Annual Income', value: 'annual_income'},
        {name: 'Age of Credit History', value: 'credit_history_age'},
        {name: 'Number of Bank Accounts', value: 'num_bank_accounts'},
        {name: 'Number of Loans', value: 'num_of_loan'},
        {name: 'Delay from Due Date', value: 'delay_from_due_date'},
        {name: 'Number of Delayed Payments', value: 'num_of_delayed_payment'},
    ]

    d3.select('.radio-buttons')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('justify-content', 'center')
    .style('align-items', 'center');

  }

  render() {
    return (
      <div style={{display:"flex", flexDirection:"row"}}>
            <svg id="stacked-bar-chart"><g></g></svg>
        <div className="radio-buttons" style={{display:"none"}}>
            <div style={{paddingTop:10}}>
                <input type="radio" value='annual_income' name="y-axis" onClick={this.handleRadioClick}/>Annual Income
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='credit_history_age' name="y-axis" onClick={this.handleRadioClick}/>Age of Credit History
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='num_bank_accounts' name="y-axis" onClick={this.handleRadioClick}/>Number of Bank Accounts
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='num_of_loan' name="y-axis" onClick={this.handleRadioClick}/>Number of Loans
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='delay_from_due_date' name="y-axis" onClick={this.handleRadioClick}/>Delay from Due Date
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value={'num_of_delayed_payments'} name="y-axis" onClick={this.handleRadioClick}/>Number of Delayed Payments
            </div>
        </div>
      </div>
    );
  }
}

export default Visual2;
