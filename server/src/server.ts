import 'dotenv/config'
import express, { Express } from 'express'
import cors from 'cors'
import memoriesRouter from './routes/memories'
import searchRouter from './routes/search'

const app: Express = express()

//middleware 
app.use(express.json())
app.use(cors({origin: 'http://localhost:5173'}))

//routes
app.use('/api/memories', memoriesRouter)
app.use('/api/search', searchRouter)

//server
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
