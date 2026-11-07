
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  LockKeyhole,
  Sparkles,
  Zap,
  Flame,
  Target,
  Gamepad2,
  Crown,
  Medal,
  ShieldCheck,
} from 'lucide-react';

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
  const missionStreak = readJSON('veloop-mission-streak-data', {});

  return {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    streak: Number(streak.currentStreak ?? streak.streak ?? 0),
    missions: readNum('veloop-total-missions-completed'),
    perfectWeekDays: Number(missionStreak.bestStreak || 0),
    gamesPlayed: readNum('veloop-games-played'),
    singleGameObjects: readNum('veloop-best-single-game-objects'),
  };
}

function getHistory() {
  const saved = readJSON(STORAGE_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

const statItems = [
  { key: 'xp', label: 'Total XP', icon: Zap, color: 'gold' },
  { key: 'level', label: 'Player Level', icon: Crown, color: 'purple' },
  { key: 'streak', label: 'Day Streak', icon: Flame, color: 'orange' },
  { key: 'missions', label: 'Missions', icon: Target, color: 'cyan' },
  { key: 'gamesPlayed', label: 'Games Played', icon: Gamepad2, color: 'pink' },
];

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

  const percentage = BADGES.length
    ? Math.round((unlockedCount / BADGES.length) * 100)
    : 0;

  const getRarityClass = (rarity) => {
    const key = String(rarity || 'common').toLowerCase();
    return styles[key] || styles.common;
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} />
      <div className={styles.ambientGold} />
      <div className={styles.ambientPurple} />

      <header className={styles.topbar}>
        <Link to="/Lvl-Dashboard" className={styles.backLink}>
          <ArrowLeft size={17} />
          <span>Return to Dashboard</span>
        </Link>

        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <Crown size={17} />
          </span>
          VELOOP <span>REWARDS</span>
        </div>

        <div className={styles.topbarStatus}>
          <span className={styles.statusDot} />
          PLAYER PROFILE
        </div>
      </header>

      <section className={styles.container}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={14} />
              THE ACHIEVEMENT VAULT
            </div>

            <h1>
              Prove Your <span>Legend.</span>
            </h1>

            <p>
              Every challenge tells a story. Every achievement earns its place.
              Build your legacy and collect them all.
            </p>

            <div className={styles.heroMeta}>
              <div className={styles.playerLevel}>
                <Crown size={16} />
                LEVEL {stats.level}
              </div>
              <span className={styles.heroDivider} />
              <span className={styles.playerName}>VELOOPER</span>
            </div>
          </div>

          <div className={styles.heroTrophy}>
            <div className={`${styles.trophyOrbit} ${styles.trophyOrbitOne}`} />
            <div className={`${styles.trophyOrbit} ${styles.trophyOrbitTwo}`} />
            <div className={styles.trophyGlow} />
            <div className={styles.trophyCore}>
              <Trophy size={65} strokeWidth={1.3} />
            </div>
            <Sparkles className={styles.trophySparkleOne} size={19} />
            <Sparkles className={styles.trophySparkleTwo} size={14} />
            <span className={styles.trophyCaption}>YOUR LEGACY</span>
          </div>
        </section>

        {/* PLAYER STATS */}
        <section className={styles.statsGrid}>
          {statItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.key}
                className={`${styles.statCard} ${styles[item.color]}`}
              >
                <div className={styles.statIcon}>
                  <Icon size={19} />
                </div>
                <div>
                  <span className={styles.statLabel}>{item.label}</span>
                  <strong className={styles.statValue}>
                    {Number(stats[item.key] || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </article>
            );
          })}
        </section>

        {/* COLLECTION PROGRESS */}
        <section className={styles.collectionCard}>
          <div className={styles.collectionTop}>
            <div className={styles.collectionTitle}>
              <div className={styles.collectionIcon}>
                <Medal size={21} />
              </div>
              <div>
                <span className={styles.smallLabel}>YOUR COLLECTION</span>
                <h2>Achievement Progress</h2>
              </div>
            </div>

            <div className={styles.collectionCount}>
              <strong>{unlockedCount}</strong>
              <span>/ {BADGES.length} UNLOCKED</span>
            </div>
          </div>

          <div className={styles.collectionTrack}>
            <div
              className={styles.collectionFill}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className={styles.collectionBottom}>
            <span>{percentage}% of the vault discovered</span>
            <span>{BADGES.length - unlockedCount} achievements remaining</span>
          </div>
        </section>

        {/* BADGE COLLECTION */}
        <section className={styles.vaultSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.smallLabel}>CHOOSE YOUR CHALLENGE</span>
              <h2>The Badge Vault</h2>
              <p>Collect achievements and rise through the ranks.</p>
            </div>

            <div className={styles.vaultTotal}>
              <ShieldCheck size={17} />
              {unlockedCount} COLLECTED
            </div>
          </div>

          <nav className={styles.filters} aria-label="Filter badges">
            {BADGE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? styles.activeFilter : ''}
                onClick={() => setCategory(item)}
              >
                {item === 'All' && <Trophy size={13} />}
                {item}
              </button>
            ))}
          </nav>

          <div className={styles.grid}>
            {visibleBadges.map((badge, index) => {
              const Icon = badge.icon;
              const unlocked = unlockedIds.has(badge.id);

              const value = Math.min(
                Number(stats[badge.key] || 0),
                badge.target
              );

              const progress = badge.target > 0
                ? Math.min(100, (value / badge.target) * 100)
                : 0;

              return (
                <article
                  key={badge.id}
                  className={`${styles.badgeCard} ${
                    unlocked ? styles.unlocked : styles.locked
                  }`}
                  style={{ '--card-index': index }}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.badgeCategory}>
                      {badge.category}
                    </span>

                    <span
                      className={`${styles.rarity} ${getRarityClass(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                  </div>

                  <div className={styles.emblemArea}>
                    <div className={styles.emblemGlow} />
                    <div className={styles.emblemOuter}>
                      <div className={styles.emblemMiddle}>
                        <div className={styles.emblemInner}>
                          <div className={styles.emblemIcon}>
                            {unlocked ? (
                              <Icon size={34} strokeWidth={1.7} />
                            ) : (
                              <LockKeyhole size={29} strokeWidth={1.8} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {unlocked && (
                      <>
                        <span className={styles.emblemSparkle}>
                          <Sparkles size={15} />
                        </span>
                        <span className={styles.emblemCheck}>
                          <ShieldCheck size={17} />
                        </span>
                      </>
                    )}
                  </div>

                  <div className={styles.badgeDetails}>
                    <h3>{badge.title}</h3>
                    <p>{badge.description}</p>
                  </div>

                  <div className={styles.badgeProgress}>
                    <div className={styles.progressHeading}>
                      <span>{unlocked ? 'CHALLENGE COMPLETE' : 'CHALLENGE PROGRESS'}</span>
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
                  </div>

                  <div className={styles.cardFooter}>
                    {unlocked ? (
                      <span className={styles.unlockedLabel}>
                        <ShieldCheck size={14} />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className={styles.lockedLabel}>
                        <LockKeyhole size={13} />
                        LOCKED
                      </span>
                    )}

                    <span className={styles.progressPercent}>
                      {Math.floor(progress)}%
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleBadges.length === 0 && (
            <div className={styles.emptyState}>
              <Trophy size={35} />
              <h3>No achievements found</h3>
              <p>Try selecting another category.</p>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <span>VELOOP REWARDS</span>
          <span>YOUR JOURNEY. YOUR LEGACY.</span>
        </footer>
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
