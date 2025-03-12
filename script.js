
const margin = { top: 80, right: 130, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
let allData = [];
let xVar = 'TAVG', yVar = 'PRCP', sizeVar = 'SNOW', targetYear = 2017;
const states = [
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Maine",
  "Maryland",
  "Massachusetts",
  "New Hampshire",
  "New Jersey",
  "New York",
  "North Carolina",
  "Rhode Island",
  "South Carolina",
  "Virginia",
  "Vermont",
];

const stateAbbreviations = {
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New York": "NY",
    "North Carolina": "NC",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "Virginia": "VA",
    "Vermont": "VT"
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

// Assign unique colors to each state
const stateColors = {
    "CT": "#ff9999",
    "DE": "#66b3ff",
    "FL": "#99ff99",
    "GA": "#ffcc99",
    "ME": "#c2c2f0",
    "MD": "#ffb3e6",
    "MA": "#ff6666",
    "NH": "#99cc99",
    "NJ": "#ffccff",
    "NY": "#ff9933",
    "NC": "#ff6666",
    "RI": "#ccffcc",
    "SC": "#ffff99",
    "VA": "#ffcc33",
    "VT": "#c2f0c2"
};

// Regions: Now, each state will have its own color from stateColors
const regions = {
    "Connecticut": { abbreviation: "CT", color: stateColors["CT"] },
    "Delaware": { abbreviation: "DE", color: stateColors["DE"] },
    "Florida": { abbreviation: "FL", color: stateColors["FL"] },
    "Georgia": { abbreviation: "GA", color: stateColors["GA"] },
    "Maine": { abbreviation: "ME", color: stateColors["ME"] },
    "Maryland": { abbreviation: "MD", color: stateColors["MD"] },
    "Massachusetts": { abbreviation: "MA", color: stateColors["MA"] },
    "New Hampshire": { abbreviation: "NH", color: stateColors["NH"] },
    "New Jersey": { abbreviation: "NJ", color: stateColors["NJ"] },
    "New York": { abbreviation: "NY", color: stateColors["NY"] },
    "North Carolina": { abbreviation: "NC", color: stateColors["NC"] },
    "Rhode Island": { abbreviation: "RI", color: stateColors["RI"] },
    "South Carolina": { abbreviation: "SC", color: stateColors["SC"] },
    "Virginia": { abbreviation: "VA", color: stateColors["VA"] },
    "Vermont": { abbreviation: "VT", color: stateColors["VT"] }
};

// Function to display the side legend
/*function createLegend() {
    const legendContainer = d3.select("#legend");
    console.log("Legend container:", legendContainer);

    Object.entries(regions).forEach(([state, { abbreviation, color }]) => {
        const legendItem = legendContainer.append("div")
            .attr("class", "legend-item");

        legendItem.append("div")
            .attr("class", "legend-color")
            .style("background-color", color)
            .style("width", "20px")
            .style("height", "20px");

        legendItem.append("span")
            .text(`${state} (${abbreviation})`);
    });
}

// Call the function to generate the side legend
createLegend();*/


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
    d3.csv("./data/filtered_weather.csv").then(data => {
        console.log("Loaded Data:", data);

        data.forEach(d => {
            d.TMIN = d.TMIN ? +d.TMIN : null;
            d.TMAX = d.TMAX ? +d.TMAX : null;
            d.TAVG = d.TAVG ? +d.TAVG : null;


            d.PRCP = d.PRCP ? (+d.PRCP / 10) : 0;
            d.SNOW = d.SNOW ? (+d.SNOW / 10) : 0;
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
    const stateContainer = d3.select('#stateFilter');

    stateContainer.selectAll("*").remove();

    const states = {
        "Connecticut": "CT",
        "Delaware": "DE",
        "Florida": "FL",
        "Georgia": "GA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New York": "NY",
        "North Carolina": "NC",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "Virginia": "VA",
        "Vermont": "VT"
    };

    Object.entries(states).forEach(([state, abbrev]) => {
        const checkbox = stateContainer.append("label")
            .attr("class", "state-option");

        checkbox.append("input")
            .attr("type", "checkbox")
            .attr("value", abbrev)
            .attr("class", "state-checkbox");

        checkbox.append("span").text(state);
        stateContainer.append("br");
    });

    d3.selectAll('.state-checkbox').on('change', function () {
        updateVis();
    });

    d3.select('#dateFilter').on('change', function () {
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

    d3.selectAll('.variable').on('change', function () {
        const id = d3.select(this).attr('id');
        const selectedValue = d3.select(this).property('value');

        if (id === 'xVariable') xVar = selectedValue;
        if (id === 'yVariable') yVar = selectedValue;

        updateAxes();
        updateVis();
    });
}

function updateAxes() {
    svg.selectAll('.axis').remove()
    svg.selectAll('.labels').remove()
   
    // Create the x-axis with grid lines
    xScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[xVar])])
        .range([0, width]);

   // Create the x-axis with grid lines
    const xAxis = d3.axisBottom(xScale)
   

// Append the x-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`) // Position at the bottom
        .call(xAxis);

// Define the y-scale
    yScale = d3.scaleLinear()
        .domain([0, d3.max(allData, d => d[yVar])])
        .range([height, 0]); // Position the y-axis from top to bottom

// Create the y-axis with grid lines
    const yAxis = d3.axisLeft(yScale)
    
// Append the y-axis to the SVG
    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(allData, d => d[sizeVar])]) // Largest bubble = largest data point 
        .range([5, 20]); // Feel free to tweak these values if you want bigger or smaller bubbles
// X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("text-anchor", "middle")
        .text(xVar) // Displays the current x-axis variable
        .attr('class', 'labels')

// Y-axis label (rotated)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 40)
        .attr("text-anchor", "middle")
        .text(yVar) // Displays the current y-axis variable
        .attr('class', 'labels')
   
}

function updateVis() {
    if (!xScale) xScale = d3.scaleLinear().range([0, width]);
    if (!yScale) yScale = d3.scaleLinear().range([height, 0]);
    if (!sizeScale) sizeScale = d3.scaleSqrt().range([2, 10]);

    const regionColorScale = d3.scaleOrdinal()
        .domain(Object.keys(regions))
        .range(d3.schemeSet3);

    let filteredData = allData;

    const selectedRegions = d3.selectAll('.region-checkbox:checked')
        .nodes()
        .map(node => node.value);

    if (selectedRegions.length > 0) {
        let selectedStates = new Set();
        selectedRegions.forEach(region => {
            if (regions[region]) {
                regions[region].forEach(state => selectedStates.add(state));
            }
        });
        filteredData = filteredData.filter(d => selectedStates.has(d.state.toUpperCase()));
    }

    const selectedMonth = d3.select('#dateFilter').property('value');
    if (selectedMonth !== "all") {
        filteredData = filteredData.filter(d => d.date.getMonth() + 1 == selectedMonth);
    }

    filteredData = filteredData.filter(d => d[xVar] != null && !isNaN(d[xVar]) && d[yVar] != null && !isNaN(d[yVar])
        && d[xVar] != "" && d[yVar] != "");

    if (filteredData.length === 0) {
        console.warn("⚠ No valid data points to display after filtering.");
        return;
    }

    xScale.domain([d3.min(filteredData, d => d[xVar]), d3.max(filteredData, d => d[xVar])]);
    yScale.domain([d3.min(filteredData, d => d[yVar]), d3.max(filteredData, d => d[yVar])]);
    sizeScale.domain([d3.min(filteredData, d => d[sizeVar]), d3.max(filteredData, d => d[sizeVar])]);

    svg.selectAll('.points')
        .data(filteredData, d => d.station)
        .join(
            enter => enter.append('circle')
                .attr('class', 'points')
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar]))
                .attr('fill', d => regionColorScale(getRegion(d)))
                .style('opacity', 0.8)
                .on('mouseover', function (event, d) {
                    d3.select('#tooltip')
                        .style("display", 'block')
                        .html(`
                            <strong>State:</strong> ${d.state}<br>
                            <strong>Date:</strong> ${d.date.toLocaleDateString()}<br>
                            <strong>${weatherOptions.find(opt => opt.key === xVar).label}:</strong> ${d[xVar]}<br>
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
                    d3.select(this).style('stroke', 'none');
                }),
            update => update.transition().duration(500)
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar])),
            exit => exit.remove()
        );

    addLegend(regionColorScale);
}

function getRegion(d) {
    const stateAbbr = d.state.toUpperCase();
    for (const region in regions) {
        if (regions[region].includes(stateAbbr)) {
            return region;
        }
    }
    return 'Unknown';
}

function addLegend() {
    const size = 10;
    const legendSpacing = 20;

    // Color scale for regions or states
    const regionColorScale = d3.scaleOrdinal()
        .domain(Object.keys(regions))
        .range(d3.schemeSet3);  // Using a color scheme for the regions

    const legendX = width + 50;  // Position of the legend
    const legendY = height / 2; // Vertical position of the legend

    // Append color squares to the legend
    svg.selectAll("regionSquare")
        .data(Object.entries(regions))
        .enter()
        .append('rect')
        .attr('class', 'regionSquare')
        .attr('x', legendX)
        .attr('y', (d, i) => legendY + i * (size + legendSpacing))
        .attr('width', size)
        .attr('height', size)
        .style("fill", (d) => regionColorScale(d[0])); // Set the color based on region

    // Append region name next to the color square
    svg.selectAll("regionName")
        .data(Object.entries(regions))
        .enter()
        .append("text")
        .attr("y", (d, i) => legendY + i * (size + legendSpacing) + size)
        .attr("x", legendX + size + 5)  // Position text next to color square
        .style("fill", 'yellow')
        .text(d => d[0])  // Display region name
        .attr("text-anchor", "left")
        .style('font-size', '12px');
}
