import styles from './css/EmotionMenu.module.css'

interface EmotionMenuProps {
  emotion: string, 
  setEmotion: (value: string) => void 
}

const EmotionMenu = ({ emotion, setEmotion}: EmotionMenuProps) => {
  return (
    <div className={styles['emotion-menu-container']}>
      <select className={styles['emotion-menu']} value={emotion} onChange={(e)=> setEmotion(e.target.value)}>
        <option value="" disabled>select emotion</option>
        <option value="excited">excited</option>
        <option value="wonder">wonder</option>
        <option value="euphoria">euphoria</option>
        <option value="sentimental">sentimental</option>
        <option value="nostalgic">nostalgic</option>
        <option value="heartbroken">heartbroken</option>
        <option value="longing">longing</option>
        <option value="in-love">in love</option>
        <option value="melancholic">melancholic</option>
        <option value="anxious">anxious</option>
        <option value="peaceful">peaceful</option>
        <option value="lonely">lonely</option>
        <option value="bittersweet">bittersweet</option>
        <option value="anger">anger</option>
        <option value="depressed">depressed</option>
      </select>
    </div>
  )
}

export default EmotionMenu