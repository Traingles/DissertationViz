class SlidingEdge {
    constructor () {
        this.points = []
        this.index = 0
    }

    setPoints(points) {
        this.points = points
    }

    setIndex(index) {
        this.index = index
    }

    draw(context) {
        let lastPoint = this.points[0]

        for (let i = 1; i < this.index; i++) {
            // draw line between two points
            context.beginPath()
            context.strokeStyle = traversalColor
            context.lineWidth = "5"
            context.moveTo(lastPoint[0], lastPoint[1])
            context.lineTo(this.points[i][0], this.points[i][1])
            context.stroke()
            context.closePath()
            
            lastPoint = this.points[i]
        }
    }
}