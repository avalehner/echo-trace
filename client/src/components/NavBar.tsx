import styles from './css/NavBar.module.css'
import { NavLink } from 'react-router'

const NavBar = () => {
  return (
    <nav className={styles['nav-bar']}>
      <li><NavLink to="">ENTER MEMORY</NavLink></li>
      <li><NavLink to="/explore">VIEW ALL MEMORIES</NavLink></li>
    </nav>
  )
}

export default NavBar