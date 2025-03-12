const margin = { top: 80, right: 130, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
let allData = [];
let xVar = 'TAVG', yVar = 'PRCP', sizeVar = 'SNOW', targetYear = 2017;

const stateAbbreviations = {
    "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA","Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA","New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC","Pennsylvania": "PA", "Rhode Island": "RI",
    "South Carolina": "SC", "Vermont": "VT", "Virginia": "VA",
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

let xScale, yScale, sizeScale;
const options = ['TMAX', 'TMIN', 'TAVG', 'PRCP', 'SNOW', 'SNWD', 'AWND', 'WSF5'];
const t = 1000;
const svg = d3.select('#vis')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const stateColorScale = d3.scaleOrdinal()
    .domain(Object.values(stateAbbreviations))
    .range(d3.schemeCategory10.concat(d3.schemeSet3).slice(0, 50));
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
    const eastCoastContainer = d3.select('#eastCoastCheckboxes');

    eastCoastContainer.selectAll("*").remove();

    const eastCoastStates = [
        "Maine", "New Hampshire", "Massachusetts", "Rhode Island", "Connecticut",
        "New York", "New Jersey", "Delaware", "Maryland", "Virginia",
        "North Carolina", "South Carolina", "Georgia", "Florida"
    ];

    eastCoastStates.forEach(state => {
        const checkboxContainer = eastCoastContainer.append("label")
            .attr("class", "checkbox-item");

        checkboxContainer.append("input")
            .attr("type", "checkbox")
            .attr("value", stateAbbreviations[state])
            .attr("class", "state-checkbox");

        checkboxContainer.append("span").text(state);
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
        .domain([d3.min(allData, d => d[yVar]), d3.max(allData, d => d[yVar])])
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
        .domain(["East Coast"])
        .range(["#1f77b4"]);

    let filteredData = allData;

    const selectedEastCoastStates = d3.selectAll('.state-checkbox:checked')
        .nodes()
        .map(node => node.value);

    if (selectedEastCoastStates.length > 0) {
        filteredData = filteredData.filter(d => selectedEastCoastStates.includes(d.state.toUpperCase()));
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

    updateAxes()

    svg.selectAll('.points')
        .data(filteredData, d => d.station+ d.date)
        .join(
            enter => enter.append('circle')
                .attr('class', 'points')
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar]))
                .attr('fill', d => stateColorScale(d.state))
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
            update => update.transition().duration(700)
                .attr('cx', d => xScale(d[xVar]))
                .attr('cy', d => yScale(d[yVar]))
                .attr('r', d => sizeScale(d[sizeVar])),
            exit => exit.remove()
        );
        addLegend();
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
    svg.selectAll(".legend").remove();

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 30}, 20)`);

    const states = Object.entries(stateAbbreviations);

    legend.selectAll(".legend-item")
        .data(states)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 15})`)
        .each(function (d) {
            d3.select(this)
                .append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", stateColorScale(d[1]));

            d3.select(this)
                .append("text")
                .attr("x", 15)
                .attr("y", 8)
                .text(d[1])
                .style("font-size", "10px")
                .attr("alignment-baseline", "middle");
        });
}
