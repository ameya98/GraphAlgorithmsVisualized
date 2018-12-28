/*
The Delaunay Triangulation in TypeScript: Geometrical Tests
Author: Ameya Daigavane

Reference: Incremental Delaunay Triangulation - Dani Lischinski
(https://dl.acm.org/citation.cfm?id=180900)
*/
define(["require", "exports", "./quadedge"], function (require, exports, quadedge_1) {
    "use strict";
    exports.__esModule = true;
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
    // Checks whether vertex a is on the edge e, upto a tolerance of 0.01.
    function on_edge(a, e) {
        var tol = 0.01;
        var origin = e.get_origin();
        var dest = e.get_dest();
        var l1 = Math.sqrt((a.x - origin.x) * (a.x - origin.x) + (a.y - origin.y) * (a.y - origin.y));
        if (l1 < tol) {
            return true;
        }
        var l2 = Math.sqrt((a.x - dest.x) * (a.x - dest.x) + (a.y - dest.y) * (a.y - dest.y));
        if (l2 < tol) {
            return true;
        }
        var l = Math.sqrt((origin.x - dest.x) * (origin.x - dest.x) + (origin.y - dest.y) * (origin.y - dest.y));
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
    function triangle_circumcentre(a, b, c) {
        var mid1 = new quadedge_1.vertex((a.x + b.x) / 2, (a.y + b.y) / 2);
        var mid2 = new quadedge_1.vertex((b.x + c.x) / 2, (b.y + c.y) / 2);
        var m1;
        var m2;
        var cx;
        var cy;
        if (a.y == b.y) {
            cy = mid1.y;
            if ((b.x != c.x)) {
                m2 = -(b.x - c.x) / (b.y - c.y);
                cx = (cy - mid2.y) / m2 + mid2.x;
            }
            else {
                cx = mid2.x;
            }
        }
        else if (b.y == c.y) {
            cy = mid2.y;
            if ((a.x != b.x)) {
                m1 = -(a.x - b.x) / (a.y - b.y);
                cx = (cy - mid1.y) / m1 + mid1.x;
            }
            else {
                cx = mid1.x;
            }
        }
        else {
            m1 = -(a.x - b.x) / (a.y - b.y);
            m2 = -(b.x - c.x) / (b.y - c.y);
            cx = ((m2 * mid2.x - mid2.y) - (m1 * mid1.x - mid1.y)) / (m2 - m1);
            cy = m1 * (cx - mid1.x) + mid1.y;
        }
        return new quadedge_1.vertex(cx, cy);
    }
    exports.triangle_circumcentre = triangle_circumcentre;
});
