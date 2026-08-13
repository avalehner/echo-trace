import { Router } from 'express';
import type { Request, Response } from 'express';
import pool from '../db.ts';
import {
  downloadWavYtDlp,
  audioDir,
  downloadAndConvertPreview,
  uploadToR2,
} from '../services/audioService.ts';
import fs from 'fs';
import path from 'path';
import { validate } from 'uuid';
import os from 'os'; //built in node module giving acces to the system temp directory

//create router instance
const memoriesRouter = Router();

//download wav
memoriesRouter.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isVoice = req.query.voice === 'true';
    const dbResponse = await pool.query(
      `
      SELECT *
      FROM memories 
      WHERE id = $1`,
      [id]
    );
    const memoryData = dbResponse.rows[0];

    if (!memoryData) {
      res.status(404).json({ error: 'Memory not found in database' });
      return;
    }

    //if this memory has already been encoded return stored R2 URL, dont need to re-encode

    if (isVoice) {
      if (memoryData.voice_audio_url?.startsWith('http')) {
        res.status(200).json({ url: memoryData.voice_audio_url });
        return;
      }
    } else {
      if (memoryData.encoded_audio_url?.startsWith('http')) {
        res.status(200).json({ url: memoryData.encoded_audio_url });
        return;
      }
    }

    //extract song data from memory data
    const songName = memoryData.song_name;
    const artist = memoryData.artist;
    const memoryId = memoryData.id;

    //only download if file doesnt already exist
    const wavFilePath = path.join(os.tmpdir(), `${memoryId}.wav`);

    if (!fs.existsSync(wavFilePath)) {
      //production: deezer 30 second preview
      await downloadAndConvertPreview(songName, artist, memoryId);
    }

    //extract memory fields into json string once, reused in both branches below
    const memoryJsonString = JSON.stringify({
      emotion: memoryData.emotion,
      season: memoryData.season,
      year: memoryData.year,
      memory_fragment: memoryData.memory_fragment,
    });

    const r2Key = isVoice ? `${memoryId}_voice.wav` : `${memoryId}_encoded.wav`; // the key (filename) this file will have in R2
    let voice_audio_url: string;
    let encodedAudioUrl: string;
    let encodeInterval: number | null = null;

    if (process.env.NODE_ENV === 'production') {
      //production: express and flask are on separate containers, can't share file paths
      //solution: read the WAV bytes, convert to base64 string, send over HTTP to Flask

      //fs.readFileSync reads the WAV file from Express' /tmp into memory as a Buffer
      //.toString('base64') converts those raw bytes to a base64 string (safe to send in JSON)
      const wavBase64 = fs.readFileSync(wavFilePath).toString('base64');

      const encodeFetchUrl = isVoice
        ? `${process.env.FLASK_URL}/encode_voice`
        : `${process.env.FLASK_URL}/encode`;

      const encoderResponse = await fetch(encodeFetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wav_base64: wavBase64, json_string: memoryJsonString }),
        //send the base64 WAV and the memory JSON to Flask
      });

      if (!encoderResponse.ok) throw new Error(`Encoder error: ${encoderResponse.status}`);

      //Flask returns the encoded WAV as a base64 string
      const { encoded_base64, interval } = await encoderResponse.json();
      if (!isVoice) encodeInterval = interval;

      //grab encode interval
      encodeInterval = interval;

      //define a temp path on Express' container to write the encoded WAV
      const tmpEncodedPath = path.join(os.tmpdir(), `${memoryId}_encoded.wav`);

      //converts the base64 string back to wav bytes
      //writes those bytes to disk so uploadToR2 can read the file
      fs.writeFileSync(tmpEncodedPath, Buffer.from(encoded_base64, 'base64'));

      //upload the encoded WAV to R2, get back the public URL
      encodedAudioUrl = await uploadToR2(tmpEncodedPath, r2Key);

      //delete the temp encoded WAV
      fs.unlinkSync(tmpEncodedPath);
    } else {
      //development: flask and express share file system
      const encodeFetchUrl = isVoice
        ? `${process.env.FLASK_URL}/encode_voice`
        : `${process.env.FLASK_URL}/encode`;

      const encoderResponse = await fetch(encodeFetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wav_path: wavFilePath,
          json_string: JSON.stringify({
            emotion: memoryData.emotion,
            season: memoryData.season,
            year: memoryData.year,
            memory_fragment: memoryData.memory_fragment,
          }),
        }),
      });

      if (!encoderResponse.ok) {
        const errorBody = await encoderResponse.text();
        console.error('Flask encode error:', errorBody);
        throw new Error(`Encoder error: ${encoderResponse.status} - ${errorBody}`);
      }

      //where flask saved the encoded file locally
      const { output_path, interval } = await encoderResponse.json();

      //grab encode interval
      encodeInterval = interval;

      //upload encoded file to R2, get back the public URL
      encodedAudioUrl = await uploadToR2(output_path, r2Key);
    }

    //add url to db
    const updateQuery = isVoice
      ? `UPDATE memories SET voice_audio_url = $1 WHERE id = $2`
      : `UPDATE memories SET encoded_audio_url = $1, encode_interval = $2 WHERE id = $3`;

    const updateParams = isVoice
      ? [encodedAudioUrl, memoryId]
      : [encodedAudioUrl, encodeInterval, memoryId];

    await pool.query(updateQuery, updateParams);

    //return the URL so frontend can play it directly from R2
    res.status(200).json({ url: encodedAudioUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

//get decoded message
memoriesRouter.get('/:id/decode', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //makes sure valid uuid input
    if (!validate(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    //get interval from db
    const dbResponse = await pool.query(
      `
      SELECT encode_interval FROM memories
      WHERE id = $1`,
      [id]
    );
    const memoryData = dbResponse.rows[0];
    const decodeInterval = memoryData.encode_interval ?? 1600; // fallback for memories made before this change

    //construct R2 key
    const r2key = `${id}_encoded.wav`;

    //pass the local temp file to Flask for decoding
    const decoderResponse = await fetch(`${process.env.FLASK_URL}/decode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wav_url: `${process.env.R2_PUBLIC_URL}/${r2key}`, //gives public url to flask so it can download from R2 directly
        interval: decodeInterval,
      }),
    });

    if (!decoderResponse.ok) {
      const errorBody = await decoderResponse.text(); //read Flask's actual error message
      console.error('Flask decode error:', errorBody);
      throw new Error(`Decoder error: ${decoderResponse.status} - ${errorBody}`);
    }

    const { decoded_message } = await decoderResponse.json();
    console.log(decoded_message);
    res.status(200).json(decoded_message);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

//get all memories (filter by emotion, year, season)
memoriesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { emotion, season, year } = req.query;

    let sqlQuery = 'SELECT * FROM memories WHERE 1=1'; //WHERE 1=1 is an always true placeholder i can keep appending AND conditions to
    const params: any[] = []; //array that contains a any type, query params are always string s or numbers
    let paramCount = 1;

    if (emotion) {
      sqlQuery += ` AND emotion = $${paramCount}`;
      params.push(emotion);
      paramCount++;
    }

    if (season) {
      sqlQuery += ` AND season = $${paramCount}`;
      params.push(season);
      paramCount++;
    }

    if (year) {
      sqlQuery += ` AND year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }

    const dbResponse = await pool.query(sqlQuery, params);
    const memoriesData = dbResponse.rows;
    res.status(200).json(memoriesData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

//get memory by id
memoriesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbResponse = await pool.query(
      `
      SELECT * 
      FROM memories
      WHERE id = $1`,
      [id]
    );

    const memoryData = dbResponse.rows[0];

    if (!memoryData) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    res.status(200).json(memoryData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

//delete memory by id
memoriesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dbResponse = await pool.query(
      `
      DELETE FROM memories 
      WHERE id = $1 
      RETURNING *;`,
      [id]
    );

    const deletedMemoryData = dbResponse.rows[0];

    if (!deletedMemoryData) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    res.status(200).json(deletedMemoryData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

//save memory data
memoriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { song_id, song_name, album_name, artist, emotion, year, memory_fragment } = req.body;
    const season = req.body.season ?? null; //season is an optional input

    const dbResponse = await pool.query(
      `
        INSERT INTO memories (song_id, song_name, album_name, artist, emotion, season, year, memory_fragment) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`,
      [song_id, song_name, album_name, artist, emotion, season || null, year, memory_fragment]
    );
    const newMemory = dbResponse.rows[0];

    res.status(201).json(newMemory);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default memoriesRouter;
