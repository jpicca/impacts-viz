import histChart from './plotBase.js'
import { quantileCalc } from './stats.js'

// Read in csv

// d3.csv('./includes/data/impactCounts.csv').then(impacts => {
    
//     var h = [], m = [], p = [];
    
//     impacts.forEach(d => {
//         d.hospitals = +d.hospitals;
//         d.psubstations = +d.psubstations;
//         d.mobilehomes = +d.mobilehomes;

//         h.push(d.hospitals);
//         m.push(d.mobilehomes);
//         p.push(d.psubstations);
//     })

//     var hospChart = new histChart();
//     hospChart.makeChart(h,'#hosp-chart')

//     var mobChart = new histChart();
//     mobChart.makeChart(m, '#mob-chart')

//     var powChart = new histChart();
//     powChart.makeChart(p, '#pow-chart')

// })

// New file format to read in sims + state/cwa starter info (10/med/90 + climo)
export default d3.json('./includes/data/init/data.json').then(impacts => {
    var h = [], m = [], pop = [], pow = [];
    let initData = impacts;

    impacts.sims.forEach(entry => {
        pop.push(entry[0])
        h.push(entry[1])
        m.push(entry[2])
        pow.push(entry[3])
    })

    var hospChart = new histChart();
    hospChart.makeChart(h,'#hosp-chart')

    var mobChart = new histChart();
    mobChart.makeChart(m, '#mob-chart')

    var powChart = new histChart();
    powChart.makeChart(pow, '#pow-chart')

    // Get quantile data for table
    let masterArr = [pop,h,m,pow];

    let statsDict = quantileCalc(masterArr);

    // Add the statsDict to initData so we have the quantiles for the table whenever
    // we have to re-populate the table with national stats
    initData['natQuantiles'] = statsDict;

    Object.keys(statsDict).forEach(key => {
        Object.keys(statsDict[key]).forEach(innerKey => {

            //console.log(`.t${key}.${innerKey}`)

            d3.select(`.t${key}.${innerKey}`).text((+statsDict[key][innerKey]).toFixed())

        })
    })

    return initData;
    
});