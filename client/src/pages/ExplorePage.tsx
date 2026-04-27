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

      try {
         const data = await getMemories(filters)
        setMemories(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(message)
      }

    }
    fetchMemories()
  }, [emotion, season, year])

  const renderMemories = () => {
    return memories.map((memory, index) => {
      if (index < memories.length -1) {
        return (
          <div key={memory.id}>
            <MemoryLog memory={memory} />
            <hr className={styles['log-divider']}/>
         </div>
        )
      } else {
        return (
          <div key={memory.id} >
            <MemoryLog memory={memory} />
          </div>
        )
      }
    }) 
  }

  const handleFilterReset = (filter: string) => {
    if (filter === 'emotion') setEmotion('')
    if (filter === 'season') setSeason('')
    if (filter === 'year') setYear(null)    
  }

  return (
    <>
      <div className={styles['emotion-menu-container']}>
        <EmotionMenu 
          emotion={emotion}
          setEmotion={setEmotion}
        /> 
        <button onClick={() => handleFilterReset('emotion')}>RESET</button>
      </div>
      <div className={styles['season-menu-container']}>
        <SeasonMenu 
          season={season}
          setSeason={setSeason}
        />
        <button onClick={() => handleFilterReset('season')}>RESET</button>
      </div>
      <div className={styles['year-menu-container']}>
        <YearMenu 
          year={year}
          setYear={setYear}
        />
        <button onClick={() => handleFilterReset('year')}>RESET</button>
      </div>
      {memories.length === 0 ? <p>no memories found </p> : renderMemories()}
    </>
  )
}

export default ExplorePage 


