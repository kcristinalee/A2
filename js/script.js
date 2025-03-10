
const margin = { top: 80, right: 130, bottom: 60, left: 100 }; 
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
let allData = [];
let xVar = 'TAVG', yVar = 'PRCP', sizeVar = 'SNOW', targetYear = 2017;
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

const stateAbbreviations = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
    "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA",
    "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

const weatherOptions = [
    { key: 'TAVG', label: 'Average Temperature (°F)' },
    { key: 'TMAX', label: 'Maximum Temperature (°F)' },
    { key: 'TMIN', label: 'Minimum Temperature (°F)' },
    { key: 'PRCP', label: 'Precipitation (Rainfall in inches)' },
    { key: 'SNOW', label: 'Snowfall (inches)' },
    { key: 'SNWD', label: 'Snow Depth (inches)' },
    { key: 'AWND', label: 'Average Wind Speed (mph)' },
    { key: 'WSF5', label: 'Strongest Wind Gust (mph)' }
];

const regions = {
    "Midwest": ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
    "Northeast": ["CT", "DE", "ME", "MD", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"],
    "Southeast": ["AL", "AR", "FL", "GA", "KY", "LA", "MS", "NC", "SC", "TN", "VA", "WV"],
    "West": ["AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"],
    "Southwest": ["OK", "TX"]
};


let xScale, yScale, sizeScale;
const options = ['TMAX', 'TMIN', 'TAVG', 'PRCP', 'SNOW', 'SNWD', 'AWND', 'WSF5'];
const t = 1000;
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

function init() {
    d3.csv("./data/weather.csv").then(data => {
        console.log("Loaded Data:", data);

        data.forEach(d => {
            d.TMIN = +d.TMIN || 0;
            d.TMAX = +d.TMAX || 0;
            d.TAVG = +d.TAVG || 0;
            d.PRCP = +d.PRCP || 0;
            d.SNOW = +d.SNOW || 0;
            d.date = new Date(d.date.slice(0, 4), d.date.slice(4, 6) - 1, d.date.slice(6, 8));
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            d.elevation = +d.elevation;
        });

        allData = data;

        setupSelector();
        updateAxes();
        updateVis();
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

window.addEventListener('load', init);
function setupSelector() {
    const xDropdown = d3.select('#xVariable');
    const yDropdown = d3.select('#yVariable');
    const stateDropdown = d3.select('#stateFilter');

    stateDropdown.selectAll("*").remove();
    stateDropdown.append("option")
        .text("All Regions")
        .attr("value", "all");

    Object.entries(regions).forEach(([region, states]) => {
        stateDropdown.append("option")
            .text(region)
            .attr("value", region);
    });

    d3.select('#stateFilter').on('change', null).on('change', function () {
        updateVis();
    });

    d3.select('#dateFilter').on('change', null).on('change', function () {
        updateVis();
    });

    xDropdown.selectAll("*").remove();
    yDropdown.selectAll("*").remove();

    weatherOptions.forEach(option => {
        xDropdown.append("option")
            .text(option.label)
            .attr("value", option.key);

        yDropdown.append("option")
            .text(option.label)
            .attr("value", option.key);
    });

    d3.select('#xVariable').property('value', 'TAVG');
    d3.select('#yVariable').property('value', 'PRCP');

    d3.selectAll('.variable').on('change', null).on('change', function () {
        const id = d3.select(this).attr('id');
        const selectedValue = d3.select(this).property('value');

        if (id === 'xVariable') xVar = selectedValue;
        if (id === 'yVariable') yVar = selectedValue;

        updateAxes();
        updateVis();
    });
}

function updateAxes() {
    svg.selectAll('.axis').remove();
    svg.selectAll('.labels').remove();

    const xLabel = weatherOptions.find(option => option.key === xVar)?.label || xVar;
    const yLabel = weatherOptions.find(option => option.key === yVar)?.label || yVar;

    xScale = d3.scaleLinear()
        .domain([d3.min(allData, d => d[xVar]), d3.max(allData, d => d[xVar])])
        .range([0, width]);

    const xAxis = d3.axisBottom(xScale).ticks(10);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[yVar])])
        .range([height, 0]);

    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xLabel)
        .attr('class', 'labels');

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yLabel)
        .attr('class', 'labels');
}


function updateVis() {
    if (!xScale) xScale = d3.scaleLinear().range([0, width]);
    if (!yScale) yScale = d3.scaleLinear().range([height, 0]);
    if (!sizeScale) sizeScale = d3.scaleSqrt().range([2, 10]);

    const regionColorScale = d3.scaleOrdinal()
        .domain(Object.keys(regions))  // The regions are the keys of the 'regions' object
        .range(d3.schemeSet3);   // Use a predefined color scheme


    console.log("X Scale Exists?", xScale);
    console.log("Y Scale Exists?", yScale);
    console.log("Size Scale Exists?", sizeScale);

    let filteredData = allData;
    const selectedValue = d3.select('#stateFilter').property('value');

    if (selectedValue !== "all") {
        if (regions[selectedValue]) {
            const selectedStates = regions[selectedValue];
            filteredData = filteredData.filter(d => selectedStates.includes(d.state.toUpperCase()));
        } else {
            filteredData = filteredData.filter(d => d.state.toUpperCase() === selectedValue);
        }
    }
    const selectedMonth = d3.select('#dateFilter').property('value');
    console.log("Filtered Data:", filteredData);

    if (selectedMonth !== "all") {
        filteredData = filteredData.filter(d => d.date.getMonth() + 1 == selectedMonth);
    }

    if (filteredData.length > 0) {
        xScale.domain([d3.min(filteredData, d => d[xVar]), d3.max(filteredData, d => d[xVar])]);
        yScale.domain([d3.min(filteredData, d => d[yVar]), d3.max(filteredData, d => d[yVar])]);
        sizeScale.domain([d3.min(filteredData, d => d[sizeVar]), d3.max(filteredData, d => d[sizeVar])]);
    }

    console.log("Filtered Data Count:", filteredData.length);
    console.log("Sample Data Point:", filteredData.length > 0 ? filteredData[0] : "No Data!");

    svg.selectAll('.points').remove();

    svg.selectAll('.points')
        .data(filteredData, d => d.station)
        .join(
            enter => enter.append('circle')
                .attr('class', 'points')
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar]))
                //.style('fill', d => colorScale(d.region))
                .attr('fill', d => regionColorScale(getRegion(d)))
                .style('opacity', 0.8)
        
                .on('mouseover', function (event, d) {
                    //console.log("Hovered Data:", d);

                    d3.select('#tooltip')
                        .style("display", 'block')
                        .html(`
                            <strong>State:</strong> ${d.state}<br>
                            <strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
                            <strong>Avg Temp:</strong> ${d.TAVG} °F<br>
                            <strong>${weatherOptions.find(opt => opt.key === yVar).label}:</strong> ${d[yVar]}
                        `)
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", (event.pageY - 28) + "px");

                    d3.select(this)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px');
                })
                .on("mouseout", function () {
                    d3.select('#tooltip').style('display', 'none');
                    d3.select(this)
                        .style('stroke', 'none');
                }),
            update => update.transition().duration(500)
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar]))
                .style('fill', d => colorScale(d.state)),
                
            exit => exit.remove()
        );
    addLegend()
}

// Helper function to get region based on state
function getRegion(d) {
    const stateAbbr = d.state.toUpperCase();
    for (const region in regions) {
        if (regions[region].includes(stateAbbr)) {
            return region;
        }
    }
    return 'Unknown'; // Default value in case a state isn't found in any region
}

function addLegend() {
    const size = 10;  // Size of the color squares
    const legendSpacing = 20;  // Space between each legend item

    // Use the same color scale as the data points
    const regionColorScale = d3.scaleOrdinal()
        .domain(Object.keys(regions))
        .range(d3.schemeSet3);  // This should match the color scale used in the chart

    // Ensure the legend starts below the chart area and does not overlap
    const legendX = width + 50;  // Set X position a bit outside the chart
    const legendY = height / 2;  // Set Y position in the middle of the SVG area

    // Create legend squares
    svg.selectAll("regionSquare")
        .data(Object.entries(regions))  // Use regions data
        .enter()
        .append('rect')
        .attr('class', 'regionSquare')
        .attr('x', (d, i) => legendX)  // Fixed X position
        .attr('y', (d, i) => legendY + i * (size + legendSpacing))  // Stack items vertically
        .attr('width', size)
        .attr('height', size)
        .style("fill", (d) => regionColorScale(d[0]));  // Use the color scale for legend colors

    // Add region names next to each square
    svg.selectAll("regionName")
        .data(Object.entries(regions))
        .enter()
        .append("text")
        .attr("y", (d, i) => legendY + i * (size + legendSpacing) + size)  // Place text next to square
        .attr("x", legendX + size + 5)  // Place text to the right of the square
        .style("fill", 'black')
        .text(d => d[0])  // Display the region name (d[0] is the region)
        .attr("text-anchor", "left")
        .style('font-size', '12px');  // Adjust font size if needed
}


// function addLegend() {
//     const size = 10; // Size of the color squares
//     const legendSpacing = 20; // Space between each legend item

//     // Define color scale for the legend
//     const colorScale = d3.scaleOrdinal(d3.schemeCategory10);  // Adjust for your actual color scale if needed

//     // Ensure the legend starts below the chart area and does not overlap
//     const legendX = width + 50;  // Set X position a bit outside the chart
//     const legendY = height / 2;  // Set Y position in the middle of the SVG area

//     // Create legend squares
//     svg.selectAll("regionSquare")
//         .data(Object.entries(regions))  // Use regions data
//         .enter()
//         .append('rect')
//         .attr('class', 'regionSquare')
//         .attr('x', (d, i) => legendX) // Fixed X position
//         .attr('y', (d, i) => legendY + i * (size + legendSpacing))  // Stack items vertically
//         .attr('width', size)
//         .attr('height', size)
//         .style("fill", (d) => colorScale(d[0]));

//     // Add state names next to each square
//     svg.selectAll("regionName")
//         .data(Object.entries(regions))
//         .enter()
//         .append("text")
//         .attr("y", (d, i) => legendY + i * (size + legendSpacing) + size)  // Place text next to square
//         .attr("x", legendX + size + 5)  // Place text to the right of the square
//         .style("fill", 'black')
//         .text(d => d[0])  // Display the region name (d[0] is the region)
//         .attr("text-anchor", "left")
//         .style('font-size', '12px');  // Adjust font size if needed
// }
