// Script to hold variable constants

export const colors = {
    2: '#248B00',
    5: '#8B4726',
    10: '#FDC803',
    15: '#F90201',
    30: '#F724FF',
    45: '#912CEE',
    60: '#104E8B'
}

export const textKey = {
    '#hosp-chart': 'Hospitals',
    '#mob-chart': 'Mobile Homes',
    '#pow-chart': 'Power Plants'
}

export const height = $(window).height();
export const width = $(window).width();

export const nSims = 10000;

// Obviously needs to be improved with variable color scales based on impact type, etc.
export const fillColor = d3.scaleSequential([0,75], d3.interpolateReds).nice();

export const fillColorDict = {
    'pop': d3.scaleSequential([1,10000], d3.interpolateReds).nice(),
    'hosp': d3.scaleSequential([1,5], d3.interpolateReds).nice(),
    'pow': d3.scaleSequential([1,10], d3.interpolateReds).nice(),
    'mob': d3.scaleSequential([1,100], d3.interpolateReds).nice()
}