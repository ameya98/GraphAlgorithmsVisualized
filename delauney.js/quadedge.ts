// Vertex interface.
export interface vertex {
    id: number;
    x: number;
    y: number;
    data: string;
}

// Edge class.
export class edge {
    quadedge_id: number;
    associated_quadedge: quadedge;
    origin: vertex;
    next: edge;
    data: string;
    
    // Dual of edge, from right to left.
    rot(): edge {
        return this.associated_quadedge.edges[(this.quadedge_id + 1) % 4];
    }

    // Dual of edge, from left to right.
    inv_rot(): edge {
        return this.rot().sym();
    }

    // Edge pointing in the opposite direction, but same endpoints.
    sym(): edge {
        return this.associated_quadedge.edges[(this.quadedge_id + 2) % 4];
    }

    // Next counter-clockwise edge from origin of this edge.
    origin_next(): edge {
        return this.next;
    }

    // Next clockwise edge from origin of this edge.
    origin_prev(): edge {
        return this.rot().origin_next().rot();
    }

    // Next counter-clockwise edge into destination of this edge.
    dest_next(): edge {
        return this.sym().origin_next().sym();
    }

    // Next clockwise edge into destination of this edge.
    dest_prev(): edge {
        return this.inv_rot().origin_next().inv_rot();
    }

    // Next edge around the left face, after this edge.
    lface_next(): edge {
        return this.inv_rot().origin_next().rot();
    }

    // Previous edge around the left face, before this edge.
    lface_prev(): edge {
        return this.origin_next().sym();
    }

    // Next edge around the right face, after this edge.
    rface_next(): edge {
        return this.rot().origin_next().inv_rot();
    }

    // Previous edge around the right face, before this edge.
    rface_prev(): edge {
        return this.sym().origin_next();
    }

    // Origin of this edge.
    get_origin(): vertex {
        return this.origin;
    }

    // Destination of this edge.
    get_dest(): vertex {
        return this.sym().origin;
    }

    // Set endpoints of this edge.
    set_endpoints(origin: vertex, dest: vertex){
        this.origin = origin;
        this.sym().origin = dest;
    }

    // Return id of this directed edge. All directed edges in a quadedge have the same id.
    id(): number {
        return this.associated_quadedge.id;
    }
    
}

// Quadedge class.
export class quadedge {
    id: number;
    edges: edge[];

    constructor(){
        // Create 4 edges (the 'quad') for this edge.
        for (let index = 0; index < 4; index++) {
            let new_edge = new edge();
            new_edge.quadedge_id = index;
            this.edges.push(new_edge);
        }

        this.edges[0].next = this.edges[0];
        this.edges[1].next = this.edges[3];
        this.edges[2].next = this.edges[2];
        this.edges[3].next = this.edges[1];
    }
}






