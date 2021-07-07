// convert a set of x and y coordinates to a list of percentage screen space
function pointToPercent(x, y) {
    return [x / window.innerWidth, y / window.innerHeight]
}

// convert a list of percentage screen space to a list of x and y coordinates
function percentToPoint(point) {
    return [point[0] * window.innerWidth, point[1] * window.innerHeight]
}

function closeToPoint(point, range) {
    // get event point in point coordinates
    point = percentToPoint(point)

    // check each vertex in the graph, checking if it is within range
    let i = 0
    for (let vertex of graph.vertices) {
        let temp = percentToPoint(vertex.percentPoint)

        if (Math.abs(temp[0] - point[0]) < range && Math.abs(temp[1] - point[1]) < range) {
            return graph.vertices[i]
        }
        i++
    }

    // if no vertex was near
    return false
}

// return a y and x given an m and b for a given x and y
function equationOfALine(x, y, m, b) {
    let return_x = (y - b) / m
    let return_y = (m * x) + b
    return [return_x, return_y]
}

function clear() {
    let historyStep = []

    // return adjaceny matrix
    let edges = []
    let adjacencyLists = graph.adjacency.values()
    for (let e of adjacencyLists) {
        for (let edge of e) edges.push(edge)
    }
    historyStep.push(["clear", [...graph.vertices], edges])

    // add this to the history
    addToHistory(historyStep)

    // overwrite the graph variable with a new graph object
    graph = new Graph()
    
    // render the graph
    render()
}

function getLineVariables(pointA, pointB) {
    let m = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0])
    let b = pointA[1] - (m * pointA[0])
    return [m, b]
}

function distance(x1, y1, x2, y2) {
    let xDiff = x1 - x2
    let yDiff = y1 - y2

    return Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))
}

function deleteVertex(percentPoint) {
    let clickedVertex = closeToPoint(percentPoint, radius)

    if (clickedVertex != false) {
        let edges = []
        for (let v of graph.vertices) {
            // find edges in either direction
            let edge = graph.findEdge(clickedVertex, v)
            let reverse = graph.findEdge(v, clickedVertex)

            // if edges exist, add them to the array
            if (edge) {edges.push(edge)}
            if (reverse) {edges.push(reverse)}
        }

        graph.deleteVertex(clickedVertex)
        return [clickedVertex, edges]
    }
    return false
}

// delete an edge if a clicked point was within a margin of error of it
function deleteEdge(percentPoint) {
    let pointC = percentToPoint(percentPoint)
    let error = 5

    for (let vertex of graph.vertices) {
        let edges = graph.adjacency.get(vertex)

        let pointA = percentToPoint(vertex.percentPoint)
        for (let edge of edges) {
            let pointB = percentToPoint(edge.endVertex.percentPoint)

            if (graph.directed && graph.findEdge(edge.endVertex, vertex)) {
                let d = distance(pointA[0], pointA[1], pointB[0], pointB[1])
                let c = getBezierControlPoint(pointA, pointB)

                let t = 0
                let num = (d / error * 0.5)
                let interval = 1 / num
                for (let i = 0; i < num; i++) {
                    // calculate x, y at t
                    let x = Math.pow(1 - t, 2) * pointA[0] + 2 * (1 - t) * t * c[0] + Math.pow(t, 2) * pointB[0]
                    let y = Math.pow(1 - t, 2) * pointA[1] + 2 * (1 - t) * t * c[1] + Math.pow(t, 2) * pointB[1]
                    t += interval

                    // if close to click
                    if (Math.abs(x - pointC[0]) < error && Math.abs(y - pointC[1]) < error) {
                        graph.deleteEdge(vertex, edge.endVertex)
                        return edge
                    }
                }
            } else {
                let result = getLineVariables(pointA, pointB)
                let m = result[0]
                let b = result[1]
                let coords = equationOfALine(pointC[0], pointC[1], m, b)
                
                if ((Math.abs(coords[1] - pointC[1]) < error || Math.abs(coords[0] - pointC[0]) < error) && !beyondLengthOfLine(pointA[0], pointA[1], pointB[0], pointB[1], pointC[0], pointB[1])) {
                    graph.deleteEdge(vertex, edge.endVertex)
                    return edge
                }
            }
        }
    }
    // no edge deleted
    return false
}

// validate if a point is within the area that a line would cover
// used to check that a point is not only on the line but also within the target area
function beyondLengthOfLine(x1, y1, x2, y2, x3, y3) {
    if (x3 < Math.min(x1, x2) || x3 > Math.max(x1, x2) || y3 < Math.min(y1, y2) || y3 > Math.max(y1, y2)) {
        return true
    } else {
        return false
    }
}