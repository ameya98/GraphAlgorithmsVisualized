"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Vertex class.
class vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.vertex = vertex;
// Edge class.
class edge {
    // Dual of edge, from right to left.
    rot() {
        return this.associated_quadedge.edges[(this.quadedge_id + 1) % 4];
    }
    // Dual of edge, from left to right.
    inv_rot() {
        return this.rot().sym();
    }
    // Edge pointing in the opposite direction, but same endpoints.
    sym() {
        return this.associated_quadedge.edges[(this.quadedge_id + 2) % 4];
    }
    // Next counter-clockwise edge from origin of this edge.
    origin_next() {
        return this.next;
    }
    // Next clockwise edge from origin of this edge.
    origin_prev() {
        return this.rot().origin_next().rot();
    }
    // Next counter-clockwise edge into destination of this edge.
    dest_next() {
        return this.sym().origin_next().sym();
    }
    // Next clockwise edge into destination of this edge.
    dest_prev() {
        return this.inv_rot().origin_next().inv_rot();
    }
    // Next edge around the left face, after this edge.
    lface_next() {
        return this.inv_rot().origin_next().rot();
    }
    // Previous edge around the left face, before this edge.
    lface_prev() {
        return this.origin_next().sym();
    }
    // Next edge around the right face, after this edge.
    rface_next() {
        return this.rot().origin_next().inv_rot();
    }
    // Previous edge around the right face, before this edge.
    rface_prev() {
        return this.sym().origin_next();
    }
    // Origin of this edge.
    get_origin() {
        return this.origin;
    }
    // Destination of this edge.
    get_dest() {
        return this.sym().origin;
    }
    // Set endpoints of this edge.
    set_endpoints(origin, dest) {
        this.origin = origin;
        this.sym().origin = dest;
    }
    // Return id of this directed edge. All directed edges in a quadedge have the same id.
    id() {
        return this.associated_quadedge.id;
    }
}
exports.edge = edge;
// Quadedge class.
class quadedge {
    constructor() {
        // Create 4 edges (the 'quad') for this edge.
        this.edges = [];
        for (let index = 0; index < 4; index++) {
            let new_edge = new edge();
            new_edge.quadedge_id = index;
            this.edges.push(new_edge);
        }
        // Initialize pointers.
        this.edges[0].next = this.edges[0];
        this.edges[1].next = this.edges[3];
        this.edges[2].next = this.edges[2];
        this.edges[3].next = this.edges[1];
    }
}
exports.quadedge = quadedge;
