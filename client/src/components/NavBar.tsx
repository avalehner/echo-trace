import styles from './css/NavBar.module.css'
import { NavLink } from 'react-router'

const NavBar = () => {
  return (
    <nav className={styles['nav-bar']}>
      <ul>
        <li><NavLink to="/">ENTER MEMORY</NavLink></li>
        <li><NavLink to="/explore">VIEW ALL MEMORIES</NavLink></li>
      </ul>
    </nav>
  )
}

export default NavBar