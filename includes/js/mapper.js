// Mapping script

import { colors, width, height, fillColorDict } from './const.js'
import { interact } from './interactions.js'
import { stateDict } from './helper.js'
import initData from './charts.js'

Promise.all([d3.json('./includes/geo/counties-10m-edit.json'),
            d3.json('./includes/geo/outlook.geojson'),
            d3.json('./includes/geo/cwa.json'),
            initData]).then(function(files) {

    var us = files[0];
    var outlooks = files[1];
    var cwa = files[2];
    var starterData = files[3];
    var mapWidthScaler = 1;
    var mapHeightScaler = 1;

    // Check size of window
    if (width >= 992) {
        mapWidthScaler = 2;
    } 

    if (height >= 558) {
        mapHeightScaler = 2;
    } 

    const dims = {
        'width': width,
        'height': height
    };

    var projection = d3.geoAlbersUsa()
        .scale(dims.width/mapWidthScaler)
        .translate([dims.width/(mapWidthScaler*2),dims.height/(mapHeightScaler*2)]);

    var path = d3.geoPath().projection(projection);

    var svg = d3.select('#map-holder')
                .append('svg')
                //.attr('viewBox', `0 0 ${dims.width} ${dims.height/2}`)
                .attr('height',dims.height/mapHeightScaler)
                .attr('width',dims.width/mapWidthScaler);


    // Need to reverse the order of the lat/lon pairs...
    // The way they're processed in python, they're output in reverse order that
    // d3 needs them to properly render the geojsons
    outlooks.features.map(function(arr) {
        return arr.geometry.coordinates[0].reverse()
    })

    var g = d3.select('svg')
        .append('g')
        .attr('fill','none');

    g.selectAll('.contours')
        .data(outlooks.features)
        .join('path')
        .attr('d',path)
        .classed('contours',true)
        .attr('stroke-width', 1 )
        .attr('stroke', d => {
            return colors[d.properties.probability];
        })
        .attr('fill', d => {
            return colors[d.properties.probability];
        })

    let svgTitle = d3.select('svg')
                        .append('g')

    svgTitle.append('text')
            .classed('title-text', true)
            .attr('text-anchor','middle')
            .attr('transform',`translate(${dims.width*0.25},40)`)
            .text('SPC Tornado Probabilities')

    let legendG = d3.select('svg')
        .append('g');

    // Legend for contours, etc
    legendG.selectAll('.prob-square')
        .data([2,5,10,15,30,45,60])
        .join('rect')
        .classed('prob-square',true)
        .classed('tor-prob-leg',true)
        .classed('legend',true)
        .attr('width',30)
        .attr('height',20)
        .attr('transform', (d,i) => 
            {
                return `translate(${i*30 + 40},${dims.height/mapHeightScaler - 40})`
            })
        .attr('fill', d => colors[d])
        .attr('stroke','#000')

    legendG.selectAll('.prob-text')
        .data([2,5,10,15,30,45,60])
        .join('text')
        .classed('prob-text', true)
        .classed('tor-prob-leg', true)
        .classed('legend',true)
        .text(d => `${d}%`)
        .attr('transform', (d,i) => 
            {
                return `translate(${i*30 + 40},${dims.height/mapHeightScaler - 40})`
            })
        .attr('fill','#000')
        .attr('font-size','0.6rem')

    legendG.selectAll('.fill-legend')
        .data([...Array(100).keys()])
        .join('rect')
        .classed('fill-legend',true)
        .attr('transform', (d,i) => 
            {
                return `translate(${i*2 + 40},${dims.height/mapHeightScaler - 40})`
            })
        .attr('width',2)
        .attr('height',20)
        .attr('fill', d => d3.scaleSequential([1,100], d3.interpolateReds).nice()(d))
        .attr('visibility','hidden')

    legendG.selectAll('.fill-legend-text')
        .data([0,5])
        .join('text')
        .classed('fill-legend-text', true)
        .classed('fill-legend', true)
        .attr('text-anchor','middle')
        .text(d => d)
        .attr('transform', (d,i) => 
            {
                return `translate(${i*200 + 40},${dims.height/mapHeightScaler - 10})`
            })
        .attr('fill','#000')
        .attr('font-size','0.6rem')
        .attr('visibility','hidden')

    let statesG = d3.select('svg')
                    .append('g')

    statesG.selectAll('.st')
            .data(topojson.feature(us,us.objects.states).features)
            .join('path')
            .attr('d',path)
            .attr('stroke-width',0.5)
            .attr('stroke','#000')
            .attr('fill',d => {
                // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                try {
                    let abbrev = stateDict[d.properties.name]
                    let filtered = starterData.states.filter(entry => entry.state == abbrev)
                    
                    // Grab 0 index of hospitals for array of hospitals impacted
                    // Then grab 2 index to get the median value
                    let testData = filtered[0].hospitals[0][2]

                    if (testData == 0) {
                        return '#fff'
                    }

                    return fillColorDict['hosp'](testData)
                }
                catch(err) {
                    
                    return '#fff'
                }
            })
            .attr('fill-opacity',0)
            .classed('st',true)
            //.attr('id', d => { return d.properties.name.replace(/\s/g, '') })
            .attr('id', d => { return stateDict[d.properties.name]})

    let warnAreasG = d3.select('svg')
                    .append('g')

    warnAreasG.selectAll('.cwa')
            .data(topojson.feature(cwa,cwa.objects.cwas).features)
            .join('path')
            .attr('d',path)
            .attr('stroke-width',1)
            .attr('stroke','#000')
            .attr('fill', d => {
                // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                try {
                    let abbrev = d.properties.CWA
                    let filtered = starterData.cwas.filter(entry => entry.cwa == abbrev)
                    
                    let testData = filtered[0].hospitals[0][2]

                    return fillColorDict['hosp'](testData)
                }
                catch(err) {
                    
                    return '#fff'
                }
            })
            //.attr('fill','#aaa')
            .attr('fill-opacity',0)
            .classed('cwa',true)
            .attr('id', d => d.properties.CWA )
            .attr('data-toggle','tooltip')
            .attr('title', d => d.properties.CWA)

    

    // ** Interactions ** //

    var interaction = interact()

    interaction.highlight(d3.selectAll('.st'))
        .highlight(d3.selectAll('.cwa'))
        .menuChange(d3.select('select#prod'))
        .menuChange(d3.select('select#gran'))
        .menuChange(d3.select('select#st-choice'))
        .menuChange(d3.select('select#c-choice'))
        .menuChange(d3.select('select#perc'))
        .updateThresh(starterData.sims)
        .tableSelect();
    

})

