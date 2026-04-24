import { useState } from "react"
import EmotionMenu from "../components/EmotionMenu"
import SeasonMenu from "../components/SeasonMenu"
import YearMenu from "../components/YearMenu"
import styles from './css/WritePage.module.css'
import { getAllMemories, getMemoryByEmotion, createMemory } from "../services/memoriesService"

const WritePage = () => {
const [emotion, setEmotion] = useState<string>('')
const [song, setSong] = useState<string>('')
const [artist, setArtist] =useState<string>('')
const [season, setSeason] = useState<string>('')
const [memoryFragment, setMemoryFragement] = useState<string>('')
const [year, setYear] = useState<number>(2026)
const [submitting, setSubmitting] = useState<boolean>(false)
const [submittingMessage, setSubmmittingMessage] = useState<string>('')

const submitMemory = () => {
  setSubmitting(true)

  const memoryRequestObj = {
    
  }
}

  return (
    <>
      <input 
        type="text"
        placeholder="enter title or artist"
      />
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
      />
      <button className={styles['submission-btn']}>{submitting ? 'submitting': 'SUBMIT'}</button>
      {submittingMessage && <p>{submittingMessage}</p>}
    </>
  )
}

export default WritePage