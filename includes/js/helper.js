// Helper functions

export var stateDict = {};
export var cwaDict = {};

d3.json('./includes/jsons/states.json').then(data => {

    let dropdown = d3.select('#st-choice')

    data.forEach(entry => {

        stateDict[entry.name] = entry.abbreviation;
        
        let option = dropdown.append('option')

        option.text(entry.name)
        option.attr('value',entry.abbreviation)

    })

    dropdown.property('value','OK');
})

d3.json('./includes/jsons/cwa.json').then(data => {

    let dropdown = d3.select('#c-choice')

    data.forEach(entry => {

        cwaDict[entry.name] = entry.abbreviation;
        
        let option = dropdown.append('option')

        option.text(entry.name)
        option.attr('value',entry.abbreviation)

    })

    dropdown.property('value','OUN')
})