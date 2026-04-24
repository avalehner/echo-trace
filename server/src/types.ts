export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string, name: string}[]
  album: {
    name: string
    images: {url: string, width: number, height: number}[]
  }
}

export interface TrackResult {
  song_id: string 
  song_name: string
  artist: string 
  album_name: string
  album_art: string 
}