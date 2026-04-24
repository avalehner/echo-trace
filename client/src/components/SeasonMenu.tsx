import styles from './css/SeasonMenu.module.css'

interface SeasonMenuProps{
  season: string
  setSeason: (value:string) => void
}


const SeasonMenu = ({season, setSeason}: SeasonMenuProps) => {
  return (
    <div className={styles['emotion-menu-container']}>
      <select className={styles['emotion-menu']} value={season} onChange={() => setSeason}>
        <option value="spring">spring</option>
        <option value="summer">summer</option>
        <option value="fall">fall</option>
        <option value="winter">winter</option>
      </select>
    </div>
  )
}

export default SeasonMenu