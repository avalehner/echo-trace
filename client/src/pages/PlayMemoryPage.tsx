import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import type { MemoryTypes, DecodedMemoryTypes } from '../types'
import { getMemoryById } from '../services/memoriesService'
// import MemoryLog from '../components/MemoryLog'
import { generateEncodedSong, decodeSong } from '../services/memoriesService'
import styles from './css/PlayMemoryPage.module.css'

const PlayMemoryPage = () => {
  const [memory, setMemory] = useState<MemoryTypes | null>(null)
  const [encodedSongUrl, setEncodedSongUrl] = useState<string | null>(null)
  const [isEncoding, setIsEncoding] = useState<boolean>(false)
  const [isDecoding, setIsDecoding] = useState<boolean>(false)
  const [decodedMemory, setDecodedMemory] = useState<DecodedMemoryTypes | null>(null)
  const [displayedText, setDisplayedText] = useState<string>('')
  const [fullDecodedText, setFullDecodedText] = useState<string>('')
  const [encodedCharCount, setEncodedCharCount] = useState<number | null>(null)

  const { id } = useParams()

  useEffect(() => {
    if (!id) return  
    getMemoryById(id)
      .then(data => setMemory(data))
  }, [id])

  if (!memory) return null 

  const handleEncodedSong = async (memoryId: string) => {
    try {
      setIsEncoding(true)
      await new Promise(resolve => setTimeout(resolve, 2000)) //makes async/await sleep for a duration
      const url = await generateEncodedSong(memoryId)
      setEncodedSongUrl(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error' 
      console.error(message)
    } finally {
      setIsEncoding(false)
    }
  }

  const handleDecodeMessage = async (memoryId: string) => {
    try {
      setIsDecoding(true)
      // await new Promise(resolve => setTimeout(resolve, 5000)) //makes async/await sleep for a duration
      const decoded = await decodeSong(memoryId)
      const rawJson = JSON.stringify(decoded)
      const encodedCharLength = rawJson.length 
      console.log('decoded', decoded)
      setDecodedMemory(decoded)
      setEncodedCharCount(encodedCharLength)
      const fullText = `emotion: ${decoded.emotion}, ` + `season: ${decoded.season} ` + `${decoded.year}, ` + `memory: ${decoded.memory_fragment}`
      setFullDecodedText(fullText)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      console.error(message)
    } finally {
      setIsDecoding(false)
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => { //type for event on audio element 
    if (!encodedCharCount) return 
    const currentTime = (e.target as HTMLAudioElement).currentTime //in seconds 
    const samplesPlayed = currentTime * 48000 * 2
    const bitsDecoded = samplesPlayed / 1600 //added a bit every 1600 samples 
    const charactersEncoded = Math.floor(bitsDecoded / 8)
    const ratio = fullDecodedText.length / encodedCharCount //how long is display text compared to encoded JSON
    const charactersVisible = Math.floor(charactersEncoded * ratio)
    setDisplayedText(fullDecodedText.slice(0, Math.floor(charactersVisible)))
  }

  return (
    <div>
      <div className={styles['song-info-container']}>
        <div className={styles['song-item-container']}>
          <p>memory id:</p>
          <p>{memory.id}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>song name:</p>
          <p>{memory.song_name}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>album:</p>
          <p>{memory.album_name}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>artist:</p>
          <p>{memory.artist}</p>
        </div>
      </div>
      <div className={styles['encode-btn-container']}>
        {!encodedSongUrl &&(
        <button className={styles['play-memory-page-btn']} onClick={()=> handleEncodedSong(memory.id)} >encode your memory</button>)}
      </div>
      {isEncoding && <p className={styles['encoding-text']}>encoding your memory...</p>}
      {encodedSongUrl && (
        <div className={styles['audio-player-container']}>
          {/* The ontimeupdate event occurs when the play time of a media changes. The ontimeupdate event occurs while the media is playing.The ontimeupdate event occurs when the user moves the play position. */}
          <audio 
            controls src={encodedSongUrl} 
            onPlay={() =>!decodedMemory && handleDecodeMessage(memory.id)}
            onTimeUpdate={handleTimeUpdate}/>
        </div>
      )}
      {encodedSongUrl && !decodedMemory && !isDecoding && <p className={styles['decode-instructions']}>press play to decode your memory!</p>}
      {decodedMemory && <div className={styles['decoded-msg-container']}>
        <p className={styles['decode-msg-label']}>decoded message:</p>
        <p className={styles['decoded-msg-text']}>{displayedText}</p>
      </div>}
      {encodedSongUrl && 
        <div className={styles['download-link-container']}>
          <a 
          className={styles['download-link']}
          href={encodedSongUrl} 
          download={`memory-${id}.wav`}>
            click to download encoded song
          </a>
        </div>}
    </div> 
  )
}

export default PlayMemoryPage