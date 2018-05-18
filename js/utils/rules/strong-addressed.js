
import FloydWarshall from 'floyd-warshall'

export function strong (graph) {
  let valid = true
  const warshal = new FloydWarshall(graph.matriz)
  const result = warshal.widestPaths

  result.map((_row, i) => {
    _row.map((_d, j) => {
      if (i !== j && _row[j] === 0) {
        valid = valid && false
      }
    })
  })

  return valid
}

export function countSourceTargetGrades (links, circles) {
  const data = circles.map(_circle => {
    const _entries = links.filter(_link => _link.source === _circle.id)
    const _targets = links.filter(_link => _link.target === _circle.id)
    _circle.entries = _entries.length
    _circle.targets = _targets.length
    return _circle
  })
  return data
}
