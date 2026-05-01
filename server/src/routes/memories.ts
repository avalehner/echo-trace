import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from "../db"
import { downloadWav } from '../services/audioService'
import fs from 'fs'
import path from 'path'
import { audioDir } from '../services/audioService'
import { validate } from 'uuid'

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

    const wavFilePath = path.resolve(audioDir, `${memoryId}.wav`) //construct file path before download 
    if (!fs.existsSync(wavFilePath)) await downloadWav(songName, artist, memoryId) //downloads file only if it doesnt exist 

    //call encoder 
    const encoderResponse = await fetch(`${process.env.FLASK_URL}/encode`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        wav_path: wavFilePath, 
        json_string: JSON.stringify({
          emotion: memoryData.emotion, 
          season: memoryData.season, 
          year: memoryData.year, 
          memory_fragment: memoryData.memory_fragment
        }) 
      })
    }) 

    if(!encoderResponse.ok) throw new Error (`Encoder error: ${encoderResponse.status}`)

    const { output_path } = await encoderResponse.json()
    res.sendFile(output_path) //serves file, frontend decides what to do with it
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

//get decoded message
memoriesRouter.get('/:id/decode', async (req: Request, res:Response) => {
  try {   
    const { id } = req.params 

    //imports location of audio directory from audio service 
    
    //makes sure valid uuid input
    if (!validate(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return 
    }
    if (!fs.existsSync(audioDir)) {
      res.status(500).json({ error: 'Audio directory not found' })
      return 
    }

    //gets filepath for encoded wav file 
    const encodedWavFilePath = path.resolve(audioDir, `${id}_encoded.wav`)

    //makes sure encoded wav file exists
    if (!fs.existsSync(encodedWavFilePath)) {
      res.status(404).json({ error: 'Encoded WAV not found - has this memory been downloaded yet? '})
      return
    }

    const decoderResponse = await fetch (`${process.env.FLASK_URL}/decode`, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({
        wav_path: encodedWavFilePath
      })
    })

    if (!decoderResponse.ok) throw new Error(`Decoder error: ${decoderResponse.status}`)

    const decodedMessage = await decoderResponse.json()
    res.status(200)
      .json(decodedMessage)

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