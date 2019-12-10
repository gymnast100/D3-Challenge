// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]*0.8),
        d3.max(censusData, d => d[chosenXAxis]*1.2)
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d[chosenYAxis])])
    .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  
// function used for updating text group with a transition to
// new circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

   textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
    

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis ,circlesGroup){

    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%):";
    }
    else if (chosenXAxis === "age"){
        var xlabel = "Age(Median):";    
    }
    else {
      var xlabel = "Household Income(Median):";
    }
    

    if (chosenYAxis === "healthcare") {
        var ylabel = "lacking Healthcare(%):";
      }
      else if (chosenYAxis === "smokes"){
          var ylabel = "Smokes(%):";    
      }
      else {
        var ylabel = "Obesity(%):";
    }

    // creating the tooltip
     toolTip = d3.select("body").append("div")
      .attr("class", "d3-tip")
      .offset([20, -80])
      .html(function(d) {
        return (`${d.state}<br>${xlabel}:${d[chosenXAxis]}%<br>${ylabel}:${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip)
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    
    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
    console.log(censusData)
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.healthcare = +data.healthcare
      data.obesity = +data.obesity
      data.smokes = +data.smokes
      data.income = +data.income;
    });
// xLinearScale  , yLinearScale function above csv import
     var xLinearScale = xScale(censusData, chosenXAxis);
     var yLinearScale = yScale(censusData, chosenYAxis);

// Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale)
        var leftAxis = d3.axisLeft(yLinearScale)

 // append x axis
    var xAxis = chartGroup.append("g")
    // .classed("aText", true)
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

// append y axis    
    chartGroup.append("g")
    // .classed("aText", true)
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    // .attr("fill", "light blue")
    .classed("stateCircle", true)
    // .attr("opacity", ".8")
    
  // append text to circles with state abbreviations
  var textGroup = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .classed("stateText", true)
    .text(function(d){return d.abbr})
   

 // Create group for  3 x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty(%)");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


 // Create group for  3 y - axis labels
    var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 60 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacking Healthcare(%)");

    var ageLabel = ylabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes(%)");

  
    var incomeLabel = ylabelsGroup.append("text")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity(%)");

 // updateToolTip function above csv import
     var circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);


// x axis labels event listener
 xlabelsGroup.selectAll("text")
    .on("click", function() {
  // get value of selection
    var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {

    // replaces chosenXAxis with value
    chosenXAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    xLinearScale = xScale(censusData, chosenXAxis);
    

    // updates x axis with transition
    xAxis = renderXAxes(xLinearScale, xAxis);
    

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis,chosenYaxis,circlesGroup);

    textGroup = renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis);

    // changes classes to change bold text
    if (chosenXAxis === "poverty") {
      povertyLabel
        .classed("active", true)
        .classed("inactive", false);
      ageLabel
        .classed("active", false)
        .classed("inactive", true);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);

    }
    else if (chosenXAxis === "age"){
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
        .classed("active", true)
        .classed("inactive", false);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
        .classed("active", false)
        .classed("inactive", true);
      incomeLabel
        .classed("active", true)
        .classed("inactive", false);
     
    }
  }
});

    // y axis labels event listener
 ylabelsGroup.selectAll("text")
 .on("click", function(){
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis){

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);
       

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
       

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
        // circleGroups= renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis); 

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYaxis,circlesGroup);

        // updates text of the 
        textGroup = renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis);

         // changes classes to change bold text
         if (chosenYAxis === "healthcare"){
         
         healthcareLabel
             .classed("active", true)
             .classed("inactive", false);
         smokesLabel
             .classed("active", false)
             .classed("inactive", true);
         obesityLabel
             .classed("active", false)
             .classed("inactive", true);

         }
         else if (chosenYAxis === "smokes"){
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obesityLabel
                .classed("active", true)
                .classed("inactive",false); 
        } 
    }

});

})