import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import type { MemoryTypes } from '../types'
import { getMemoryById } from '../services/memoriesService'
import { generateEncodedSong, decodeSong } from '../services/memoriesService'
import styles from './css/PlayMemoryPage.module.css'
import WaveSurfer from 'wavesurfer.js'

const PlayMemoryPage = () => {
  const [memory, setMemory] = useState<MemoryTypes | null>(null)
  const [encodedSongUrl, setEncodedSongUrl] = useState<string | null>(null)
  const [isEncoding, setIsEncoding] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [displayedText, setDisplayedText] = useState<string>('')
  const [voiceLayer, setVoiceLayer] =useState<boolean>(false)
  const audioContainerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const encodedCharCountRef = useRef<number | null>(null)
  const fullDecodedTextRef = useRef<string>('')
  const { id } = useParams()

  useEffect(() => {
    if (!id) return  
    getMemoryById(id)
      .then(data => setMemory(data))
  }, [id])

  useEffect(() => {
    if (!encodedSongUrl || !memory || !audioContainerRef.current) return 
    
    const waveSurfer = WaveSurfer.create({
      container: audioContainerRef.current, 
      waveColor: '#be34dacc', 
      progressColor: '#581289', 
      cursorColor: '#00ff0d66', 
      cursorWidth: 3, 
      barHeight: 0.8, 
      url: encodedSongUrl, 
      sampleRate: 48000, 
    })

    wavesurferRef.current = waveSurfer
    waveSurfer.on('play', () => setIsPlaying(true))
    waveSurfer.on('pause', () => setIsPlaying(false))
    waveSurfer.on('audioprocess', (currentTime: number) => {
      if (!encodedCharCountRef.current) return 
      const samplesPlayed = currentTime * 48000 * 2
      const bitsDecoded = samplesPlayed / 1600 //added a bit every 1600 samples 
      const charactersEncoded = Math.floor(bitsDecoded / 8)
      const ratio = fullDecodedTextRef.current.length / encodedCharCountRef.current //how long is display text compared to encoded JSON
      const charactersVisible = Math.floor(charactersEncoded * ratio)
      setDisplayedText(fullDecodedTextRef.current.slice(0, Math.floor(charactersVisible)))
    })
    
    return () => waveSurfer.destroy() //cleanup and unmount 
  }, [encodedSongUrl, memory])

  if (!memory) return null 

  const handleEncodedSong = async (memoryId: string, isVoice: boolean) => {
    try {
      setIsEncoding(true)
      // await new Promise(resolve => setTimeout(resolve, 1500)) //makes async/await sleep for a duration
      const url = await generateEncodedSong(memoryId, isVoice)
      setEncodedSongUrl(url)
      const decoded = await decodeSong(memoryId)
      const rawJson = JSON.stringify(decoded)
      const encodedCharLength = rawJson.length 
      encodedCharCountRef.current = encodedCharLength
      const fullText = `feeling: ${decoded.emotion}, ` + `season: ${decoded.season} ` + `${decoded.year}, ` + `memory: ${decoded.memory_fragment}`
      fullDecodedTextRef.current = fullText
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error' 
        console.error(message)
    } finally {
        setIsEncoding(false)
    }
  }

  const handleRefresh = () => {
    setEncodedSongUrl('')
    setIsEncoding(false)
    setIsPlaying(false)
    setDisplayedText('')
    setVoiceLayer(false)
  }

  return (
    <>
    <div className={styles["your-memory-container"]}>
      <div className={styles['title-container']}>
        <h1 className={styles['title']}>your memory</h1>
        <button className={styles['refresh-btn']} onClick={handleRefresh}>
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>
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
      {(!encodedSongUrl) && ( 
        <div className={styles['encode-btn-container']}>
          <label className={styles['toggle']}>
            <span className={styles["toggle-label"]}>secret message</span>
            <input
              type="checkbox"
              checked={voiceLayer}
              onChange={(e) => setVoiceLayer(e.target.checked)}
              className={styles["toggle-input"]}
            />
            <span className={styles["toggle-slider"]} />
            <span className={styles["toggle-label"]}>spoken message</span>
          </label>
          <button 
            className={`${styles['play-memory-page-btn']} ${styles['encode-btn']}`} 
              onClick={()=> handleEncodedSong(memory.id, voiceLayer)} >
                encode your memory
          </button>
        </div>
      )}
      {isEncoding && <p className={styles['encoding-text']}>encoding your memory...</p>}
      {encodedSongUrl && <div className={`${styles['audio-player-container']} ${isEncoding ? styles['hidden'] : ''}`} ref={audioContainerRef}></div>}
      {encodedSongUrl && !isEncoding && (
        <div>
          <p className={styles['decode-instructions']}>press play to decode your memory!</p>
          <div className={styles['button-container']}>
          <button 
            className={styles['play-song-btn']}
            onClick={() => wavesurferRef.current?.playPause()}
            >
            {isPlaying ? 'pause' : 'play'}
          </button>
          {/* <button className={styles['play-memory-page-btn']} onClick={handleRefresh}>REFRESH</button> */}
          </div>
        </div>
        )}
      {!isEncoding && !voiceLayer && encodedSongUrl && <div className={styles['decoded-msg-container']}>
        <p className={styles['decode-msg-label']}>decoded message:</p>
        <p className={styles['decoded-msg-text']}>{displayedText}</p>
      </div>}
      {/* {!isEncoding && encodedSongUrl && <button className={styles['play-memory-page-btn']} onClick={handleRefresh}>REFRESH</button>} */}
    </div> 
      {encodedSongUrl && !isEncoding && 
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