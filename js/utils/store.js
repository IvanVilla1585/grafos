'use strict'

const store = {
  graphs: {},
  lastGraph: 1,
  lastChild: 0,
  graphType: '',
  baseName: 'graph_',
  currentGraph: '',
  isCreating: false,
  isSaving: false,
  getGraps() {
    return {...this.graphs}
  },
  getGrap(key) {
    return this.graphs[key]
  },
  setGrap(key, data) {
    this.graphs[key] = data
  },
  setCurrentGraph(graph) {
    this.currentGraph = graph
  },
  getCurrentGraph() {
    return this.currentGraph
  },
  getlastGraph() {
    return this.lastGraph
  },
  incrementGraph() {
    this.lastGraph += 1
  },
  decrementGraph() {
    this.lastGraph -= 1
  },
  setIsCreating() {
    this.isCreating = !this.isCreating
  },
  getIsCreating() {
    return this.isCreating
  },
  setLastChild(value) {
    this.lastChild = value
  },
  getLastChild() {
    return this.lastChild
  },
  resetValues() {
    this.graphs = {}
    this.lastGraph = 1,
    this.lastChild = 0
    this.currentGraph = ''
    this.isCreating = false
    this.isSaving = false
  }
}

export default store