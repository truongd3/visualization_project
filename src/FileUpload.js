import React, { useState, Component } from "react";
import * as d3 from "d3";
import "./styles/FileUpload.css";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // New state to store the parsed JSON data
      quanAttributes: [],
      catAttributes: []
    };
  }
  
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  // Set JSON to state
        this.props.set_data(json)
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split("\n").filter(line => line.trim()); // Remove empty rows
    const headers = lines[0].split(",").map(header => header.trim()); // Trim headers
    const result = [];
  
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",").map(value => value.trim()); // Trim each value
      const obj = {};
  
      headers.forEach((header, index) => {
        obj[header] = currentLine[index] || null; // Assign value or null if missing
      });
  
      const parsedObj = {
        age: parseInt(obj.age),
        annual_income: parseFloat(obj['annual_income']),
        monthly_inhand_salary: parseFloat(obj['monthly_inhand_salary']),
        credit_history_age: parseFloat(obj['credit_history_age']),
        total_emi_per_month: parseFloat(obj['total_emi_per_month']),
        num_bank_accounts: parseFloat(obj['num_bank_accounts']),
        num_credit_card: parseFloat(obj['num_credit_card']),
        interest_rate: parseFloat(obj['interest_rate']),
        num_of_loan: parseFloat(obj['num_of_loan']),
        delay_from_due_date: parseFloat(obj['delay_from_due_date']),
        num_of_delayed_payment: parseFloat(obj['num_of_delayed_payment']),
        num_credit_inquiries: parseFloat(obj['num_credit_inquiries']),
        credit_mix: obj['credit_mix'],
        outstanding_debt: parseFloat(obj['outstanding_debt']),
        credit_utilization_ratio: parseFloat(obj['credit_utilization_ratio']),
        payment_of_min_amount: obj['payment_of_min_amount'],
        amount_invested_monthly: parseFloat(obj['amount_invested_monthly']),
        monthly_balance: parseFloat(obj['monthly_balance']),
        credit_score: parseInt(obj['credit_score']) === 0 ? 'Low' : (parseInt(obj['credit_score']) === 1 ? 'Average' : 'High'),
      };
  
      result.push(parsedObj);
    }
    var svg1 = d3.select('.mySvg1');
    var svg2 = d3.select('.mySvg2');
    const keys = Object.keys(result[0]);

    const tooltip = d3.select('body').append('div')
                      .attr('class', 'tooltip')
                      .style('position', 'absolute')
                      .style('visibility', 'hidden')
                      .style('background-color', 'darkgrey')
                      .style('color', 'white')
                      .style('padding', '5px')
                      .style('border-radius', '4px')
                      .style('pointer-events', 'none');

    var categoricalKeys = keys.filter(d => (d === "payment_of_min_amount" || d === "credit_mix" || d === "credit_score"));
    this.setState({ catAttributes: categoricalKeys});
    var quantitativeKeys = keys.filter(d => (d !== "payment_of_min_amount" && d !== "credit_mix" && d !== "credit_score"));
    this.setState({ quanAttributes: quantitativeKeys});

    svg1.selectAll('quaRect').data(quantitativeKeys).join('rect')
        .attr('class', 'quaRects')
        .attr('width', (d) => d.length * 8)
        .attr('height', 25)
        .attr("fill", "darkgray")
        .attr("y", 5)
        .attr("x", (d, i) => {
          return quantitativeKeys.slice(0, i).reduce((total, key) => total + key.length * 8 + 20, 0); // Sum widths + 20 gaps
        })
        .attr('flex', 1)
        .attr("rx", 5).attr("ry", 5)
        .on('mouseover', function(event, d) {
          tooltip.style('visibility', 'visible').html('');
          
          const barMargins = {
            top: 30, bottom: 30, right: 45, left: 40
          }

          const ttHeight = 50;
          const ttWidth = 100;

          var toolTipSVG = tooltip.append('svg').attr('class','tooltip-svg')
          .attr('height',ttHeight+barMargins.top + barMargins.bottom)
          .attr('width',ttWidth + barMargins.left + barMargins.right);

          const barContainer = toolTipSVG.join('g').attr("transform", `translate(${barMargins.left},${barMargins.top})`);
          
        })
        .on('mousemove', function(event) {
          tooltip.style('top', (event.pageY + 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          tooltip.style('visibility', 'hidden')
        });

    svg1.selectAll("quaText").data(quantitativeKeys).join("text")
        .attr("class", "quaText")
        .attr("x", (d, i) => {
          const rectX = quantitativeKeys.slice(0, i).reduce((total, key) => total + key.length * 8 + 20, 0);
          const rectWidth = d.length * 8;
          return rectX + rectWidth / 2; // Center text horizontally in the rectangle
        })
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('font-size', 8)
        .attr('font-weight', 'bold');

    svg2.selectAll('catRect').data(categoricalKeys).join('rect')
        .attr('class', 'catRects')
        .attr('width', (d) => d.length * 8)
        .attr("height", 25)
        .attr("fill", "darkgray")
        .attr("y", 5)
        .attr("x", (d, i) => {
          return categoricalKeys.slice(0, i).reduce((total, key) => total + key.length * 8 + 20, 0); // Sum widths + 20 gaps
        })
        .attr("flex", 1)
        .attr("rx", 5).attr("ry", 5)
        .on("mouseover", function(event, d) {
          tooltip.style("visibility", "visible").html("");
          
          const barMargins = {
            top: 30, bottom: 30, right: 45, left: 40
          }

          const ttHeight = 50;
          const ttWidth = 100;

          var toolTipSVG = tooltip.append("svg").attr("class","tooltip-svg")
          .attr("height",ttHeight+barMargins.top + barMargins.bottom)
          .attr("width",ttWidth + barMargins.left + barMargins.right);

          const barContainer = toolTipSVG.join("g").attr("transform", `translate(${barMargins.left},${barMargins.top})`);
          
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY + 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          tooltip.style("visibility", "hidden")
        });
    
    svg2.selectAll('catText').data(categoricalKeys).join('text')
      .attr('class', 'catText')
      .attr("x", (d, i) => {
        const rectX = categoricalKeys.slice(0, i).reduce((total, key) => total + key.length * 8 + 20, 0);
        const rectWidth = d.length * 8;
        return rectX + rectWidth / 2;
      })
      .attr("y", 20)
      .attr('text-anchor', 'middle')
      .text(d => d)
      .attr('font-size', 8)
      .attr('font-weight', 'bold');

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <div className="upload">
          <h2>Upload a CSV File</h2>
          <form onSubmit={this.handleFileSubmit}>
            <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
            <button type="submit">Upload</button>
          </form>
        </div>
        
        <div className="attribute-list-container">
          <h2 className="attribute-title">Quantitative Attributes:</h2>
          <div className="svg-container">
            <svg className='mySvg1' style={{ width:2500 }}></svg>
          </div>

          <h2 className="attribute-title">Categorical Attributes:</h2>
          <div className="svg-container">
            <svg className='mySvg2' style={{ width:2500}}></svg>
          </div>
        </div>
      </div>
    );
  }
}

export default FileUpload;