/*
The Delaunay Triangulation in TypeScript: Geometrical Tests 
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/

import { vertex, edge } from "./quadedge";

// Oriented area of triangle with vertices a, b and c.
export function triangle_area(a: vertex, b: vertex, c: vertex): number {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

// Returns true if vertex d inside the circumcircle of triangle abc.
export function in_circle(d: vertex, a: vertex, b: vertex, c: vertex): boolean {
    return  (a.x * a.x + a.y * a.y) * triangle_area(b, c, d) -
            (b.x * b.x + b.y * b.y) * triangle_area(a, c, d) + 
            (c.x * c.x + c.y * c.y) * triangle_area(a, b, d) -
            (d.x * d.x + d.y * d.y) * triangle_area(a, b, c) > 0;
}

// Returns true if vertices in a counterclockwise order.
export function in_ccw_order(a: vertex, b: vertex, c: vertex): boolean {
    return (triangle_area(a, b, c) > 0);
}

// Checks whether vertex a is to the right of the directed edge e.
export function right_of(a: vertex, e: edge): boolean {
    return in_ccw_order(a, e.get_dest(), e.get_origin());
}

// Checks whether vertex a is to the left of the directed edge e.
export function left_of(a: vertex, e: edge): boolean {
    return in_ccw_order(a, e.get_origin(), e.get_dest());
}

// Checks whether vertex a is on the edge e, upto a tolerance of 0.01.
export function on_edge(a: vertex, e: edge): boolean {
    let tol = 0.01;
    let origin = e.get_origin();
    let dest = e.get_dest();

    let l1 = Math.sqrt((a.x - origin.x) * (a.x - origin.x) + (a.y - origin.y) * (a.y - origin.y));
    if(l1 < tol) {
        return true;
    }

    let l2 = Math.sqrt((a.x - dest.x) * (a.x - dest.x) + (a.y - dest.y) * (a.y - dest.y));
    if (l2 < tol) {
        return true;
    }

    let l = Math.sqrt((origin.x - dest.x) * (origin.x - dest.x) + (origin.y - dest.y) * (origin.y - dest.y));
    if(l1 > l || l2 > l) {
        return false;
    }

    if (Math.abs(l1 + l2 - l) < tol) {
        return true;
    }
    else {
        return false;
    }
}

export function triangle_circumcentre(a: vertex, b: vertex, c: vertex): vertex {
    let mid1 = new vertex((a.x + b.x) / 2, (a.y + b.y) / 2);
    let mid2 = new vertex((b.x + c.x) / 2, (b.y + c.y) / 2);

    let m1: number;
    let m2: number;
    let cx: number;
    let cy: number;

    if (a.y == b.y) {
        cy = mid1.y;
        if ((b.x != c.x)) {
            m2 = - (b.x - c.x) / (b.y - c.y);
            cx = (cy - mid2.y) / m2 + mid2.x;
        }
        else {
            cx = mid2.x;
        }
    }
    else if (b.y == c.y) {
        cy = mid2.y;
        if ((a.x != b.x)) {
            m1 = - (a.x - b.x) / (a.y - b.y);
            cx = (cy - mid1.y) / m1 + mid1.x;
        }
        else {
            cx = mid1.x;
        }
    }
    else {
        m1 = - (a.x - b.x) / (a.y - b.y);
        m2 = - (b.x - c.x) / (b.y - c.y);

        cx = ((m2 * mid2.x - mid2.y) - (m1 * mid1.x - mid1.y)) / (m2 - m1);
        cy = m1 * (cx - mid1.x) + mid1.y;
    }

    return new vertex(cx, cy);
}



