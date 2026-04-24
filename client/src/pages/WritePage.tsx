import { useState } from "react"
import EmotionMenu from "../components/EmotionMenu"
import SeasonMenu from "../components/SeasonMenu"
import YearMenu from "../components/YearMenu"
import styles from './css/WritePage.module.css'
import { searchSongs } from "../services/spotifyService" 
import type { SearchResult } from "../types"
// import { getAllMemories, getMemoryByEmotion, createMemory } from "../services/memoriesService"

const WritePage = () => {
const [searchQuery, setSearchQuery] = useState<string>('')
const [searchResults, setSearchResults] = useState<SearchResult[]>([])
const [emotion, setEmotion] = useState<string>('')
const [season, setSeason] = useState<string>('')
const [memoryFragment, setMemoryFragement] = useState<string>('')
const [year, setYear] = useState<number>(2026)
const [searching, setSearching] = useState<boolean>(false)
const [searchingMessage, setSearchingMessage] = useState<string>('')
const [submitting, setSubmitting] = useState<boolean>(false)
const [submittingMessage, setSubmmittingMessage] = useState<string>('')

const getSongs = async () => {
  setSearching(true)
  try {
    const songs = await searchSongs(searchQuery)
    setSearchResults(songs)
    setSearchingMessage('found songs :)')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    setSearchingMessage(message)
  } finally {
    setSearching(false)
  }
}

const renderSongs = (searchResult: SearchResult[]) => {
  return searchResult.map((result)=> {
    return (
      <>
        <div className={styles['song-result']}>
          <p>{result.song_name}</p>
          <p>{result.album_name}</p>
          <p>{result.artist}</p>
        </div>
      </>
    )
  })
}

// const submitMemory = () => {
//   setSubmitting(true)

//   const memoryRequestObj = {
    
//   }
// }

console.log(searchResults)

  return (
    <>
      <input 
        type="text"
        placeholder="enter title or artist"
        value={searchQuery}
        onChange={(e)=> setSearchQuery(e.target.value)}
      />
      <button className={styles['search-btn']} onClick={getSongs}>{searching ? 'searching...' : 'SEARCH'}</button>
      {searchingMessage && <p>{searchingMessage}</p>}
      <div className={styles['song-result-container']}>{renderSongs(searchResults)}</div>
      <p>listening to this song made me feel:</p>
      <EmotionMenu 
        emotion={emotion}
        setEmotion={setEmotion}
      />
      <p>this song reminds me of: </p>
      <SeasonMenu 
        season={season}
        setSeason={setSeason}
      />
     <YearMenu 
        year={year}
        setYear={setYear}
     />
      <input 
        type="text"
        placeholder="enter a memory"
        value={memoryFragment}
        onChange={(e)=> setMemoryFragement(e.target.value)}
      />
      <button className={styles['submission-btn']}>{submitting ? 'submitting': 'SUBMIT'}</button>
      {submittingMessage && <p>{submittingMessage}</p>}
    </>
  )
}

export default WritePage