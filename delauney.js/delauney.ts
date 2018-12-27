class subdivision {
    private last_id: number;

    quadedges: quadedge[];
    starting_edge: edge;

    // Initialize a subdivision of the plane with a triangle with vertices a, b, and c.
    constructor(a: vertex, b: vertex, c: vertex){
        this.last_id = -1;

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
    get_quadedge_by_id(id: number): quadedge {
        return this.quadedges[id];
    }

    // Get a new id for a new edge.
    get_new_quadedge_id(): number {
        this.last_id += 1;
        return this.last_id;
    }

    /* Topological Operations */
    // Make a new edge.
    make_edge(): edge {
        let new_quadedge = new quadedge();
        new_quadedge.id = this.get_new_quadedge_id();
        this.quadedges.push(new_quadedge);

        return new_quadedge.edges[0];
    }

    // Create a new edge to connect the destination of edge e1 to the origin of edge e2, so that all three edges must have the same left face after.
    connect(e1: edge, e2: edge): edge {
        let e3 = this.make_edge();
        
        this.splice(e3, e1.lface_next());
        this.splice(e3.sym(), e2);

        e3.set_endpoints(e1.get_dest(), e2.get_origin());
        return e3;
    }

    // Turn edge counterclockwise inside its enclosing quadrilateral. Essentially, the Lawson Flip.
    swap(e: edge) {
        let e1 = e.origin_prev();
        let e2 = e.sym().origin_prev();

        this.splice(e, e1);
        this.splice(e.sym(), e2);
        this.splice(e, e1.lface_next());
        this.splice(e.sym(), e2.lface_next());

        e.set_endpoints(e1.get_dest(), e2.get_dest());
    }

    // Join or split edges, according to whether the two edgerings around the origin of the two edges are the same.
    splice(e1: edge, e2: edge) {
        let alpha = e1.origin_next().rot();
        let beta  = e2.origin_next().rot();
    
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
    delete_edge(e: edge) {
        this.splice(e, e.origin_prev());
        this.splice(e.sym(), e.sym().origin_prev());
        
        delete e.associated_quadedge;
    }
}