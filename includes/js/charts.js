import histChart from './plotBase.js'
import { quantileCalc } from './stats.js'

// New file format to read in sims + state/cwa starter info (10/med/90 + climo)
export default d3.json('./includes/data/init/data.json').then(function(impacts) {
    var h = [], m = [], pop = [], pow = [];
    let initData = impacts;

    // console.log(initData)

    impacts.sims.forEach(function(entry) {
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

    // Populate table with stats
    Object.keys(statsDict).forEach(function(key) {
        Object.keys(statsDict[key]).forEach(function(innerKey) {

            //console.log(`.t${key}.${innerKey}`)

            let cell = d3.select(`.t${key}.${innerKey}`);
            let val = +statsDict[key][innerKey].toFixed()

            cell.text(val)
            cell.attr('title',() => {

                let climo = +initData['natClimo'][key][innerKey];
                let text;
                if (climo == 0) { 
                    text = 'Climo: 0'
                } else {
                    text = `Climo: ${climo.toFixed()} // Today's value is ${(val/climo).toFixed(1)}x normal for this date.`
                }

                return text;
            })

        })
    })

    return initData;
    
});