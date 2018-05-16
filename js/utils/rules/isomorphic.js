'use strict'

export const isomorphic = (graphs) => {
  const {graph_1, graph_2} = graphs
  const data = composeData(graph_1, graph_2)
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

function validatorNodesEdges(array1, array2, name1, name2, key, data) {
  if (array1.length === array2.length) {
    const dataKey = key === 'nodes' ? 'circles' : 'links'
    if (key === 'nodes') {
      data.isNodesEquals = true
    } else {
      data.isEdgesEquals = true
    }
    data.graph_1 = {
      ...data.graph_1,
      [key]: array1.length,
      [dataKey]: array1
    }
    data.graph_2 = {
      ...data.graph_2,
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

function validatorGrades(name1, name2, data) {
  const {graph_1, graph_2} = data
  graph_1.circles = countGrades(graph_1.links, graph_1.circles)
  graph_2.circles = countGrades(graph_2.links, graph_2.circles)
  const result = compareGrades(graph_1.circles, graph_2.circles)
  if (result.valid) {
    data.isNodesGradesEquals = true
  } else {
    data.isNodesGradesEquals = false
    const circle1 = graph_1.circles[result.pos]
    const circle2 = graph_2.circles[result.pos]
    data.errorMessage = `
      No es un grafo isomorfo por que el vertice ${circle1.text} de los 2 grafos no tienen el mismo grado,
      vertice ${circle1.text} con grado ${circle1.grade} del ${name1} y vertice ${circle2.text} con grado ${circle2.grade} del ${name2} 
    `
  }

  return {
    ...data,
    graph_1: {
      ...graph_1
    },
    graph_2: {
      ...graph_2
    }
  }
}

export function countGrades(links, circles) {
  const data = circles.map(_circle => {
    const _edges = links.filter(_link => _link.source === _circle.id || _link.target === _circle.id)
    _circle.grade = _edges.length
    return _circle
  })
  return data
}

function compareGrades(circles1, circles2) {
  let valid = true
  let pos = -1
  circles1.map((_circle, index) => {
    const _c = circles2[index]
    if (_circle.grade !== _c.grade) {
      valid = false
      pos = index
      return false;
    }
  })
  return {valid, pos}
}
