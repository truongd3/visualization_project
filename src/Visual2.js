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
    console.log('clicked ',event.target.value);
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


    // Normalize the data
    const normalizedData = data.map(d => ({
      credit_mix: d.credit_mix ? d.credit_mix.trim() : null,
      credit_score: d.credit_score ? d.credit_score : null, //credit_score: d.credit_score ? d.credit_score : null,
      annual_income: d.annual_income ? d.annual_income : null,
      credit_history_age: d.credit_history_age ? d.credit_history_age : null,
      num_bank_accounts: d.num_bank_accounts ? d.num_bank_accounts : null,
      num_of_loan: d.num_of_loan ? d.num_of_loan : null,
      delay_from_due_date: d.delay_from_due_date ? d.delay_from_due_date : null,
      credit_utilization_ratio: d.credit_utilization_ratio ? d.credit_utilization_ratio : null,

    }));

    /*
       {name: 'Annual Income', value: 'annual_income'},
        {name: 'Age of Credit History', value: 'credit_history_age'},
        {name: 'Number of Bank Accounts', value: 'num_bank_accounts'},
        {name: 'Number of Loans', value: 'num_of_loan'},
        {name: 'Delay from Due Date', value: 'delay_from_due_date'},
        {name: 'Number of Delayed Payments', value: 'num_of_delayed_payment'},
    */

    // Credit mix categories and scores
    const creditMixes = ["Bad", "Standard", "Good"];
    const creditScores = ["High", "Average", "Low"];

// Assuming credit_score values are "Bad", "Standard", and "Good"
const scoreMap = {
    'Low': 0,
    'Average': 1,
    'High': 2
  };
  

  const groupedData = creditMixes.map((credit_mix) => {
    const filtered = normalizedData.filter(d => d.credit_mix === credit_mix);
  

    const counts = filtered.reduce((acc, curr) => {
      const scoreIndex = scoreMap[curr.credit_score];
  
      if (scoreIndex !== undefined) {
        acc[scoreIndex] += 1;
      }
      return acc;
    }, [0, 0, 0]);
  
    const total = counts.reduce((sum, count) => sum + count, 0);
  
    if (this.state.yAxis === 'count') {
      return {
        credit_mix: credit_mix,
        Low: total ? (counts[0] / total) * 100 : 0,
        Average: total ? (counts[1] / total) * 100 : 0,
        High: total ? (counts[2] / total) * 100 : 0,
      };
    } else {

      const lowData = filtered.filter(d => d.credit_score === "Low");
      const avgData = filtered.filter(d => d.credit_score === "Average");
      const highData = filtered.filter(d => d.credit_score === "High");
  
      return {
        credit_mix: credit_mix,
        Low: d3.mean(lowData, d => d[this.state.yAxis]) || 0,
        Average: d3.mean(avgData, d => d[this.state.yAxis]) || 0,
        High: d3.mean(highData, d => d[this.state.yAxis]) || 0,
      };
    }
  });

  var maxValue = d3.max(groupedData, d => d.Low+d.Average+d.High);
  

    // Set up chart dimensions and margins
    const svgWidth = 420, svgHeight = 400;
    const margin = { top: 60, right: 150, bottom: 60, left: 60 };
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
      .range(["green", "#ff7f00", "#e41a1c"]);

    // Stack data based on credit scores
    const stackGen = d3.stack().keys(["Low", "Average", "High"]);
    const stackedSeries = stackGen(groupedData);
    
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
      .call(d3.axisLeft(yScale).ticks(10).tickFormat( this.state.yAxis === 'count' ? d => `${d}%` : d=>d));

    // Add a legend
    const legend = chart.append("g")
      .attr("transform", `translate(${width + 20}, ${height/2-margin.top})`);

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
        .text(score+' Credit Score')
        .attr('font-size', 12);
    });

    d3.select('.radio-buttons')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('justify-content', 'center')
    .style('align-items', 'center');

    let yAxisToName = {'count': 'Percentage',
      'annual_income': 'Annual Income (USD)',
      'credit_history_age': 'Credit Age (Months)',
      'num_bank_accounts': 'Number of Bank Accounts',
      'num_of_loan': 'Number of Loans',
      'delay_from_due_date': 'Delay from Due Date',
      'credit_utilization_ratio': 'Credit Utilization Ratio (Percent)'};

    svg.selectAll('title')
    .data(['Title'])
    .join('text')
    .attr('class','title')
    .attr('x',svgWidth/2)
    .attr('y',30)
    .text('Credit Mix vs. '+yAxisToName[this.state.yAxis])
    .attr('font-size',16)
    .attr('font-weight','bold')
    .attr('text-anchor','middle')

    svg.selectAll('x-axis-label')
    .data(['Credit Mix'])
    .join('text')
    .attr('class','x-axis-label')
    .attr('x',svgWidth/2-margin.left/1.3)
    .attr('y',height+margin.top+margin.bottom/1.5)
    .text('Credit Mix')
    .attr('font-size',14)
    .attr('font-weight','bold')
    .attr('text-anchor','middle')


    

    svg.selectAll('y-axis-label')
    .data([null])
    .join('text')
    .attr('class','y-axis-label')
    .attr('x',0)
    .attr('y',0)
    .text(yAxisToName[this.state.yAxis])
    .attr('font-size',14)
    .attr('font-weight','bold')
    .attr('text-anchor','middle')
    .attr('transform', `rotate(-90)`)
    .attr('dy', 13)
    .attr('dx', -height/2-margin.top)

  }

  render() {
    return (
      <div style={{display:"flex", flexDirection:"row"}}>
            <svg id="stacked-bar-chart"><g></g></svg>
        <div className="radio-buttons" style={{display:"none", flex:1, marginLeft:10, marginRight:-20, fontSize:11}}>
          <div style={{paddingTop:10}}>
                <input type="radio" value='count' name="y-axis" onClick={this.handleRadioClick}defaultChecked/>Count (as percentage)
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='annual_income' name="y-axis" onClick={this.handleRadioClick}/>Average Annual Income (USD)
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='credit_history_age' name="y-axis" onClick={this.handleRadioClick}/>Average Age of Credit (Months)
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='num_bank_accounts' name="y-axis" onClick={this.handleRadioClick}/>Average Number of Bank Accounts
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='num_of_loan' name="y-axis" onClick={this.handleRadioClick}/>Average Number of Loans
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value='delay_from_due_date' name="y-axis" onClick={this.handleRadioClick}/>Average Delay from Due Date
            </div>
            <div style={{paddingTop:10}}>
                <input type="radio" value={'credit_utilization_ratio'} name="y-axis" onClick={this.handleRadioClick}/>Average Credit Utilization Ratio
            </div>
        </div>
      </div>
    );
  }
}

export default Visual2;
