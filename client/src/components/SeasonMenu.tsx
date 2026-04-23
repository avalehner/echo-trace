import styles from './css/SeasonMenu.module.css'

const SeasonMenu = () => {
  return (
    <div className={styles['emotion-menu-container']}>
      <select className={styles['emotion-menu']}>
        <option value="spring">spring</option>
        <option value="summer">summer</option>
        <option value="fall">fall</option>
        <option value="winter">winter</option>
      </select>
    </div>
  )
}

export default SeasonMenu