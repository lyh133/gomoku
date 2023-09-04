import { createServer } from 'http'
import express, { Express } from 'express'
import authHandler from './handler/auth.handler'


const app: Express = express()

app.use(express.json())

// app.use('/api/theatres', theatreHandler)
// app.use('/api/movies', movieHandler)
// app.use('/api/bookings', bookingHandler)
// app.use('/api/sessions', sessionHandler)
app.use('/api/auth', authHandler)

export const server = createServer(app)

export default app
