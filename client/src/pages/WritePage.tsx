import EmotionMenu from "../components/EmotionMenu"
import SeasonMenu from "../components/SeasonMenu"

const WritePage = () => {
  return (
    <>
      <input 
        type="text"
        placeholder="enter title or artist"
      />
      <input 
        type="text"
        placeholder="enter a month"
      />
      <input 
        type="text"
        placeholder="enter a memory"
      />
      <EmotionMenu />
      <SeasonMenu />
    </>
  )
}

export default WritePage