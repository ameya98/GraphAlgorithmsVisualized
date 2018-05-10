// dynamic resize for width and height
var width = d3.select("#svgdiv").node().getBoundingClientRect().width;
var height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
    svg.attr("height", height)
       .attr("width", width);

// add heading text - fade later
svg.append("svg:text")
.text("Prim's Minimum Spanning Tree")
.attr("class", "heading")
.attr("x", "50%")
.attr("y", "40%")
.attr("text-anchor", "middle")
.attr("fill", "black");

// description text
svg.append("svg:text")
.text("Find a tree that contains all points while minimizing the sum of edges weighted according to Euclidean distance.")
.attr("class", "description")
.attr("x", "50%")
.attr("y", "45%")
.attr("text-anchor", "middle");

svg.append("svg:text")
.text("Prim's Algorithm:")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "52%")
.style("fill", "black");

svg.append("svg:text")
.text("1. For all points, initialize distance (representing the shortest distance from the current tree) as 'Infinity'.")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "55%");

svg.append("svg:text")
.text("2. Select one point arbitrarily, and set its distance as 0.")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "58%");

svg.append("svg:text")
.text("3. Repeat until all vertices in tree:")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "61%");

svg.append("svg:text")
.text("Find point with least distance from tree, and add it to the tree.")
.attr("class", "description")
.attr("x", "24%")
.attr("y", "64%");

svg.append("svg:text")
.text("For this added point, update distance for all neighbours, if shorter.")
.attr("class", "description")
.attr("x", "24%")
.attr("y", "67%");

svg.append("svg:text")
.text("Click to begin!")
.attr("class", "subheading")
.attr("x", "50%")
.attr("y", "75%")
.attr("text-anchor", "middle")
.style("fill", "black");

// algorithm global values
points = []
pointcount = 100;
started = false;
growtree = false;
startindex = 0;

// start loading points once clicked
d3.select("body")
  .on('click', function(){
      if(started == false){
          started = true;

          // start loading points
          startanimation();

          // fade heading away and descriptions
          d3.timeout(function fadeheading(){
              d3.select(".heading")
              .transition()
              .style("fill-opacity", "0")
              .duration("500");

              d3.select(".subheading")
              .transition()
              .style("fill-opacity", "0")
              .duration("500");

              d3.selectAll(".description")
              .transition()
              .style("fill-opacity", "0")
              .remove()
              .duration("500");

              console.log("Heading Faded");
          });

      }
  });

function startanimation()
{
    // add points one-by-one
    timer = d3.timer(function() {
        let point = {x: 30 + (Math.random() * (width - 60)),
                     y: 30 + (Math.random() * (height - 60))};

        svg.append("circle")
            .attr("id", "point" + (points.length).toString())
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", 0)
            .on("mouseover", function(){
                d3.select(this).attr("r", 4);
            })
            .on("mouseout", function(){
                d3.select(this).attr("r", 2);
            })
            .on("click", function(){
                if(points.length == pointcount && !growtree)
                {
                    growtree = true;
                    startindex = parseInt(d3.select(this).attr("id").replace("point", ""), 10);

                    console.log(startindex);

                    // start growing the tree when clicked
                    findMST();

                    // remove prompt when point clicked
                    d3.select(".subheading")
                    .transition()
                     .style("fill-opacity", "0")
                     .duration("500");

                    // show the button now
                    d3.select("#pausebutton")
                    .style("visibility", "visible")
                    .transition()
                     .style("opacity", "1")
                     .duration(1000);

                    // fade distances in
                    for(let i = 0; i < points.length; ++i)
                    {
                        if(i != startindex)
                        {
                            d3.select("#distance" + i.toString())
                            .transition()
                            .attr("fill-opacity", "0.8")
                            .duration("1000");
                        }
                    }
                }
            })
          .transition()
            .attr("r", 2);

        svg.append("svg:text")
            .text("Inf")
            .attr("id", "distance" +  (points.length).toString())
            .attr("class", "distance")
            .attr("x", point.x)
            .attr("y", point.y)
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .attr("fill-opacity", "0")
            .attr("fill", "gray");

        points.push(point);
        if(points.length == pointcount)
        {
                timer.stop();

                // show prompt to click on a point
                d3.select(".subheading")
                .text("Click on any point to initialize the tree.")
                .attr("y", "3%")
                .transition()
                 .style("fill-opacity", "1")
                 .duration("500");
        }
    }, 500);
}

function findMST(){
    current_tree = [];
    distance = [];
    in_tree = [];
    parent = [];

    for(let i = 0; i < points.length; ++i)
    {
        if(i != startindex)
        {
            distance.push(Infinity);
            in_tree.push(false);
            parent.push(null);
        }
        else {
            distance.push(0);
            in_tree.push(false);
            parent.push(null);
        }
    }

    stopped = false;
    edgetimer = d3.interval(addnextedge, 800);

    // to pause and continue
    d3.select("#pausebutton")
    .on("click", function(){
        if(stopped)
        {
            edgetimer = d3.interval(addnextedge, 800);
            stopped = false;
            d3.select(this).text("Pause");
        }
        else {
            edgetimer.stop();
            stopped = true;
            d3.select(this).text("Continue");
        }
    });

    // actual Prim's algorithm
    var mindistpoint;
    var mindist;
    function addnextedge()
    {
        if(current_tree.length == pointcount)
        {
            edgetimer.stop();
            console.log("MST complete");
            clearscreen();
        }

        // find point with closest distance
        mindist = Infinity;
        for(let i = 0; i < points.length; ++i)
        {
            if(!in_tree[i])
            {
                if(mindist > distance[i])
                {
                    mindist = distance[i];
                    mindistpoint = i;
                }
            }
        }

        // add closest point and the edge to its parent
        console.log("point" + mindistpoint.toString() + " added to MST");
        in_tree[mindistpoint] = true;
        current_tree.push(points[mindistpoint]);

        d3.select("#point" + mindistpoint.toString())
          .attr("r", 3)
          .style("fill", "gray");

        d3.select("#distance" + mindistpoint.toString())
          .transition()
           .attr("fill-opacity", "0")
           .duration("500");

        if(parent[mindistpoint] != null)
        {
            svg.append("line")
               .style("stroke", "red")
               .attr("x1", points[parent[mindistpoint]].x)
               .attr("y1", points[parent[mindistpoint]].y)
               .attr("x2", points[parent[mindistpoint]].x)
               .attr("y2", points[parent[mindistpoint]].y)
               .transition()
                   .attr("x2", points[mindistpoint].x)
                   .attr("y2", points[mindistpoint].y)
               .transition()
                   .style("stroke", "gray");
            }

        // update distances to neighbours - here, all other points
        for(let i = 0; i < points.length; ++i)
        {
            if(!in_tree[i])
            {
                newdistance = Math.sqrt(Math.pow(points[i].x - points[mindistpoint].x, 2) + Math.pow(points[i].y - points[mindistpoint].y, 2));
                if(distance[i] > newdistance)
                {
                    distance[i] = newdistance;
                    parent[i] = mindistpoint;

                    d3.select("#distance" + i.toString())
                      .transition()
                       .text(Math.round(distance[i]))
                       .duration("300");
                }
            }
        }
    }
}

// clear the screen eventually
function clearscreen(){
    d3.timeout(function(){

            svg.append("defs")
                .append("filter")
                .attr("id", "blur")
                .append("feGaussianBlur")
                .attr("stdDeviation", 5);

            d3.select(".heading")
            .text("Minimal Spanning Tree Built")
            .attr("y", "4%")
            .transition()
                .style("fill-opacity", "1")
                .duration("500")
            .transition()
                .style("fill-opacity", "0")
                .duration("1500");

    }, 1000);
}
