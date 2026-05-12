import styles from './css/Song.module.css'
import type { SongSearchResult } from '../types'

interface SelectedSongTypes {
  song: SongSearchResult
  className: string 
}
 
const Song = ({ song, className }: SelectedSongTypes) => {
  return (
    <div className={styles[className]}> 
      <p>{song.song_name}</p>
      <p>{song.album_name}</p>
      <p>{song.artist}</p>
    </div>
  )
}

export default Song