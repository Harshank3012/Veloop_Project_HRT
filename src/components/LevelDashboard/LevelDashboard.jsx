
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Crown,
  Gift,
  LockKeyhole,
  Medal,
  PlayCircle,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
  Swords,
  Gem,
  Flame,
  Orbit,
} from 'lucide-react';

import { levelData, XP_PER_LEVEL } from '../../data/levelData';
import { BADGES } from '../../data/badges';

import styles from './LevelDashboard.module.css';

import XPCatcher from '../XPCatcher/XPCatcher.jsx';
import LevelUpCelebration from '../LevelUpCelebration/LevelUpCelebration.jsx';
import BadgeCelebration from '../BadgeCelebration/BadgeCelebration.jsx';
import RankEmblem from './RankEmblem.jsx';

import { logActivity } from '../../utils/ActivityTracker';

const XP_STORAGE_KEY = 'veloop-total-xp';
const BADGE_STORAGE_KEY = 'veloop-unlocked-badges';
const LAST_SEEN_XP_KEY = 'veloop-dashboard-last-seen-xp';
const MISSION_QUEUE_KEY = 'veloop-pending-mission-celebrations';

const levelTiers = [
  {
    name: 'Bronze Explorer',
    color: 'bronze',
    min: 1,
    max: 10,
    icon: Swords,
    emblem: 'WARRIOR',
  },
  {
    name: 'Silver Adventurer',
    color: 'silver',
    min: 11,
    max: 20,
    icon: Shield,
    emblem: 'KNIGHT',
  },
  {
    name: 'Gold Champion',
    color: 'gold',
    min: 21,
    max: 35,
    icon: Crown,
    emblem: 'ROYAL',
  },
  {
    name: 'Platinum Master',
    color: 'platinum',
    min: 36,
    max: 50,
    icon: Swords,
    emblem: 'MASTER',
  },
  {
    name: 'Diamond Elite',
    color: 'diamond',
    min: 51,
    max: 75,
    icon: Gem,
    emblem: 'ELITE',
  },
  {
    name: 'Legendary',
    color: 'legendary',
    min: 76,
    max: 100,
    icon: Flame,
    emblem: 'PHOENIX',
  },
  {
    name: 'Transcendent',
    color: 'transcendent',
    min: 101,
    max: Infinity,
    icon: Orbit,
    emblem: 'COSMIC',
  },
];

const getTierForLevel = (level) =>
  levelTiers.find((tier) => level >= tier.min && level <= tier.max) ||
  levelTiers[levelTiers.length - 1];

function consumePendingMissionCelebrations() {
  try {
    const pending = JSON.parse(
      localStorage.getItem(MISSION_QUEUE_KEY) || '[]'
    );

    localStorage.removeItem(MISSION_QUEUE_KEY);
    return Array.isArray(pending) ? pending : [];
  } catch {
    localStorage.removeItem(MISSION_QUEUE_KEY);
    return [];
  }
}

function loadUnlockedBadges() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(BADGE_STORAGE_KEY) || '[]'
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function LevelDashboard() {
  const [currentXP, setCurrentXP] = useState(() => {
    const savedXP = localStorage.getItem(XP_STORAGE_KEY);

    return savedXP === null
      ? Number(levelData.currentXP) || 0
      : Math.max(0, Number(savedXP) || 0);
  });

  const currentXPRef = useRef(currentXP);

  const [, setUnlockedBadges] = useState(loadUnlockedBadges);
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [activeCelebration, setActiveCelebration] = useState(null);

  // Unlock mission badges using the lifetime mission counter.
  const checkMissionBadges = useCallback(() => {
    const totalMissions = Number(
      localStorage.getItem('veloop-total-missions-completed') || 0
    );

    const savedBadges = loadUnlockedBadges();
    const savedIds = new Set(savedBadges.map((badge) => badge.id));

    const newlyUnlocked = BADGES.filter(
      (badge) =>
        badge.category === 'Mission Achievements' &&
        badge.key !== 'perfectWeekDays' &&
        totalMissions >= Number(badge.target) &&
        !savedIds.has(badge.id)
    );

    if (newlyUnlocked.length === 0) return;

    const newHistory = newlyUnlocked.map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      rarity: badge.rarity,
      unlockedAt: new Date().toISOString(),
    }));

    const updatedHistory = [...savedBadges, ...newHistory];

    localStorage.setItem(
      BADGE_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    setUnlockedBadges(updatedHistory);

    newHistory.forEach((badge) => {
      logActivity({
        type: 'badge',
        title: `${badge.title} Unlocked`,
        description: badge.description,
        xp: 0,
      });
    });

    setCelebrationQueue((queue) => [
      ...queue,
      ...newHistory.map((badge) => ({
        type: 'badge',
        payload: badge,
      })),
    ]);
  }, []);

  // Check XP achievement badges.
  const checkXPBadges = useCallback((totalXP) => {
    const savedBadges = loadUnlockedBadges();
    const savedIds = new Set(savedBadges.map((badge) => badge.id));

    const newlyUnlocked = BADGES.filter(
      (badge) =>
        badge.key === 'xp' &&
        totalXP >= Number(badge.target) &&
        !savedIds.has(badge.id)
    );

    if (newlyUnlocked.length === 0) return [];

    const newHistory = newlyUnlocked.map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      rarity: badge.rarity,
      unlockedAt: new Date().toISOString(),
    }));

    const updatedHistory = [...savedBadges, ...newHistory];

    localStorage.setItem(
      BADGE_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    setUnlockedBadges(updatedHistory);

    newHistory.forEach((badge) => {
      logActivity({
        type: 'badge',
        title: `${badge.title} Unlocked`,
        description: badge.description,
        xp: 0,
      });
    });

    return newHistory.map((badge) => ({
      type: 'badge',
      payload: badge,
    }));
  }, []);

  // Process XP earned on other pages.
  const processExternalXP = useCallback(
    (updatedXP, previousXP) => {
      if (!Number.isFinite(updatedXP) || updatedXP < 0) return;

      currentXPRef.current = updatedXP;
      setCurrentXP(updatedXP);

      localStorage.setItem(XP_STORAGE_KEY, String(updatedXP));
      localStorage.setItem(LAST_SEEN_XP_KEY, String(updatedXP));

      const celebrations = [];

      const previousLevel = Math.floor(previousXP / XP_PER_LEVEL) + 1;
      const updatedLevel = Math.floor(updatedXP / XP_PER_LEVEL) + 1;

      if (updatedXP > previousXP && updatedLevel > previousLevel) {
        const newTier = getTierForLevel(updatedLevel);

        celebrations.push({
          type: 'level',
          payload: {
            previousLevel,
            newLevel: updatedLevel,
            levelName: newTier.name,
          },
        });

        logActivity({
          type: 'level',
          title: `Level ${updatedLevel} Unlocked`,
          description: `Congratulations! You reached ${newTier.name}.`,
          xp: 0,
        });
      }

      celebrations.push(...checkXPBadges(updatedXP));

      if (celebrations.length > 0) {
        setCelebrationQueue((queue) => [
          ...queue,
          ...celebrations,
        ]);
      }
    },
    [checkXPBadges]
  );

  useEffect(() => {
    localStorage.setItem(XP_STORAGE_KEY, String(currentXP));
    currentXPRef.current = currentXP;
  }, [currentXP]);

  useEffect(() => {
    const latestXP = Math.max(
      0,
      Number(
        localStorage.getItem(XP_STORAGE_KEY) || currentXPRef.current
      ) || 0
    );

    const savedLastSeen = localStorage.getItem(LAST_SEEN_XP_KEY);

    const previousXP =
      savedLastSeen === null
        ? latestXP
        : Math.max(0, Number(savedLastSeen) || 0);

    processExternalXP(latestXP, previousXP);
    checkXPBadges(latestXP);
    checkMissionBadges();

    const pendingMissions = consumePendingMissionCelebrations();

    if (pendingMissions.length > 0) {
      setCelebrationQueue((queue) => [
        ...queue,
        ...pendingMissions.map((mission) => ({
          type: 'mission',
          payload: mission,
        })),
      ]);
    }

    const handleXPUpdate = () => {
      const updatedXP = Math.max(
        0,
        Number(localStorage.getItem(XP_STORAGE_KEY) || 0) || 0
      );

      processExternalXP(updatedXP, currentXPRef.current);
    };

    const handleAchievementsUpdate = () => checkMissionBadges();

    const handleMissionCompleted = () => {
      const pending = consumePendingMissionCelebrations();

      if (pending.length === 0) return;

      setCelebrationQueue((queue) => [
        ...queue,
        ...pending.map((mission) => ({
          type: 'mission',
          payload: mission,
        })),
      ]);
    };

    window.addEventListener('veloop-xp-updated', handleXPUpdate);
    window.addEventListener(
      'veloop-achievements-updated',
      handleAchievementsUpdate
    );
    window.addEventListener(
      'veloop-mission-completed',
      handleMissionCompleted
    );

    return () => {
      window.removeEventListener('veloop-xp-updated', handleXPUpdate);
      window.removeEventListener(
        'veloop-achievements-updated',
        handleAchievementsUpdate
      );
      window.removeEventListener(
        'veloop-mission-completed',
        handleMissionCompleted
      );
    };
  }, [processExternalXP, checkXPBadges, checkMissionBadges]);

  useEffect(() => {
    if (!activeCelebration && celebrationQueue.length > 0) {
      setActiveCelebration(celebrationQueue[0]);
      setCelebrationQueue((queue) => queue.slice(1));
    }
  }, [activeCelebration, celebrationQueue]);

  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = currentXP % XP_PER_LEVEL;

  const progress = Math.min(
    100,
    (xpIntoLevel / XP_PER_LEVEL) * 100
  );

  const remainingXP = XP_PER_LEVEL - xpIntoLevel;
  const nextLevel = currentLevel + 1;
  const currentTier = getTierForLevel(currentLevel);
  const formattedXP = useMemo(
    () => currentXP.toLocaleString('en-IN'),
    [currentXP]
  );

  const addXP = useCallback((amount) => {
    const earnedXP = Number(amount);

    if (!Number.isFinite(earnedXP) || earnedXP <= 0) return;

    const previousXP = currentXPRef.current;
    const previousLevel = Math.floor(previousXP / XP_PER_LEVEL) + 1;

    const updatedXP = previousXP + earnedXP;
    const updatedLevel = Math.floor(updatedXP / XP_PER_LEVEL) + 1;

    currentXPRef.current = updatedXP;
    setCurrentXP(updatedXP);

    localStorage.setItem(XP_STORAGE_KEY, String(updatedXP));
    localStorage.setItem(LAST_SEEN_XP_KEY, String(updatedXP));

    logActivity({
      type: 'xp',
      title: 'XP Earned',
      description: `You earned ${earnedXP} XP from XP Catcher.`,
      xp: earnedXP,
    });

    const celebrations = [];

    if (updatedLevel > previousLevel) {
      const newTier = getTierForLevel(updatedLevel);

      celebrations.push({
        type: 'level',
        payload: {
          previousLevel,
          newLevel: updatedLevel,
          levelName: newTier.name,
        },
      });

      logActivity({
        type: 'level',
        title: `Level ${updatedLevel} Unlocked`,
        description: `Congratulations! You reached ${newTier.name}.`,
        xp: 0,
      });
    }

    const savedBadges = loadUnlockedBadges();
    const savedIds = new Set(savedBadges.map((badge) => badge.id));

    const newlyUnlocked = BADGES.filter(
      (badge) =>
        badge.key === 'xp' &&
        updatedXP >= badge.target &&
        !savedIds.has(badge.id)
    );

    if (newlyUnlocked.length > 0) {
      const newHistory = newlyUnlocked.map((badge) => ({
        id: badge.id,
        title: badge.title,
        description: badge.description,
        rarity: badge.rarity,
        unlockedAt: new Date().toISOString(),
      }));

      const updatedHistory = [...savedBadges, ...newHistory];

      try {
        localStorage.setItem(
          BADGE_STORAGE_KEY,
          JSON.stringify(updatedHistory)
        );
      } catch (error) {
        console.error('Unable to save unlocked badges:', error);
      }

      setUnlockedBadges(updatedHistory);

      newHistory.forEach((badge) => {
        celebrations.push({
          type: 'badge',
          payload: badge,
        });

        logActivity({
          type: 'badge',
          title: `${badge.title} Unlocked`,
          description: badge.description,
          xp: 0,
        });
      });
    }

    if (celebrations.length > 0) {
      setCelebrationQueue((queue) => [
        ...queue,
        ...celebrations,
      ]);
    }
  }, []);

  const handleCloseCelebration = () => {
    setActiveCelebration(null);
  };

  return (
    <main className={styles.dashboard}>
      <div className={styles.ambientGlow} />
      <div className={styles.ambientGlowSecondary} />

      <div className={styles.content} id="home">

        {/* HERO — ROYAL PLAYER INTRO */}
        <section className={styles.hero} aria-labelledby="level-hero-title">
          <div className={styles.heroContent}>
            <h1 id="level-hero-title">
              YOUR JOURNEY.
              <br />
              <span>YOUR LEGACY.</span>
            </h1>

            <p>
              Every activity brings you closer to your next rank. Earn XP,
              conquer challenges, and unlock rewards worthy of your progress.
            </p>

          </div>

          <div className={`${styles.heroRank} ${styles[`${currentTier.color}Halo`] || ""}`}>
            <svg
              className={styles.heroRankHalo}
              viewBox="0 0 300 300"
              width="300"
              height="300"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              focusable="false"
            >
              <circle className={styles.heroHaloOuter} cx="150" cy="150" r="139" />
              <circle className={styles.heroHaloOrbit} cx="150" cy="150" r="116" />
            </svg>
            <div className={styles.heroRankInner}>
              <RankEmblem
                tier={currentTier.color}
                state="current"
                variant="hero"
                className={styles.heroRankEmblem}
              />
            </div>
          </div>
          <div className={styles.heroBottomRule} aria-hidden="true" />
        </section>

        {/* OVERVIEW */}
        <section className={styles.overviewGrid}>

          {/* CURRENT LEVEL */}
          <article className={styles.progressCard}>
            <div className={styles.cardHeader}>
              <div className={styles.currentLevelHeading}>
                <h2>Your Current Level</h2>
              </div>
            </div>

            <div className={styles.levelIdentity}>
              <div className={`${styles.levelEmblemStage} ${styles[`${currentTier.color}Stage`] || ""}`}>
                <div className={styles.levelEmblemOrbit} aria-hidden="true" />
                <div
                  className={`${styles.levelEmblem} ${styles[currentTier.color]}`}
                  aria-label={`${currentTier.name}, level ${currentLevel}`}
                >
                  <div className={styles.emblemOuterRing} />
                  <div className={styles.emblemInner}>
                    <Crown size={25} />
                    <span>LEVEL</span>
                    <strong>{String(currentLevel).padStart(2, '0')}</strong>
                  </div>
                  <span className={styles.levelEmblemJewel} aria-hidden="true" />
                </div>
              </div>

              <div className={styles.identityText}>
                <span className={styles.mutedLabel}>CURRENT RANK</span>
                <h3>{currentTier.name}</h3>

                <div className={styles.xpTotal}>
                  {formattedXP}
                  <span>TOTAL XP EARNED</span>
                </div>
              </div>
            </div>

            <div className={styles.progressBlock}>
              <div className={styles.progressMeta}>
                <span>
                  LEVEL {currentLevel}
                  <ChevronRight size={14} />
                  LEVEL {nextLevel}
                </span>
                <strong>{progress.toFixed(1)}%</strong>
              </div>

              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Number(progress.toFixed(1))}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className={styles.progressFoot}>
                <span>
                  <Zap size={15} />
                  <b>{remainingXP.toLocaleString('en-IN')} XP</b>
                  {' '}needed for next level
                </span>

                <span>
                  {xpIntoLevel.toLocaleString('en-IN')} /{' '}
                  {XP_PER_LEVEL.toLocaleString('en-IN')} XP
                </span>
              </div>
            </div>

            <div className={styles.levelCardFooter}>
              <div>
                <span>YOUR NEXT MILESTONE</span>
                <strong>Level {nextLevel}</strong>
              </div>
              <div className={styles.milestoneIcon}>
                <Target size={19} />
              </div>
            </div>
          </article>

          {/* NEXT REWARD */}
          <article className={styles.rewardCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionLabel}>UPCOMING REWARD</span>
                <h2>Next level unlock</h2>
              </div>

              <span className={styles.lockPill}>
                <LockKeyhole size={12} />
                LOCKED
              </span>
            </div>

            <div className={styles.rewardVisual}>
             <div className={`${styles.rewardOrbit} ${styles.rewardOrbitOne}`} />
             <div className={`${styles.rewardOrbit} ${styles.rewardOrbitTwo}`} />
              <div className={styles.rewardIcon}>
                <Gift size={48} strokeWidth={1.5} />
              </div>

              <Sparkles className={styles.rewardSparkleOne} size={20} />
              <Star className={styles.rewardSparkleTwo} size={16} />
              <Star className={styles.rewardSparkleThree} size={12} />
            </div>

            <div className={styles.rewardValue}>
              <Coins size={24} />
              <strong>
                {(Number(levelData.reward) || 500).toLocaleString('en-IN')}
              </strong>
              <span>{levelData.rewardCurrency || 'VEs'}</span>
            </div>

            <p className={styles.rewardSub}>
              Your next Milestone comes with a new Reward.
            </p>

            <div className={styles.rewardUnlock}>
              <div>
                <span>NEXT UNLOCK</span>
                <strong>Reach Level {nextLevel}</strong>
              </div>

              <div className={styles.rewardMiniBadge}>
                <Medal size={21} />
              </div>
            </div>

            <small className={styles.demoLabel}>
              Demo reward · Not redeemable
            </small>
          </article>
        </section>


{/* XP CATCHER */}
        <section className={styles.gameSection}>
          <div className={styles.gameCard}>
            <div className={styles.gameTitle}>
              <h2>XP CATCHER ARENA</h2>
            </div>
            <p className={styles.gameIntroNote}>
              Tap the glowing XP orbs before the 15-second timer runs out to collect XP and boost your level progress.
            </p>
            <XPCatcher onEarnXP={addXP} />
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span>VELOOP REWARDS</span>
          <span>LEVEL-UP EXPERIENCE · KEEP MOVING FORWARD</span>
        </footer>
      </div>

      {/* LEVEL-UP CELEBRATION */}
      {activeCelebration?.type === 'level' && (
        <LevelUpCelebration
          isOpen
          previousLevel={activeCelebration.payload.previousLevel}
          newLevel={activeCelebration.payload.newLevel}
          levelName={activeCelebration.payload.levelName}
          onClose={handleCloseCelebration}
        />
      )}

      {/* BADGE CELEBRATION */}
      {activeCelebration?.type === 'badge' && (
        <BadgeCelebration
          badge={activeCelebration.payload}
          onClose={handleCloseCelebration}
        />
      )}

      {/* MISSION COMPLETION CELEBRATION */}
      {activeCelebration?.type === 'mission' && (
        <div
          className={styles.celebrationOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-celebration-title"
        >
          <div className={styles.missionCelebration}>
            <div className={styles.missionCelebrationFx} aria-hidden="true">
              <span className={`${styles.missionStar} ${styles.missionStarOne}`}>✦</span>
              <span className={`${styles.missionStar} ${styles.missionStarTwo}`}>✧</span>
              <span className={`${styles.missionStar} ${styles.missionStarThree}`}>✦</span>
              <span className={`${styles.missionStar} ${styles.missionStarFour}`}>·</span>
              <span className={`${styles.missionStar} ${styles.missionStarFive}`}>✧</span>
              <span className={`${styles.missionStar} ${styles.missionStarSix}`}>✦</span>
              <span className={`${styles.missionRocket} ${styles.missionRocketOne}`}>🚀</span>
              <span className={`${styles.missionRocket} ${styles.missionRocketTwo}`}>🚀</span>
            </div>
            <div className={styles.celebrationIcon}>
              <Target size={36} />
            </div>

            <span className={styles.celebrationEyebrow}>
              MISSION COMPLETED
            </span>

            <h2 id="mission-celebration-title">
              {activeCelebration.payload.title}
            </h2>

            <p>{activeCelebration.payload.description}</p>

            <div className={styles.celebrationXP}>
              +{activeCelebration.payload.xp} XP
              <span>EARNED</span>
            </div>

            <button
              type="button"
              className={styles.celebrationContinue}
              onClick={handleCloseCelebration}
            >
              Awesome!
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 
