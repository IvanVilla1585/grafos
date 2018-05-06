'use strict'

const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'})
    fs.createReadStream(path.join(__dirname, '../public/index.html')).pipe(res)
  } else if (req.url.includes('/css/') || req.url.includes('/js/')) {
    const text = req.url.includes('/css/') ? 'css' : 'javascript'
    res.writeHead(200, {'Content-Type': `text/${text}`})
    fs.createReadStream(path.join(__dirname, `../public${req.url}`)).pipe(res)
  }
})

server.listen(8082, () => console.log('server running on port 8082'))
