//  create a div from a given text and class
function createTextDiv(divText, divClass, leftPad) {
    let div = document.createElement('div')
    div.classList.add(divClass)
    let text = document.createTextNode(divText)
    div.appendChild(text)
    div.style.paddingLeft =  1+1.5*leftPad + "em"
    div.style.paddingRight = "1em"

    return div
}

// convert a list of strings in divs with those strings as text content
function linesToDivs(lines) {
    let divs = []

    for (let line of lines) {
        let pad = line[0]
        line = line.substring(1)
        divs.push(createTextDiv(line, 'line', pad))
    }

    return divs
}

function getLines(algorithm) {
    switch (algorithm) {
        case "dijkstra":
            return [
                "0dijkstra(w1,w2) {",
                "1initialize all distances to infinity",
                "1add vertex v to the set S and set d(v)=0",
                "1for w adjacent to v {",
                "2d(u) = wt(v,u)",
                "1}",
                "1while not done {",
                "2find vertex u with minimum distance not in S",
                "2add u to the set S",
                "2update distance/perform relaxation",
                "2for w adjacent to u {",
                "3if w not in S {",
                "4d(w) = min { d(w) , d(u) + wt(u,w) }",
                "3}",
                "2}",
                "1}",
                "0}"
            ]
            // OLD
            // [
            //     "0dijkstra(w1,w2):",
            //     "1initialize (no vertices in the set 'S')",
            //     "1add vertex w2 to the set S and set distance to be 0",
            //     "1set distance all vertices in j's adjacency list",
            //     "1while not done",
            //     "2find minimum distance",
            //     "2find index of vertex with min distance",
            //     "2m becomes a member of S if it exists",
            //     "2update distance/perform relaxation",
            //     "2go through adjacency list of m",
            //     "3perform relaxation",
            //     "1return path if it exists"
            // ]
        case "dfs":
            return [
                "0Depth-First Search (DFS):",
                "1assign each vertex unvisited",
                "1assign initial vertex to be visited",
                "1add initial vertex to the stack",
                "1while the stack is not empty",
                "2remove vertex u from the stack",
                "2for each vertex w in the adjacency list of u",
                "3if w is unvisited",
                "4assign w to be visited",
                "4add w to the stack"
            ]
        case "bfs":
            return [
                "0Breadth-First Search (BFS):",
                "1assign each vertex unvisited",
                "1assign initial vertex to be visited",
                "1add initial vertex to the queue",
                "1while the queue is not empty",
                "2remove vertex u from the queue",
                "2for each vertex w in the adjacency list of u",
                "3if w is unvisited",
                "4assign w to be visited",
                "4add w to the queue"
            ]
        default:
            return null
    }
}

// put divs into the right sidebar
function showAlgorithmPseudocode(algorithm) {
    let targetDiv = document.getElementById('pseudocode_text')
    targetDiv.innerHTML = ""

    let lines = getLines(algorithm)
    let divs = linesToDivs(lines)

    for (let div of divs) {
        targetDiv.appendChild(div)
    }
}