// dynamic resize for width and height
var width = d3.select("#svgdiv").node().getBoundingClientRect().width;
var height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
    svg.attr("height", height)
       .attr("width", width);

// add heading text - fade later
svg.append("svg:text")
.text("The Delauney Triangulation")
.attr("class", "heading")
.attr("x", "50%")
.attr("y", "40%")
.attr("text-anchor", "middle")
.attr("fill", "black");

// description text
svg.append("svg:text")
.text("Compute a triangulation of points such that any of the points is not inside the circumcircle of any triangle of the triangulation.")
.attr("class", "description")
.attr("x", "50%")
.attr("y", "45%")
.style("text-anchor", "middle");

svg.append("svg:text")
.text("Algorithm:")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "52%")
.style("fill", "black");

svg.append("svg:text")
.text("1. Add points one by one. Points in gray have not been added yet.")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "55%");

svg.append("svg:text")
.text("2. Find the triangle that contains the new point, and join the vertices of this triangle and the point.")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "58%");

svg.append("svg:text")
.text("3. Perform Lawson flips to restore the Delauney Triangulation with the new point.")
.attr("class", "description")
.attr("x", "22%")
.attr("y", "61%");

svg.append("svg:text")
.text("Click anywhere to begin!")
.attr("class", "subheading")
.attr("x", "50%")
.attr("y", "75%")
.attr("text-anchor", "middle")
.style("fill", "black");

// algorithm global values
points = []
pointcount = 4;
started = false;
inprogress = false;
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
        let point = {x: 200 + (Math.random() * (width/3 - 400)),
                     y: 200 + (Math.random() * (2*height/3 - 400))};

        // the actual black circles
        svg.append("circle")
            .attr("id", "point" + (points.length).toString())
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", 0)
            .style("fill", "gray")
            .transition()
             .attr("r", 5);

        // transparent circles on top
        svg.append("circle")
            .attr("id", "transcircle" + (points.length).toString())
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", 10)
            .attr("fill-opacity", "0")
            .on("mouseover", function(){
                d3.select(this.id.replace("transcircle", "#point")).attr("r", 6);
            })
            .on("mouseout", function(){
                d3.select(this.id.replace("transcircle", "#point")).attr("r", 5);
            })
            .on("click", function(){
                if(points.length == pointcount && !inprogress)
                {
                    inprogress = true;
                    startindex = parseInt(d3.select(this).attr("id").replace("transcircle", ""), 10);

                    console.log(startindex);

                    // start growing the tree when clicked
                    findDT();

                    // remove prompt when point clicked
                    d3.select(".subheading")
                    .transition()
                     .style("fill-opacity", "0")
                     .duration("500");

                    // show the button now
                    d3.select("#pausebutton")
                    .text("Pause")
                    .style("visibility", "visible")
                    .transition()
                     .style("opacity", "1")
                     .duration("1000");

                    // fade distances in
                    // for(let i = 0; i < points.length; ++i)
                    // {
                    //     if(i != startindex)
                    //     {
                    //         d3.select("#distance" + i.toString())
                    //         .transition()
                    //         .attr("fill-opacity", "0.8")
                    //         .duration("1000");
                    //     }
                    // }
                }
            });

        points.push(point);
        if(points.length == pointcount)
        {
                timer.stop();

                // show prompt to click on a point
                d3.select(".subheading")
                .text("Click on any point to start building the triangulation.")
                .attr("y", "3%")
                .transition()
                 .style("fill-opacity", "1")
                 .duration("500");
        }
    }, 500);
}

// build a triangle object from 3 points
function build_triangle(point1, point2, point3){
    return {1: point1, 2: point2, 3: point3};
}

// add the triangle to the svg element
function draw_triangle(triangle){
    for(let i = 1; i <= 3; ++i)
    {
        svg.append("line")
           .style("stroke", "black")
           .attr("x1", triangle[i].x)
           .attr("y1", triangle[i].y)
           .attr("x2", triangle[i].x)
           .attr("y2", triangle[i].y)
           .transition()
               .attr("x2", triangle[1 + (i % 3)].x)
               .attr("y2", triangle[1 + (i % 3)].y)
               .delay(100*i)
               .duration(400);
    }
}

// checks whether the cross-product of (point1 - point3) and (point2 - point3) is negative
function cross_product_negative(point1, point2, point3){
    return ((point1.x - point3.x) * (point2.y - point3.y) - (point2.x - point3.x) * (point1.y - point3.y)) < 0.0;
}

// check if this triangle contains point in its interior
function in_triangle(point, triangle){

    b1 = cross_product_negative(point, triangle[1], triangle[2]);
    b2 = cross_product_negative(point, triangle[2], triangle[3]);
    b3 = cross_product_negative(point, triangle[3], triangle[1]);

    return ((b1 == b2) && (b2 == b3));
}

// join this point inside this triangle to the vertices
function join_points(point, triangle){

    new_triangles = [];

    new_triangles.push(build_triangle(point, triangle[1], triangle[2]));
    new_triangles.push(build_triangle(point, triangle[2], triangle[3]));
    new_triangles.push(build_triangle(point, triangle[3], triangle[1]));

    for(let i = 1; i <= 3; ++i)
    {
        svg.append("line")
           .style("stroke", "black")
           .attr("x1", point.x)
           .attr("y1", point.y)
           .attr("x2", point.x)
           .attr("y2", point.y)
           .transition()
               .attr("x2", triangle[i].x)
               .attr("y2", triangle[i].y)
               .delay(100*i)
               .duration(400);
    }

    return new_triangles;
}

function lawson_flip(triangle1, triangle2){

    // find the common edge
    commonvertices = [];
    count = 0;
    for(let i = 1; i <= 3, count < 2; ++i)
    {
        for(let j = 1; j <= 3, count < 2; ++j)
        {
            if(triangle1[i].x == triangle2[j].x and triangle1[i].y == triangle2[j].y)
            {
                commonvertices.push([i, j]);
                count += 1;
            }
        }
    }

    // find the non-common vertices
    othervertex1 = 6 - (commonvertices[0][0] + commonvertices[1][0]);
    othervertex2 = 6 - (commonvertices[0][1] + commonvertices[1][1]);

}

// finds the Delauney Triangulation of points given in the array points[]
function findDT(){

    // store the triangles as a list
    triangles = []

    // create three phantom points containing all other points
    phantompoint = []
    phantompoint.push({x: 40, y: 50});
    phantompoint.push({x: 40, y: height - 50});
    phantompoint.push({x: 2*width/3, y: height/2});

    // phantom points are red - remove this later.
    for(let i = 0; i < 3; ++i)
    {
        console.log(phantompoint[i]);

        svg.append("circle")
             .attr("id", "phantompoint" + (points.length).toString())
             .attr("cx", phantompoint[i].x)
             .attr("cy", phantompoint[i].y)
             .attr("r", 0)
             .style("fill", "red")
             .transition()
              .attr("r", 5);

        points.push(phantompoint[i]);
    }

    // start with the phantom points for the first triangle
    curr_triangle = build_triangle(phantompoint[0], phantompoint[1], phantompoint[2]);
    draw_triangle(curr_triangle);
    triangles.push(curr_triangle);

    stopped = false;
    edgetimer = d3.interval(addnextpoint, 1000);

    // to pause and continue
    d3.select("#pausebutton")
    .on("click", function(){
        if(stopped)
        {
            edgetimer = d3.interval(addnextpoint, 1000);
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
    let curr_index = 0;
    function addnextpoint()
    {
        // find triangle containing the next point
        for(let j = 0; j < triangles.length; ++j)
        {
            if(in_triangle(points[curr_index], triangles[j]))
            {
                console.log(curr_index, triangles[j]);

                // join vertices
                new_triangles = join_points(points[curr_index], triangles[j]);

                // add the new triangles - overwrite this current triangle too!
                triangles[j] = new_triangles[0];
                triangles.push(new_triangles[1]);
                triangles.push(new_triangles[2]);

                // perform Lawson flips


                // next point in points[]
                curr_index += 1;


            }
        }

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

                // show the button now
                d3.select("#pausebutton")
                .attr("float", "initial")
                .attr("position", "relative")
                .on("click", function restart(){
                    d3.selectAll("line")
                    .transition()
                     .style("stroke-opacity", "0")
                     .duration("1000");

                    d3.timeout(function removeedges(){
                        d3.selectAll("line")
                        .remove();
                    }, 1100);

                // show prompt to click on a point
                d3.select(".subheading")
                .text("Click on any point to initialize the tree.")
                .attr("y", "3%")
                .transition()
                 .style("fill-opacity", "1")
                 .duration("500");

                inprogress = false;

            })
            .transition()
             .text("Restart")
             .duration("1000");

            d3.select(".heading")
            .text("Minimal Spanning Tree Built")
            .attr("y", "5%")
            .transition()
                .style("fill-opacity", "1")
                .duration("500")
            .transition()
                .style("fill-opacity", "0")
                .duration("1500");

    }, 1000);
}
