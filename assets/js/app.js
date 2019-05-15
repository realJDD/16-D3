let
    svgWidth = 750,
    svgHeight = 500

let margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
let svg = d3.select("#scatter")
.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
.classed("svg-content", true)

let chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`)

// Initial Params
let chosenXAxis = "obesity"
let chosenYAxis = "income"

  // function used for updating x-scale let upon click on axis label
  function xScale(scatterData, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d[chosenXAxis]),  d3.max(scatterData, d => d[chosenXAxis])])
      .range([0, width])
      return xLinearScale
  }

  // function used for updating y-scale let upon click on axis label
  function yScale(scatterData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d[chosenYAxis]), d3.max(scatterData, d => d[chosenYAxis])])
      .range([height, 0])
      return yLinearScale
  }

  // function used for updating xAxis let upon click on axis label
  function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale)
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis)
    return xAxis
  }

  // function used for updating yAxis let upon click on axis label
  function renderAxesY(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale)
    yAxis.transition()
      .duration(1000)
      .call(leftAxis)
    return yAxis
  }

  // function used for updating circles group  (from new selected X axis) with a transition to new circles
  function renderCirclesX(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
    return circlesGroup
  }

  // function used for updating Y circles group (from new selected Y axis) with a transition to new circles
  function renderCirclesY(circlesGroup, newYScale, chosenYaxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]))
    return circlesGroup
  }

    // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
      let labelX  = ""
      let labelY  = ""
      if (chosenXAxis === "obesity") {
          labelX = "Obese (%)"
      }
      else {
          labelX = "Smokes (%)"
      }
      if (chosenYAxis === "income") {
          labelY = "Household Income (Median)"
      }
      else {
          labelY = "Lacks Healthcare (%)"
      }

      let toolTip = d3.tip()
          .attr("class", "tooltip")
          .style("background", "#232F34")
          .style("color", "#FFFFFF")
          .style("padding", "2px")
          .style("border", "0px")
          .style("border-radius", "8px")
          .style("font", "12px sans-serif")
          .style("text-align", "center")
          .style("position", "absolute")
          .html(function(d) {
              return (`${d.state}<br>${labelY}: ${d[chosenYAxis]}<br>${labelX}: ${d[chosenXAxis]}`)
          })

      circlesGroup.call(toolTip)

      circlesGroup.on("mouseover", function(data) {
          toolTip.show(data, this)
      })
      // onmouseout event
      .on("mouseout", function(data, index) {
          toolTip.hide(data, this)
      })

    return circlesGroup
  }

// Retrieve data from the CSV file and execute everything below
(async function(){
    let scatterData = await d3.csv("assets/data/data.csv")

    // Parse Data/Cast as numbers
    scatterData.forEach(function(data) {
        data.income = +data.income
        data.obesity = +data.obesity
        data.smokes = +data.smokes
        data.healthcare = +data.healthcare
    })

    // xLinearScale function above csv import
    let xLinearScale = xScale(scatterData, chosenXAxis)

    // yLinearScale scale function
    let yLinearScale = yScale(scatterData, chosenYAxis)

    // create axis functions
    let bottomAxis = d3.axisBottom(xLinearScale)
    let leftAxis = d3.axisLeft(yLinearScale)

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis)

    // Create Circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "12")
        .attr("fill", "blue")
        .attr("opacity", ".5")

    // Create group for  2 x-axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
    let obesityLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)")
    let smokesLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)")

    // Create group for  2 y-axis labels
    let labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        // .attr("transform", `translate(${width / 20}, ${height + 20})`,)
    let incomeLabel = labelsGroupY.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", -60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)")
    let healthcareLabel = labelsGroupY.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", -80)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)")

    //Add State Abbr labels to SVG nodes
    chartGroup.append("text")
        .selectAll("tspan")
        .data(scatterData)
        .enter()
        .append("tspan")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("text-anchor", "middle")
            .text(function(d) {return d.abbr})
            .attr("fill", "white")
            .attr("font-size", 9)

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value")
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value

            // updates x scale for new data
            xLinearScale = xScale(scatterData, chosenXAxis)

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis)

            // updates circles with new x values
            circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenXAxis, circlesGroup)

            // changes classes to change bold text
            if (chosenXAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false)
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true)
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false)
            }

            // clear any current svg labels
            svg.selectAll("tspan").remove()

            //Add State Abbr labels to SVG nodes
            chartGroup.append("text")
                .selectAll("tspan")
                .data(scatterData)
                .enter()
                .append("tspan")
                    .attr("x", d => xLinearScale(d[chosenXAxis]))
                    .attr("y", d => yLinearScale(d[chosenYAxis]))
                    .attr("text-anchor", "middle")
                    .text(function(d) {return d.abbr})
                    .attr("fill", "white")
                    .attr("font-size", 9)
          }
          // updateToolTip function above csv import
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)
      })

      // y axis labels event listener
      labelsGroupY.selectAll("text")
          .on("click", function() {
          // get value of selection
          const value = d3.select(this).attr("value")
          if (value !== chosenYAxis) {

              // replaces chosenXAxis with value
              chosenYAxis = value

              // updates y scale for new data
              yLinearScale = yScale(scatterData, chosenYAxis)

              // updates y axis with transition
              yAxis = renderAxesY(yLinearScale, yAxis)

              // updates circles with new y values
              circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis)

              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

              // changes classes to change bold text
              if (chosenYAxis === "income") {
                  incomeLabel
                      .classed("active", true)
                      .classed("inactive", false)
                  healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true)
              }
              else {
                  incomeLabel
                      .classed("active", false)
                      .classed("inactive", true)
                  healthcareLabel
                      .classed("active", true)
                      .classed("inactive", false)
              }

              // clear any current svg labels
              svg.selectAll("tspan").remove()

              //Add State Abbr labels to SVG nodes
              chartGroup.append("text")
                  .selectAll("tspan")
                  .data(scatterData)
                  .enter()
                  .append("tspan")
                      .attr("x", d => xLinearScale(d[chosenXAxis]))
                      .attr("y", d => yLinearScale(d[chosenYAxis]))
                      .attr("text-anchor", "middle")
                      .text(function(d) {return d.abbr})
                      .attr("fill", "white")
                      .attr("font-size", 9)
            }
            // updateToolTip function above csv import
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)
        })
  })()
