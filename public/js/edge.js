class Edge {
    constructor(startVertex, endVertex, weight, color) {
        this.startVertex = startVertex
        this.endVertex = endVertex
        this.weight = weight
        this.color = color
    }

    getStartVertex() {
        return this.startVertex
    }

    setStartVertex(v) {
        this.startVertex = v
    }

    getEndVertex() {
        return this.endVertex
    }

    setEndVertex(v) {
        this.endVertex = v
    }

    getWeight() {
        return this.weight
    }

    setWeight(weight) {
        this.weight = weight
    }

    getColor() {
        return this.color
    }

    setColor(color) {
        this.color = color
    }

    draw(context) {
        // points of the two vertices
        let pointA = percentToPoint(this.startVertex.percentPoint)
        let pointB = percentToPoint(this.endVertex.percentPoint)

        // draw a curved edge if there are multiple edges between these two vertices
        // draw a straight edge if this is the only edge between these two vertices
        let midPoint
        let reverse = graph.findEdge(this.endVertex, this.startVertex)
        if (graph.directed && reverse != false) {
            midPoint = this.drawCurvedEdge(pointA, pointB, context)
        } else {
            midPoint = this.drawStraightEdge(pointA, pointB, context)
        }

        if (graph.directed) {
            this.drawArrow(midPoint, pointB, context)
        }

        // if this edge is weighted
        if (graph.weighted && this.weight != null) {
            let x = midPoint[0]
            let y = midPoint[1]
            let size = 15

            // draw circular text background
            context.beginPath()
            context.arc(x, y, radius, 0, Math.PI * 2, false)
            context.fillStyle = colorLight
            context.fill()
            context.closePath()

            // draw text
            context.font = "bold " + size + "px Comic Sans MS"
            context.fillStyle = colorDark
            context.textAlign = "center"
            context.fillText(this.weight, x, y + 5)
        }
    }

    drawCurvedEdge(a, b, context) {
        let c = getBezierControlPoint(a, b)

        // draw a quadrative curve between point A and point B bent around the new point
        context.beginPath()
        context.strokeStyle = this.color
        context.lineWidth = lineWidth
        context.moveTo(a[0], a[1])
        context.quadraticCurveTo(c[0], c[1], b[0], b[1])
        context.stroke()
        context.closePath()

        // return the coordinates to draw a weight
        return [c[0], c[1]]
    }
    
    drawStraightEdge(a, b, context) {
        // midpoint
        let x = (a[0] + b[0]) / 2
        let y = (a[1] + b[1]) / 2

        // angle from the midpoint to point
        let angle = Math.atan2(y - b[1], x - b[0])
        
        // get the x, y of the edge of the vertex that the triangle will touch
        let edgePoint = [
            radius * Math.cos(angle) + b[0],
            radius * Math.sin(angle) + b[1]
        ]

        this.drawLine(context, a, edgePoint, this.color)

        // return the coordinates to draw a weight
        return [x, y]
    }

    drawArrow(midPoint, point, context) {
        let r = 30
        let x = midPoint[0]
        let y = midPoint[1]
        
        // angle from the midpoint to point
        let angle = Math.atan2(y - point[1], x - point[0])
        
        // get the x, y of the edge of the vertex that the triangle will touch
        let edgeOfVertex = [
            radius * Math.cos(angle) + point[0],
            radius * Math.sin(angle) + point[1]
        ]

        // new x and y coordinates rotated around the point
        let x_displaced
        let y_displaced
        let offset = 20 * (Math.PI / 180)

        // get point C
        x_displaced = r * Math.cos(angle + offset) + point[0]
        y_displaced = r * Math.sin(angle + offset) + point[1]
        let point1 = [x_displaced, y_displaced]

        // get point D
        x_displaced = r * Math.cos(angle - offset) + point[0]
        y_displaced = r * Math.sin(angle - offset) + point[1]
        let point2 = [x_displaced, y_displaced]

        // draw triangle
        this.drawLine(context, point1, edgeOfVertex, this.color)
        this.drawLine(context, point2, edgeOfVertex, this.color)
        this.drawLine(context, point1, point2, this.color)
    }
    
    drawLine(context, pointA, pointB, color) {
        // draw a straight line from point A to point B
        context.beginPath()
        context.strokeStyle = color
        context.lineWidth = lineWidth
        context.moveTo(pointA[0], pointA[1])
        context.lineTo(pointB[0], pointB[1])
        context.stroke()
        context.closePath()
    }
}