'use strict'

export const isomorphic = (graphs) => {
  const {graph1, graph2} = graphs
  const data = composeData(graph1, graph2)
  return data
}

const composeData = (graph1, graph2) => {
  let data = {}
  const {circles: circles1, links: links1, name: name1} = graph1
  const {circles: circles2, links: links2, name: name2} = graph2
  data = validatorNodesEdges(circles1, circles2, name1, name2, 'nodes', data)
  if (!data.isNodesEquals) {
    return data
  }
  data = validatorNodesEdges(links1, links2, name1, name2, 'edges', data)
  if (!data.isEdgesEquals) {
    return data
  }
  data = validatorGrades(name1, name2, data)
  if (!data.isNodesGradesEquals) {
    return data
  }
  return data
}

function validatorNodesEdges (array1, array2, name1, name2, key, data) {
  if (array1.length === array2.length) {
    const dataKey = key === 'nodes' ? 'circles' : 'links'
    if (key === 'nodes') {
      data.isNodesEquals = true
    } else {
      data.isEdgesEquals = true
    }
    data.graph1 = {
      ...data.graph1,
      [key]: array1.length,
      [dataKey]: array1
    }
    data.graph2 = {
      ...data.graph2,
      [key]: array2.length,
      [dataKey]: array2
    }
  } else {
    data.isNodesEquals = false
    const type = key === 'nodes' ? 'vertices' : 'aristas'
    data.errorMessage = `
      No son grafos isomorfos por que no tienen la misma cantidad de ${type},
      el ${name1} tiene ${array1.length} ${type} y el ${name2} tiene ${array2.length} ${type}.
    `
  }
  return {...data}
}

function validatorGrades (name1, name2, data) {
  const {graph1, graph2} = data
  graph1.circles = countGrades(graph1.links, graph1.circles)
  graph2.circles = countGrades(graph2.links, graph2.circles)
  const result = compareGrades(graph1.circles, graph2.circles)
  if (result.valid) {
    data.isNodesGradesEquals = true
  } else {
    data.isNodesGradesEquals = false
    const circle1 = graph1.circles[result.pos]
    const circle2 = graph2.circles[result.pos]
    data.errorMessage = `
      No es un grafo isomorfo por que el vertice ${circle1.text} de los 2 grafos no tienen el mismo grado,
      vertice ${circle1.text} con grado ${circle1.grade} del ${name1} y vertice ${circle2.text} con grado ${circle2.grade} del ${name2} 
    `
  }

  return {
    ...data,
    graph1: {
      ...graph1
    },
    graph2: {
      ...graph2
    }
  }
}

export function countGrades (links, circles) {
  const data = circles.map(_circle => {
    const _edges = links.filter(_link => _link.source === _circle.id || _link.target === _circle.id)
    _circle.grade = _edges.length
    return _circle
  })
  return data
}

function compareGrades (circles1, circles2) {
  let valid = true
  let pos = -1
  circles1.map((_circle, index) => {
    const _c = circles2[index]
    if (_circle.grade !== _c.grade) {
      valid = false
      pos = index
    }
  })
  return {valid, pos}
}
