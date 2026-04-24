import styles from './css/YearMenu.module.css'

interface YearMenuProps {
  year: number, 
  setYear: (value: number) => void 
}

const YearMenu = ({year, setYear}: YearMenuProps) => {
  return(
    <div className={styles['year-menu-container']} >
      <select name='year' id='year' value={year} onChange={(e) => setYear(Number(e.target.value))}> {/*e.target.value is always a string*/}
        <option value='0' disabled>select a year</option>
          {Array.from({ length: 77 }, (_, i) => 2026 - i).map(year => ( //Array.from() creates an array using the first param given, second param is a map function that transforms the array as it builds it 
            <option key={year} value={year}>{year}</option>
          ))}
      </select>
    </div>
  )
}

export default YearMenu