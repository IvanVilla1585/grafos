'use strict'

import store from './utils/store'
import message from './utils/messages'
import {templateTableIsomorphic, templateTableMatriz} from './utils/templates'
import {isomorphic} from './utils/rules/isomorphic'
import {addressed, complete, regular, validAddressed} from './utils/rules/related'
import {countSourceTargetGrades, strong} from './utils/rules/strong-addressed'

class HandlerButtons {
  constructor (canvas) {
    this.matriz = []
    this.canvas = canvas
    this.$buttonSave = document.getElementById('save')
    this.$ratioAddressed = document.getElementById('addressed')
    this.$ratioNotAddressed = document.getElementById('not_addressed')
    this.$buttonCancel = document.getElementById('cancel')
    this.$buttonAddressed = document.getElementById('addressedB')
    this.$buttonStrongAddressed = document.getElementById('strong-addressed')
    this.$buttonCreate = document.getElementById('create')
    this.$buttonMatriz = document.getElementById('matriz')
    this.$buttonRegular = document.getElementById('regular')
    this.$buttonComplete = document.getElementById('complete')
    this.$buttonIsomorphic = document.getElementById('isomorphic')
    this.$matrizContainer = document.getElementById('matriz-container')
    this.$addressedContainer = document.getElementById('addressed-container')
    this.$strongContainer = document.getElementById('strong-container')
    this.$completeContainer = document.getElementById('complete-container')
    this.$regularContainer = document.getElementById('regular-container')
    this.$isomorphicContainer = document.getElementById('isomorphic-container')
  }

  setupHandlers () {
    this.handleSave()
    this.handleCancel()
    this.handleMatriz()
    this.handleCreate()
    this.handleRegular()
    this.handleComplete()
    this.handleAddressed()
    this.handleIsomorphic()
    this.handleStrongAddressed()
    this.handleRadioOption(this.$ratioAddressed)
    this.handleRadioOption(this.$ratioNotAddressed)
  }

  handleMatriz () {
    this.$buttonMatriz.addEventListener('click', (e) => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (!keys.length) {
        return message.info('Debe al menos 1 grafo para ver su matriz de adyacencia')
      }
      this.$matrizContainer.innerHTML = ''
      keys.map(_key => {
        const graph = graphs[_key]
        let {circles, links, matriz} = graph
        circles.map((_, index) => {
          matriz[index] = circles.map(_ => 0)
        })

        links.map(link => {
          const source = circles.findIndex(_c => _c.id === link.source)
          const target = circles.findIndex(_c => _c.id === link.target)
          matriz[source][target] = 1
          if (store.graphType === 'not_addressed') {
            matriz[target][source] = 1
          }
        })
        const template = templateTableMatriz(circles, matriz, graph.name)
        this.$matrizContainer.insertAdjacentHTML('beforeEnd', template)
        store.setGrap(_key, {
          ...graph,
          circles,
          links,
          matriz
        })
      })
    })
  }

  handleCreate () {
    this.$buttonCreate.addEventListener('click', (e) => {
      if (!this.$ratioAddressed.checked && !this.$ratioNotAddressed.checked) {
        return message.info('Seleccione el tipo de grafo a crear')
      }
      if (store.getIsCreating()) {
        return message.info('Primero debe guardar el grafo que esta creando para poder crear otro')
      }
      const key = `${store.baseName}${store.getlastGraph()}`
      const graph = {
        name: `Grafo ${store.getlastGraph()}`,
        links: [],
        matriz: [],
        circles: []
      }
      store.setGrap(key, graph)
      store.setCurrentGraph(key)
      store.setIsCreating()
    })
  }

  handleSave () {
    this.$buttonSave.addEventListener('click', () => {
      const currentGraph = store.getCurrentGraph()
      const graph = store.getGrap(currentGraph)
      if (store.getIsCreating()) {
        store.setIsCreating()
        store.setLastChild(0)
        store.incrementGraph()
        message.success(`Se creo el digrafo ${graph.name}`)
      } else {
        message.info('El grafo debe contener al menos un vértice')
      }
    })
  }

  handleCancel () {
    this.$buttonCancel.addEventListener('click', () => {
      store.resetValues()
      this.canvas.clear()
      store.graphType = ''
      this.$ratioAddressed.checked = false
      this.$ratioNotAddressed.checked = false
    })
  }

  handleIsomorphic () {
    this.$buttonIsomorphic.addEventListener('click', () => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (keys.length < 2) {
        return message.info('Debe crear 2 grafos para poder saber si son isomorfos')
      }
      const data = isomorphic(graphs)
      this.$isomorphicContainer.innerHTML = ''
      if (!data.isNodesEquals || !data.isEdgesEquals || !data.isNodesGradesEquals) {
        return this.$isomorphicContainer.insertAdjacentHTML('beforeEnd', `<h3>${data.errorMessage}</h3>`)
      }
      keys.map(_k => {
        const template = templateTableIsomorphic(data[_k])
        this.$isomorphicContainer.insertAdjacentHTML('beforeEnd', template)
      })
    })
  }

  handleRegular () {
    this.$buttonRegular.addEventListener('click', () => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (!keys.length) {
        return message.info('Debe crear al menos un grafo para saber si es regular')
      }
      this.$regularContainer.innerHTML = ''
      keys.map(_k => {
        let message = ''
        const result = regular(graphs[_k])
        if (result) {
          message = `<h3>El grafo ${graphs[_k].name} es un grafo regular por que todos sus vértices tiene el mismo grado</h3>`
        } else {
          message = `<h3>El grafo ${graphs[_k].name} no es un grafo regular por que todos sus vértices no tiene el mismo grado</h3>`
        }
        this.$regularContainer.insertAdjacentHTML('beforeEnd', message)
      })
    })
  }

  handleComplete () {
    this.$buttonComplete.addEventListener('click', () => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (!keys.length) {
        return message.info('Debe crear al menos un grafo para saber si es completo o no.')
      }
      this.$completeContainer.innerHTML = ''
      keys.map(_k => {
        let message = ''
        const result = complete(graphs[_k].matriz)
        if (result) {
          message = `<h3>El grafo ${graphs[_k].name} es un grafo completo por que se puede ir desde cualquier par de nodos y regresar al mismo</h3>`
        } else {
          message = `<h3>El grafo ${graphs[_k].name} no es un grafo completo por que no se puede ir desde cualquier par de nodos y regresar al mismo</h3>`
        }
        this.$completeContainer.insertAdjacentHTML('beforeEnd', message)
      })
    })
  }

  handleAddressed () {
    this.$buttonAddressed.addEventListener('click', () => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (!keys.length) {
        return message.info('Debe crear al menos un grafo para saber si es conexo.')
      }
      this.$addressedContainer.innerHTML = ''
      keys.map(_k => {
        let message = ''
        const visited = graphs[_k].circles.map(() => {
          return false
        })
        addressed(0, graphs[_k].matriz, visited)
        const result = validAddressed(visited)
        if (result) {
          message = `<h3>El grafo ${graphs[_k].name} es un grafo conexo por que puede ir desde un vértice a otro.</h3>`
        } else {
          message = `<h3>El grafo ${graphs[_k].name} no es un grafo conexo por que puede ir desde un vértice a otro.</h3>`
        }
        this.$addressedContainer.insertAdjacentHTML('beforeEnd', message)
      })
    })
  }

  handleStrongAddressed () {
    this.$buttonStrongAddressed.addEventListener('click', () => {
      const graphs = store.getGraps()
      const keys = Object.keys(graphs)
      if (!keys.length) {
        return message.info('Debe crear al menos un grafo para saber si es fuertemente conexo.')
      }
      this.$strongContainer.innerHTML = ''
      keys.map(_k => {
        let message = ''
        const visited = graphs[_k].circles.map(() => {
          return false
        })
        addressed(0, graphs[_k].matriz, visited)
        const result = validAddressed(visited)
        if (result) {
          const circles = countSourceTargetGrades(graphs[_k].links, graphs[_k].circles)
          let valid = true
          circles.map(_d => {
            if (_d.entries > 0 && _d.targets > 0) {
              valid = valid && true
            }
          })
          if (valid) {
            const _d = strong(graphs[_k])
            if (_d) {
              message = `<h3>El grafo ${graphs[_k].name} es un grafo fuertemente conexo por que puede ir desde cualquiera de sus 
                ${graphs[_k].circles.length} vértices a otro vértice.</h3>
              `
            } else {
              message = `<h3>El grafo ${graphs[_k].name} no es un grafo fuertemente conexo por que no puede ir desde cualquiera de sus 
                ${graphs[_k].circles.length} vértices a otro vértice.</h3>
              `
            }
          } else {
            message = '<h3>Cada nodo debe tener como minimo una arista de entrada y otra de salida.</h3>'
          }
        } else {
          message = '<h3>No se puede verificar si es un grafo fuertemente conexo, por que no es un grafo conexo.</h3>'
        }
        this.$strongContainer.insertAdjacentHTML('beforeEnd', message)
      })
    })
  }

  handleRadioOption (component) {
    component.addEventListener('click', (e) => {
      if (e.target.checked) {
        store.graphType = e.target.value
      }
    })
  }
}

export default HandlerButtons
