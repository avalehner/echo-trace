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
      console.log('decoded', decoded)
      setDecodedMemory(decoded)
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
    const currentTime = (e.target as HTMLAudioElement).currentTime //in seconds 
    const samplesPlayed = currentTime * 44100
    const bitsDecoded = samplesPlayed / 800 //added a bit every 800 samples 
    const charactersVisible = bitsDecoded / 8 //each character is 8 bits
    setDisplayedText(fullDecodedText.slice(0, Math.floor(charactersVisible)))
  }

  // const handleRevealText = (memoryText: string) => {
  //   let i = 0 
  //   const interval = setInterval(() => { //setInterval() built in browser web API, returns an id 
  //     setDisplayedText(memoryText.slice(0, i + 1))
  //     i++
  //     if (i >= memoryText.length) clearInterval(interval)
  //   }, 150)
  // }

  return (
    <div>
      <div className={styles['id-container']}>
        <p>memory id:</p>
        <p>{memory.id}</p>
      </div>
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
      {!encodedSongUrl &&(
        <button onClick={()=> handleEncodedSong(memory.id)} >encode your memory</button>)}
      {isEncoding && <p>encoding your memory...</p>}
      {encodedSongUrl && (
        <div>
          {/* The ontimeupdate event occurs when the play time of a media changes. The ontimeupdate event occurs while the media is playing.The ontimeupdate event occurs when the user moves the play position. */}
          <audio 
            controls src={encodedSongUrl} 
            onPlay={() =>!decodedMemory && handleDecodeMessage(memory.id)}
            onTimeUpdate={handleTimeUpdate}/>
          <a href={encodedSongUrl} download={`memory-${id}.wav`}>download encoded song</a>
        </div>
      )}
      {encodedSongUrl && !decodedMemory && !isDecoding && <p>press play to decode your memory!</p>}
      {decodedMemory && <p>decoded message:</p>}
      {decodedMemory && <p>{displayedText}</p>}
    </div> 
  )
}

export default PlayMemoryPage