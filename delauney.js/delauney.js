"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quadedge_1 = require("./quadedge");
const geom = require("./geom");
class subdivision {
    // Initialize a subdivision of the plane with a triangle with vertices a, b, and c.
    constructor(a, b, c) {
        this.last_id = -1;
        this.quadedges = {};
        let ab = this.make_edge();
        let bc = this.make_edge();
        let ca = this.make_edge();
        ab.set_endpoints(a, b);
        bc.set_endpoints(b, c);
        ca.set_endpoints(c, a);
        this.splice(ab.sym(), bc);
        this.splice(bc.sym(), ca);
        this.splice(ca.sym(), ab);
        this.starting_edge = ab;
    }
    // Returns the quadedge object corresponding to the id.
    get_quadedge_by_id(id) {
        return this.quadedges[id];
    }
    // Get a new id for a new edge.
    get_new_quadedge_id() {
        this.last_id += 1;
        return this.last_id;
    }
    /* Topological Operations */
    // Make a new edge.
    make_edge() {
        let new_quadedge = new quadedge_1.quadedge();
        new_quadedge.id = this.get_new_quadedge_id();
        for (let i = 0; i < 4; i++) {
            new_quadedge.edges[i].associated_quadedge = new_quadedge;
        }
        this.quadedges[new_quadedge.id] = new_quadedge;
        return new_quadedge.edges[0];
    }
    // Create a new edge to connect the destination of edge e1 to the origin of edge e2, so that all three edges must have the same left face after.
    connect(e1, e2) {
        let e3 = this.make_edge();
        this.splice(e3, e1.lface_next());
        this.splice(e3.sym(), e2);
        e3.set_endpoints(e1.get_dest(), e2.get_origin());
        return e3;
    }
    // Turn edge counterclockwise inside its enclosing quadrilateral. Essentially, the Lawson Flip.
    swap(e) {
        let e1 = e.origin_prev();
        let e2 = e.sym().origin_prev();
        this.splice(e, e1);
        this.splice(e.sym(), e2);
        this.splice(e, e1.lface_next());
        this.splice(e.sym(), e2.lface_next());
        e.set_endpoints(e1.get_dest(), e2.get_dest());
    }
    // Join or split edges, according to whether the two edgerings around the origins of the two edges are the same.
    splice(e1, e2) {
        let alpha = e1.origin_next().rot();
        let beta = e2.origin_next().rot();
        let t1 = e2.origin_next();
        let t2 = e1.origin_next();
        let t3 = beta.origin_next();
        let t4 = alpha.origin_next();
        e1.next = t1;
        e2.next = t2;
        alpha.next = t3;
        beta.next = t4;
    }
    // Delete edge.
    delete_edge(e) {
        this.splice(e, e.origin_prev());
        this.splice(e.sym(), e.sym().origin_prev());
        delete this.quadedges[e.associated_quadedge.id];
        delete e.associated_quadedge;
    }
    // List all edges.
    list_edges() {
        console.log("Edges:");
        for (let curr_id in this.quadedges) {
            let curr_quadedge = this.quadedges[curr_id];
            console.log(curr_quadedge.edges[0].get_origin(), curr_quadedge.edges[0].get_dest());
        }
        console.log();
    }
}
class triangulation extends subdivision {
    // Returns an edge e such that vertex a is on edge e, or e is an edge of a triangle containing a.
    locate(a) {
        let e = this.starting_edge;
        while (true) {
            if (a == e.get_origin() || a == e.get_dest()) {
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
    }
    // Inserts vertex a into the Delauney triangulation, such that it remains a Delauney triangulation after the insertion as well.
    insert_point(a) {
        let e = this.locate(a);
        // Point already on the edge or on endpoints?
        if (a == e.get_origin() || a == e.get_dest()) {
            return;
        }
        else if (geom.on_edge(a, e)) {
            e = e.origin_prev();
            this.delete_edge(e.origin_next());
        }
        // Connect new point to the other vertices
        let base = this.make_edge();
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
            let prev_edge = e.origin_prev();
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
    }
}
exports.triangulation = triangulation;
