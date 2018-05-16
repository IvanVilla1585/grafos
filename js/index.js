'use strict'

import Canvas from './Canvas'
import HandlerButtons from './HandlerButtons'

const canvas = new Canvas()
const handlers = new HandlerButtons(canvas)

canvas.setupCanvas()
handlers.setupHandlers()