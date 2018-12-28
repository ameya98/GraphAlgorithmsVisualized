/*
The Delaunay Triangulation in TypeScript: A Quadedge Implementation
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/
define(["require", "exports", "./d3", "./src/delaunay", "./src/quadedge"], function (require, exports, d3, delaunay, quadedge) {
    "use strict";
    exports.__esModule = true;
    // Dynamic resize for width and height
    var width = d3.select("#svgdiv").node().getBoundingClientRect().width;
    var height = d3.select("#svgdiv").node().getBoundingClientRect().height;
    var svg = d3.select("#svgdiv").append("svg");
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
    var phantom1 = new quadedge.vertex(100 * (width + height), 0);
    var phantom2 = new quadedge.vertex(0, 100 * (width + height));
    var phantom3 = new quadedge.vertex(-100 * (width + height), -100 * (width + height));
    var dt = new delaunay.triangulation(phantom1, phantom2, phantom3);
    var animation_started = false;
    var insertion_finished = true;
    var last_ids = {};
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
            if (!insertion_finished)
                return;
            var coordinates = d3.mouse(this);
            var new_vertex = new quadedge.vertex(coordinates[0], coordinates[1]);
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
            for (var id in last_ids) {
                if (!(id in dt.quadedges)) {
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
            for (var quad_id in dt.quadedges) {
                if (!(quad_id in last_ids)) {
                    var curr_quadedge = dt.quadedges[quad_id];
                    var p1 = curr_quadedge.edges[0].get_origin();
                    var p2 = curr_quadedge.edges[0].get_dest();
                    if ((p1 != phantom1 && p1 != phantom2 && p1 != phantom3) && (p2 != phantom1 && p2 != phantom2 && p2 != phantom3)) {
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
            // Find triangles one-by-one.
            for (var quad_id in last_ids) {
                if (last_ids[quad_id]) {
                    last_ids[quad_id] = false;
                    var points = [];
                    var curr_edge = dt.quadedges[quad_id].edges[0];
                    var start_point = curr_edge.get_origin();
                    var next_point = curr_edge.get_dest();
                    points.push(start_point);
                    while (next_point != start_point) {
                        points.push(next_point);
                        curr_edge = curr_edge.lface_next();
                        next_point = curr_edge.get_dest();
                        last_ids[curr_edge.associated_quadedge.id] = false;
                    }
                    var phantom_triangle = false;
                    for (var i = 0; i < 3; ++i) {
                        if (points[i] == phantom1 || points[i] == phantom2 || points[i] == phantom3) {
                            phantom_triangle = true;
                            break;
                        }
                    }
                    if (!phantom_triangle) {
                        var mid1 = new quadedge.vertex((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
                        var mid2 = new quadedge.vertex((points[1].x + points[2].x) / 2, (points[1].y + points[2].y) / 2);
                        // console.log(mid1, mid2);
                        var m1 = void 0;
                        var m2 = void 0;
                        var cx = void 0;
                        var cy = void 0;
                        if (points[0].y == points[1].y) {
                            cy = mid1.y;
                            m2 = -(points[1].x - points[2].x) / (points[1].y - points[2].y);
                            cx = (cy - mid2.y) / m2 + mid2.x;
                        }
                        else if (points[1].y == points[2].y) {
                            cy = mid2.y;
                            m1 = -(points[0].x - points[1].x) / (points[0].y - points[1].y);
                            cx = (cy - mid1.y) / m1 + mid1.x;
                        }
                        else {
                            m1 = -(points[0].x - points[1].x) / (points[0].y - points[1].y);
                            m2 = -(points[1].x - points[2].x) / (points[1].y - points[2].y);
                            cx = ((m2 * mid2.x - mid2.y) - (m1 * mid1.x - mid1.y)) / (m2 - m1);
                            cy = m1 * (cx - mid1.x) + mid1.y;
                        }
                        // console.log(cx, cy);
                        var circumcentre = new quadedge.vertex(cx, cy);
                        var circumradius = Math.sqrt((cx - points[0].x) * (cx - points[0].x) + (cy - points[0].y) * (cy - points[0].y));
                        svg.append("circle")
                            .style("stroke-dasharray", ("3, 5"))
                            .style("stroke", "gray")
                            .style("fill", "none")
                            .attr("class", "circumcircle")
                            .attr("cx", circumcentre.x)
                            .attr("cy", circumcentre.y)
                            .attr("r", circumradius);
                    }
                }
                else {
                }
            }
        }
    });
});
