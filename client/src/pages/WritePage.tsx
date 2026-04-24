import { useState } from "react"
import EmotionMenu from "../components/EmotionMenu"
import SeasonMenu from "../components/SeasonMenu"
import YearMenu from "../components/YearMenu"

const WritePage = () => {
const [emotion, setEmotion] = useState<string>('')
const [season, setSeason] = useState<string>('')
const [year, setYear] = useState<number>(2026)

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
    </>
  )
}

export default WritePage