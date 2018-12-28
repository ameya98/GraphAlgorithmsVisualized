// dynamic resize for width and height
var width = d3.select("#svgdiv").node().getBoundingClientRect().width;
var height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
    svg.attr("height", height)
       .attr("width", width);

points = [];
pointcount = 6;
edgecount = 3 * pointcount - 4;

// source
points[0] = {x: width/4,
             y: height/2};

points[1] = {x: width/3,
             y: height/3};

points[2] = {x: width/3,
             y: 2 * height/3};

points[3] = {x: 2 * width/3,
             y: height/3};

points[4] = {x: 2 * width/3,
             y: 2 * height/3};

// sink
points[5] = {x: 3*width/4,
             y: height/2};


// a BFS from source to sink
function findpath(){

distance = [0];
parent = [null];
for(let i = 1; i < pointcount; ++i)
{
        distance.push(Infinity);
        parent.push(null);
}

BFSqueue = [];
while()


}

// append the points
for(let i = 0; i <= 5; ++i)
{
   svg.append("circle")
       .style("fill", function(){
                                if(i == 0 || i == 5) return "red";
                                else return "gray";
                            })
       .attr("id", "point" + (i).toString())
       .attr("cx", points[i].x)
       .attr("cy", points[i].y)
       .attr("r", 0)
       .transition()
        .attr("r", 4);
}

console.log(points);

// add edges from source
sourceedgecount = 1;
sourceedgetimer = d3.timer(function(){
    let index = sourceedgecount;

    // append the edge
    svg.append("line")
       .style("stroke", "red")
       .attr("x1", points[0].x)
       .attr("y1", points[0].y)
       .attr("x2", points[0].x)
       .attr("y2", points[0].y)
       .transition()
           .attr("x2", points[index].x)
           .attr("y2", points[index].y)
           .duration("500")
       .transition()
           .style("stroke", "gray");

    sourceedgecount += 1;
    if(sourceedgecount == 3)
    {
        sourceedgetimer.stop();
    }

});

// add edges from sink
sinkedgecount = 3;
sinkedgetimer = d3.timer(function(){

    let index = sinkedgecount;

    // append the edge
    svg.append("line")
       .style("stroke", "red")
       .attr("x1", points[pointcount - 1].x)
       .attr("y1", points[pointcount - 1].y)
       .attr("x2", points[pointcount - 1].x)
       .attr("y2", points[pointcount - 1].y)
       .transition()
           .attr("x2", points[index].x)
           .attr("y2", points[index].y)
           .duration("500")
       .transition()
           .style("stroke", "gray");

    sinkedgecount += 1;
    if(sinkedgecount == 5)
    {
        sinkedgetimer.stop();
    }

}, 1000);

// add edges between middle 4 points
currentpoint = 1;
drawntopoint = 2;
edgetimer = d3.timer(function(){
    let index1 = currentpoint;
    let index2 = drawntopoint;

    // append the edge
    svg.append("line")
       .style("stroke", "gray")
       .attr("x1", points[index1].x)
       .attr("y1", points[index1].y)
       .attr("x2", points[index1].x)
       .attr("y2", points[index1].y)
       .transition()
           .attr("x2", points[index2].x)
           .attr("y2", points[index2].y)
           .duration("500");

   capacity = Math.floor(Math.random() * 99) + 1;
   svg.append("svg:text")
      .text(99)
      .attr("class", "flow")
      .attr("id", "edge" + index1.toString() + index2.toString())
      .attr("x", function(){
                            if(index1 == 1 && index2 == 4) {
                               return(points[index1].x + 2*points[index2].x) / 3;
                           }
                            else if(index1 == 2 && index2 == 3) {
                               return(2*points[index1].x + points[index2].x) / 3;
                           }
                            else return(points[index1].x + points[index2].x) / 2;
                       })
      .attr("y", function(){
                            if(index1 == 1 && index2 == 4) {
                               return(points[index1].y + 2*points[index2].y) / 3;
                            }
                            else if(index1 == 2 && index2 == 3) {
                               return(2*points[index1].y + points[index2].y) / 3;
                            }
                            else return(points[index1].y + points[index2].y) / 2;
                        })
      .style("fill-opacity", "0")
      .transition()
        .style("fill-opacity", "1")
        .duration("1000");

    svg.append("svg:text")
       .text("/" + capacity.toString())
       .attr("class", "capacity")
       .attr("x", function(){
                             if(index1 == 1 && index2 == 4) {
                                return(points[index1].x + 2*points[index2].x) / 3;
                            }
                             else if(index1 == 2 && index2 == 3) {
                                return(2*points[index1].x + points[index2].x) / 3;
                            }
                             else return(points[index1].x + points[index2].x) / 2;
                        })
       .attr("y", function(){
                             if(index1 == 1 && index2 == 4) {
                                return(points[index1].y + 2*points[index2].y) / 3;
                             }
                             else if(index1 == 2 && index2 == 3) {
                                return(2*points[index1].y + points[index2].y) / 3;
                             }
                             else return(points[index1].y + points[index2].y) / 2;
                         })
       .attr("dx", "1em")
       .style("fill-opacity", "0")
       .transition()
         .style("fill-opacity", "1")
         .duration("1000");

    drawntopoint += 1;
    if(drawntopoint == 5)
    {
        currentpoint += 1;
        drawntopoint = currentpoint + 1;
    }

    if(currentpoint == 4)
    {
        edgetimer.stop();
    }

}, 2000);
