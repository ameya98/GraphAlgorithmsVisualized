# GraphAlgorithmsVisualized
Graph algorithms visualized with d3.js.

## The Delaunay Triangulation
An implementation of the Incremental Delaunay Triangulation algorithm, with TypeScript.  
Keep clicking to add points, and watch how the triangulation changes - courtesy of d3.js. 

There's also a quad-edge data-structure that I implemented in TypeScript. See the 'src' and 'tests' folder inside 'delaunay.js' if you're interested in using this.
 
The main reference for this was Dani Lischinski's guide and C++ code [here](http://www.karlchenofhell.org/cppswp/lischinski.pdf).  
Theory about the extremely impressive quad-edge data-structure can be found in the original paper by Leonidas Guibas and Jorge Stolfi
[here](http://www.sccg.sk/~samuelcik/dgs/quad_edge.pdf). Additional references from courses at [CMU](https://www.cs.cmu.edu/afs/andrew/scs/cs/15-463/2001/pub/src/a2/quadedge.html#guibas) and [Stanford](http://graphics.stanford.edu/courses/cs348a-17-winter/ReaderNotes/handout31.pdf) were very useful too.

Try it out [here](https://ameya98.github.io/GraphAlgorithmsVisualized/delaunay.js).


## Prim's Minimal Spanning Tree
Randomly generates points in the two-dimensional plane.   
Select the first point in the minimal spanning tree, and the tree will begin to grow.   
Pause and continue at will. Complete with transitions and animations - courtesy of d3.js.  

Try it out [here](https://ameya98.github.io/GraphAlgorithmsVisualized/prim.js).
