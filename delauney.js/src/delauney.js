/*
The Delauney Triangulation in TypeScript
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./quadedge", "./geom"], function (require, exports, quadedge_1, geom) {
    "use strict";
    exports.__esModule = true;
    var subdivision = /** @class */ (function () {
        // Initialize a subdivision of the plane with a triangle with vertices a, b, and c.
        function subdivision(a, b, c) {
            this.last_id = -1;
            this.quadedges = {};
            var ab = this.make_edge();
            var bc = this.make_edge();
            var ca = this.make_edge();
            ab.set_endpoints(a, b);
            bc.set_endpoints(b, c);
            ca.set_endpoints(c, a);
            this.splice(ab.sym(), bc);
            this.splice(bc.sym(), ca);
            this.splice(ca.sym(), ab);
            this.starting_edge = ab;
        }
        // Returns the quadedge object corresponding to the id.
        subdivision.prototype.get_quadedge_by_id = function (id) {
            return this.quadedges[id];
        };
        // Get a new id for a new edge.
        subdivision.prototype.get_new_quadedge_id = function () {
            this.last_id += 1;
            return this.last_id;
        };
        /* Topological Operations */
        // Make a new edge.
        subdivision.prototype.make_edge = function () {
            var new_quadedge = new quadedge_1.quadedge();
            new_quadedge.id = this.get_new_quadedge_id();
            for (var i = 0; i < 4; i++) {
                new_quadedge.edges[i].associated_quadedge = new_quadedge;
            }
            this.quadedges[new_quadedge.id] = new_quadedge;
            return new_quadedge.edges[0];
        };
        // Create a new edge to connect the destination of edge e1 to the origin of edge e2, so that all three edges must have the same left face after.
        subdivision.prototype.connect = function (e1, e2) {
            var e3 = this.make_edge();
            this.splice(e3, e1.lface_next());
            this.splice(e3.sym(), e2);
            e3.set_endpoints(e1.get_dest(), e2.get_origin());
            return e3;
        };
        // Turn edge counterclockwise inside its enclosing quadrilateral. Essentially, the Lawson Flip.
        subdivision.prototype.swap = function (e) {
            var e1 = e.origin_prev();
            var e2 = e.sym().origin_prev();
            this.splice(e, e1);
            this.splice(e.sym(), e2);
            this.splice(e, e1.lface_next());
            this.splice(e.sym(), e2.lface_next());
            e.set_endpoints(e1.get_dest(), e2.get_dest());
        };
        // Join or split edges, according to whether the two edgerings around the origins of the two edges are the same.
        subdivision.prototype.splice = function (e1, e2) {
            var alpha = e1.origin_next().rot();
            var beta = e2.origin_next().rot();
            var t1 = e2.origin_next();
            var t2 = e1.origin_next();
            var t3 = beta.origin_next();
            var t4 = alpha.origin_next();
            e1.next = t1;
            e2.next = t2;
            alpha.next = t3;
            beta.next = t4;
        };
        // Delete edge.
        subdivision.prototype.delete_edge = function (e) {
            this.splice(e, e.origin_prev());
            this.splice(e.sym(), e.sym().origin_prev());
            delete this.quadedges[e.associated_quadedge.id];
            delete e.associated_quadedge;
        };
        // List all edges in the console.
        subdivision.prototype.list_edges = function () {
            console.log("Edges:");
            for (var curr_id in this.quadedges) {
                var curr_quadedge = this.quadedges[curr_id];
                console.log(curr_quadedge.edges[0].get_origin(), curr_quadedge.edges[0].get_dest());
            }
            console.log();
        };
        return subdivision;
    }());
    var triangulation = /** @class */ (function (_super) {
        __extends(triangulation, _super);
        function triangulation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // Returns an edge e such that vertex a is on edge e, or e is an edge of a triangle containing a.
        triangulation.prototype.locate = function (a) {
            var e = this.starting_edge;
            while (true) {
                if (geom.on_edge(a, e)) {
                    return e;
                }
                if (geom.right_of(a, e)) {
                    e = e.sym();
                }
                else if (!geom.right_of(a, e.origin_next())) {
                    e = e.origin_next();
                }
                else if (!geom.right_of(a, e.dest_prev())) {
                    e = e.dest_prev();
                }
                else {
                    return e;
                }
            }
        };
        // Inserts vertex a into the Delauney triangulation, such that it remains a Delauney triangulation after the insertion as well.
        triangulation.prototype.insert_point = function (a) {
            var e = this.locate(a);
            console.log("sup");
            // Point already on the edge or on endpoints?
            var tol = 0.01;
            var origin = e.get_origin();
            var dest = e.get_dest();
            var l1 = Math.sqrt((a.x - origin.x) * (a.x - origin.x) + (a.y - origin.y) * (a.y - origin.y));
            var l2 = Math.sqrt((a.x - dest.x) * (a.x - dest.x) + (a.y - dest.y) * (a.y - dest.y));
            if (l1 < tol || l2 < tol) {
                console.log("too close!");
                return;
            }
            else if (geom.on_edge(a, e)) {
                console.log("on edge!");
                e = e.origin_prev();
                this.delete_edge(e.origin_next());
            }
            console.log("all good!");
            // Connect new point to the other vertices
            var base = this.make_edge();
            base.set_endpoints(e.get_origin(), a);
            this.splice(base, e);
            this.starting_edge = base;
            while (true) {
                base = this.connect(e, base.sym());
                e = base.origin_prev();
                if (e.lface_next() == this.starting_edge) {
                    break;
                }
            }
            // Ensure that the Delauney condition is not violated by swapping if required.
            while (true) {
                var prev_edge = e.origin_prev();
                if (geom.right_of(prev_edge.get_dest(), e) && geom.in_circle(a, e.get_origin(), prev_edge.get_dest(), e.get_dest())) {
                    this.swap(e);
                    e = e.origin_prev();
                }
                else if (e.origin_next() == this.starting_edge) {
                    return;
                }
                else {
                    e = e.origin_next().lface_prev();
                }
            }
        };
        return triangulation;
    }(subdivision));
    exports.triangulation = triangulation;
});
