
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Target,
  Flame,
  Award,
  History,
  Bell,
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [earnOpen, setEarnOpen] = useState(false);

  return (
    <header className={styles.header}>
      {/* TOP BRAND ROW */}
      <div className={styles.brandRow}>
        <Link to="/Lvl-Dashboard" className={styles.brand}>
          <span className={styles.logo}>V</span>
          <span>
            VELOOP <b>Rewards</b>
          </span>
        </Link>

        <div className={styles.headerActions}>
          <div className={styles.notification}>
            <Bell size={19} />
            <span className={styles.notificationDot}></span>
          </div>

          <div className={styles.profileIcon}>V</div>
        </div>
      </div>

      {/* NAVIGATION ROW */}
      <nav className={styles.nav}>
        <NavLink
          to="/Lvl-Dashboard"
          end
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          <LayoutDashboard size={16} />
          Overview
        </NavLink>

        <div className={styles.dropdown}>
          <button
            className={`${styles.navLink} ${earnOpen ? styles.active : ''}`}
            onClick={() => setEarnOpen(!earnOpen)}
            type="button"
          >
            Earn XP
            <ChevronDown
              size={15}
              className={earnOpen ? styles.rotate : ''}
            />
          </button>

          {earnOpen && (
            <div className={styles.dropdownMenu}>
              <Link
                to="/Lvl-Dashboard/missions"
                onClick={() => setEarnOpen(false)}
              >
                <Target size={16} /> Daily Missions
              </Link>

              <Link
                to="/Lvl-Dashboard/streaks"
                onClick={() => setEarnOpen(false)}
              >
                <Flame size={16} /> Streak Rewards
              </Link>
            </div>
          )}
        </div>

        <NavLink
          to="/Lvl-Dashboard/badges"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          <Award size={16} />
          Rewards & Badges
        </NavLink>

        <NavLink
          to="/Lvl-Dashboard/activity"
          className={({ isActive }) =>
            `${styles.navLink} ${isActive ? styles.active : ''}`
          }
        >
          <History size={16} />
          Activity History
        </NavLink>
      </nav>
    </header>
  );
}
