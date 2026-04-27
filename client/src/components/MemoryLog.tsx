import type { MemoryTypes } from '../types'
import styles from './css/MemoryLog.module.css'
import { useNavigate } from 'react-router'

interface MemoryLogProps {
  memory: MemoryTypes
}

const MemoryLog = ({ memory }: MemoryLogProps ) => {
const navigate = useNavigate()

  return (
    <div className={styles['memory-log-container']} onClick={() => navigate(`/listen/${memory.id}`)}>
      <div className={styles['song-container']}>
        <p>song name:</p>
        <p>{memory.song_name}</p>
      </div>
      <div className={styles['album-container']}>
        <p>album:</p>
        <p>{memory.album_name}</p>
      </div>
      <div className={styles['artist-container']}>
        <p>artist:</p>
        <p>{memory.artist}</p>
      </div>
      <div className={styles['emotion-container']}>
        <p>emotion:</p>
        <p>{memory.emotion}</p>
      </div>
      <div className={styles['season-container']}>
        <p>season:</p>
        <p>{memory.season}</p>
      </div>
      <div className={styles['year-container']}>
        <p>year:</p>
        <p>{memory.year}</p>
      </div>
      <div className={styles['memory-fragment-container']}>
        <p>memory:</p>
        <p>{memory.memory_fragment}</p>
      </div>
    </div>
  )
}

export default MemoryLog