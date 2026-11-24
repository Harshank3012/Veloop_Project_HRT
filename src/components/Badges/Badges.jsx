
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
import BadgeArtwork from './BadgeArtwork.jsx';
import weekWarrior3D from '../../assets/achievement-badges-3d/week-warrior.webp';
import fortnightFighter3D from '../../assets/achievement-badges-3d/fortnight-fighter.webp';
import monthlyChampion3D from '../../assets/achievement-badges-3d/monthly-champion.webp';
import unstoppableLegend3D from '../../assets/achievement-badges-3d/unstoppable-legend.webp';
import centuryWarrior3D from '../../assets/achievement-badges-3d/century-warrior.webp';
import missionStarter3D from '../../assets/achievement-badges-3d/mission-starter.webp';
import missionPro3D from '../../assets/achievement-badges-3d/mission-pro.webp';
import missionExpert3D from '../../assets/achievement-badges-3d/mission-expert.webp';
import missionMaster3D from '../../assets/achievement-badges-3d/mission-master.webp';
import missionLegendArt from '../../assets/mission-badges/mission-legend.webp';
import perfectWeekArt from '../../assets/mission-badges/perfect-week.webp';

const premiumBadgeArtwork = {
  8: weekWarrior3D,
  9: fortnightFighter3D,
  10: monthlyChampion3D,
  11: unstoppableLegend3D,
  12: centuryWarrior3D,
  13: missionStarter3D,
  14: missionPro3D,
  15: missionExpert3D,
  16: missionMaster3D,
  17: missionLegendArt,
  18: perfectWeekArt,
  19: quickCatcherUnique,
  20: skilledCatcherUnique,
  21: gameStarterUnique,
  22: gameEnthusiastUnique,
  23: gameMasterUnique,
  24: gamingLegendUnique,
  25: ultimateGamerUnique,
  26: bronzeRankArt,
  27: silverRankArt,
  28: goldRankArt,
  29: platinumRankArt,
  30: diamondRankArt,
  31: eliteRankArt,
  32: transcendentRankArt,
};
import quickCatcherUnique from '../../assets/unique-3d-achievements/quick-catcher.webp';
import skilledCatcherUnique from '../../assets/unique-3d-achievements/skilled-catcher.webp';
import gameStarterUnique from '../../assets/unique-3d-achievements/game-starter.webp';
import gameEnthusiastUnique from '../../assets/unique-3d-achievements/game-enthusiast.webp';
import gameMasterUnique from '../../assets/unique-3d-achievements/game-master.webp';
import gamingLegendUnique from '../../assets/unique-3d-achievements/gaming-legend.webp';
import ultimateGamerUnique from '../../assets/unique-3d-achievements/ultimate-gamer.webp';
import styles from './Badges.module.css';
import { getLocalDateKey, getPreviousLocalDateKey } from '../../utils/dateUtils';

// Shared rank artwork: these exact files are also rendered by RankEmblem.
import bronzeRankArt from '../../assets/rank-emblems/bronze.webp';
import silverRankArt from '../../assets/rank-emblems/silver.webp';
import goldRankArt from '../../assets/rank-emblems/gold.webp';
import platinumRankArt from '../../assets/rank-emblems/platinum.webp';
import diamondRankArt from '../../assets/rank-emblems/diamond.webp';
import eliteRankArt from '../../assets/rank-emblems/legendary.webp';
import transcendentRankArt from '../../assets/rank-emblems/transcendent.webp';

const STORAGE_KEY = 'veloop-unlocked-badges';
// The seven XP milestone medals are displayed on the Level Roadmap, not in this vault.
const REWARD_BADGES = BADGES.filter((badge) => badge.id < 1 || badge.id > 7);

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
  const legacyStreak = readJSON('veloop-streak-data', {});
  const missionStreak = readJSON('veloop-mission-streak-data', {});
  const streakData = { ...legacyStreak, ...missionStreak };
  const lastCompletedDate = streakData.lastCompletedDate;
  const savedCurrentStreak = Number(
    streakData.currentStreak ?? streakData.streak ?? 0
  ) || 0;
  const currentStreak = lastCompletedDate
    ? (lastCompletedDate === getLocalDateKey() ||
        lastCompletedDate === getPreviousLocalDateKey()
        ? savedCurrentStreak
        : 0)
    : savedCurrentStreak;
  const bestStreak = Math.max(
    Number(legacyStreak.bestStreak ?? legacyStreak.longestStreak ?? 0) || 0,
    Number(missionStreak.bestStreak ?? missionStreak.longestStreak ?? 0) || 0,
    currentStreak
  );

  return {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    streak: currentStreak,
    missions: readNum('veloop-total-missions-completed'),
    perfectWeekDays: bestStreak,
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

  return () => {
    window.removeEventListener('focus', refresh);
    window.removeEventListener('storage', refresh);
    window.removeEventListener('veloop-achievements-updated', refresh);
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
      ? REWARD_BADGES
      : REWARD_BADGES.filter((badge) => badge.category === category);

  const unlockedCount = REWARD_BADGES.filter(
    (badge) => unlockedIds.has(badge.id)
  ).length;

  const percentage = REWARD_BADGES.length
    ? Math.round((unlockedCount / REWARD_BADGES.length) * 100)
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
              <span>/ {REWARD_BADGES.length} UNLOCKED</span>
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
            <span>{REWARD_BADGES.length - unlockedCount} achievements remaining</span>
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
            {BADGE_CATEGORIES.filter((item) => item !== 'XP Achievements').map((item) => (
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
                  style={{ '--card-index': index, '--badge-accent': ({1:'#f2bd64',2:'#8fc9ff',3:'#f4c35e',4:'#7ad8e5',5:'#c8a0f5',6:'#ff9b7d',7:'#d69cff',8:'#ff9b55',9:'#8ab8f5',10:'#f2ca67',11:'#c69af3',12:'#e99a91',13:'#e7c783',14:'#82d4df',15:'#a8baff',16:'#efc36a',17:'#c69af3',18:'#8dd9ad',19:'#f0bb65',20:'#8ecbfa',21:'#b3a0ff',22:'#7dd5df',23:'#f0c56e',24:'#f49b80',25:'#d59cff',26:'#c58a59',27:'#c2cfdf',28:'#eac16b',29:'#85dce8',30:'#8dbcf5',31:'#c19be9',32:'#d2a3f6'})[badge.id] || '#d8bd80' }}
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
                    {premiumBadgeArtwork[badge.id] ? (
                      <img
                        className={styles.premiumBadgeImage}
                        src={premiumBadgeArtwork[badge.id]}
                        alt={`${badge.title} premium collectible badge`}
                        loading="lazy"
                        draggable="false"
                      />
                    ) : (
                      <BadgeArtwork
                        badge={badge}
                        unlocked={unlocked}
                        progress={progress}
                      />
                    )}
                    <span className={styles.artUnlockSeal} aria-hidden="true">
                      {unlocked ? <ShieldCheck size={16} /> : <LockKeyhole size={14} />}
                    </span>
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
