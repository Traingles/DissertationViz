// assorted elements
const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

// resize movement elements
const bottomBar = document.getElementById('bottom')
const topBar = document.getElementById('top')
const startButtons = document.getElementById('start-buttons')

// control buttons
const addButton = document.getElementById("add_btn")
const moveButton = document.getElementById("mve_btn")
const deleteButton = document.getElementById("del_btn")
const clearButton = document.getElementById("clr_btn")
const undoButton = document.getElementById("undo_btn")
const redoButton = document.getElementById("redo_btn")
const randomButton = document.getElementById("random_btn")

// help
const helpButton = document.getElementById("help_btn")
const helpDiv = document.getElementById("help")
const helpVideo = document.getElementById("video")
const helpVideoSrc = document.getElementById("videoSrc")
const helpBack = document.getElementById("backButton")
const helpForward = document.getElementById("forButton")
const topText = document.getElementById("topText")
const coverDiv = document.getElementById("cover")
const closeHelpPopup = document.getElementById("exitHelpButton")

// tutorial
const tutorialDiv = document.getElementById("tutorial")
const exitTutorialButton = document.getElementById("exitTutorialButton")

// prompt
//const randomGraphPromptDiv = document.getElementById("randomGraphPrompt")
const exitPrompt = document.getElementById("exitPromptButton")
const randomPromptSubmit = document.getElementById("randomPromptSubmit")

// play buttons
const stepBackButton = document.getElementById('step_back_btn')
const playButton = document.getElementById("play_btn")
const stepForwardButton = document.getElementById('step_for_btn')

// checkboxes
const weightedCheck = document.getElementById("graph_weight")
const directedCheck = document.getElementById("graph_directed")

// icons
const playIcon = document.getElementById('play_button_icon')

// sidebar values
const sidebar = document.getElementById('sidebar')
const openButton = document.getElementById('open_btn')
const sidebarOpen = "200px"
const sidebarClosed = "0px"

// extract the time in ms of the transition from css text
const sidebarStyle = window.getComputedStyle(sidebar)
const transitionTime = parseFloat(sidebarStyle.getPropertyValue('transition-duration')) * 1000

// colours
const traversalColor = "red"
const visitedColor = "DodgerBlue"
const visitingColor = "Violet"
const minDistColor = "LimeGreen"
const relaxColor = "LightSkyBlue"
const setSColor = "purple"
const colorDark = "#111"
const colorLight = "#FFF"

// graph settings
const lineWidth = "3"
const radius = 12.5

// count calls to render per minute and average
// let renderCounter = 0
// let intervals = 1
// setInterval(() => {
//     console.log("Average renders per second: " + renderCounter / (60 * intervals))
//     intervals++
// }, 60000)

// hide or show a popup, do the same for dim cover if it exists
function closePopup(div, cover = null) {
    if (div.style.display == "inline") {
        div.style.display = "none"
        if (cover) cover.style.display = "none"
    } else {
        div.style.display = "inline"
        if (cover) cover.style.display = "inline"
    }
}


// play speed slider
function getSliderValue() {
    let speed = document.getElementById('speed_slider').value
    return speed
}

function updateSliderText() {
    const label = document.getElementById('slider_label')
    const speed = getSliderValue()

    let speed_type
    if (speed > 1400) {
        speed_type = "Fast"
    } else if (speed < 600) {
        speed_type = "Slow"
    } else {
        speed_type = "Medium"
    }

    label.innerHTML = "Play Speed: " + speed_type
}
updateSliderText()



// localStorage
const visited = localStorage.getItem('visited')
if (!visited) {
    // first time
    localStorage.setItem('visited', true)
    closePopup(tutorialDiv, coverDiv)
}

// set sidebar open on startup
let isOpen = true
let sidebarMoving = false
setSidebarCSS(sidebarOpen)

// change sidebar to open or closed
function openNav() {
    if (isOpen) {
        setSidebarCSS(sidebarClosed)
    } else {
        setSidebarCSS(sidebarOpen)
    }
    isOpen = !isOpen
}

// set the sidebar width and open button left margin
function setSidebarCSS(px) {
    sidebar.style.width = px
    openButton.style.marginLeft = px

    // update sidebar movement boolean for 0.5 seconds
    sidebarMoving = true
    setTimeout(() => {
        sidebarMoving = false
    }, transitionTime)
}

// make video double speed
helpVideo.playbackRate = 2
// disable back button, currently at start
helpBack.disabled = true

// instantiate 2 arrays
// array of filenames
// array of title text
// instantiate the starting index as 0
let videoArray = ["Add", "Delete", "Move", "Clear"]
let textArray = ["Adding a vertex or edge:", "Deleting a vertex or edge:", "Moving a vertex:", "Clearing the canvas:"]
let videoIndex = 0

// given an increment, move that increment (-1 or 1) in the arrays and set the video and title text
function changeVideo(increment) {
    // pause current video
    helpVideo.pause()

    // disable border
    helpVideo.style.border = "none"

    // fetch video file path and set as new source
    videoIndex += increment
    let videoPath = getVideoFilePathFromArrayIndex(videoIndex)
    setVideoSrc(videoPath)
    topText.textContent = textArray[videoIndex]

    // relaod and play the new video
    helpVideo.load()
    helpVideo.play()
    helpVideo.playbackRate = 2

    // enable border
    setTimeout(() => {
        helpVideo.style.border = "1px solid #222"
    }, 100)

    checkStartOrEnd(helpBack, helpForward, videoIndex, videoArray, 1)
}

// array of graph animation steps
let graph_steps
// array of pseudocode animation steps
let pseudo_steps
// boolean tracker of whether or not an animation is currently playing
let playing = false

// instantiate the graph
let graph = new Graph()
// array of the changes made to the graph data structure
let graphHistory = []

// undo or redo a step in the history
let historyIndex = graphHistory.length

function graphUndoRedo(movement) {
    // if movement = -1, undo
    // if movement = 1, redo

    // invalid index
    if (historyIndex + movement < 0 || historyIndex + movement > graphHistory.length) {
        return
    }

    if (movement == -1) {
        historyIndex -= 1
    }

    let historyStep = graphHistory[historyIndex]

    // if edge or vertex event
    if (historyStep[0] == "added" || historyStep[0] == "deleted") {
        updateGraphFromHistory(historyStep, movement)
    }
    // if clear event
    else {
        for (let step of historyStep) {
            updateGraphFromHistory(step, movement)
        }
    }


    if (movement == 1) {
        historyIndex += 1
    }

    // disable or enable buttons
    checkStartOrEnd(undoButton, redoButton, historyIndex, graphHistory, 0)

    // render the graph
    render()
}

function updateGraphFromHistory(historyStep, movement) {
    // if added and undo or deleted and redo
    if (historyStep[0] == "added" && movement == -1 || historyStep[0] == "deleted" && movement == 1) {
        if (historyStep[1] instanceof Vertex) {
            graph.deleteVertex(historyStep[1])
        } else {
            graph.deleteEdge(historyStep[1].startVertex, historyStep[1].endVertex)
        }
    }
    // if added and redo or deleted and undo
    else if (historyStep[0] == "added" && movement == 1 || historyStep[0] == "deleted" && movement == -1) {
        if (historyStep[1] instanceof Vertex) {
            graph.addVertex(historyStep[1])
            for (let edge of historyStep[2]) {
                graph.addEdge(edge.startVertex, edge.endVertex, edge.weight)
            }
        } else {
            graph.addEdge(historyStep[1].startVertex, historyStep[1].endVertex, historyStep[1].weight)
        }
    }
    // if clear
    else if (historyStep[0] == "clear") {
        // if undo
        if (movement == -1) {
            for (let v of historyStep[1]) graph.addVertex(v)
            for (let e of historyStep[2]) graph.addEdge(e.startVertex, e.endVertex, e.weight)
        }
        // if redo
        else {
            graph.vertices = []
            graph.adjacency = new Map()
        }
    }
    // if random graph generated
    else if (historyStep[0] == "random") {
        // if redo
        if (movement == 1) {
            for (let v of historyStep[1]) graph.addVertex(v)
            for (let e of historyStep[2]) graph.addEdge(e.startVertex, e.endVertex, e.weight)
        }
        // if undo
        else {
            graph.vertices = []
            graph.adjacency = new Map()
        }
    }
}

function addToHistory(step) {
    // delete forward history if adding new history
    if (historyIndex < graphHistory.length - 1) {
        graphHistory.length = historyIndex
    }

    // add the new history state to the queue
    graphHistory.push(step)

    // increment the index tracker
    historyIndex += 1

    // verify where the index tracker is
    checkStartOrEnd(undoButton, redoButton, historyIndex, graphHistory, 0)

    // render the graph
    render()
}

// initialise button opacity
checkStartOrEnd(undoButton, redoButton, historyIndex, graphHistory, 0)
checkStartOrEnd(helpBack, helpForward, videoIndex, videoArray, 1)

function checkStartOrEnd(startButton, endButton, index, array, endOffset) {
    // get child icon node
    let startIcon = startButton.children[0]
    let endIcon = endButton.children[0]

    // make buttons interactable
    startButton.disabled = false
    endButton.disabled = false

    // show button icons
    startIcon.style.opacity = 1
    endIcon.style.opacity = 1

    // if at end
    if (index == array.length - endOffset) {
        endButton.disabled = true
        endIcon.style.opacity = .5
    }

    // if at start
    if (index == 0) {
        startButton.disabled = true
        startIcon.style.opacity = .5
    }
}

let isDragging = false
let vertexA, vertexB
let clickState = 0

// canvas resize
resize()
window.onresize = resize

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (canvas.width < canvas.height) {
        bottomBar.appendChild(
            document.getElementById('start-buttons')
        )
        bottomBar.style.display = "inline"
    } else {
        topBar.appendChild(
            document.getElementById('start-buttons')
        )
        bottomBar.style.display = "none"
    }

    // render the graph
    render()
}

// clear the canvas and render all data points
let slidingEdge = new SlidingEdge()

function render() {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height)

    // draw all edges
    graph.drawEdges(context)

    // define variables
    let boxSize = 17.5
    let leftMargin = sidebar.clientWidth + boxSize
    let topMargin = 15

    // draw key
    context.beginPath()
    context.textAlign = "left"
    context.lineWidth = "2.5"
    context.strokeStyle = "black"

    // general
    drawTitleText(leftMargin, topMargin, boxSize, "General", "grey")
    drawKeyBox(traversalColor, leftMargin, topMargin += boxSize * 2, boxSize, "Traversing")

    // DFS / BFS
    drawTitleText(leftMargin, topMargin += boxSize * 3, boxSize, "DFS / BFS", "grey")
    drawKeyBox(visitedColor, leftMargin, topMargin += boxSize * 2, boxSize, "Visited")
    drawKeyBox(visitingColor, leftMargin, topMargin += boxSize * 2, boxSize, "Visiting")

    // Dijkstra
    drawTitleText(leftMargin, topMargin += boxSize * 3, boxSize, "Dijkstra", "grey")
    drawKeyBox(minDistColor, leftMargin, topMargin += boxSize * 2, boxSize, "Minimum Distance")
    drawKeyBox(relaxColor, leftMargin, topMargin += boxSize * 2, boxSize, "Relaxation")
    drawKeyBox(setSColor, leftMargin, topMargin += boxSize * 2, boxSize, "In Set S")
    context.stroke()
    context.closePath()

    // if there is an animation playing
    if (playing) {
        // draw the animated edge
        slidingEdge.draw(context)
    }

    // draw vertices last so that they are on the top layer
    graph.drawVertices(context)

    // if (graph.weighted) {
    //     graph.drawEdgeWeights(context)
    // }

    // console log the call to render
    // renderCounter++
}

// function that draws a box and text for the on canvas keys
function drawKeyBox(color, marginLeft, marginTop, boxSize, text) {
    // draw box
    context.fillStyle = color
    context.fillRect(marginLeft, marginTop, boxSize, boxSize)
    context.rect(marginLeft, marginTop, boxSize, boxSize)

    // draw text
    context.font = boxSize + "px Poppins"
    context.fillStyle = colorDark
    context.fillText(text, marginLeft + boxSize * 1.5, marginTop + boxSize * .9)
}

function drawTitleText(marginLeft, marginTop, boxSize, text, color) {
    context.font = boxSize + "px Poppins"
    context.fillStyle = color
    context.fillText(text, marginLeft, marginTop + boxSize * .9)
}

// constantly re-render the canvas data
function animate() {
    requestAnimationFrame(animate)

    // re-render the canvas if the sidebar is moving
    if (sidebarMoving == true) {
        // render the graph
        render()
    }
}
animate()