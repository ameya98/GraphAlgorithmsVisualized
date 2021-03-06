/*
The Delaunay Triangulation in TypeScript: A Quadedge Implementation
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/


import * as d3 from "./d3";
import * as delaunay from "./src/delaunay";
import * as quadedge from "./src/quadedge";
import * as geom from "./src/geom";

// Dynamic resize for width and height
let width = d3.select("#svgdiv").node().getBoundingClientRect().width;
let height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
svg.attr("height", height)
    .attr("width", width);

// Add heading text, will fade later
svg.append("svg:text")
    .text("The Delaunay Triangulation")
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
    .text("1. Add points one by one, by clicking anywhere.")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "45%");

svg.append("svg:text")
    .text("2. Find the triangle that contains the new point, and join the vertices of this triangle and the point.")
    .attr("class", "description")
    .attr("x", "22%")
    .attr("y", "48%");

svg.append("svg:text")
    .text("3. Perform Lawson flips to restore the Delaunay Condition, and obtain a triangulation with the new point.")
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


// For iOS, to allow the 'click' event
svg.attr("cursor", "pointer");

// Add phantom points at large distance away.
let phantom1 = new quadedge.vertex(100*(width + height), 0);
let phantom2 = new quadedge.vertex(0, 100*(width + height));
let phantom3 = new quadedge.vertex(-100*(width + height), -100*(width + height));

function is_phantom(a: quadedge.vertex): boolean {
    return (a == phantom1 || a == phantom2 || a == phantom3)
}

let dt = new delaunay.triangulation(phantom1, phantom2, phantom3);

let animation_started = false;
let insertion_finished = true;
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
                
            // Remove old edges, no longer present
            for (let id in last_ids) {
                if(!(id in dt.quadedges)){
    
                    // Transition the removal.
                    d3.select("#" + "edge" + id)
                        .attr("fill-opacity", 1)
                        .attr("stroke-opacity", 1)
                        .transition()
                            .duration(1000)
                            .attr("fill-opacity", 0)
                            .attr("stroke-opacity", 0)
                            .remove();

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

                    if (!is_phantom(p1) && !is_phantom(p2)) {
                        svg.append("line")
                            .style("stroke", "gray")
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

            // Redraw circumcircles!
            d3.selectAll('.circumcircle')
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1)
                .transition()
                .duration(1000)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .remove();
            
            // Find triangle faces one-by-one.
            console.log(last_ids);
            
            let visited = {};
            for (let quad_id in last_ids) {
                visited[quad_id] = false;
            }

            for (let quad_id in last_ids){
                if(!visited[quad_id]){

                    // Explore left face.
                    let points: quadedge.vertex[] = [];
                    let init_edge: quadedge.edge = dt.quadedges[quad_id].edges[0];
                    let curr_edge: quadedge.edge = init_edge;
                    let start_point: quadedge.vertex = curr_edge.get_origin();
                    let next_point: quadedge.vertex = curr_edge.get_dest();
                    
                    console.log("Visiting the left face of edge", curr_edge.associated_quadedge.id);

                    points.push(start_point);

                    // Check if new and non-phantom face.
                    let invalid_triangle = false;
                    let all_edges_old = true;
                    while (next_point != start_point) {

                        console.log(curr_edge.associated_quadedge.id);
                        
                        if (is_phantom(next_point) || visited[curr_edge.associated_quadedge.id]){
                            console.log("Oops invalid!");
                            invalid_triangle = true;
                            break;
                        }

                        if(last_ids[curr_edge.associated_quadedge.id]){
                            all_edges_old = false;
                        }

                        points.push(next_point);
                        curr_edge = curr_edge.lface_next();
                        next_point = curr_edge.get_dest(); 
                    }
                    
                    if ((points.length != 3) || (all_edges_old)) {
                        invalid_triangle = true;
                    }
                    
                    // Draw if not invalid.
                    if(!invalid_triangle){
                        console.log(points);
                        let circumcentre = geom.triangle_circumcentre(points[0], points[1], points[2]);
                        let circumradius = Math.sqrt((circumcentre.x - points[0].x) * (circumcentre.x - points[0].x) + (circumcentre.y - points[0].y) * (circumcentre.y - points[0].y));

                        svg.append("circle")
                            .style("stroke-dasharray", ("3, 5"))
                            .style("stroke", "gray")
                            .style("fill", "none")
                            .attr("class", "circumcircle")
                            .attr("cx", circumcentre.x)
                            .attr("cy", circumcentre.y)
                            .attr("r", circumradius);

                        console.log("Drew circumcircle.");   
                    }

                    // Explore right face.
                    invalid_triangle = false;
                    all_edges_old = true;
                    points = [];
                    curr_edge = init_edge;
                    next_point = curr_edge.get_dest();

                    console.log("Visiting the right face of edge", curr_edge.associated_quadedge.id);
                    points.push(start_point);

                    // Check if new and non-phantom face.
                    while (next_point != start_point) {

                        console.log(curr_edge.associated_quadedge.id);

                        if (is_phantom(next_point) || visited[curr_edge.associated_quadedge.id]) {
                            console.log("Oops invalid!");
                            invalid_triangle = true;
                            break;
                        }

                        if (last_ids[curr_edge.associated_quadedge.id]) {
                            all_edges_old = false;
                        }

                        points.push(next_point);
                        curr_edge = curr_edge.rface_next();
                        next_point = curr_edge.get_dest();
                    }

                    if((points.length != 3) || all_edges_old) {
                        invalid_triangle = true;
                    }
                    
                    // Draw if not invalid.
                    if (!invalid_triangle) {
                        console.log(points);
                        let circumcentre = geom.triangle_circumcentre(points[0], points[1], points[2]);
                        let circumradius = Math.sqrt((circumcentre.x - points[0].x) * (circumcentre.x - points[0].x) + (circumcentre.y - points[0].y) * (circumcentre.y - points[0].y));

                        svg.append("circle")
                            .style("stroke-dasharray", ("3, 5"))
                            .style("stroke", "gray")
                            .style("fill", "none")
                            .attr("class", "circumcircle")
                            .attr("cx", circumcentre.x)
                            .attr("cy", circumcentre.y)
                            .attr("r", circumradius);

                        console.log("Drew circumcircle.");
                    }

                    visited[quad_id] = true;
                }
            }

            for(let quad_id in last_ids){
                last_ids[quad_id] = false;
            }

        }
    });