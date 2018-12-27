/*
The Delauney Triangulation in TypeScript: A Quadedge Implementation
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/


import * as d3 from "./d3";
import * as delauney from "./src/delauney";
import * as quadedge from "./src/quadedge";

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
let phantom3 = new quadedge.vertex(0, 0);

let dt = new delauney.triangulation(phantom1, phantom2, phantom3);

let animation_started = false;
let insertion_finished = true;
let vertices = [];
let last_ids = {};

d3.select("body")
    .on('click', function () {
        if (animation_started == false) {            
            animation_started = true;

            // fade heading away and descriptions
            d3.timeout(function fadeheading() {
                d3.select(".heading")
                    .transition()
                    .style("fill-opacity", "0")
                    .remove()
                    .duration("500");

                d3.select(".subheading")
                    .transition()
                    .style("fill-opacity", "0")
                    .remove()
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
            if(!insertion_finished) return;

            let coordinates = d3.mouse(this);
            let new_vertex = new quadedge.vertex(coordinates[0], coordinates[1]);

            // Add new point to SVG.
            svg.append("circle")
                .attr("cx", new_vertex.x)
                .attr("cy", new_vertex.y)
                .attr("r", 3);

            console.log(coordinates);
            
            // Insert into triangulation.
            insertion_finished = false;
            dt.insert_point(new_vertex);  
            insertion_finished = true;

            console.log("Insertion finished");
            
            // // Show quadedge ids now.
            // console.log("Last ids:");
            // for (let id in last_ids) {
            //     console.log(id);
            // }

            // console.log("Current ids:");
            // for (let id in dt.quadedges) {
            //     console.log(id);
            // }
            
            // Remove old edges, no longer present
            for (let id in last_ids) {
                if(!(id in dt.quadedges)){
                    d3.select("#" + "edge" + id).remove();
                    delete last_ids[id];
                    console.log("removed edge with id", id);
                }
            }

            // Draw the new edges in, with d3.
            for (let quad_id in dt.quadedges) {
                if(!(quad_id in last_ids)){
                    let curr_quadedge = dt.quadedges[quad_id];
                    let p1 = curr_quadedge.edges[0].get_origin();
                    let p2 = curr_quadedge.edges[0].get_dest();

                    if ((p1 != phantom1 && p1 != phantom2 && p1 != phantom3) && (p2 != phantom1 && p2 != phantom2 && p2 != phantom3)) {
                        svg.append("line")
                            .style("stroke", "black")
                            .attr("class", "edge")
                            .attr("id", "edge" + quad_id)
                            .attr("x1", p1.x)
                            .attr("y1", p1.y)
                            .attr("x2", p1.x)
                            .attr("y2", p1.y)
                        .transition()
                            .attr("x2", p2.x)
                            .attr("y2", p2.y)
                            .duration(2000);
                        
                        last_ids[quad_id] = true;
                        console.log("added edge with id", quad_id);
                    }

                }
            }

        }
    });