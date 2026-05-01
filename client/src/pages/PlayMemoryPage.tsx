import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import type { MemoryTypes, DecodedMemoryTypes } from '../types'
import { getMemoryById } from '../services/memoriesService'
// import MemoryLog from '../components/MemoryLog'
import { generateEncodedSong, decodeSong } from '../services/memoriesService'
import styles from './css/PlayMemoryPage.module.css'
// import WaveSurfer from 'wavesurfer.js'

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
      await new Promise(resolve => setTimeout(resolve, 1500)) //makes async/await sleep for a duration
      const url = await generateEncodedSong(memoryId)
      setEncodedSongUrl(url)
      handleDecodeMessage(memoryId)
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
      const decoded = await decodeSong(memoryId)
      const rawJson = JSON.stringify(decoded)
      const encodedCharLength = rawJson.length 
      console.log('decoded', decoded)
      setDecodedMemory(decoded)
      setEncodedCharCount(encodedCharLength)
      const fullText = `feeling: ${decoded.emotion}, ` + `season: ${decoded.season} ` + `${decoded.year}, ` + `memory: ${decoded.memory_fragment}`
      setFullDecodedText(fullText)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Error'
      console.error(message)
    } finally {
      setIsDecoding(false)
    }
  }

  // useEffect(() => {
  //   if (!encodedSongUrl) return 
  //   if (!memory) return 
    
  //   const waveSurfer = WaveSurfer.create({
  //     container: '#waveform', 
  //     waveColor: '#4f4A85', 
  //     progressColor: '#383351', 
  //     url: encodedSongUrl, 
  //     sampleRate: 48000, 
  //   })

  //   waveSurfer.on('play', () => !decodedMemory && handleDecodeMessage(memory.id))
  //   waveSurfer.on('audioprocess', (currentTime: number) => {
  //     //handleTimeUpdate logic
  //   })
    
  //   return () => waveSurfer.destroy() //cleanup and unmount 
  // }, [encodedSongUrl])

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
    <>
    <div className={styles["your-memory-container"]}>
      <h1 className={styles['title']}>your memory</h1>
      <div className={styles['song-info-container']}>
        <div className={styles['song-item-container']}>
          <p>memory id:</p>
          <p className={styles['memory-id']}>{memory.id}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>song name:</p>
          <p className={styles['song-name']}>{memory.song_name}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>album:</p>
          <p className={styles['album-name']}>{memory.album_name}</p>
        </div>
        <div className={styles['song-item-container']}>
          <p>artist:</p>
          <p className={styles['artist']}>{memory.artist}</p>
        </div>
      </div>
      {!encodedSongUrl &&(
      <button className={`${styles['play-memory-page-btn']} ${styles['encode-btn']}`} onClick={()=> handleEncodedSong(memory.id)} >encode your memory</button>)}
      {isEncoding && <p className={styles['encoding-text']}>encoding your memory...</p>}
      {encodedSongUrl && !decodedMemory && !isDecoding && <p className={styles['decode-instructions']}>press play to decode your memory!</p>}
      {encodedSongUrl && (
        <div className={styles['audio-player-container']}>
          {/* The ontimeupdate event occurs when the play time of a media changes. The ontimeupdate event occurs while the media is playing.The ontimeupdate event occurs when the user moves the play position. */}
          <audio 
            className={styles['audio-player']}
            controls src={encodedSongUrl} 
            onPlay={() =>!decodedMemory && handleDecodeMessage(memory.id)}
            onTimeUpdate={handleTimeUpdate}/>
          {/* {wavesurfer} */}
          <div className={styles['decoded-msg-container']}>
            <p className={styles['decode-msg-label']}>decoded message:</p>
            <p className={styles['decoded-msg-text']}>{displayedText}</p>
          </div>
        </div>
      )}
    </div> 
      {encodedSongUrl && 
        <button className={styles['download-link-btn']}>
          <a 
          className={styles['download-link']}
          href={encodedSongUrl} 
          download={`memory-${id}.wav`}>
            click to download encoded song
          </a>
        </button>}
    </>
  )
}

export default PlayMemoryPage