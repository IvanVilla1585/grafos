'use strict'

import * as d3 from 'd3'
import uuid from 'uuid/v4'

import store from './utils/store'
import messages from './utils/messages'

class Canvas {
  constructor () {
    this.radius = 32
    this.colors = []
    this.node_from = null
    this.canvas = d3.select('canvas')
    this.width = this.canvas.property('width')
    this.height = this.canvas.property('height')
    this.context = this.canvas.node().getContext('2d')
  }
  setupCanvas () {
    this.canvas
      .on('mousedown', this.handleMouseDown.bind(this))
    d3.select(window)
      .on('keyup', this.handleDelete.bind(this))

    this.colors = d3.scaleOrdinal()
      .range(d3.schemeCategory20)

    this.canvas.call(d3.drag()
      .subject(this.dragsubject.bind(this))
      .on('start', this.dragstarted.bind(this))
      .on('drag', this.dragged.bind(this))
      .on('end', this.dragended.bind(this))
      .on('start.render drag.render end.render', this.render.bind(this)))
  }

  render () {
    this.clear()
    const data = this.mergeData()
    this.drawLines(data.links, data.circles)
    this.drawCircles(data.circles)
  }

  mergeData () {
    let circles = []
    let links = []
    const currentGraph = store.getCurrentGraph()
    const graph = store.getGrap(currentGraph)
    if (store.lastGraph === 2) {
      const key = `${store.baseName}${store.lastGraph - 1}`
      const firstGraph = store.getGrap(key)
      links = [...firstGraph.links, ...graph.links]
      circles = [...firstGraph.circles, ...graph.circles]
    } else {
      links = [...graph.links]
      circles = [...graph.circles]
    }
    return {circles, links}
  }

  drawCircles (circles) {
    circles.map(circle => {
      this.context.beginPath()
      this.context.moveTo(circle.x + this.radius, circle.y)
      this.context.arc(circle.x, circle.y, this.radius, 0, 2 * Math.PI)
      this.context.fillStyle = this.colors(circle.index)
      this.context.fill()
      this.context.font = 'bold 22px sans-serif'
      this.context.fillStyle = '#fff'
      this.context.fillText(
        circle.text,
        circle.text.toString().length > 1 ? circle.x - 12 : circle.x - 6,
        circle.y + 6
      )
      if (circle.selected) {
        this.context.lineWidth = 6
      } else {
        this.context.lineWidth = 2
      }
      this.context.stroke()
      this.context.closePath()
    })
  }

  drawLines (links, circles) {
    links.map(link => {
      this.context.beginPath()
      this.context.lineWidth = 3
      const source = circles.find(_c => _c.id === link.source)
      const target = circles.find(_c => _c.id === link.target)
      if (link.source === link.target) {
        this.drawCycle(source)
      } else {
        this.context.moveTo(
          source.x,
          source.y
        )
        this.context.lineTo(
          target.x,
          target.y
        )
      }
      if (store.graphType === 'addressed') {
        this.drawArrow(source, target, 14)
      }
      this.context.stroke()
      this.context.closePath()
    })
  }

  drawArrow (source, target, headLength) {
    const degreesInRadians225 = 225 * Math.PI / 180
    const degreesInRadians135 = 135 * Math.PI / 180

    // calc the angle of the line
    const dx = target.x - source.x
    const dy = target.y - source.y
    const angle = Math.atan2(dy, dx)

    // calc the position in x and y
    const posX = target.x - this.radius * Math.cos(angle)
    const posY = target.y - this.radius * Math.sin(angle)

    // calc the arrow position in x and y
    const x225 = posX + headLength * Math.cos(angle + degreesInRadians225)
    const y225 = posY + headLength * Math.sin(angle + degreesInRadians225)
    const x135 = posX + headLength * Math.cos(angle + degreesInRadians135)
    const y135 = posY + headLength * Math.sin(angle + degreesInRadians135)

    // draw partial arrowhead at 225 degrees
    this.context.moveTo(posX, posY)
    this.context.lineTo(x225, y225)
    // draw partial arrowhead at 135 degrees
    this.context.moveTo(posX, posY)
    this.context.lineTo(x135, y135)
  }

  drawCycle (data) {
    this.context.beginPath()
    this.context.moveTo(data.x, data.y)
    this.context.lineTo(data.x - 60, data.y)
    this.context.moveTo(data.x, data.y + 15)
    this.context.lineTo(data.x - 60, data.y + 15)
    this.context.moveTo(data.x - 60, data.y)
    this.context.lineTo(data.x - 60, data.y + 15)
    // this.context.bezierCurveTo(data.x, data.y + 100, 30, data.x - 100, data.x, data.y)
    // this.context.quadraticCurveTo(data.x, data.x + 60, data.x - 30, data.y)
    this.context.stroke()
  }

  dragsubject () {
    if (store.getIsCreating()) {
      let dx = -1
      let dy = -1
      let d2 = -1
      let s2 = this.radius * this.radius * 4 // Double the radius.
      let subject = {}
      const data = this.mergeData()

      data.circles.map(circle => {
        dx = d3.event.x - circle.x
        dy = d3.event.y - circle.y
        d2 = dx * dx + dy * dy
        if (d2 < s2) {
          subject = circle
          s2 = d2
        }
      })

      return subject
    }
  }

  dragstarted () {
    this.resolverEvent()
    d3.event.subject.active = true
  }

  resolverEvent () {
    const currentGraph = store.getCurrentGraph()
    const graph = store.getGrap(currentGraph)
    const current = d3.event.subject
    const shiftKey = d3.event.sourceEvent.shiftKey
    if (shiftKey && !this.node_from) {
      this.node_from = current
      d3.event.subject.selected = true
    } else if (shiftKey && this.node_from && current.id !== this.node_from.id) {
      const link = {source: this.node_from.id, target: current.id}
      graph.links.push(link)
      this.node_from.selected = false
      graph.circles = graph.circles.map(_c => {
        if (_c.id === this.node_from.id) {
          return this.node_from
        }
        return _c
      })
      this.node_from = null
      store.setGrap(currentGraph, graph)
    } else if (shiftKey && this.node_from && current.id === this.node_from.id) {
      this.node_from = null
      d3.event.subject.selected = false
    }
  }

  dragged () {
    d3.event.subject.x = d3.event.x
    d3.event.subject.y = d3.event.y
  }

  dragended () {
    d3.event.subject.active = false
  }

  handleMouseDown () {
    if (store.getIsCreating()) {
      if (d3.event.altKey) {
        this.createCircle()
      }
    } else if (d3.event.altKey && !store.getIsCreating()) {
      messages.info('Debe iniciar la creacion de un grafo')
    }
  }

  createCircle () {
    const currentGraph = store.getCurrentGraph()
    const graph = store.getGrap(currentGraph)
    const lastChild = store.getLastChild()
    const circle = {
      index: graph.circles.length ? graph.circles.length - 1 : 0,
      x: d3.event.x,
      y: d3.event.y,
      id: uuid(),
      text: lastChild + 1,
      selected: false
    }
    store.setLastChild(lastChild + 1)
    graph.circles.push(circle)
    store.setGrap(currentGraph, graph)
    this.render()
  }

  clear () {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  handleDelete () {
    const currentGraph = store.getCurrentGraph()
    const graph = store.getGrap(currentGraph)
    if (this.node_from && d3.event.keyCode === 8) {
      graph.circles = graph.circles.filter(_c => _c.id !== this.node_from.id)
      graph.links = graph.links.filter(_l => _l.source !== this.node_from.id && _l.target !== this.node_from.id)
      console.log(d3.event)
      store.setGrap(currentGraph, graph)
      this.node_from = null
      this.render()
    } else if (this.node_from && (d3.event.keyCode === 67 || d3.event.keyCode === 99)) {
      const link = {
        source: this.node_from.id,
        target: this.node_from.id
      }
      graph.links.push(link)
      this.node_from.selected = false
      graph.circles = graph.circles.map(_c => {
        if (_c.id === this.node_from.id) {
          return this.node_from
        }
        return _c
      })
      this.node_from = null
      this.render()
    }
  }
}

export default Canvas
