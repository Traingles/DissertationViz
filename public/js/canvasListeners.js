// mouse down listener
canvas.addEventListener("mousedown", () => {
    let percentPoint = getCoords(event)
    isDragging = true
    clickedVertex = closeToPoint(percentPoint, radius)
    
    switch (clickState) {
        case 0:
            // if we are in an add state
            // add the vertex or edges
            addVertexOrEdge(percentPoint)
            break
        case 1:
            // if we are in a delete state
            // delete the vertex or edges
            deleteVertexOrEdge(percentPoint)
            break
        default:
            // in any other state
            // do nothing
            return
    }
})

function deleteVertexOrEdge(percentPoint) {
    // we are in a delete state
    // delete the vertex or edges
    let vertex = deleteVertex(percentPoint)
    let edge = deleteEdge(percentPoint)

    if (vertex) {
        let historyStep = ["deleted", vertex[0], vertex[1]]
        addToHistory(historyStep)
    } else if (edge) {
        let historyStep = ["deleted", edge]
        addToHistory(historyStep)
    }
}

let tempVertex
let drawingEdge = false
function addVertexOrEdge(p) {
    // did not click on an existing vertex
    if (closeToPoint(p, radius * 2) == false) {
        // add a new vertex to the graph
        let vertex = new Vertex(graph.vertices.length, p, radius, colorDark, false)
        graph.addVertex(vertex)

        // add this event to the history tracker
        let historyStep = ["added", vertex, []]
        addToHistory(historyStep)
        
        return
    }

    // clicked on an existing vertex
    if (clickedVertex != false) {
        vertexA = clickedVertex

        // set drawing tracker to true
        drawingEdge = true
    
        // create a dummy vertex to draw an edge to
        tempVertex = new Vertex(graph.vertices.length, p, radius, colorDark, true)
                
        // add this dummy vertex to the graph
        // add an edge from the clicked vertex to it
        graph.addVertex(tempVertex)
        graph.addEdge(vertexA, tempVertex, null)

        // add this change of state to the history
        // addToHistory()
    }
}

canvas.addEventListener("mouseup", () => {
    // get event coordinates in screen percentages
    let percentPoint = getCoords(event)

    // set the drag tracker to false
    isDragging = false

    // if we are not in an add state
    if (clickState != 0) {
        return
    }

    // get the vertex at the release point, if there is one
    clickedVertex = closeToPoint(percentPoint, radius)

    // mouseup after adding vertex
    if (vertexA == null) {
        return
    }

    // loop
    if (clickedVertex == vertexA) {
        stopDrawingEdge('error', 'Cannot draw an edge between a vertex and itself!')
        return
    }
    
    // no target
    if (clickedVertex == tempVertex) {
        stopDrawingEdge(null, null)
        return
    }

    // edge exists
    if (graph.findEdge(vertexA, clickedVertex)) {
        stopDrawingEdge('error', 'Edge already exists!')
        return
    }

    // define edge weight
    let weight = Math.floor(Math.random() * 10 + 1).toString()
    let fail_limit = 3
    if (graph.weighted) {
        weight = null
        let count = 0
        do {
            // if the user has failed to enter a weight too many times
            // assign a random weight
            // this deals with "prevent dialogue" problem
            if (count == fail_limit) {
                weight = Math.floor(Math.random() * 10 + 1).toString()
                break
            }

            weight = prompt("Please enter a weight for this edge", "1")
            count += 1
        } while (!validateInteger(weight))
    }

    // add new edge to graph
    graph.addEdge(vertexA, clickedVertex, parseInt(weight))

    // add this event to the history tracker
    let edge = graph.findEdge(vertexA, clickedVertex)
    let historyStep = ["added", edge]

    // remove edge from graph
    stopDrawingEdge(null, null)
    
    // add this step to the history
    addToHistory(historyStep)
})

// check if a string is an integer
function validateInteger(string) {
    let num = Math.floor(Number(string))
    return num !== Infinity && String(num) === string && num >= 0
}

function stopDrawingEdge(type, text) {
    if (type) {
        // give an informative toast to users
        toastr[type](text)
    }

    // reset state
    vertexA = null
    vertexB = null
    drawingEdge = false

    // delete edge reference in graph
    graph.deleteVertex(tempVertex)

    // render
    render()
}

canvas.addEventListener("mouseout", () => {
    let percentPoint = getCoords(event)

    // no longer dragging if out of bounds
    if (isDragging) {
        isDragging = false
    }

    // delete the edge if dragged an edge out of bounds
    if (drawingEdge) {
        stopDrawingEdge(null, null)
    }
})

canvas.addEventListener("mousemove", () => {
    let percentPoint = getCoords(event)
    move(percentPoint)
})

// add touch movement support --- it does not work :)
canvas.addEventListener("touchmove", () => {
    let percentPoint = getCoords(event)
    move(percentPoint)
})

function move(p) {
    // if move state
    if (clickState == 2) {
        if (isDragging) {
            clickedVertex.percentPoint = p
            render()
        }
        return
    }
    
    // if not move state
    if (drawingEdge) {
        tempVertex.percentPoint = p
        render()
    }
}

function getCoords(e) {
    let rect = canvas.getBoundingClientRect()
    return pointToPercent(e.clientX - rect.left, e.clientY - rect.top)
}