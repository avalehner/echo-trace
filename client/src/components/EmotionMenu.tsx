import styles from './css/EmotionMenu.module.css'

interface EmotionMenuProps {
  emotion: string, 
  setEmotion: (value: string) => void 
}

const EmotionMenu = ({ emotion, setEmotion}: EmotionMenuProps) => {
  return (
    <div className={styles['emotion-menu-container']}>
      <select className={styles['emotion-menu']} value={emotion} onChange={(e)=> setEmotion(e.target.value)}>
        <option value="" disabled>select feeling</option>
        <option value="excited">excited</option>
        <option value="desperate">desperate</option>
        <option value="ethereal">ethereal</option>
        <option value="daring">daring</option>
        <option value="warm">warm</option>
        <option value="wonder">wonder</option>
        <option value="euphoria">euphoria</option>
        <option value="sentimental">sentimental</option>
        <option value="triumphant">triumphant</option>
        <option value="determined">determined</option>
        <option value="nostalgic">nostalgic</option>
        <option value="heartbroken">heartbroken</option>
        <option value="longing">longing</option>
        <option value="in-love">in love</option>
        <option value="locked-in">locked in</option>
        <option value="melancholic">melancholic</option>
        <option value="anxious">anxious</option>
        <option value="peaceful">peaceful</option>
        <option value="lonely">lonely</option>
        <option value="bittersweet">bittersweet</option>
        <option value="anger">anger</option>
        <option value="dancy">dancy</option>
        <option value="dirty">dirty</option>
        <option value="depressed">depressed</option>
      </select>
    </div>
  )
}

export default EmotionMenu