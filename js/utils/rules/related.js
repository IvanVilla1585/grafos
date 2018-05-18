'use strict'

import {countGrades} from './isomorphic'

export function addressed (node, matriz, visited) {
  if (!visited[node]) {
    visited[node] = true
    let row = []
    matriz[node].map((_d, index) => {
      if (_d === 1) {
        row.push(index)
      }
    })
    row.map(_d => {
      addressed(_d, matriz, visited)
    })
  }
}

export function validAddressed (array) {
  let result = true
  array.map(_d => {
    result = result && _d
  })
  return result
}

export function regular (data) {
  let result = false
  const circles = countGrades([...data.links], [...data.circles])
  const grade = circles[0].grade
  const grades = circles.filter(_c => _c.grade === grade)
  if (circles.length === grades.length) {
    result = true
  }

  return result
}

export function complete (matriz) {
  let result = true
  matriz.map((_data, index) => {
    _data.map((_d, pos) => {
      if (_d === 1 && index !== pos) {
        result = result && true
      } else if (_d === 0 && index !== pos) {
        result = result && false
      }
    })
  })
  return result
}
