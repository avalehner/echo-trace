import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from "../db"
import { downloadWavYtDlp, audioDir, downloadAndConvertPreview, uploadToR2 } from '../services/audioService'
import fs from 'fs'
import path from 'path'
import { validate } from 'uuid'
import os from 'os' //built in node module giving acces to the system temp directory 

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

    //if this memory has already been encoded return stored R2 URL, dont need to reencode 
    if (memoryData.encoded_audio_url?.startsWith('http')) {
      res.status(200).json({url: memoryData.encoded_audio_url})
      return 
    }

    //only download if file doesnt already exist 
    const wavFilePath = process.env.NODE_ENV === 'production'
      ? path.join(os.tmpdir(), `${memoryId}.wav`)
      : path.resolve(audioDir, `${memoryId}.wav`)

    if (!fs.existsSync(wavFilePath)) {
      if (process.env.NODE_ENV === 'production') {
        //production: deezer 30 second preview 
        await downloadAndConvertPreview(songName, artist, memoryId)
      } else {
        //local dev: yt-dlp full song 
        await downloadWavYtDlp(songName, artist, memoryId)
      }
    }

    //extract memory fields into json string once, reused in both branches below 
    const memoryJson = JSON.stringify({
      emotion: memoryData.emotion, 
      season: memoryData.season, 
      year: memoryData.year, 
      memory_fragment: memoryData.memory_fragment
    })

    const r2Key = `${memoryId}_encoded.wav` // the key (filename) this file will have in R2
    let encodedAudioUrl: string 

    if (process.env.NODE_ENV === 'production') {
      //production: express and flask are on separate containers, can't share file paths 
      //solution: read the WAV bytes, convert to base64 string, send over HTTP to Flask 

      //fs.readFileSync reads the WAV file from Express' /tmp into memory as a Buffer
      //.toString('base64') converts those raw bytes to a base64 string (safe to send in JSON)
      const wavBase64 = fs.readFileSync(wavFilePath).toString('base64')

      const encoderResponse = await fetch(`${process.env.FLASK_URL}/encode`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json'}, 
        body: JSON.stringify({ wav_base64: wavBase64, json_string: memoryJson })
        //send the base64 WAV and the memory JSON to Flask 
      })

      if (!encoderResponse.ok) throw new Error(`Encoder error: ${encoderResponse.status}`)

      //Flask returns the encoded WAV as a base64 string 
      const { encoded_base64 } = await encoderResponse.json()

      //define a temp path on Express' container to write the encoded WAV
      const tmpEncodedPath = path.join(os.tmpdir(), `${memoryId}_encoded.wav`)

      //converts the base64 string back to wav bytes
      //writes those bytes to disk so uploadToR2 can read the file 
      fs.writeFileSync(tmpEncodedPath, Buffer.from(encoded_base64, 'base64'))

      encodedAudioUrl = await uploadToR2(tmpEncodedPath, r2Key)
      //upload the encoded WAV to R2, get back the public URL 

      fs.unlinkSync(tmpEncodedPath)
      //delete the temp encoded WAV 
    } else {
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

      const { output_path } = await encoderResponse.json() //where flask saved the encoded file locally 

      //upload encoded file to R2, get back the public URL 
      encodedAudioUrl = await uploadToR2(output_path, r2Key)
    }

    await pool.query(`UPDATE memories SET encoded_audio_url = $1 WHERE id = $2`, [encodedAudioUrl, memoryId])

    //return the URL so frontend can play it directly form R2 
    res.status(200).json({ url: encodedAudioUrl })

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

    //makes sure valid uuid input
    if (!validate(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return 
    }

    //construct R2 key 
    const r2key = `${id}_encoded.wav`

    //pass the local temp file to Flask for decoding 
    const decoderResponse = await fetch (`${process.env.FLASK_URL}/decode`, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({
        wav_url: `${process.env.R2_PUBLIC_URL}/${r2key}` //gives public url to flask so it can download from R2 directly
      })
    })

    if (!decoderResponse.ok) {
      const errorBody = await decoderResponse.text() //read Flask's actual error message 
      console.error('Flask decode error:', errorBody)
      throw new Error(`Decoder error: ${decoderResponse.status} - ${errorBody}`)
    }

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