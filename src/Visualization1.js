import React, { Component } from "react";
import * as d3 from "d3";

function calculateAverages(data) {
  // Initialize an object to store the sums and counts
  const totals = {
    Low: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
    Average: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
    High: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
  };

  // Iterate over each record in the data
  data.forEach(obj => {
    const creditScoreGroup = obj.credit_score;

    if (totals[creditScoreGroup]) {
      totals[creditScoreGroup].monthly_balance += obj.monthly_balance;
      totals[creditScoreGroup].outstanding_debt += obj.outstanding_debt;
      totals[creditScoreGroup].count += 1;
    }
  });

  // Prepare the final result in a flat structure
  const averages = Object.keys(totals).map(group => {
    const groupData = totals[group];
    return {
      credit_score: group,
      average_monthly_balance: groupData.count > 0 ? groupData.monthly_balance / groupData.count : 0,
      average_outstanding_debt: groupData.count > 0 ? groupData.outstanding_debt / groupData.count : 0,
    };
  });

  return averages;
};

class Visualization1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidUpdate(){
    const data = this.props.csv_data;
    if (!data) return 0;
    //console.log(data);

    const svgWidth = 800, svgHeight = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
    

    const newData = calculateAverages(data);
    console.log(newData);

    const xScale = d3.scaleBand().domain(["Low","Average","High"]).range([0,width]).padding(0.2);
    const debtAvg = d3.max(newData, d => d.average_outstanding_debt);
    const balanceAvg = d3.max(newData, d => d.average_monthly_balance);
    const actualMax = debtAvg>balanceAvg ? debtAvg : balanceAvg;
    const yScale = d3.scaleLinear().domain([0, actualMax]).range([height, 0]);


    const svg = d3.select("#mysvg").attr("width", svgWidth).attr("height", svgHeight)
                                   .select("g")
                                   .attr("transform", `translate(${margin.left}, ${margin.top})`);

 
    // X-axis
    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale))
       .append("text")
       .attr("x", width / 2)
       .attr("y", 40)
       .text("Credit Score Group").style("fill", "black");
    // Y-axis
    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis')
       .call(d3.axisLeft(yScale))
       .append("text")
       .attr("x", -height / 2)
       .attr("y", -40)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .text("Average Amount in USD").style("fill", "black");


       svg.selectAll('debt')
        .data(newData)
        .join('rect')
        .attr('class','debt')
        .attr('x', d => xScale(d.credit_score))  // Correctly map credit_score to x position
        .attr('y', d => yScale(d.average_outstanding_debt)) // Correctly map outstanding_debt to y position
        .attr('width', xScale.bandwidth()/2)       // Use xScale.bandwidth() for bar width
        .attr('height', d => height - yScale(d.average_outstanding_debt)) // Calculate bar height
        .attr('fill', 'red');                    // Set bar color
  
      svg.selectAll('balance')
        .data(newData)
        .join('rect')
        .attr('class','balance')
        .attr('x', d => xScale(d.credit_score) + xScale.bandwidth()/2)  // Correctly map credit_score to x position
        .attr('y', d => yScale(d.average_monthly_balance)) // Correctly map outstanding_debt to y position
        .attr('width', xScale.bandwidth()/2)       // Use xScale.bandwidth() for bar width
        .attr('height', d => height - yScale(d.average_monthly_balance)) // Calculate bar height
        .attr('fill', 'green');        

  }
  

  render(){
    return (
      <div className="child1">
        <svg id="mysvg"><g></g></svg>
      </div>
    );
  };

}

export default Visualization1;