
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { BADGES, BADGE_CATEGORIES } from '../../data/badges';
import { XP_PER_LEVEL } from '../../data/levelData';
import BadgeCelebration from '../BadgeCelebration/BadgeCelebration.jsx';
import styles from './Badges.module.css';

const STORAGE_KEY = 'veloop-unlocked-badges';

const readJSON = (key, fallback = {}) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const readNum = (key) => Math.max(0, Number(localStorage.getItem(key)) || 0);

function getAchievementData() {
  const xp = readNum('veloop-total-xp');
  const streak = readJSON('veloop-streak-data', {});

  return {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    streak: Number(streak.currentStreak ?? streak.streak ?? 0),
    missions: readNum('veloop-total-missions-completed'),
    perfectWeekDays: Number(streak.bestStreak ?? streak.longestStreak ?? 0),

    // Total completed games
    gamesPlayed: readNum('veloop-games-played'),

    // Highest objects caught in a single game
    singleGameObjects: readNum('veloop-best-single-game-objects'),
  };
}

function getHistory() {
  const saved = readJSON(STORAGE_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

export default function Badges() {
  const [category, setCategory] = useState('All');
  const [stats, setStats] = useState(getAchievementData);
  const [history, setHistory] = useState(getHistory);
  const [celebration, setCelebration] = useState(null);

  const refresh = useCallback(() => {
    setStats(getAchievementData());
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('veloop-achievements-updated', refresh);

    const timer = window.setInterval(refresh, 1500);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('veloop-achievements-updated', refresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  // Automatically unlock badges when their target is reached.
  useEffect(() => {
    const known = new Set(history.map((item) => item.id));

    const newlyUnlocked = BADGES.filter(
      (badge) =>
        Number(stats[badge.key] || 0) >= badge.target &&
        !known.has(badge.id)
    );

    if (!newlyUnlocked.length) return;

    const records = newlyUnlocked.map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      category: badge.category,
      rarity: badge.rarity,
      unlockedAt: new Date().toISOString(),
    }));

    const updated = [...history, ...records];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Could not save badge history:', error);
    }

    setHistory(updated);
    setCelebration(records[0]);

    window.dispatchEvent(new Event('veloop-achievements-updated'));
  }, [stats, history]);

  const unlockedIds = useMemo(
    () => new Set(history.map((item) => item.id)),
    [history]
  );

  const visibleBadges =
    category === 'All'
      ? BADGES
      : BADGES.filter((badge) => badge.category === category);

  const unlockedCount = BADGES.filter(
    (badge) => unlockedIds.has(badge.id)
  ).length;

  const percentage = Math.round(
    (unlockedCount / BADGES.length) * 100
  );

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/Lvl-Dashboard" className={styles.backLink}>
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <span className={styles.brand}>VELOOP REWARDS</span>
      </header>

      <section className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>YOUR ACHIEVEMENTS</span>
            <h1>Badges &amp; Milestones</h1>
            <p>
              Complete challenges, unlock achievements and build your collection.
            </p>
          </div>

          <div className={styles.count}>
            <Trophy size={17} />
            {unlockedCount} / {BADGES.length} Unlocked
          </div>
        </div>

        <section className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span>Collection Progress</span>
            <strong>{percentage}%</strong>
          </div>

          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </section>

        <nav className={styles.filters} aria-label="Filter badges">
          {BADGE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? styles.activeFilter : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className={styles.grid}>
          {visibleBadges.map((badge) => {
            const Icon = badge.icon;
            const unlocked = unlockedIds.has(badge.id);

            const value = Math.min(
              Number(stats[badge.key] || 0),
              badge.target
            );

            const progress = Math.min(
              100,
              (value / badge.target) * 100
            );

            return (
              <article
                key={badge.id}
                className={`${styles.badgeCard} ${
                  unlocked ? styles.unlocked : ''
                }`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.badgeIcon}>
                    {unlocked ? (
                      <Icon size={27} />
                    ) : (
                      <span className={styles.lock}>🔒</span>
                    )}
                  </div>

                  <span
                    className={`${styles.rarity} ${
                      styles[badge.rarity.toLowerCase()]
                    }`}
                  >
                    {badge.rarity}
                  </span>
                </div>

                <span className={styles.category}>{badge.category}</span>

                <h3>{badge.title}</h3>
                <p>{badge.description}</p>

                <div className={styles.progressInfo}>
                  <span>{unlocked ? 'Completed' : 'Progress'}</span>
                  <strong>
                    {value.toLocaleString('en-IN')} /{' '}
                    {badge.target.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className={styles.badgeTrack}>
                  <div
                    className={styles.badgeFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span
                  className={
                    unlocked ? styles.unlockedLabel : styles.lockedLabel
                  }
                >
                  {unlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      {celebration && (
        <BadgeCelebration
          badge={celebration}
          onClose={() => setCelebration(null)}
        />
      )}
    </main>
  );
}
