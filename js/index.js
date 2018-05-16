'use strict'

import Canvas from './Canvas'
import HandleButtons from './HandleButtons'

const canvas = new Canvas()
const handle = new HandleButtons(canvas)

canvas.setupCanvas()
handle.setupHandlers()