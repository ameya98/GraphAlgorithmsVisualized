/*
The Delauney Triangulation in TypeScript: A Quadedge Implementation
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/

/* 
The 'import' statements below have been commented out because the corresponding .js files have been loaded in at global scope, ie, in 'index.html'.

    import * as d3 from "./d3";
    import * from "./delauney";
    import * from "./quadedge";
*/


// Dynamic resize for width and height
let width = d3.select("#svgdiv").node().getBoundingClientRect().width;
let height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
svg.attr("height", height)
    .attr("width", width);

// Add heading text, will fade later
svg.append("svg:text")
    .text("The Delauney Triangulation")
    .attr("class", "heading")
    .attr("x", "50%")
    .attr("y", "30%")
    .attr("text-anchor", "middle")
    .attr("fill", "black");

// Description text
svg.append("svg:text")
    .text("Compute a triangulation of points such that any of the points is not inside the circumcircle of any triangle of the triangulation.")
    .attr("class", "description")
    .attr("x", "50%")
    .attr("y", "35%")
    .style("text-anchor", "middle");

svg.append("svg:text")
    .text("Algorithm:")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "42%")
    .style("fill", "black");

svg.append("svg:text")
    .text("1. Add points one by one. Points in gray have not been added yet.")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "45%");

svg.append("svg:text")
    .text("2. Find the triangle that contains the new point, and join the vertices of this triangle and the point.")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "48%");

svg.append("svg:text")
    .text("3. Perform Lawson flips to restore the Delauney Condition, and obtain a triangulation with the new point.")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "51%");

svg.append("svg:text")
    .text("Click anywhere to begin!")
    .attr("class", "subheading")
    .attr("x", "50%")
    .attr("y", "65%")
    .attr("text-anchor", "middle")
    .style("fill", "black");


let phantom1 = new quadedge.vertex(width + height, 0);
let phantom2 = new quadedge.vertex(0, width + height);
let phantom3 = new quadedge.vertex(width, height);

let dt = new triangulation(phantom1, phantom2, phantom3);

let animation_started = false;
d3.select("body")
    .on('click', function () {
        if (animation_started == false) {            
            animation_started = true;

            // fade heading away and descriptions
            d3.timeout(function fadeheading() {
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

                console.log("Heading faded");

                
            });

        }
        else {
            let coordinates = d3.mouse(this);
            let new_vertex = new quadedge.vertex(coordinates[0], coordinates[1]);

            dt.insert_point(new_vertex);
            dt.list_edges();

        }
    });