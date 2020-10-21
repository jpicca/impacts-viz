// Mapping script

import { colors, width, height, fillColorDict } from './const.js'
import { interact } from './interactions.js'
import { stateDict } from './helper.js'
import initData from './charts.js'

Promise.all([d3.json('./includes/geo/counties-10m-edit.json'),
            d3.json('./includes/geo/test.geojson'),
            d3.json('./includes/geo/cwa.json'),
            initData]).then(function(files) {

    var us = files[0];
    var outlooks = files[1];
    var cwa = files[2];
    var starterData = files[3];

    const dims = {
        'width': width,
        'height': height
    };

    var projection = d3.geoAlbersUsa()
        .scale(dims.width/2)
        .translate([dims.width/4,dims.height/4]);

    var path = d3.geoPath().projection(projection);

    var svg = d3.select('#map-holder')
                .append('svg')
                //.attr('viewBox', `0 0 ${dims.width} ${dims.height/2}`)
                .attr('height',dims.height/2)
                .attr('width',dims.width/2);


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
                return `translate(${i*30 + 40},${dims.height/2 - 40})`
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
                return `translate(${i*30 + 40},${dims.height/2 - 40})`
            })
        .attr('fill','#000')
        .attr('font-size','0.6rem')

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
                    
                    let testData = filtered[0].hospitals[0][2]

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

    // let countiesG = d3.select('svg')
    //                     .append('g')

    // countiesG.selectAll('.co')
    //         .data(topojson.feature(us,us.objects.counties).features)
    //         .join('path')
    //         .attr('d',path)
    //         .attr('stroke-width',0.5)
    //         .attr('stroke','#aaa')
    //         .attr('fill','none')
    //         .classed('co',true)

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
            .attr('id', d => { return d.properties.CWA })

    

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

