
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
    const regionContainer = d3.select('#regionFilter');

    regionContainer.selectAll("*").remove();

    Object.entries(regions).forEach(([region]) => {
        const checkbox = regionContainer.append("label")
            .attr("class", "region-option");

        checkbox.append("input")
            .attr("type", "checkbox")
            .attr("value", region)
            .attr("class", "region-checkbox");

        checkbox.append("span").text(region);
        regionContainer.append("br");
    });

    d3.selectAll('.region-checkbox').on('change', function () {
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

    const regionColorScale = d3.scaleOrdinal()
        .domain(Object.keys(regions))
        .range(d3.schemeSet3);

    const legendX = width + 50;
    const legendY = height / 2;

    svg.selectAll("regionSquare")
        .data(Object.entries(regions))
        .enter()
        .append('rect')
        .attr('class', 'regionSquare')
        .attr('x', (d, i) => legendX)
        .attr('y', (d, i) => legendY + i * (size + legendSpacing))
        .attr('width', size)
        .attr('height', size)
        .style("fill", (d) => regionColorScale(d[0]));

    svg.selectAll("regionName")
        .data(Object.entries(regions))
        .enter()
        .append("text")
        .attr("y", (d, i) => legendY + i * (size + legendSpacing) + size)
        .attr("x", legendX + size + 5)
        .style("fill", 'black')
        .text(d => d[0])
        .attr("text-anchor", "left")
        .style('font-size', '12px');
}
