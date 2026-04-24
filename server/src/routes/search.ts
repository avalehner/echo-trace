import { Router, Request, Response } from "express"
import type { SpotifyTrack, TrackResult } from "../types"

const searchRouter = Router()

//helpers
const getAccessToken = async () => {
  const spotifyResponse = await fetch (`https://accounts.spotify.com/api/token`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Authorization': 'Basic ' + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64')
    }, 
    body: 'grant_type=client_credentials'
  }) 

  const data = await spotifyResponse.json()
  return data.access_token
}

//routes
searchRouter.get('/', async (req:Request, res: Response) => {

  try {
    const song = req.query.q
    const accessToken = await getAccessToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(song as string)}&type=track&limit=5`, {
        headers: {Authorization: `Bearer ${accessToken}` }
      }
    )

    const songData = await response.json()
    const songs = songData.tracks.items.map((song: SpotifyTrack): TrackResult => ({
      song_id: song.id, 
      song_name: song.name, 
      artist: song.artists[0].name, 
      album_name: song.album.name, 
      album_art: song.album.images[0].url 
    }))

    res.status(200)
      .json(songs)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500)
      .json({ error: message })
  }
})

export default searchRouter