import type { MemoryTypes } from '../types'
import styles from './css/MemoryLog.module.css'

interface MemoryLogProps {
  memory: MemoryTypes
}

const MemoryLog = ({ memory }: MemoryLogProps ) => {
  return (
    <div className={styles['memory-log-container']}>
      <p>song name:</p>
      <p>{memory.song_name}</p>
      <p>artist:</p>
      <p>{memory.artist}</p>
      <p>emotion:</p>
      <p>{memory.emotion}</p>
      <p>season:</p>
      <p>{memory.season}</p>
      <p>year:</p>
      <p>{memory.year}</p>
      <p>memory:</p>
      <p>{memory.memory_fragment}</p>
    </div>
  )
}

export default MemoryLog