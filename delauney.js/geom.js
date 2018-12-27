"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Oriented area of triangle with vertices a, b and c.
function triangle_area(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
exports.triangle_area = triangle_area;
// Returns true if vertex d inside the circumcircle of triangle abc.
function in_circle(d, a, b, c) {
    return (a.x * a.x + a.y * a.y) * triangle_area(b, c, d) -
        (b.x * b.x + b.y * b.y) * triangle_area(a, c, d) +
        (c.x * c.x + c.y * c.y) * triangle_area(a, b, d) -
        (d.x * d.x + d.y * d.y) * triangle_area(a, b, c) > 0;
}
exports.in_circle = in_circle;
// Returns true if vertices in a counterclockwise order.
function in_ccw_order(a, b, c) {
    return (triangle_area(a, b, c) > 0);
}
exports.in_ccw_order = in_ccw_order;
// Checks whether vertex a is to the right of the directed edge e.
function right_of(a, e) {
    return in_ccw_order(a, e.get_dest(), e.get_origin());
}
exports.right_of = right_of;
// Checks whether vertex a is to the left of the directed edge e.
function left_of(a, e) {
    return in_ccw_order(a, e.get_origin(), e.get_dest());
}
exports.left_of = left_of;
// Checks whether vertex a is on the edge e, upto a tolerance of 0.0001.
function on_edge(a, e) {
    let tol = 0.0001;
    let origin = e.get_origin();
    let dest = e.get_dest();
    let l1 = Math.sqrt((a.x - origin.x) * (a.x - origin.x) + (a.y - origin.y) * (a.y - origin.y));
    if (l1 < tol) {
        return true;
    }
    let l2 = Math.sqrt((a.x - dest.x) * (a.x - dest.x) + (a.y - dest.y) * (a.y - dest.y));
    if (l2 < tol) {
        return true;
    }
    let l = Math.sqrt((origin.x - dest.x) * (origin.x - dest.x) + (origin.y - dest.y) * (origin.y - dest.y));
    if (l1 > l || l2 > l) {
        return false;
    }
    if (Math.abs(l1 + l2 - l) < tol) {
        return true;
    }
    else {
        return false;
    }
}
exports.on_edge = on_edge;
