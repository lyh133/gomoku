import { createServer } from 'http'
import express, { Express } from 'express'
import authHandler from './handler/auth.handler'
import gameHandler from './handler/game.handler'
import cors from 'cors'

const app: Express = express()
app.use(
    cors({
      origin: process.env.allowHost || true,
    })
  )
app.use(express.json())

app.use('/api/game', gameHandler)
app.use('/api/auth', authHandler)

export const server = createServer(app)

export default app
