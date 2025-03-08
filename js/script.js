const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
let allData = [];
let xVar = 'TAVG', yVar = 'PRCP', sizeVar = 'SNOW', targetYear = 2017; // Default variables for weather data
const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
    'West Virginia', 'Wisconsin', 'Wyoming'
];
let xScale, yScale, sizeScale;
const options = ['TMAX', 'TMIN', 'TAVG', 'PRCP', 'SNOW', 'SNWD', 'AWND', 'WSF5'];
const t = 1000; // 1000ms = 1 second

// Create the SVG container for the visualization
const svg = d3.select('#vis') // Ensure you have a div with id 'vis'
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);



// Initialize function to load the data
function init() {
    d3.csv("./data/weather.csv").then(data => {
        console.log("Loaded Data:", data); // Log the loaded data

        // Process the data
        data.forEach(d => {
            d.TMIN = +d.TMIN || 0; // Convert to number, default to 0 if NaN
            d.TMAX = +d.TMAX || 0; // Convert to number, default to 0 if NaN
            d.TAVG = +d.TAVG || 0; // Convert to number, default to 0 if NaN
            d.PRCP = +d.PRCP || 0; // Convert to number, default to 0 if NaN
            d.SNOW = +d.SNOW || 0; // Convert to number, default to 0 if NaN
            d.date = new Date(d.date.slice(0, 4), d.date.slice(4, 6) - 1, d.date.slice(6, 8)); // Convert date to Date object
            d.latitude = +d.latitude; // Convert latitude to number
            d.longitude = +d.longitude; // Convert longitude to number
            d.elevation = +d.elevation; // Convert elevation to number
        });

        allData = data; // Save the processed data
        updateAxes();
        updateVis();
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}
window.addEventListener('load', init);

function setupSelector() {
    let slider = d3
        .sliderHorizontal()
        .min(d3.min(allData, d => d.date.getFullYear())) // setup the range
        .max(d3.max(allData, d => d.date.getFullYear())) // setup the range
        .step(1)
        .width(width)
        .displayValue(false)
        .on('onchange', (val) => {
            targetYear = +val; // Update the year
            updateVis(); // Refresh the chart
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

    d3.selectAll('.variable')
        .each(function() {
            d3.select(this).selectAll('myOptions')
                .data(options)
                .enter()
                .append('option')
                .text(d => d) // The displayed text
                .attr("value", d => d); // The actual value used in the code
        })
        .on("change", function(event) {
            const dropdownId = d3.select(this).property("id");
            const selectedValue = d3.select(this).property("value");

            if (dropdownId === "xVariable") {
                xVar = selectedValue; // Update global variable xVar with the selected value
            } else if (dropdownId === "yVariable") {
                yVar = selectedValue; // Update global variable yVar with the selected value
            } else if (dropdownId === "sizeVariable") {
                sizeVar = selectedValue; // Update global variable sizeVar with the selected value
            }

            updateAxes(); // Update axes to reflect the changes
            updateVis(); // Update the visual elements
        });

    d3.select('#xVariable').property('value', xVar);
    d3.select('#yVariable').property('value', yVar);
    d3.select('#sizeVariable').property('value', sizeVar);
}

function updateAxes() {
    svg.selectAll('.axis').remove();
    svg.selectAll('.labels').remove();

    // Create the x-axis
    xScale = d3.scaleLinear()
        .domain([d3.min(allData, d => d[xVar]), d3.max(allData, d => d[xVar])])
        .range([0, width]);

    const xAxis = d3.axisBottom(xScale).ticks(10); // Add ticks for better readability

    // Append the x-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`) // Position at the bottom
        .call(xAxis);

    // Define the y-scale
    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[yVar])])
        .range([height, 0]); // Position the y-axis from top to bottom

    // Create the y-axis
    const yAxis = d3.axisLeft(yScale).ticks(10); // Add ticks for better readability

    // Append the y-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    // Size scale for bubbles
    sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(allData, d => d[sizeVar])]) // Largest bubble = largest data point 
        .range([5, 20]); // Feel free to tweak these values if you want bigger or smaller bubbles

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xVar) // Displays the current x-axis variable
        .attr('class', 'labels');

    // Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yVar) // Displays the current y-axis variable
        .attr('class', 'labels');
}

function updateVis() {
    let currentData = allData.filter(d => d.date.getFullYear() === targetYear); // Filter data for the selected year
    console.log("Current Data:", currentData);

    svg.selectAll('.points')
        .data(currentData, d => d.station) // Use station as the key for data binding
        .join(
            // Enter: When new circles are added
            function (enter) {
                return enter
                    .append('circle')
                    .attr('class', 'points')
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .style('fill', 'steelblue') // Set a default color for the circles
                    .attr('r', d => sizeScale(d[sizeVar])) // Set the radius based on size variable
                    .on('mouseover', function (event, d) {
                        d3.select('#tooltip')
                            .style("display", 'block') // Make the tooltip visible
                            .html( // Change the html content of the <div> directly
                                `<strong>${d.station}</strong><br/>
                                State: ${d.state}<br/>
                                Date: ${d.date.toLocaleDateString()}<br/>
                                Avg Temp: ${d.TAVG} °F<br/>
                                Precipitation: ${d.PRCP} inches`)
                            .style("left", (event.pageX + 20) + "px")
                            .style("top", (event.pageY - 28) + "px");
                        d3.select(this) // Refers to the hovered circle
                            .style('stroke', 'black')
                            .style('stroke-width', '4px');
                    })
                    .on("mouseout", function () {
                        d3.select('#tooltip')
                            .style('display', 'none'); // Hide tooltip when cursor leaves
                    });
            },
            // Update: When existing circles need to move or resize
            function (update) {
                return update
                    .transition(t)
                    .attr('cx', d => xScale(d[xVar]))
                    .attr('cy', d => yScale(d[yVar]))
                    .attr('r', d => sizeScale(d[sizeVar]));
            },
            function (exit) {
                exit
                .transition(t)
                .attr('r', 0)  // Shrink to radius 0
                .remove()  // Then remove the bubble
            }
        )
    }
            
    function addLegend() {
        let size = 10;  // Size of the legend squares
    
        // Draw a set of rectangles using D3 for states
        svg.selectAll("stateSquare")
            .data(states) // Bind the data to the legend squares
            .enter()
            .append('rect')  // Create a 'rect' element for each state
            .attr('class', 'stateSquare')  // Add a class for styling (optional)
            .attr('x', (d, i) => i * (size + 20) + 100)  // Position the squares horizontally with spacing
            .attr('y', -margin.top / 2)  // Position the squares vertically with respect to the margin
            .attr('width', size)  // Set the width of each square
            .attr('height', size)  // Set the height of each square
            .style("fill", 'steelblue'); // Set a default color for the squares
    
        svg.selectAll("stateName")
            .data(states)
            .enter()
            .append("text")
            .attr("y", -margin.top / 2 + size) // Align vertically with the square
            .attr("x", (d, i) => i * (size + 20) + 120)  
            .style("fill", 'black')  // Match text color to the square
            .text(d => d) // The actual state name
            .attr("text-anchor", "left")
            .style('font-size', '10px');
    }