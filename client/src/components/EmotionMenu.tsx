import styles from './css/EmotionMenu.module.css'

const EmotionMenu = () => {
  return (
    <div className={styles['emotion-menu-container']}>
      <select className={styles['emotion-menu']}>
        <option value="excited">excited</option>
        <option value="nostalgic">nostalgic</option>
        <option value="heartbroken">heartbroken</option>
        <option value="in-love">in love</option>
        <option value="melancholic">melancholic</option>
        <option value="anxious">anxious</option>
        <option value="peaceful">peaceful</option>
        <option value="lonely">lonely</option>
        <option value="bittersweet">bittersweet</option>
        <option value="angry">angry</option>
        <option value="depressed">depressed</option>
      </select>
    </div>
  )
}

export default EmotionMenu