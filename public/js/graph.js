class Graph {
    constructor() {
        this.vertices = []
        this.adjacency = new Map()

        // instantiate the graph with the current weighted or directed settings
        this.weighted = weightedCheck.checked
        this.directed = directedCheck.checked
    }

    // add vertex to the graph
    addVertex(vertex) {
        // if vertex already exists
        if (this.vertices.includes(vertex)) {
            return
        }

        vertex.setNumber(this.vertices.length)
        this.vertices.push(vertex)
        this.adjacency.set(vertex, [])
    }

    // add vertex to the graph
    deleteVertex(vertex) {
        // delete vertex from vertices list
        let index = this.vertices.indexOf(vertex)
        this.vertices.splice(index, 1)

        // THE ADJACENCY DOES NOT EXIST IN DIRECTED
        // YOU CANNOT LOOP THE EDGES FOR THIS
        
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].setNumber(i)
            this.deleteEdge(this.vertices[i], vertex)
        }

        this.adjacency.delete(vertex)
    }

    // add edge to the graph
    addEdge(vertexA, vertexB, weight) {
        // if edge already exists
        if (this.findEdge(vertexA, vertexB)) {
            return
        }

        // add edge to graph
        let edge = new Edge(vertexA, vertexB, weight, colorDark)
        this.adjacency.get(vertexA).push(edge)

        // add reverse edge if undirected graph
        if (!this.directed) {
            edge = new Edge(vertexB, vertexA, weight, colorDark)
            this.adjacency.get(vertexB).push(edge)
        }
    }

    deleteEdge(vertexA, vertexB) {
        let edges = this.adjacency.get(vertexA)
        const index = edges.findIndex(edge => edge.endVertex == vertexB)
        if (index > -1) {
            edges.splice(index, 1)
        }

        // delete reverse edge if undirected
        if (!this.directed) {
            edges = this.adjacency.get(vertexB)
            const index = edges.findIndex(edge => edge.endVertex == vertexA)
            if (index > -1) {
                edges.splice(index, 1)
            }
        }
    }

    // find an edge on the graph given two vertex
    findEdge(vertexA, vertexB) {
        let edges = this.adjacency.get(vertexA)
        for (let edge of edges) {
            // if the edge exists return it
            if (edge.endVertex == vertexB) {
                return edge
            }
        }
        // if there's no edge found, return false
        return false
    }

    isEmpty() {
        if (this.vertices.length == 0 && this.adjacency.isEmpty()) {
            return true
        }
        return false
    }

    countEdges() {
        let n = 0
        for (let edges of this.adjacency.values()) {
            n += edges.length
        }
        return n
    }

    // render the vertices and edges on a HTML5 canvas
    drawEdges(context) {
        this.adjacency.forEach(function(value, key, map) {
            for (let edge of value) {
                edge.draw(context, key)
            }
        })
    }

    // WIP
    drawEdgeWeights(context) {
        this.adjacency.forEach(function(value, key, map) {
            for (let edge of value) {
                edge.draw(context, key)
            }
        })
    }

    drawVertices(context) {
        // draw vertices on the top layer
        for (let vertex of this.vertices) {
            vertex.draw(context)
        }
    }

    dfs(startVertex) {
        // initialise animation steps
        let graph_steps = []
        let pseudo_steps = []
        
        // assign each vertex unvisited
        for (let v of this.vertices) v.setVisited(false)

        // use js array and shift in place of queue
        let queue = []

        // assign initial vertex to be visited
        startVertex.setVisited(true)
        startVertex.setPred(-1)

        // add animation steps for initial vertex
        graph_steps = addElementAndVisited(graph_steps, startVertex, traversalColor)
        pseudo_steps.push([1,2,3])

        // add initial vertex to the queue
        queue.push(startVertex)

        // while the queue is not empty
        while (queue.length != 0) {
            // remove vertex u from the queue
            let u = queue.pop()

            // this is not the first vertex in the animation, highlight the edge going to this vertex
            if (u.getPred() != -1) {
                graph_steps = addElementAndVisited(graph_steps, this.findEdge(this.vertices[u.getPred()], u), visitingColor)
            }
            graph_steps = addElementAndVisited(graph_steps, u, visitingColor)
            pseudo_steps.push([4])
            pseudo_steps.push([5])

            // for each vertex w in the adjacency list of u
            for (let edge of this.adjacency.get(u)) {
                let w = edge.endVertex
                graph_steps = addElementAndVisited(graph_steps, edge, traversalColor)
                pseudo_steps.push([6])

                // if w is unvisited
                if (!w.getVisited()) {
                    graph_steps = addElementAndVisited(graph_steps, w, traversalColor)
                    pseudo_steps.push([7,8,9])

                    // assign w to be visited
                    w.setVisited(true)
                    w.setPred(this.vertices.indexOf(u))

                    // add w to the queue
                    queue.push(w)
                }
            }
        }

        // showcase final step
        graph_steps = addElementAndVisited(graph_steps, null, null)
                
        // return animation steps
        return [graph_steps, pseudo_steps]
    }

    bfs(startVertex) {
        // initialise animation steps
        let graph_steps = []
        let pseudo_steps = []
        
        // assign each vertex unvisited
        for (let v of this.vertices) v.setVisited(false)

        // use js array and shift in place of queue
        let queue = []

        // assign initial vertex to be visited
        startVertex.setVisited(true)
        startVertex.setPred(-1)

        // add animation steps for initial vertex
        graph_steps = addElementAndVisited(graph_steps, startVertex, traversalColor)
        pseudo_steps.push([1,2,3])

        // add initial vertex to the queue
        queue.push(startVertex)

        // while the queue is not empty
        while (queue.length != 0) {
            // remove vertex u from the queue
            let u = queue.shift()

            // this is not the first vertex in the animation, highlight the edge going to this vertex
            if (u.getPred() != -1) {
                graph_steps = addElementAndVisited(graph_steps, this.findEdge(this.vertices[u.getPred()], u), traversalColor)
            }
            graph_steps = addElementAndVisited(graph_steps, u, visitingColor)
            pseudo_steps.push([4])
            pseudo_steps.push([5])

            // for each vertex w in the adjacency list of u
            for (let edge of this.adjacency.get(u)) {
                let w = edge.endVertex
                graph_steps = addElementAndVisited(graph_steps, edge, traversalColor)
                pseudo_steps.push([6])

                // if w is unvisited
                if (!w.getVisited()) {
                    graph_steps = addElementAndVisited(graph_steps, w, traversalColor)
                    pseudo_steps.push([7,8,9])

                    // assign w to be visited
                    w.setVisited(true)
                    w.setPred(this.vertices.indexOf(u))

                    // add w to the queue
                    queue.push(w)
                }
            }
        }

        // showcase final step
        graph_steps = addElementAndVisited(graph_steps, null, null)
                
        // return animation steps
        return [graph_steps, pseudo_steps]
    }

    dijkstra(v1, v2) {
        // initialise animation steps
        let graph_steps = []
        let pseudo_steps = []

        let path_edges = []

        // initialise vertices
		for (let v of this.vertices) {
			v.setS(false)
			v.setDistance(Infinity)
		}

        // "initialize all distances to infinity"
        graph_steps.push([])
        pseudo_steps.push([1])

        // add end vertex to the set S and set distance to be 0
		v2.setS(true)
		v2.setDistance(0)

        // "add vertex v to the set S and set d(v)=0"
        graph_steps.push(getVerticesInS())
        pseudo_steps.push([2])

        // set distance to all vertices in j's adjacency list
		let list = this.adjacency.get(v2)
		for (let edge of list){
			let i = edge.endVertex.getNumber()
			let d = edge.getWeight()

            // update vertex
			this.vertices[i].setDistance(d)
			this.vertices[i].setPred(v2.getNumber())
		}

        let finished = false
        while (!finished) {
            let minDistance = Infinity
            let i = -1

            for (let v of this.vertices) {
                // find min highlighting
                if (!v.getS()) {
                    let min = []
                    if (i != -1) min = [this.vertices[i], minDistColor]
                    graph_steps.push(getVerticesInS().concat([min,[v, traversalColor]]).concat(path_edges))
                    pseudo_steps.push([6,7])
                }

                if (!v.getS() && v.getDistance() < minDistance) {
                    minDistance = v.getDistance()
                    i = v.getNumber()
                }
            }

            // add m to set S if exists
            if (i >= 0) {
                // show min
                let tempMin = this.vertices[i]
                graph_steps.push(getVerticesInS().concat([[tempMin, minDistColor]]).concat(path_edges))
                pseudo_steps.push([6,7])

                tempMin.setS(true)

                // record this edge in path edges
                let path_edge = this.findEdge(this.vertices[tempMin.getPred()], tempMin)
                path_edges.push([path_edge, setSColor, "static"])

                // show add m to S
                graph_steps.push(getVerticesInS().concat(path_edges))
                pseudo_steps.push([6,8])
            }

            if (i < 0 || i == v1.getNumber()) {
                finished = true
            } else {
                for (let edge of this.adjacency.get(this.vertices[i])) {
                    let k = edge.endVertex.getNumber()

                    // traverse edge
                    graph_steps.push(getVerticesInS().concat([[edge, traversalColor]]).concat(path_edges))
                    pseudo_steps.push([10])

                    // visit vertex
                    graph_steps.push(getVerticesInS().concat([[this.vertices[k], traversalColor]]).concat(path_edges))
                    pseudo_steps.push([11])
                    
                    if (!this.vertices[k].getS() && minDistance + edge.getWeight() < this.vertices[k].getDistance()) {
                        this.vertices[k].setDistance(minDistance + edge.getWeight())
						this.vertices[k].setPred(i)

                        // relax
                        graph_steps.push(getVerticesInS().concat([[this.vertices[k], relaxColor]]).concat(path_edges))
                        pseudo_steps.push([12])
                    }
                }
            }
        }

        // vertex exists
        let temp_graph_steps = []
        if (v1.getS()) {
            let i = v1.getNumber()
            while (i >= 0 && i != null) {
                let lastVertex = this.vertices[i]
                i = this.vertices[i].getPred()

                if (i >= 0 && i != null) {
                    let nextVertex = this.vertices[i]
                    let edge = this.findEdge(nextVertex, lastVertex)

                    // highlighting
                    temp_graph_steps.unshift([[lastVertex, traversalColor]])
                    temp_graph_steps.unshift([[nextVertex, traversalColor], [edge, traversalColor]])
                }
            }
        } else {
            toastr['error']('Path is not possible!')
        }

        // add the path at the end
        let final_graph_steps = graph_steps.concat(temp_graph_steps)

        // return animation steps
        return [final_graph_steps, pseudo_steps]
    }
}

function addElementAndVisited(steps, elem, color) {
    let temp = []

    // add the visited vertices to the step
    for (let vertex of graph.vertices) {
        if (vertex.getVisited()) {
            temp.push([vertex, visitedColor])
        }
    }

    if (elem) {
        // add the current element
        temp.push([elem, color])
    }
    steps.push(temp)

    return steps
}

function getVerticesInS() {
    let list = []
    for (let vertex of graph.vertices) {
        if (vertex.getS()) {
            list.push([vertex, setSColor])
        }
    }
    return list
}