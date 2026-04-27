import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from "../db"
import { downloadWav } from '../services/audioService'

//create router instance 
const memoriesRouter = Router()


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

    if (!memoryData) {
      res.status(404)
        .json({ error: 'Memory not found'})
      return 
    }

    const songName = memoryData.song_name
    const artist = memoryData.artist
    const memoryId = memoryData.id 
    const wavFilePath = await downloadWav(songName, artist, memoryId)

    res.download(wavFilePath) //tells express to serve the file as a downloadble attachment to the browser 
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})


//get all memories (filter by emotion, year, season)
memoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { emotion, season, year } = req.query 

    let sqlQuery = 'SELECT * FROM memories WHERE 1=1' //WHERE 1=1 is an always true placeholder i can keep appending AND conditions to 
    const params: any[] = [] //array that contains a any type, query params are always string s or numbers 
    let paramCount = 1

    if (emotion) {
      sqlQuery += ` AND emotion = $${paramCount}`
      params.push(emotion)
      paramCount++
    }

    if (season) {
      sqlQuery += ` AND season = $${paramCount}`
      params.push(season)
      paramCount++
    }

    if (year) {
      sqlQuery += ` AND year = $${paramCount}`
      params.push(year) 
      paramCount++
    }

    const dbResponse = await pool.query(sqlQuery, params)
    const memoriesData = dbResponse.rows
    res.status(200)
      .json(memoriesData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//get memory by id 
memoriesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params 
    const dbResponse = await pool.query(`
      SELECT * 
      FROM memories
      WHERE id = $1`, 
      [id]
    )

    const memoryData = dbResponse.rows[0]

    if(!memoryData) {
      res.status(404)
        .json({ error: 'Memory not found' })
      return 
    }

    res.status(200)
      .json(memoryData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//delete memory by id 
memoriesRouter.delete('/:id', async (req: Request, res: Response) => {
  try { 
    const { id } = req.params 
    
    const dbResponse = await pool.query(`
      DELETE FROM memories 
      WHERE id = $1 
      RETURNING *;`, 
      [id]
    )

    const deletedMemoryData = dbResponse.rows[0]

    if(!deletedMemoryData) {
      res.status(404)
        .json({ error: 'Memory not found' })
      return 
    }

    res.status(200)
      .json(deletedMemoryData)
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