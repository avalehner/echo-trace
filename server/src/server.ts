import 'dotenv/config'
import express, { Express } from 'express'
import cors from 'cors'

const app: Express = express()

//middleware 
app.use(express.json())
app.use(cors({origin: 'http://localhost:5173'}))



//server
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
