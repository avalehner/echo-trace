import { useState, useEffect } from 'react'
import { getMemories } from '../services/memoriesService'
import type { MemoryTypes, MemoryFiltersTypes } from '../types'
import SeasonMenu from '../components/SeasonMenu'
import YearMenu from '../components/YearMenu'
import EmotionMenu from '../components/EmotionMenu'
import MemoryLog from '../components/MemoryLog'
import styles from './css/ExplorePage.module.css'

const ExplorePage = () => {
  const [memories, setMemories] = useState<MemoryTypes[]>([])
  const [emotion, setEmotion] = useState<string>('')
  const [season, setSeason] = useState<string>('')
  const [year, setYear] = useState<number | null>(null)
  
  useEffect(() => {
    const fetchMemories = async () => {
      const filters: MemoryFiltersTypes = {}
      if (emotion) filters.emotion = emotion
      if (season) filters.season = season
      if (year) filters.year = year

      const data = await getMemories(filters)
      setMemories(data)
    }
    fetchMemories()
  }, [emotion, season, year])

  const renderMemories = () => {
    memories.map((memory, index) => {
      if (index < memories.length -1) {
        return (
          <>
            <MemoryLog memory={memory} />
            <hr className={styles['log-divider']}/>
          </>
        )
      } else {
        return (
          <MemoryLog memory={memory} />
        )
      }
    }) 
  }

  return (
    <>
      <EmotionMenu 
          emotion={emotion}
          setEmotion={setEmotion}
        /> 
      <SeasonMenu 
        season={season}
        setSeason={setSeason}
      />
      <YearMenu 
        year={year}
        setYear={setYear}
      />
      {renderMemories()}
    </>
  )
}

export default ExplorePage 


