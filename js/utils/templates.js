'use strict'

export const templateTableMatriz = (circles, matriz, name) => {
  const template = `
    <article class='col-md-6'>
      <h3 class="text-center">${name}</h3>
      <div>
        ${table(circles, matriz)}
      </div>
    </article>
  `
  return template
}

export const templateTableIsomorphic = (data) => {
  const template = `
    <article class='col-md-6'>
      ${isomorphicTable(data)}
    </article>
  `
  return template
}

function isomorphicTable(graph) {
  const _h = graph.circles.map(_c => {
    return `<th>${_c.text}</th>`
  })
  const head = `
    <thead className="t-head text-center">
    <tr>
      <th rowSpan="2">${graph.name}</th>
      <th rowSpan="2">N</th>
      <th rowSpan="2">A</th>
      <th colSpan="2">Grado</th>
    </tr>
    <tr>
      ${_h.join('')}
    </tr>
    </thead>
  `
  const _b = graph.circles.map(_c => {
    return `<td>${_c.grade}</td>`
  })
  const body = `
    <tr>
      <td>deg(V)</td>
      <td>${graph.nodes}</td>
      <td>${graph.edges}</td>
      ${_b.join('')}
    </tr>
  `
  const table = `
    <table class='table'>
      <thead id='t-head'>
        ${head}
      </thead>
      <tbody id='t-body'>
        ${body}
      </tbody>
    </table>
  `
  return table
}

function table(circles, matriz) {
  let tbody = ''
  let head = `
    <tr class="text-center">
    </tr>`

  matriz.map(_data => {
    let body = '<tr>'
    _data.map(_d => {
      body += `<td>${_d === 0 ? _d : `<strong>${_d}</strong>`}</td>`
    })
    body += '</tr>'
    tbody += body
  })
  const table = `
    <table class='table'>
      <thead id='t-head'>
        ${head}
      </thead>
      <tbody id='t-body'>
        ${tbody}
      </tbody>
    </table>
  `

  return table
}