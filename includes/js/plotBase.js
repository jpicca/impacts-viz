import {width, height, textKey, nSims} from './const.js'

var margin = {top: 10, right: 20, bottom: 40, left: 40};


// Generic chart class

class chartBase {
    // Create instance with variables
    constructor() {
      this.width = width/4 //- margin.left - margin.right;
      this.height = height/4 //- margin.top - margin.bottom;
      //this.ylabel = "";
    }
  
}

// Bar chart class to extend generic chart
class histChart extends chartBase {

    // Initialize barchart with same attributes as generic chart
    constructor() { 
        super()
        this.stats = {
            '0.5': '',
            '0.9': ''
        } 
    }

    makeChart = (data,container) => {

        const svg = d3.select(container).append('svg');
        svg.attr('width',this.width).attr('height',this.height);

        svg.append("g").classed('x-axis',true);
        svg.append("g").classed('y-axis',true);
        svg.append("g").classed('bars',true);
        svg.append("g").classed('stats',true);

        // Make x func for this chart
        var x = this.x(data);

        // Create x axis
        this.xAxis(svg.select('.x-axis'),x);

        // Create array of bins
        var bins = this.bins(data,x);

        // Create y func for this chart
        var y = this.y(bins);

        // Create y axis
        this.yAxis(svg.select('.y-axis'),y);

        // Create histogram bars
        this.bars(svg.select('.bars'),bins,x,y);

        // Update percentiles & add text
        this.calcs(data);
        this.statsText(svg.select('.stats'),container)

    }

    xAxis = (g,x) => g.attr("transform", `translate(0,${this.height - margin.bottom})`)
        .call(d3.axisBottom(x))

    yAxis = (g,y) => g.attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(10,".0%"))


    x = data => d3.scaleLinear()
        .domain([d3.min(data),d3.max(data)+2])
        //.domain(d3.extent(data)).nice()
        .range([margin.left, this.width - margin.right])

    y = () => d3.scaleLinear()
        .domain([0,1])
        .range([this.height - margin.bottom, margin.top])

    bins = (data,x) => d3.bin()
        .domain(x.domain())
        .thresholds(10)
        (data)

    bars = (g,bins,x,y) => g.attr('fill','steelblue')
        .selectAll('rect')
        .data(bins)
        .join('rect')
        .attr('x', d => x(d.x0))
        .attr('width', d => x(d.x1) - x(d.x0))
        .attr('y', d => y(d.length/nSims))
        .attr('height', d => y(0) - y(d.length/nSims));

    calcs = (data) => {
        this.stats['0.5'] = d3.quantile(data,0.5);
        this.stats['0.9'] = d3.quantile(data,0.9);
    }

    statsText = (g,container) => {

        // g.append('text')
        //     .text(`90th Percentile: ${this.stats['0.9']} ${textKey[container]}`)
        //     .attr("transform", `translate(${this.width/4},${2*margin.top})`)

    }

}


export default histChart;

