let lastActiveButton = addButton

playButton.addEventListener("mousedown", () => {
    if (playing && pause) {
        // fetch speed input
        let timeout = 2000 - document.getElementById('speed_slider').value

        pause = false
        animateGraphAlgorithm(graph_steps, pseudo_steps, timeout)

        // change the button icon to be a pause icon
        changeButtonClassAndTitle(playIcon, "fas fa-pause", "Pause")
    } else if (playing) {
        pause = true

        // change the button icon to be a play icon
        changeButtonClassAndTitle(playIcon, "fas fa-play", "Play")
    }
    // if there is no animation currently playing
    else {
        graph_steps = []
        pseudo_steps = []

        // no algorithm
        if (algorithm == "default") {
            toastr["warning"]("Select an algorithm!")
            return
        }

        // no graph
        if (graph.vertices.length == 0) {
            return
        }

        // fetch starting and ending vertex input
        let start = document.getElementById('start_vertex').value
        let end = document.getElementById('end_vertex').value

        // default
        let startVertexIndex = 0
        let endVertexIndex = graph.vertices.length - 1

        // if valid input starting vertex, use it
        if (validateInteger(start) && parseInt(start) >= 0 && parseInt(start) < graph.vertices.length) {
            startVertexIndex = parseInt(start)
        }

        // if valid input ending vertex, use it
        if (validateInteger(end) && parseInt(end) >= 0 && parseInt(end) < graph.vertices.length) {
            endVertexIndex = parseInt(end)
        }

        // fetch starting vertex
        let startVertex = graph.vertices[startVertexIndex]
        let endVertex = graph.vertices[endVertexIndex]

        // fetch animation steps
        let values
        if (algorithm == "dijkstra") {
            if (!graph.weighted) {
                toastr["warning"]("Dijkstra is for weighted graphs!")
                return
            }
            // dijkstra from vertex to last vertex in the vertex list
            values = graph.dijkstra(endVertex, startVertex)
        } else if (algorithm == "dfs") {
            values = graph.dfs(startVertex)
        } else if (algorithm == "bfs") {
            values = graph.bfs(startVertex)
        }

        graph_steps = values[0]
        pseudo_steps = values[1]

        // fetch speed input
        let timeout = 2000 - document.getElementById('speed_slider').value

        // call animation
        animateGraphAlgorithm(graph_steps, pseudo_steps, timeout)

        // change the button icon to be a pause icon
        changeButtonClassAndTitle(playIcon, "fas fa-pause", "Pause")

        // disable all graph interaction buttons
        disableControlButtons(true)
    }
})

function changeButtonClassAndTitle(b, c, t) {
    b.className = c
    b.title = t
}

function disableControlButtons(state) {
    let controlElements = document.getElementsByClassName('control')
    for (let elem of controlElements) {
        elem.disabled = state
    }
    clickState = 999
}

stepBackButton.addEventListener('click', () => {
    animationStepIndex -= 1

    playAnimationStep(graph_steps, pseudo_steps, 500)
    disableStepButtons()
})

stepForwardButton.addEventListener('click', () => {
    animationStepIndex += 1

    playAnimationStep(graph_steps, pseudo_steps, 500)
    disableStepButtons()
})

function disableStepButtons() {
    // enable buttons by default
    stepBackButton.disabled = false
    stepForwardButton.disabled = false

    // if at start, disable back button
    if (animationStepIndex == 0) {
        stepBackButton.disabled = true
    }

    // if at end, disable forward button
    if (animationStepIndex == graph_steps.length) {
        stepForwardButton.disabled = true
    }
}

function playAnimationStep(g_steps, p_steps, speed) {
    resetGraphColor()
    resetPseudoColor()
    if (animationStepIndex < g_steps.length) {
        playGraphStep(g_steps[animationStepIndex], speed)
        playPseudoStep(p_steps[animationStepIndex])
    }
    render()
}

// change to add state
addButton.addEventListener("mousedown", () => {
    clickState = 0

    // update active button
    makeButtonActive(addButton)
})

// change to move state
moveButton.addEventListener("mousedown", () => {
    clickState = 2

    // update active button
    makeButtonActive(moveButton)
})

// change to delete state
deleteButton.addEventListener("mousedown", () => {
    clickState = 1

    // update active button
    makeButtonActive(deleteButton)
})

// clear the canvas and clear the data points
clearButton.addEventListener("mousedown", () => {
    if (!graph.isEmpty()) {
        clear()

        // toast
        toastr['success']('Cleared!')

        // change the button to active briefly before moving back to the add button
        clickState = 0

        // update active button
        makeButtonActive(addButton)
    }
})

// disable undo/redo buttons at start, there is no history to undo or redo
undoButton.disabled = true
undoButton.addEventListener('click', () => {
    graphUndoRedo(-1)

})

redoButton.disabled = true
redoButton.addEventListener('click', () => {
    graphUndoRedo(1)

})


// clear the canvas and clear the data points
randomButton.addEventListener("mousedown", () => {
    // create a random graph
    let number = document.getElementById('vertex_number').value
    let ratio = document.getElementById('edges_ratio').value

    if (validateInteger(number)) {
        randomButtonCode(number, ratio)
    } else {
        toastr['warning']('You need to set a number of vertices!')
    }
})

function randomButtonCode(number, ratio) {
    // if valid input, create new graph
    generateRandomGraph(number, ratio)

    // return to add state
    clickState = 0

    // update active button
    makeButtonActive(addButton)

    // render the graph
    render()

    // exit if directed
    if (graph.directed) return
}


// open / close help video div
helpButton.addEventListener("click", () => {
    closePopup(helpDiv, coverDiv)
})
closeHelpPopup.addEventListener("click", () => {
    closePopup(helpDiv, coverDiv)
})

// close tutorial
exitTutorialButton.addEventListener("click", () => {
    closePopup(tutorialDiv, coverDiv)
})

// // close random graph prompt
// exitPrompt.addEventListener("click", () => {
//     closePopup(randomGraphPromptDiv, coverDiv)
// })

// add the needed prefix and suffix to an element from the videoArray
function getVideoFilePathFromArrayIndex(index) {
    return "video/" + videoArray[index] + ".mp4"
}

// set the video source
function setVideoSrc(source) {
    helpVideoSrc.setAttribute('src', source)
}

function generateRandomGraph(n, ratio) {
    let historyStep = []

    // too big
    if (n > 200) {
        toastr['error']('Sorry! That\'s too many vertices!')
        return
    }

    // offsets
    let offsetRight = 550
    let offsetLeft = 200
    let offsetBottom = 40

    // change offsets if canvas is smaller
    if (canvas.width < 1100) {
        offsetRight = 0
        offsetBottom = 80
    }

    // if sidebar is not open, set left offset to 0
    if (!isOpen) offsetLeft = 0
    offsetRight += offsetLeft

    // number of edges to be added to this graph
    let numberOfEdges = Math.ceil(n * ratio)

    // clear the current graph
    // also stores this as a history step
    clear()

    // initialise sets
    let s = new Set()
    let t = new Set()
    let vertices = new Set()

    // start angle and change in radians per vertex
    let angle = 0
    let angleChange = (2 * Math.PI) / n
    let r = Math.min(canvas.width - offsetRight - offsetLeft, canvas.height - offsetBottom) * .40

    // get center coordinate of the valid canvas space
    let x_center = ((canvas.width - offsetRight) / 2) + offsetLeft
    let y_center = ((canvas.height - offsetBottom) / 2)

    // for each vertex to be added to the graph
    for (let i = 0; i < n; i++) {
        // get new x coords
        let x = r * Math.cos(angle)
        let y = r * Math.sin(angle)
        x += x_center
        y += y_center

        // increment the angle
        angle += angleChange

        // create the vertex and add it to the graph
        let vertex = new Vertex(i, pointToPercent(x, y), radius, colorDark, false)
        graph.addVertex(vertex)

        // add the point to the s set
        s.add(vertex)
        vertices.add(vertex)
    }

    let currentVertex = random(s)
    s.delete(currentVertex)
    t.add(currentVertex)

    // track number of edges
    let edgeCount = 0

    while (s.size > 0) {
        neighbour = random(vertices)

        if (!t.has(neighbour)) {
            let weight = Math.floor(Math.random() * 10) + 1
            graph.addEdge(currentVertex, neighbour, weight)
            s.delete(neighbour)
            t.add(neighbour)

            // increment the edge tracker
            edgeCount++
        }

        currentVertex = neighbour
    }

    // completeness multiplier
    let mult = 1
    if (graph.directed) mult = 2

    // assign the remaining edges randomly
    while (edgeCount < numberOfEdges && !complete(n, edgeCount, mult)) {
        let vertexA, vertexB
        let weight = Math.floor(Math.random() * 10) + 1

        do {
            vertexA = random(vertices)
            vertexB = random(vertices)
        } while (vertexA == vertexB || graph.findEdge(vertexA, vertexB) != false)

        // add edge
        graph.addEdge(vertexA, vertexB, weight)
        edgeCount++
    }

    // add this to the history
    let edges = []
    let adjacencyLists = graph.adjacency.values()
    for (let e of adjacencyLists) {
        for (let edge of e) edges.push(edge)
    }
    historyStep.push(["random", [...graph.vertices], edges])
    addToHistory(historyStep)
}

// check if a graph is complete, given a number of vertices and a number of edges
function complete(n, e, mult) {
    if (e < (n * (n-1) / 2) * mult) {
        return false
    } else {
        return true
    }
}

// version of pop for a js set
function random(s) {
    let target = Math.floor(Math.random() * s.size)

    let value
    let i = 0
    for (value of s) {
        if (target == i) {
            return value
        }
        i++
    }
}

// if the selector value changes, change the boolean, clear the canvas and default to add
graph.weighted = weightedCheck.checked
weightedCheck.onchange = function (e) {
    graph.weighted = this.checked
    render()
}

// if the selector value changes, change the boolean and default to add
graph.directed = directedCheck.checked
directedCheck.onchange = function (e) {
    graph.directed = this.checked
    clickState = 0
    clearEdges()
}

// if the selector value changes, change the algorithm variable
let algorithm = "default"
let algorithmDropdownItems = document.getElementsByClassName("dropdown__item")

for (let item of algorithmDropdownItems) {
    item.addEventListener('click', () => {
        let selected = document.getElementsByClassName('dropdown__selected')[0]

        let target = event.target
        if (event.target.className == "dropdown__item") {
            target = event.target.getElementsByClassName('dropdown__text')[0]
        }

        algorithm = target.id
        selected.textContent = target.textContent

        showAlgorithmPseudocode(algorithm)
    })
}

function clearEdges() {
    for (let vertex of graph.vertices) {
        graph.adjacency.set(vertex, [])
    }

    // render the graph
    render()
}

function makeButtonActive(button) {
    lastActiveButton.className = "button control"
    button.className = "button control active"
    lastActiveButton = button
}