import initData from './charts.js';
import { stateDict } from './helper.js';
import { fillColor,fillColorDict } from './const.js'

export function interact() {

    var exports = {};

    exports.vars = {
        'level': 'nat',
        'selected': 'nat',
        'sims':[],
        'states':[],
        'cwas':[],
        'natQuantiles': {}
    }

    // Load the sims into our exports dict 
    Promise.resolve(initData).then(data => {

        exports.vars.sims = data.sims;
        exports.vars.states = data.states;
        exports.vars.cwas = data.cwas;
        exports.vars.natQuantiles = data.natQuantiles;
        
    })

    exports.highlight = function(selection) {

        let type = selection.nodes()[0].getAttribute('class')
        let idsuff;

        switch (type) {

            case 'st':
                idsuff = 'name' 
                break;

            case 'cwa':
                idsuff = 'CWA'
                break;

            case 'co':
                // Nothing here for the time being, but if counties are added

        }

        selection.on('mouseover', (e) => {

            //$(e.currentTarget).attr('fill-opacity', 0.5)
            $(e.currentTarget).attr('stroke-width', 2)

        }).on('mouseout', (e) => {
            
            // $(e.currentTarget).attr('fill-opacity', 0)
            $(e.currentTarget).attr('stroke-width', 0.5)

        }).on('click', e => {

            // Change selection menu
            $("select#gran").val(type);
            
            // Get clicked element ID
            let id = $(e.currentTarget).attr("id")
            this.vars.selected = id;

            switch (type) {
                case 'st':
                    
                    this.vars.level = 'st'

                    $('#st-choice').val(id)
                    // d3.select('#state-choice').style('visibility','visible')
                    // d3.select('#cwa-choice').style('visibility','hidden') 

                    d3.select('#state-choice').style('display','block')
                    d3.select('#cwa-choice').style('display','none') 

                    d3.select('#cur-val-table').text(`State: ${id}`)

                    // Run the table updater
                    this.updateTable('states')

                    break;

                case 'cwa':

                    this.vars.level = 'cwa'
                    
                    $('#c-choice').val(id)
                    // d3.select('#state-choice').style('visibility','hidden')
                    // d3.select('#cwa-choice').style('visibility','visible') 

                    d3.select('#state-choice').style('display','none')
                    d3.select('#cwa-choice').style('display','block') 

                    d3.select('#cur-val-table').text(`CWA: ${id}`)

                    this.updateTable('cwas')

                    break;

                case 'co':
                    // Nothing here for the time being, but if counties are added
                }

                console.log(this.vars)
        })

        return this;
    }

    exports.menuChange = function(selection) {
        selection.on('change', () => {
            let val = selection.node().value

            switch (selection.attr('id')) {

                case 'gran':

                    this.vars['level'] = val;

                    let isChecked = d3.select('#tordio').property('checked');

                    if (this.vars['level'] == 'cwa') {

                        // Update the selected var and the table title
                        this.vars.selected = $('#c-choice').val()
                        d3.select('#cur-val-table').text(`CWA: ${$('#c-choice').val()}`)

                        // Update the table values
                        this.updateTable('cwas')

                        // Control what menu is shown
                        d3.select('#state-choice').style('display','none')
                        d3.select('#cwa-choice').style('display','block')

                        // Control what map shows
                        if (isChecked) {
                            
                            d3.selectAll('.st')
                                .style('visibility','hidden')

                            d3.selectAll('.cwa')
                                .style('visibility','visible')
                                .attr('fill-opacity',0)

                        } else {

                            d3.selectAll('.cwa')
                                .style('visibility','visible')
                                .attr('fill-opacity',1)

                        }

                    } else if (this.vars['level'] == 'st') {

                        // Update the selected var and the table title
                        this.vars.selected = $('#st-choice').val()
                        d3.select('#cur-val-table').text(`State: ${$('#st-choice').val()}`)
                        
                        // Update the table values
                        this.updateTable('states')

                        // Control what menu is shown
                        d3.select('#state-choice').style('display','block')
                        d3.select('#cwa-choice').style('display','none')

                        // Control what is shown on map
                        d3.selectAll('.cwa')
                            .style('visibility','hidden')

                        if (isChecked) {

                            d3.selectAll('.st')
                                .style('visibility','visible')
                                .attr('fill-opacity',0)

                        } else {

                            d3.selectAll('.st')
                                .style('visibility','visible')
                                .attr('fill-opacity',1)

                        }

                    } else {

                        this.vars.selected = val;
                        d3.select('#cur-val-table').text(`National`)

                        // Control what menu is shown
                        d3.select('#state-choice').style('display','none')
                        d3.select('#cwa-choice').style('display','none')

                        // Control what is shown on map
                        d3.selectAll(`.cwa`)
                            .style('visibility','hidden')

                        if (isChecked) {
                            d3.selectAll('.st')
                                .attr('fill-opacity',0)
                                .style('visibility','visible')
                        } else {
                            d3.selectAll('.st')
                                .attr('fill-opacity',1)
                                .style('visibility','visible')
                        }
                        
                    }

                    break;

                case 'st-choice':

                    this.vars.selected = val;
                    d3.select('#cur-val-table').text(`State: ${val}`)
                    
                    break;

                case 'c-choice':

                    this.vars.selected = val;
                    d3.select('#cur-val-table').text(`CWA: ${val}`)

                    break;

                case 'prod':

                    // Update context jumbo
                    this.updateThresh(this.vars.sims);

                    // Update map
                    this.updateMap('impact')

                    this.updateProduct(val);

                case 'perc':

                    //console.log(val);
                    this.updateMap()
            }

            console.log(this.vars)

        })

        return this;
    }

    exports.tableSelect = function () {

        const context = d3.select('#context-jumbo');

        // Create a hover/click with box that appears, stating the anomaly relative to climo

        // d3.selectAll('td').on('click', (e) => {
        //     let value = $(e.currentTarget).text()
        //     // console.log(value)

        //     // Place calculation here (random number placeholder for the time being)
        //     let multiplier = (Math.random() + 0.5).toFixed(2);

        //     // Update text

        //     if (multiplier > 1) {
        //         context.text(`This is ${multiplier}x more than normal for this date.`)
        //     } else if (multiplier < 1) {
        //         context.text(`This is ${multiplier}x less than normal for this date.`)
        //     } else  {
        //         context.text('This is normal for this date.')
        //     }

        // })

        return this;
    }

    // Use this function to update map fill when the impact or percentile is changed
    exports.updateMap = function() {

        const helper = {
            'hosp':'hospitals',
            'pop':'population',
            'mob':'mobilehomes',
            'pow':'psubstations'
        }

        const indexer = {
            'min': 0,
            'ten': 1,
            'med': 2,
            'ninety': 3,
            'max': 4
        } 

        //if (type == 'impact') {
            d3.selectAll('.st')
                .attr('fill', d => {
                    // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                    try {
                        let abbrev = stateDict[d.properties.name]
                        let filtered = exports.vars.states.filter(entry => entry.state == abbrev)
                        
                        // Right now, the 2nd indexed position is the median... need
                        // to make this variable based on percentile dropdown
                        let testData = filtered[0][helper[$('#prod').val()]][0][indexer[$('#perc').val()]]
                        return fillColorDict[$('#prod').val()](testData)
                    }
                    // If there's no entry for that state
                    catch(err) {
                        
                        //console.log(err)
                        return '#fff'
                    }
                })

            d3.selectAll('.cwa')
                .attr('fill', d => {
                    // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                    try {
                        let abbrev = d.properties.CWA
                    
                        let filtered = exports.vars.cwas.filter(entry => entry.cwa == abbrev)
                        //console.log(filtered)
                        
                        // Right now, the 2nd indexed position is the median... need
                        // to make this variable based on percentile dropdown
                        let testData = filtered[0][helper[$('#prod').val()]][0][indexer[$('#perc').val()]]
                        return fillColorDict[$('#prod').val()](testData)
                    }
                    // If there's no entry for that CWA
                    catch(err) {
                        
                        //console.log(err)
                        return '#fff'
                    }
                })
    }

    exports.updateThresh = function(data) {
        let thresh = +$('#thresh').val()
        
        const arrayMapper = {
            'pop': [0,'people'],
            'hosp': [1,'hospital(s)'],
            'mob': [2,'mobile home(s)'],
            'pow': [3,'power plant(s)']
        }

        let arrayIdx = arrayMapper[$('#prod').val()][0]

        let count = data.filter(entry => entry[arrayIdx] >= thresh).length

        // Update text on page
        d3.select('#context-jumbo')
            .text(`${count} of 10k simulations (${(count/100).toFixed(1)} %) impacted at least
            ${thresh} ${arrayMapper[$('#prod').val()][1]}.`)

        return this;
    }

    // Use this function to update table when an area is selected via a map click or menu change
    exports.updateTable = function(level) {

        let region;

        if (level == 'states') {
            region = $('#st-choice').val() 
        } else {
            region = $('#c-choice').val() 
        }

        const helperDict = {
            'population': 'pop',
            'hospitals': 'hosp',
            'mobilehomes': 'mob',
            'psubstations': 'pow'
        }

        const percList = ['min','ten','med','ninety','max'];

        // Get data from var holder
        let filtered = this.vars[level].filter(entry => entry[`${level.slice(0,-1)}`] == region)
        
        
        try {

            Object.keys(filtered[0]).forEach(key => {
                if ((key != 'state') && (key != 'cwa')) { 

                    console.log('update!')
                    let dataArr = filtered[0][key][0]

                    percList.forEach((e,i) => {

                        d3.select(`.t${helperDict[key]}.${e}`).text((dataArr[i]).toFixed())
                    })

                }
            })

        } catch(err) {

            d3.selectAll('.cell.dat').text(0)

        }
        
    }

    exports.updateProduct = function(val) {

        // Show states if an impact option is chosen and gran is set to nat
        // if ((this.vars.level == 'nat') && (val != 'tor')) {
        //     d3.selectAll('.st').attr('fill-opacity', 1)
        // }

        console.log(val)

        // If showing impact map, update legend appropriately
        if ($('input[name="tordio"]:checked').val() == 'imp') {
            // Hide all legends
            d3.selectAll('.legend')
                .attr('visibility','hidden');

            // Show appropriate legend
            d3.selectAll(`.${val}-leg`)
                .attr('visibility','visible');
        }

        d3.selectAll('.cell')
            .style('background-color', '#fff')

        // Hide contours
        // d3.selectAll('.contours')
        //     .attr('visibility','hidden')

        // Highlight appropriate column
        d3.selectAll(`.t${val}`)
            .style('background-color','rgba(187, 181, 181, 0.3)')

        // Highlight appropriate row
        // d3.selectAll(`.${$('#perc').val()}`)
        //     .style('background-color','rgba(187, 181, 181, 0.3)')

       
        
        // switch (val) {
            
        //     case 'hosp':
                
        //         // Show hospital legend
        //         d3.selectAll('.hosp-leg')
        //             .attr('visibility','visible');

        //         // d3.selectAll('.thosp')
        //         //     .style('background-color','rgba(187, 181, 181, 0.3)')

        //         break;

        //     case 'mob':
        
        //         // Show hospital legend
        //         d3.selectAll('.mob-leg')
        //             .attr('visibility','visible');

        //         // d3.selectAll('.tmob')
        //         //     .style('background-color','rgba(187, 181, 181, 0.3)')

        //         break;

        //     case 'pop':
    
        //         // Show hospital legend
        //         d3.selectAll('.pop-leg')
        //             .attr('visibility','visible');

        //         // d3.selectAll('.tpop')
        //         //     .style('background-color','rgba(187, 181, 181, 0.3)')

        //         break;

        //     case 'pow':

        //         // Show hospital legend
        //         d3.selectAll('.pow-leg')
        //             .attr('visibility','visible');

        //         // d3.selectAll('.tpow')
        //         //     .style('background-color','rgba(187, 181, 181, 0.3)')

        //         break;
        // }


    }

    // Random helpers
    $('#thresh-update').on('click', () => {
        exports.updateThresh(exports.vars.sims);
    })

    $('input[name="tordio"]').on('change', () => {

        let showing = exports.vars.level;

        // Hide all legends
        d3.selectAll('.legend').attr('visibility','hidden');

        if (d3.select('#tordio').property('checked')) { 

            // Show tor prob legend
            d3.selectAll('.tor-prob-leg').attr('visibility','visible');

            if (showing == 'nat' || showing == 'st') { 
                d3.selectAll(`.cwa`)
                    .style('visibility','hidden')

                d3.selectAll(`.st`)
                    .style('visibility','visible')
                    .attr('fill-opacity',0)
            } else {
                d3.selectAll(`.cwa`)
                    .style('visibility','visible')
                    .attr('fill-opacity',0)

                d3.selectAll(`.st`)
                    .style('visibility','hidden')
            }

            d3.selectAll('.legend').attr('visibility','visible')

            // Hide percentile select

            d3.select('#map-fill').style('display','none')

        } else {
            
            if (showing == 'nat' || showing == 'st') { 
                
                d3.selectAll('.st')
                    .attr('fill-opacity',1)
                    .style('visibility','visible')
            } else { 
                d3.selectAll('.cwa')
                    .attr('fill-opacity',1) 
                    .style('visibility','visible')
            }

            // Show percentile select
            d3.select('#map-fill').style('display','block')

            // Show appropriate legend
            d3.selectAll(`.${$('#prod').val()}-leg`).attr('visibility','visible');

            // Highlight appropriate percentile row
            // d3.selectAll(`.${$('#perc').val()}`)
            //     .style('background-color','rgba(187, 181, 181, 0.3)')

            //d3.select('')
        }
    })


    return exports;

}