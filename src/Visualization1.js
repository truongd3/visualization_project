import React, { Component } from "react";
import * as d3 from "d3";
import './Visual1.css';

function calculateAverages(data) {

  const totals = {
    Low: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
    Average: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
    High: { monthly_balance: 0, outstanding_debt: 0, count: 0 },
  };


  data.forEach(obj => {
    const creditScoreGroup = obj.credit_score;

    if (totals[creditScoreGroup]) {
      totals[creditScoreGroup].monthly_balance += obj.monthly_balance;
      totals[creditScoreGroup].outstanding_debt += obj.outstanding_debt;
      totals[creditScoreGroup].count += 1;
    }
  });

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

    const svgWidth = 400, svgHeight = 400;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 },
          width = 400 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
    

    const newData = calculateAverages(data);
    //console.log(newData);

    const xScale = d3.scaleBand().domain(["Low","Average","High"]).range([0,width]).padding(0.2);
    const debtAvg = d3.max(newData, d => d.average_outstanding_debt);
    const balanceAvg = d3.max(newData, d => d.average_monthly_balance);
    const actualMax = debtAvg>balanceAvg ? debtAvg : balanceAvg;
    const yScale = d3.scaleLinear().domain([0, actualMax+100]).range([height, 0]);


    const svg = d3.select("#mysvg").attr("width", svgWidth).attr("height", svgHeight)
                                   .select("g")
                                   .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.selectAll("*").remove();

    svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis')
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale))
       .append("text")
       .attr("x", width / 2)
       .attr("y", 40)
       .text("Credit Score Group").style("fill", "black")
       .attr('font-weight','bold');

    svg.selectAll('.y.axis').data([null]).join('g').attr('class', 'y axis')
       .call(d3.axisLeft(yScale))
       .append("text")
       .attr("x", -height / 2)
       .attr("y", -40)
       .attr("transform", "rotate(-90)")
       .attr("text-anchor", "middle")
       .text("Amount in USD").style("fill", "black")
       .attr('font-weight','bold');


       svg.selectAll('debt')
        .data(newData)
        .join('rect')
        .attr('class','debt')
        .attr('x', d => xScale(d.credit_score))
        .attr('y', d => yScale(d.average_outstanding_debt))
        .attr('width', xScale.bandwidth()/2)
        .attr('height', d => height - yScale(d.average_outstanding_debt))
        .attr('fill', 'red');
  
      svg.selectAll('balance')
        .data(newData)
        .join('rect')
        .attr('class','balance')
        .attr('x', d => xScale(d.credit_score) + xScale.bandwidth()/2)
        .attr('y', d => yScale(d.average_monthly_balance))
        .attr('width', xScale.bandwidth()/2)
        .attr('height', d => height - yScale(d.average_monthly_balance))
        .attr('fill', 'green');        

      svg.selectAll('title')
        .data(['Title'])
        .join('text')
        .attr('class','title')
        .attr('x',svgWidth/2-margin.left+5)
        .attr('y',-20)
        .text('Credit Score Group vs. Balance & Debt')
        .attr('font-size',18)
        .attr('font-weight','bold')
        .attr('text-anchor','middle')

        const legend = d3.select("#legend").attr("width", 300).attr("height", 200).select("g").attr('transform',`translate(-50,0)`)

      legend.selectAll('legend-rect')
        .data(['Average Monthly Balance', 'Total Outstanding Debt'])
        .join('rect')
        .attr('class', 'legend-item')
        .attr('y', (d,i)=>(200/2 + (i*30)))
        .attr('x', 50)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', d=>(d==='Average Monthly Balance' ? 'Green' : 'Red'));

      legend.selectAll('legend-item')
        .data(['Average Monthly Balance', 'Total Outstanding Debt'])
        .join('text')
        .attr('x', 80)
        .attr('y', (d,i)=>(200/2 + (i*30) + 15))
        .text(d => d)
        .attr('font-size',14);

  } 
  

  render(){
    return (
      <div className="child1">
        <svg id="mysvg">
          <g></g>
        </svg>
        <svg id="legend">
          <g></g>
        </svg>
      </div>
    );
  };

}

export default Visualization1;