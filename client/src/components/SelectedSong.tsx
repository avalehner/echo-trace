import styles from './css/SelectedSong.module.css'

interface SelectedSongTypes {
  songName: string 
  albumName: string
  artist: string
}

const SelectedSong = ({songName, albumName, artist}: SelectedSongTypes) => {
  return (
    <div className={styles['selected-song-result']}>
      <p>{songName}</p>
      <p>{albumName}</p>
      <p>{artist}</p>
    </div>
  )
}

export default SelectedSong