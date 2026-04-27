import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from "../db"
import { downloadWav } from '../services/audioService'

//create router instance 
const memoriesRouter = Router()

//get all memories
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

//get memories by emotion 
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

//get memories by season + year 
memoriesRouter.get('/:season/:year', async (req: Request, res: Response) => {
  try {
    const { season, year } = req.params 
    const dbResponse = await pool.query(`
      SELECT * from memories
      WHERE season = $1 AND emotion = $2`, 
      [season, year]
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

//download wav
memoriesRouter.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params 

    const dbResponse = await pool.query(`
      SELECT *
      FROM memories 
      WHERE id = $1`, 
      [id]
    )

    const memoryData = dbResponse.rows[0]

    const songName = memoryData.song_name
    const artist = memoryData.artist
    const memoryId = memoryData.id 
    const wavFilePath = await downloadWav(songName, artist, memoryId)

    res.status(200)
      .json(wavFilePath)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//save memory data 
memoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { song_id, song_name, album_name, artist, emotion, season, year, memory_fragment} = req.body
   
    const dbResponse = await pool.query(`
        INSERT INTO memories (song_id, song_name, album_name, artist, emotion, season, year, memory_fragment) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`, 
        [song_id, song_name, album_name, artist, emotion, season, year, memory_fragment]
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