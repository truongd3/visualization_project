import * as d3 from "d3";

function renderBarChartTooltip(title, data) {
    console.log("title:", title);
    console.log("data:", data);
    const width = 500, height = 300, margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3.select("mySvg").attr("width", width).attr("height", height);

    const xScale = d3.scaleLinear().domain([d3.min(data) - 1, d3.max(data) + 1]).range([margin.left, width - margin.right]);

    // Create a histogram generator
    const histogram = d3.histogram().domain(xScale.domain()).thresholds(xScale.ticks(10)); // Number of bins

    // Generate the bins
    const bins = histogram(data);

    // Create a scale for the y-axis (frequency counts)
    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).nice().range([height - margin.bottom, margin.top]);

    // Draw the bars
    svg.selectAll("rect").data(bins).enter().append("rect")
       .attr("x", d => xScale(d.x0)).attr("y", d => y(d.length))
       .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1) // Adjust for spacing between bars
       .attr("height", d => y(0) - y(d.length))
       .attr("fill", "pink");

    // Add the x-axis
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(xScale).ticks(10)).attr("font-size", "10px");

    // Add the y-axis
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5)).attr("font-size", "10px");

    // Add axis labels
    svg.append("text").attr("text-anchor", "middle").attr("x", width / 2).attr("y", height - 5).text(title);

    svg.append("text").attr("text-anchor", "middle").attr("transform", `rotate(-90)`).attr("x", -height / 2).attr("y", 15).text("Frequency");
}

export default renderBarChartTooltip;