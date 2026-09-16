import { useState } from 'react';
import styles from './css/NavBar.module.css';
import { Link, NavLink } from 'react-router';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={styles['nav-bar']}>
      <div className={styles['mobile-nav-header']}>
        <Link className={styles['brand']} to="/" onClick={closeMenu}>
          EchoTrace
        </Link>
        <button
          className={`${styles['menu-toggle']} ${menuOpen ? styles['menu-toggle-open'] : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <ul id="primary-navigation" className={menuOpen ? styles['menu-open'] : undefined}>
        <li>
          <NavLink to="/" onClick={closeMenu}>
            ENTER MEMORY
          </NavLink>
        </li>
        <li>
          <NavLink to="/explore" onClick={closeMenu}>
            VIEW ALL MEMORIES
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" onClick={closeMenu}>
            ABOUT
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
