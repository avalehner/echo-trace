import { useState } from "react"
import { useNavigate } from "react-router"
import EmotionMenu from "../components/EmotionMenu"
import SeasonMenu from "../components/SeasonMenu"
import YearMenu from "../components/YearMenu"
import styles from './css/WritePage.module.css'
import { searchSongs } from "../services/spotifyService" 
import { createMemory } from "../services/memoriesService"
import type { SearchResult, MemoryTypes } from "../types"

const WritePage = () => {
const navigate = useNavigate()
const [searchQuery, setSearchQuery] = useState<string>('')
const [searchResults, setSearchResults] = useState<SearchResult[]>([])
const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null)
const [emotion, setEmotion] = useState<string>('')
const [season, setSeason] = useState<string>('')
const [memoryFragment, setMemoryFragement] = useState<string>('')
const [year, setYear] = useState<number | null >(null)
const [searching, setSearching] = useState<boolean>(false)
// const [searchingMessage, setSearchingMessage] = useState<string>('')
const [submitting, setSubmitting] = useState<boolean>(false)
const [submittingMessage, setSubmmittingMessage] = useState<string>('')
const [submittedMemory, setSubmittedMemory] = useState<MemoryTypes | null>(null)

const getSongs = async () => {
  setSearching(true)
  try {
    const songs = await searchSongs(searchQuery)
    setSearchResults(songs)
    console.log('found songs :)')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(message)
  } finally {
    setSearching(false)
  }
}

const handleSelectedSong = (song: SearchResult) => {
  setSelectedSong(song)
  setSearchResults([])
}

const renderSongs = (searchResult: SearchResult[]) => {
  return searchResult.map((songResult)=> (
    <div key={songResult.song_id} className={styles['song-result']} onClick={()=> handleSelectedSong(songResult)}>
      <p>{songResult.song_name}</p>
      <p>{songResult.album_name}</p>
      <p>{songResult.artist}</p>
    </div>
    )
  )
}

const submitMemory = async () => {
  if(!selectedSong || !year || !emotion || !season) return
  setSubmitting(true)

  const memoryRequestObj = {
    song_id: selectedSong.song_id, 
    song_name: selectedSong.song_name, 
    album_name: selectedSong.album_name, 
    artist: selectedSong.artist, 
    emotion: emotion, 
    season: season,
    year: year, 
    memory_fragment: memoryFragment 
  }

  try {
    const newMemory = await createMemory(memoryRequestObj)
    setSubmittedMemory(newMemory)
    setSubmmittingMessage('memory saved :)')
    handleRefresh()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error submitting memory'
    setSubmmittingMessage(message)
  } finally {
    setSubmitting(false)
  }
}

const handleRefresh = () => {
  setSearchQuery('')
  setSearchResults([])
  setSelectedSong(null)
  setEmotion('')
  setSeason('')
  setYear(null)
  setMemoryFragement('')
  // setSearchingMessage('')
  setSubmmittingMessage('')
}

  return (
    <>
      <h1 className={styles['title']}>echo-trace</h1>
      <div className={styles['data-input-container']}>
        <div className={styles['search-container']}>
          <input 
            className={styles['text-input']}
            type="text"
            placeholder="enter title or artist"
            value={searchQuery}
            onChange={(e)=> setSearchQuery(e.target.value)}
          />
          <button className={styles['write-page-btn']} onClick={getSongs}>{searching ? 'searching...' : 'SEARCH'}</button>
        </div>
        {searchResults.length > 0 && 
          <div className={styles['refresh-btn-container']} >
            <button 
              className={styles['write-page-btn']} 
              onClick={()=> handleRefresh()}>
                REFRESH
            </button>
          </div>}
        {/* {searchingMessage && <p>{searchingMessage}</p>} */}
        <div className={selectedSong ? styles['selected-song-container'] : styles['song-results-container']}>
          {selectedSong ? (
            <div className={styles['selected-song-result']}>
              <p>{selectedSong.song_name}</p>
              <p>{selectedSong.album_name}</p>
              <p>{selectedSong.artist}</p>
            </div>)  
            : (renderSongs(searchResults))}
        </div>
        <div className={styles['emotion-menu-container']}>
          <p>listening to this song made me feel</p>
          <EmotionMenu 
            emotion={emotion}
            setEmotion={setEmotion}
          />
        </div>
        <div className={styles['season-menu-container']}>
          <p>this song reminds me of</p>
          <SeasonMenu 
            season={season}
            setSeason={setSeason}
          />
          <YearMenu 
            year={year}
            setYear={setYear}
          />
        </div>
        <div className={styles['memory-input-container']}>
          <input 
            className={styles['text-input']}
            type="text"
            placeholder="enter a memory"
            value={memoryFragment}
            onChange={(e)=> setMemoryFragement(e.target.value)}
          />
        </div>
        <div className={styles['submit-btn-container']}>
          <button className={styles['submit-btn']} onClick={submitMemory}>{submitting ? 'submitting': 'SUBMIT'}</button>
        </div>
      </div>
      {submittingMessage && <p>{submittingMessage}</p>}
      {submittedMemory && (
        <div className={styles['after-submit-btns-container']}>
          <button className={styles['write-page-btn']} onClick={() => navigate(`/listen/${submittedMemory.id}`)}>listen to your memory</button>
          <button className={styles['write-page-btn']} onClick={()=> {
            setSubmittedMemory(null)
            handleRefresh()
          }}>
            submit another memory
          </button>
        </div>
      )}
    </>
  )
}

export default WritePage