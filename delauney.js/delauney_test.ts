import { triangulation } from "./delauney";
import { vertex } from "./quadedge";

let a = new vertex(-10000, 0);
let b = new vertex(10000, 0);
let c = new vertex(0, 10000);
let dt = new triangulation(a, b, c);

dt.list_edges();

dt.insert_point(new vertex(1000, 200));

dt.list_edges();

dt.insert_point(new vertex(100, 150));

dt.list_edges();