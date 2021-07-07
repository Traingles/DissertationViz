// given a list of function calls, animate each step based on a map of those strings to functions
let animationStepIndex = 0
let pause = false
function animateGraphAlgorithm(g_steps, p_steps, delay) {
    // animation is playing
    playing = true

    // start timed loop
    let refreshIntervalId = setInterval(function () {
        // reset graph and code highlighting
        resetGraphColor()
        resetPseudoColor()

        // if steps remain, make edits to graph colouring
        if (animationStepIndex < g_steps.length) {
            if (g_steps != []) playGraphStep(g_steps[animationStepIndex], delay)
            if (p_steps != []) playPseudoStep(p_steps[animationStepIndex])
        }

        // render the graph
        render()

        // stop condition
        animationStepIndex++
        if (animationStepIndex > g_steps.length) {
            animationStepIndex = 0

            // stop the timed interval loop
            clearInterval(refreshIntervalId)

            // animations has stopped playing
            playing = false

            // once the animation has played, transition to an add state
            clickState = 0

            // change the button icon to be a play icon
            document.getElementById("play_button_icon").className = "fas fa-play"
            disableControlButtons(false)
        } else if (pause) {
            // stop the timed interval loop
            clearInterval(refreshIntervalId)
        }
    }, delay)
}

function playGraphStep(step, speed) {
    for (let i = 0; i < step.length; i++) {
        let elem = step[i][0]
        let color = step[i][1]

        // static edge highlight (for Dijkstra)
        if (step[i].length == 3) {
            elem.setColor(color)
            let reverse = graph.findEdge(elem.endVertex, elem.startVertex)
            if (reverse) reverse.setColor(color)
        }
        // if this is a vertex, change it's color
        else if (elem instanceof Vertex) {
            elem.setColor(color)
        }
        // if this is an edge, change it's color and potentially the color of the reverse edge
        else if (elem instanceof Edge) {
            let reverse = graph.findEdge(elem.endVertex, elem.startVertex)

            // if curved edge, just use the normal animation
            if (reverse != false && graph.directed) {
                slideEdge(elem, speed * .5, true)
            } else {
                slideEdge(elem, speed * .5, false)
            }
        }
    }
}

// reset the colors of all elements in the graph
function resetGraphColor() {
    for (let vertex of graph.vertices) {
        vertex.setColor(colorDark)
        for (let edge of graph.adjacency.get(vertex)) {
            edge.setColor(colorDark)
        }
    }
}

let psuedoDiv = document.getElementById('pseudocode_text')
function resetPseudoColor() {
    let divs = psuedoDiv.getElementsByTagName('div')
    for (let div of divs) changeDivHighlighting(div, colorLight, "")
}

function playPseudoStep(step) {
    let divs = psuedoDiv.getElementsByTagName('div')
    
    // if step is undefined
    if (!step) {
        return
    }
    
    for (let i of step) changeDivHighlighting(divs[i], "#EEE", "5px solid red")
}

function changeDivHighlighting(div, color, text) {
    div.style.backgroundColor = color
    div.style.borderLeft = text
    div.style.borderRight = text
}

function pointsOnLine(a, b, n) {
    let points = []
    points.push(b)

    for (let i = 0; i < n-2; i++) {
        points.push([
            (a[0] * i + b[0] * (n-i+1)) / (n+1),
            (a[1] * i + b[1] * (n-i+1)) / (n+1)
        ])
    }

    points.push(a)
    return points.reverse()
}

function pointsOnCurvedLine(a, b, n) {
    let points = []
    let c = getBezierControlPoint(a, b)
    let interval = 1 / n
    let t = 0

    for (let i = 0; i < n; i++) {
        // calculate x, y at t
        let x = Math.pow(1 - t, 2) * a[0] + 2 * (1 - t) * t * c[0] + Math.pow(t, 2) * b[0]
        let y = Math.pow(1 - t, 2) * a[1] + 2 * (1 - t) * t * c[1] + Math.pow(t, 2) * b[1]
        t += interval

        points.push([x, y])
    }

    return points
}

let refreshIntervalIdSlide
function slideEdge(edge, speed, curved) {
    // get endpoints
    let a = percentToPoint(edge.startVertex.percentPoint)
    let b = percentToPoint(edge.endVertex.percentPoint)
    
    let numberOfPoints = Math.round((speed / 1000) * 60)
    
    // get points
    let points
    if (!curved) {
        // points along a straight
        points = pointsOnLine(a, b, numberOfPoints)
    } else {
        // points along a curve
        points = pointsOnCurvedLine(a, b, numberOfPoints)
    }

    // set the points of the sliding edge
    slidingEdge.setPoints(points)
    slidingEdge.setIndex(0)

    let index = 0
    clearInterval(refreshIntervalIdSlide)
    refreshIntervalIdSlide = setInterval(function () {
        // update the end point of the drawing
        slidingEdge.setIndex(index)
        index++

        // render the graph
        render()

        // exit
        if (index >= numberOfPoints) {
            // reset sliding data
            slidingEdge = new SlidingEdge()
            clearInterval(refreshIntervalIdSlide)
        }
    }, speed / numberOfPoints)
}

function getBezierControlPoint(a, b) {
    // midpoint
    let x = (a[0] + b[0]) / 2
    let y = (a[1] + b[1]) / 2
    let r = distance(x, y, a[0], a[1])
    r /= (r/50)
    let angle = Math.atan2(b[1] - y, b[0] - x) + Math.PI * 0.5
    
    // new x and y coordinates rotated around the midpoint
    let x_displaced = r * Math.cos(angle)
    let y_displaced = r * Math.sin(angle)
    let c = [x_displaced += x, y_displaced += y]

    return c
}