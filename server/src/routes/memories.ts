import { Router, Request, Response } from 'express'
import pool from "../db"

//create router instance 
const memoriesRouter = Router()

memoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const dbResponse = await pool.query(`
      SELECT * 
      FROM memories
      `)
    const memoriesData = dbResponse.rows
    res.status(200)
      .json(memoriesData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

memoriesRouter.get('/:emotion', async (req:Request, res:Response) => {
  try {
    const { emotion } = req.params   
    const dbResponse = await pool.query(`
        SELECT * 
        FROM memories 
        WHERE emotion = $1`, 
        [emotion]
      )
    const memoriesData = dbResponse.rows
    res.status(200)
      .json(memoriesData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

memoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { song_id, song_name, artist, emotion, season, year, memory_fragment, wav_path } = req.body
    const dbResponse = await pool.query(`
        INSERT INTO memories (song_id, song_name, artist, emotion, season, year, memory_fragment, wav_path) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`, 
        [song_id, song_name, artist, emotion, season, year, memory_fragment, wav_path]
      )
    const newMemory = dbResponse.rows[0]
    res.status(201)
      .json(newMemory)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500)
      .json({ error: message })
  }
})

export default memoriesRouter