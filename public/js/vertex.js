class Vertex {
    constructor(number, percentPoint, radius, color, temporary) {
        // screen coordinates
        this.percentPoint = percentPoint

        // variables for drawing on canvas
        this.number = number
        this.radius = radius
        this.color = color
        this.temporary = temporary

        // variables for search algorithms
        this.visited = false
        this.pred = null

        // variables for dijkstra
        this.s = false
        this.distance = Infinity
    }

    /*
        getters and setters
    */

    getPercentPoint() {
        return this.percentPoint
    }

    setPercentPoint(p) {
        this.percentPoint = p
    }

    getNumber() {
        return this.number
    }

    setNumber(number) {
        this.number = number
    }

    getRadius() {
        return this.radius
    }

    setRadius(radius) {
        this.radius = radius
    }

    getColor() {
        return this.color
    }

    setColor(color) {
        this.color = color
    }

    getTemporary() {
        return this.temporary
    }

    setTemporary(temporary) {
        this.temporary = temporary
    }

    getVisited() {
        return this.visited
    }

    setVisited(b) {
        this.visited = b
    }
    
    getPred() {
        return this.pred
    }
    
    setPred(i) {
        this.pred = i
    }

    getS() {
        return this.s
    }

    setS(s) {
        this.s = s
    }

    getDistance() {
        return this.distance
    }

    setDistance(distance) {
        this.distance = distance
    }

    /*
        draw function
    */

    draw(context) {
        // vertex is not to be drawn, do not draw
        if (this.temporary) {
            return
        }

        // get screen coordinate
        let point = percentToPoint(this.percentPoint)

        // draw circle
        context.beginPath()
        context.strokeStyle = colorDark
        context.lineWidth = "2.5"
        context.arc(point[0], point[1], this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
        context.stroke()
        context.closePath()

        // draw number
        context.font = "bold " + 15 + "px Comic Sans MS"
        context.fillStyle = colorLight
        context.textAlign = "center"
        context.fillText(this.number, point[0], point[1] + 5)
    }
}