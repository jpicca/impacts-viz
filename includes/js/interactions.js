import initData from './charts.js';
import { stateDict } from './helper.js';
import { fillColor,fillColorDict } from './const.js'
import histChart from './plotBase.js'

console.log(initData)

export function interact() {

    var exports = {};

    exports.vars = {
        // 'level': 'nat',
        // 'selected': 'nat',
        'sims':[],
        'selSims':[],
        'states':[],
        'cwas':[],
        'natQuantiles': {}
    }

    // Load the sims from the initial data file into our exports dict 
    // THis includes individual sim data on national scale
    // and summary stats (quantiles) on states/cwas for map filling
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

        selection.on('mouseover', function(e) {

            //$(e.currentTarget).attr('fill-opacity', 0.5)
            $(e.currentTarget).attr('stroke-width', 2)

        }).on('mouseout', function(e) {
            
            // $(e.currentTarget).attr('fill-opacity', 0)
            $(e.currentTarget).attr('stroke-width', 0.5)

        }).on('click', function(e) {

            // Change selection menu to proper level
            $("select#gran").val(type);
            
            // Get clicked element ID
            let id = $(e.currentTarget).attr("id")
            // this.vars.selected = id;

            // Load new data file for clicked element
            // Load data also runs the threshold div updater and chart updater
            this.loadData(`./includes/data/followup/${id}_data.csv`);

            switch (type) {
                case 'st':
                    
                    // this.vars.level = 'st'

                    // Switch the state menu to clicked state
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

                    // this.vars.level = 'cwa'
                    
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

        }.bind(this))
        
        return this;    
    }

    exports.menuChange = function(selection) {
        selection.on('change', function() {

            let val = selection.node().value

            switch (selection.attr('id')) {

                case 'gran':

                    // this.vars['level'] = val;

                    let isChecked = d3.select('#tordio').property('checked');

                    if ($('select#gran').val() == 'cwa') {

                        // Update the selected var and the table title
                        // this.vars.selected = $('#c-choice').val()
                        d3.select('#cur-val-table').text(`CWA: ${$('#c-choice').val()}`)

                        // Update the table values
                        this.updateTable('cwas')

                        // Load new data file for whatever is the active CWA
                        this.loadData(`./includes/data/followup/${$('#c-choice').val()}_data.csv`);

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

                    } else if ($('select#gran').val() == 'st') {

                        // Update the selected var and the table title
                        // this.vars.selected = $('#st-choice').val()
                        d3.select('#cur-val-table').text(`State: ${$('#st-choice').val()}`)

                        // Load new data file for current state
                        this.loadData(`./includes/data/followup/${$('#st-choice').val()}_data.csv`);

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

                        // Update table for national stats
                        let statsDict = this.vars.natQuantiles;

                        Object.keys(statsDict).forEach(function(key) {
                            Object.keys(statsDict[key]).forEach(function(innerKey) {
                    
                                //console.log(`.t${key}.${innerKey}`)
                    
                                d3.select(`.t${key}.${innerKey}`).text((+statsDict[key][innerKey]).toFixed())
                    
                            })
                        })

                        // this.vars.selected = val;
                        d3.select('#cur-val-table').text(`National`)

                        // Update thresh with nat sims
                        this.updateThresh(this.vars.sims);

                        // Update charts
                        this.loadData(null,true);

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

                    // this.vars.selected = val;
                    d3.select('#cur-val-table').text(`State: ${val}`)

                    // Load new data file for updated menu
                    this.loadData(`./includes/data/followup/${val}_data.csv`);

                    // Update table
                    this.updateTable('states')
                    
                    break;

                case 'c-choice':

                    // this.vars.selected = val;
                    d3.select('#cur-val-table').text(`CWA: ${val}`)

                    // Load new data file for updated menu
                    this.loadData(`./includes/data/followup/${val}_data.csv`);

                    // Update table
                    this.updateTable('cwas')

                    break;

                case 'prod':

                    // Update context jumbo
                    if ($('select#gran').val() == 'nat') {
                        this.updateThresh(this.vars.sims);
                    } else {
                        this.updateThresh(this.vars.selSims)
                    }

                    // Update map
                    this.updateMap()

                    this.updateProduct(val);

                case 'perc':

                    this.updateMap()

                    
            }

            // console.log(this.vars)

        }.bind(this))

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
                .attr('fill', function(d) {
                    // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                    try {
                        let abbrev = stateDict[d.properties.name]
                        let filtered = exports.vars.states.filter(function(entry) {
                            return entry.state == abbrev
                        })
                        
                        // Right now, the 2nd indexed position is the median... need
                        // to make this variable based on percentile dropdown
                        let testData = filtered[0][helper[$('#prod').val()]][0][indexer[$('#perc').val()]]
                        
                        if (testData == 0) { return '#fff' }
                        
                        return fillColorDict[$('#prod').val()](testData)
                    }
                    // If there's no entry for that state
                    catch(err) {
                        
                        return '#fff'
                    }
                })

            d3.selectAll('.cwa')
                .attr('fill', function(d) {
                    // .population[0][2] is currently the 90th percentile -- *** make sure to change!! ***
                    try {
                        let abbrev = d.properties.CWA
                    
                        let filtered = exports.vars.cwas.filter(function(entry) {
                            return entry.cwa == abbrev
                        })
                        
                        
                        // Right now, the 2nd indexed position is the median... need
                        // to make this variable based on percentile dropdown
                        let testData = filtered[0][helper[$('#prod').val()]][0][indexer[$('#perc').val()]]
                        
                        if (testData == 0) { return '#fff' }
                        
                        return fillColorDict[$('#prod').val()](testData)
                    }
                    // If there's no entry for that CWA
                    catch(err) {
                        
                        return '#fff'
                    }
                })

            // Update title
            if (d3.select('#impadio').property('checked')) {
                updateTitle();
            }
    }

    exports.loadData = function(file=null,nat=false) {

        let containers = d3.selectAll('.chart');
        containers.select('h4').remove();

        if (nat) {

            var h = [], m = [], pop = [], pow = [];

            this.updateThresh(this.vars.sims);

            this.vars.sims.forEach(function(entry) {
                pop.push(entry[0])
                h.push(entry[1])
                m.push(entry[2])
                pow.push(entry[3])
            })

            var newHosp = new histChart();
            newHosp.makeChart(h,'#hosp-chart',false);

            var newMob = new histChart();
            newMob.makeChart(m,'#mob-chart',false);

            var newPow = new histChart();
            newPow.makeChart(pow,'#pow-chart',false);

            return;

        }

        d3.csv(file).then(function(data) {

            var h = [], m = [], pop = [], pow = [], simArr = [], simsArr = [];

            // Process data
            data.forEach(function(entry) {
                h.push(+entry.hospitals)
                m.push(+entry.mobilehomes)
                pop.push(+entry.population)
                pow.push(+entry.psubstations)

                simArr = [+entry.population,+entry.hospitals,+entry.mobilehomes,+entry.psubstations];
                simsArr.push(simArr);

            })

            // Add our simsArr to the exports vars
            this.vars.selSims = simsArr;

            // console.log('The 50th percentile of impacted pop is...')
            // console.log(d3.quantile(pop,0.5))

            // Update context-jumbo
            // Testing
            // console.log('Checking 50th percentile of this.vars.selSims at load data...')
            // console.log(`${this.vars.selSims.filter(entry => entry[0] > 15872).length}`)

            this.updateThresh(this.vars.selSims);
            
            var newHosp = new histChart();
            newHosp.makeChart(h,'#hosp-chart',false);

            var newMob = new histChart();
            newMob.makeChart(m,'#mob-chart',false);

            var newPow = new histChart();
            newPow.makeChart(pow,'#pow-chart',false);

        }.bind(this)).catch(function(err) {
            console.log('No file!')

            // Remove svg if it exists and add a banner about no tornadoes
            containers.select('svg').remove();
            containers.append('h4').text('No simulated tornadoes')

            d3.select('#context-jumbo').text('No simulated tornadoes')

            this.vars.selSims = [];

        }.bind(this))

    }

    exports.updateThresh = function(data) {

        // console.log(data)

        if (!data.length) { 

            console.log('nuthin!')

            d3.select('#context-jumbo').text('No simulated tornadoes');

            return;

        }

        let thresh = +$('#thresh').val()
        
        const arrayMapper = {
            'pop': [0,'people'],
            'hosp': [1,'hospital(s)'],
            'mob': [2,'mobile home(s)'],
            'pow': [3,'power substation(s)']
        }

        let arrayIdx = arrayMapper[$('#prod').val()][0]

        // console.log(arrayIdx)

        let count = data.filter(function(entry) { return entry[arrayIdx] >= thresh }).length

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

        console.log(`This is updateTable: ${region}`)

        const helperDict = {
            'population': 'pop',
            'hospitals': 'hosp',
            'mobilehomes': 'mob',
            'psubstations': 'pow'
        }

        const percList = ['min','ten','med','ninety','max'];

        // Get data from var holder
        let filtered = this.vars[level].filter(function(entry) {return entry[`${level.slice(0,-1)}`] == region })
        
        
        try {

            Object.keys(filtered[0]).forEach(function(key) {
                if ((key != 'state') && (key != 'cwa')) { 

                    let valArr = filtered[0][key][0]
                    let climoArr = filtered[0][key][1]

                    //console.log(climoArr)

                    percList.forEach(function(e,i) {

                        let cell = d3.select(`.t${helperDict[key]}.${e}`);
                        let val = +(valArr[i]).toFixed()
                        let climo = +climoArr[i]
                        let text;

                        cell.text(val)

                        cell.attr('data-original-title',() => {
                            if (climo == 0) { 
                                text = 'Climo: 0'
                            } else {
                                text = `Climo: ${climo.toFixed()} // Today's value is ${(val/climo).toFixed(1)}x normal for this date.`
                            }

                            return text;
                        })
                        //console.log(`Perc: ${e}, Impact: ${key} `)
                        
                    })

                }

                
                // let val = +statsDict[key][innerKey].toFixed()

                // cell.text(val)
                // cell.attr('title',() => {

                //     let climo = +initData['natClimo'][key][innerKey];
                //     let text;
                //     if (climo == 0) { 
                //         text = 'Climo: 0'
                //     } else {
                //         text = `Climo: ${climo.toFixed()} // Today's value is ${(val/climo).toFixed(1)}x normal for this date.`
                //     }

                //     return text;
                // })
            })

        } catch(err) {

            d3.selectAll('.cell.dat').text(0)

        }
        
    }

    exports.updateProduct = function(val) {

        // If showing impact map, update legend appropriately
        if ($('input[name="tordio"]:checked').val() == 'imp') {
            // Hide all legends
            d3.selectAll('.legend')
                .attr('visibility','hidden');

            // Show appropriate legend
            d3.selectAll(`.fill-legend`)
                .attr('visibility','visible');

        }

        // Update legend text
        let rangeHelper = {
            'pop': [0,50000],
            'hosp': [0,5],
            'pow': [0,10],
            'mob': [0,100]
        }

        d3.selectAll('.fill-legend-text')
            .data(rangeHelper[$('#prod').val()])
            .text(d => d);

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
    $('#thresh-update').on('click', function() {
        if ($('select#gran').val() == 'nat') {
            this.updateThresh(this.vars.sims);
        } else {
            this.updateThresh(this.vars.selSims);
        }
    }.bind(exports))

    function updateTitle() {
        let title = d3.select('.title-text')
                        
        let text = `${$('#prod option:selected').text()}: ${$('#perc option:selected').text()}`

        title.text(text)
    }

    $('input[name="tordio"]').on('change', function() {

        // let showing = exports.vars.level;

        let showing = $('select#gran').val();

        // Hide all legends
        // d3.selectAll('.legend').attr('visibility','hidden');

        if (d3.select('#tordio').property('checked')) { 

            // Update title
            d3.select('.title-text').text('SPC Tornado Probabilities')

            // Show tor prob legend
            d3.selectAll('.tor-prob-leg').attr('visibility','visible');
            d3.selectAll('.fill-legend').attr('visibility','hidden');

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

            // Update title
            updateTitle();

            d3.selectAll('.fill-legend').attr('visibility','visible');
            d3.selectAll('.tor-prob-leg').attr('visibility','hidden');
            
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

    // Enable tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })


    return exports;

}