
import { useCallback, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Target,
  Flame,
  Award,
  History,
  Bell,
  CircleHelp,
  PlayCircle,
} from 'lucide-react';

import Notifications from '../Notifications/Notifications';
import HelpGuide from '../HelpGuide/HelpGuide';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [earnOpen, setEarnOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleUnreadChange = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <Link to="/Lvl-Dashboard" className={styles.brand}>
          <span className={styles.logo}>V</span>
          <span>
            VELOOP <b>Rewards</b>
          </span>
        </Link>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.notification}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setHelpOpen(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notificationsOpen}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className={styles.notificationDot}></span>
            )}
          </button>

          <button
            type="button"
            className={styles.notification}
            onClick={() => {
              setHelpOpen(true);
              setNotificationsOpen(false);
            }}
            aria-label="Help guide"
          >
            <CircleHelp size={19} />
          </button>

          <div className={styles.profileIcon}>V</div>
        </div>
      </div>

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
            aria-expanded={earnOpen}
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
                to="/Lvl-Dashboard/watch-earn"
                onClick={() => setEarnOpen(false)}
              >
                <PlayCircle size={16} /> Watch & Earn
              </Link>

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

      <Notifications
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadChange={handleUnreadChange}
      />

      <HelpGuide
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </header>
  );
}
