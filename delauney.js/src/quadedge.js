/*
The Delauney Triangulation in TypeScript: A Quadedge Implementation
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    // Vertex class.
    var vertex = /** @class */ (function () {
        function vertex(x, y) {
            this.x = x;
            this.y = y;
        }
        return vertex;
    }());
    exports.vertex = vertex;
    // Edge class.
    var edge = /** @class */ (function () {
        function edge() {
        }
        // Dual of edge, from right to left.
        edge.prototype.rot = function () {
            return this.associated_quadedge.edges[(this.quadedge_id + 1) % 4];
        };
        // Dual of edge, from left to right.
        edge.prototype.inv_rot = function () {
            return this.rot().sym();
        };
        // Edge pointing in the opposite direction, but same endpoints.
        edge.prototype.sym = function () {
            return this.associated_quadedge.edges[(this.quadedge_id + 2) % 4];
        };
        // Next counter-clockwise edge from origin of this edge.
        edge.prototype.origin_next = function () {
            return this.next;
        };
        // Next clockwise edge from origin of this edge.
        edge.prototype.origin_prev = function () {
            return this.rot().origin_next().rot();
        };
        // Next counter-clockwise edge into destination of this edge.
        edge.prototype.dest_next = function () {
            return this.sym().origin_next().sym();
        };
        // Next clockwise edge into destination of this edge.
        edge.prototype.dest_prev = function () {
            return this.inv_rot().origin_next().inv_rot();
        };
        // Next edge around the left face, after this edge.
        edge.prototype.lface_next = function () {
            return this.inv_rot().origin_next().rot();
        };
        // Previous edge around the left face, before this edge.
        edge.prototype.lface_prev = function () {
            return this.origin_next().sym();
        };
        // Next edge around the right face, after this edge.
        edge.prototype.rface_next = function () {
            return this.rot().origin_next().inv_rot();
        };
        // Previous edge around the right face, before this edge.
        edge.prototype.rface_prev = function () {
            return this.sym().origin_next();
        };
        // Origin of this edge.
        edge.prototype.get_origin = function () {
            return this.origin;
        };
        // Destination of this edge.
        edge.prototype.get_dest = function () {
            return this.sym().origin;
        };
        // Set endpoints of this edge.
        edge.prototype.set_endpoints = function (origin, dest) {
            this.origin = origin;
            this.sym().origin = dest;
        };
        // Return id of this directed edge. All directed edges in a quadedge have the same id.
        edge.prototype.id = function () {
            return this.associated_quadedge.id;
        };
        return edge;
    }());
    exports.edge = edge;
    // Quadedge class.
    var quadedge = /** @class */ (function () {
        function quadedge() {
            // Create 4 edges (the 'quad') for this edge.
            this.edges = [];
            for (var index = 0; index < 4; index++) {
                var new_edge = new edge();
                new_edge.quadedge_id = index;
                this.edges.push(new_edge);
            }
            // Initialize pointers.
            this.edges[0].next = this.edges[0];
            this.edges[1].next = this.edges[3];
            this.edges[2].next = this.edges[2];
            this.edges[3].next = this.edges[1];
        }
        return quadedge;
    }());
    exports.quadedge = quadedge;
});
