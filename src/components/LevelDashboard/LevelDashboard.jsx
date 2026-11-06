
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Crown,
  Gift,
  LockKeyhole,
  Medal,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

import { levelData, XP_PER_LEVEL } from '../../data/levelData';
import { BADGES } from '../../data/badges';

import styles from './LevelDashboard.module.css';

import XPCatcher from '../XPCatcher/XPCatcher.jsx';
import LevelUpCelebration from '../LevelUpCelebration/LevelUpCelebration.jsx';
import BadgeCelebration from '../BadgeCelebration/BadgeCelebration.jsx';

import { logActivity } from '../../utils/ActivityTracker';

const XP_STORAGE_KEY = 'veloop-total-xp';
const BADGE_STORAGE_KEY = 'veloop-unlocked-badges';
const LAST_SEEN_XP_KEY = 'veloop-dashboard-last-seen-xp';
const MISSION_QUEUE_KEY = 'veloop-pending-mission-celebrations';

const levelTiers = [
  { name: 'Bronze Explorer', color: 'bronze', min: 1, max: 10 },
  { name: 'Silver Explorer', color: 'silver', min: 11, max: 20 },
  { name: 'Gold Explorer', color: 'gold', min: 21, max: 35 },
  { name: 'Platinum Explorer', color: 'platinum', min: 36, max: 50 },
  { name: 'Diamond Explorer', color: 'diamond', min: 51, max: 75 },
  { name: 'Elite Explorer', color: 'elite', min: 76, max: 100 },
  { name: 'Transcendent Explorer', color: 'transcendent', min: 101, max: Infinity },
];

const getTierForLevel = (level) =>
  levelTiers.find((tier) => level >= tier.min && level <= tier.max) ||
  levelTiers[levelTiers.length - 1];

const earningFeatures = [
  {
    title: 'Daily Missions',
    description: 'Complete daily activities and earn XP.',
    reward: '+30 XP',
    status: 'AVAILABLE',
    icon: Target,
    color: 'gold',
    link: '/Lvl-Dashboard/missions',
  },
  {
    title: 'Streak Bonus',
    description: 'Maintain your daily activity streak.',
    reward: 'View Streaks',
    status: 'AVAILABLE',
    icon: Zap,
    color: 'purple',
    link: '/Lvl-Dashboard/streaks',
  },
  {
    title: 'Refer & Earn',
    description: 'Invite friends to join the VELOOP journey.',
    reward: 'Coming Soon',
    status: 'COMING SOON',
    icon: Gift,
    color: 'green',
  },
];

function consumePendingMissionCelebrations() {
  try {
    const pending = JSON.parse(localStorage.getItem(MISSION_QUEUE_KEY) || '[]');
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

  // Unlock mission badges from the lifetime mission counter.
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
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updatedHistory));
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
      ...newHistory.map((badge) => ({ type: 'badge', payload: badge })),
    ]);
  }, []);

  // Check XP badges after XP changes (including XP earned on another page).
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
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updatedHistory));
    setUnlockedBadges(updatedHistory);

    newHistory.forEach((badge) => {
      logActivity({
        type: 'badge',
        title: `${badge.title} Unlocked`,
        description: badge.description,
        xp: 0,
      });
    });

    return newHistory.map((badge) => ({ type: 'badge', payload: badge }));
  }, []);

  // Process XP earned outside the dashboard (for example, Daily Missions).
  // The last-seen value also lets celebrations work after navigating back
  // from the Missions page, when this component was not mounted.
  const processExternalXP = useCallback((updatedXP, previousXP) => {
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
      setCelebrationQueue((queue) => [...queue, ...celebrations]);
    }
  }, [checkXPBadges]);

  useEffect(() => {
    localStorage.setItem(XP_STORAGE_KEY, String(currentXP));
    currentXPRef.current = currentXP;
  }, [currentXP]);

  useEffect(() => {
    // On return from another route, compare the saved XP with the last
    // dashboard value so level-up celebrations are not missed.
    const latestXP = Math.max(
      0,
      Number(localStorage.getItem(XP_STORAGE_KEY) || currentXPRef.current) || 0
    );
    const savedLastSeen = localStorage.getItem(LAST_SEEN_XP_KEY);
    const previousXP = savedLastSeen === null
      ? latestXP
      : Math.max(0, Number(savedLastSeen) || 0);

    processExternalXP(latestXP, previousXP);
    checkXPBadges(latestXP);
    checkMissionBadges();

    // Show mission completion popups even when the Dashboard was unmounted
    // while the user was on the Missions page.
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
      const pendingMissions = consumePendingMissionCelebrations();
      if (pendingMissions.length === 0) return;

      setCelebrationQueue((queue) => [
        ...queue,
        ...pendingMissions.map((mission) => ({
          type: 'mission',
          payload: mission,
        })),
      ]);
    };

    window.addEventListener('veloop-xp-updated', handleXPUpdate);
    window.addEventListener('veloop-achievements-updated', handleAchievementsUpdate);
    window.addEventListener('veloop-mission-completed', handleMissionCompleted);

    return () => {
      window.removeEventListener('veloop-xp-updated', handleXPUpdate);
      window.removeEventListener('veloop-achievements-updated', handleAchievementsUpdate);
      window.removeEventListener('veloop-mission-completed', handleMissionCompleted);
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

  // ADD XP + ACTIVITY HISTORY + BADGE CHECKING
  const addXP = useCallback((amount) => {
    const earnedXP = Number(amount);

    if (!Number.isFinite(earnedXP) || earnedXP <= 0) {
      return;
    }

    const previousXP = currentXPRef.current;

    const previousLevel =
      Math.floor(previousXP / XP_PER_LEVEL) + 1;

    const updatedXP = previousXP + earnedXP;

    const updatedLevel =
      Math.floor(updatedXP / XP_PER_LEVEL) + 1;

    currentXPRef.current = updatedXP;
    setCurrentXP(updatedXP);
    localStorage.setItem(XP_STORAGE_KEY, String(updatedXP));
    localStorage.setItem(LAST_SEEN_XP_KEY, String(updatedXP));

    // Record XP transaction
    logActivity({
      type: 'xp',
      title: 'XP Earned',
      description: `You earned ${earnedXP} XP from XP Catcher.`,
      xp: earnedXP,
    });

    const celebrations = [];

    // LEVEL UP
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

    // XP BADGE CHECK
    const savedBadges = loadUnlockedBadges();

    const savedIds = new Set(
      savedBadges.map((badge) => badge.id)
    );

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

      const updatedHistory = [
        ...savedBadges,
        ...newHistory,
      ];

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

      <div className={styles.content} id="home">

        {/* PAGE HERO */}
        <section className={styles.welcome}>
          <div>
            <div className={styles.eyebrow}>
              <Sparkles size={14} />
              YOUR REWARDS JOURNEY
            </div>

            <h1>
              Make Every Move <span>Count.</span>
            </h1>

            <p>
              Earn XP, Reach new milestones and unlock more
              from every step.
            </p>
          </div>

          <div className={styles.journeyChip}>
            <div className={styles.journeyIcon}>
              <Trophy size={21} />
            </div>

            <div>
              <small>YOUR CURRENT RANK</small>
              <strong>Level {currentLevel}</strong>
            </div>

            <ChevronRight size={17} />
          </div>
        </section>

        {/* CURRENT LEVEL + REWARD */}
        <section className={styles.overviewGrid}>

          {/* LEVEL CARD */}
          <article className={styles.progressCard}>
            <div className={styles.cardTopline}>
              <span className={styles.sectionLabel}>
                CURRENT LEVEL
              </span>

              <span
                className={styles.infoHint}
                title="Your level is based on total XP earned."
              >
                <CircleHelp size={16} />
              </span>
            </div>

            <div className={styles.levelIdentity}>
              <div
                className={`${styles.levelEmblem} ${styles[currentTier.color]}`}
              >
                <div className={styles.emblemInner}>
                  <Crown size={20} />

                  <span>LEVEL</span>

                  <strong>
                    {String(currentLevel).padStart(2, '0')}
                  </strong>
                </div>
              </div>

              <div className={styles.identityText}>
                <span className={styles.mutedLabel}>
                  CURRENT RANK
                </span>

                <h2>{currentTier.name}</h2>

                <div className={styles.xpTotal}>
                  {formattedXP}
                  <span>XP EARNED</span>
                </div>
              </div>
            </div>

            <div className={styles.progressBlock}>
              <div className={styles.progressMeta}>
                <span>
                  LEVEL {currentLevel} <b>→</b> LEVEL {nextLevel}
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
                  <Zap size={14} />
                  <b>
                    {remainingXP.toLocaleString('en-IN')} XP
                  </b>
                  to Level {nextLevel}
                </span>

                <span>
                  {xpIntoLevel.toLocaleString('en-IN')} /{' '}
                  {XP_PER_LEVEL.toLocaleString('en-IN')} XP
                </span>
              </div>
            </div>
          </article>

          {/* NEXT LEVEL REWARD */}
          <article className={styles.rewardCard}>
            <div className={styles.cardTopline}>
              <span className={styles.sectionLabel}>
                NEXT LEVEL REWARD
              </span>

              <span className={styles.lockPill}>
                <LockKeyhole size={11} /> LOCKED
              </span>
            </div>

            <div className={styles.rewardVisual}>
              <div className={styles.rewardRings} />

              <div className={styles.rewardIcon}>
                <Gift size={48} strokeWidth={1.4} />
              </div>

              <Sparkles
                className={styles.rewardSparkleOne}
                size={19}
              />

              <Star
                className={styles.rewardSparkleTwo}
                size={14}
              />
            </div>

            <div className={styles.rewardValue}>
              <Coins size={22} />

              <strong>
                {(Number(levelData.reward) || 500).toLocaleString('en-IN')}
              </strong>

              <span>
                {levelData.rewardCurrency || 'VEs'}
              </span>
            </div>

            <p className={styles.rewardSub}>
              A new milestone. A new reward.
            </p>

            <div className={styles.rewardUnlock}>
              <div>
                <span>YOUR NEXT UNLOCK</span>
                <strong>Reach Level {nextLevel}</strong>
              </div>

              <div className={styles.rewardMiniBadge}>
                <Medal size={19} />
              </div>
            </div>

            <small className={styles.demoLabel}>
              Demo reward · Not redeemable
            </small>
          </article>
        </section>

        {/* LEVEL ROADMAP */}
        <section className={styles.roadmapSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>
                THE ROAD AHEAD
              </span>

              <h2>Your level journey</h2>
            </div>

            <span className={styles.roadmapCaption}>
              ONE LEVEL AT A TIME <ArrowUpRight size={14} />
            </span>
          </div>

          <div className={styles.roadmap}>
            {Array.from(
              { length: 5 },
              (_, index) => currentLevel + index
            ).map((level) => {
              const state =
                level < currentLevel
                  ? 'completed'
                  : level === currentLevel
                    ? 'current'
                    : 'locked';

              const tier = getTierForLevel(level);

              return (
                <div
                  className={`${styles.roadmapItem} ${styles[`roadmap${state}`]}`}
                  key={level}
                >
                  <div className={styles.roadmapConnector} />

                  <div
                    className={`${styles.roadmapBadge} ${styles[tier.color]}`}
                  >
                    {state === 'completed' ? (
                      <Check size={18} />
                    ) : state === 'current' ? (
                      <Crown size={18} />
                    ) : (
                      <LockKeyhole size={15} />
                    )}
                  </div>

                  <strong>
                    LEVEL {String(level).padStart(2, '0')}
                  </strong>

                  <span>
                    {state === 'completed'
                      ? 'Completed'
                      : state === 'current'
                        ? 'You are here'
                        : level === nextLevel
                          ? 'Next goal'
                          : 'Locked'}
                  </span>

                  <small className={styles.roadmapRank}>
                    {tier.name}
                  </small>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURE OPTIONS */}
        <section className={styles.earnSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>
                KEEP YOUR MOMENTUM
              </span>

              <h2>More ways to move up</h2>
            </div>

            <span className={styles.roadmapCaption}>
              EARN MORE XP <Zap size={14} />
            </span>
          </div>

          <div className={styles.earningGrid}>
            {earningFeatures.map((feature) => {
              const Icon = feature.icon;

              const cardContent = (
                <>
                  <div
                    className={`${styles.earningIcon} ${styles[feature.color]}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className={styles.earningInfo}>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                    <span>{feature.reward}</span>
                  </div>

                  <span
                    className={`${styles.earningState} ${
                      feature.status === 'AVAILABLE'
                        ? styles.available
                        : ''
                    }`}
                  >
                    {feature.status}
                  </span>
                </>
              );

              return feature.link ? (
                <a
                  href={feature.link}
                  className={styles.earningCard}
                  key={feature.title}
                  style={{ textDecoration: 'none' }}
                >
                  {cardContent}
                </a>
              ) : (
                <article
                  className={styles.earningCard}
                  key={feature.title}
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        </section>

        {/* XP CATCHER GAME */}
        <XPCatcher onEarnXP={addXP} />

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

        {/* MISSION COMPLETED CELEBRATION */}
        {activeCelebration?.type === 'mission' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-celebration-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              background: 'rgba(3, 6, 18, 0.82)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 'min(100%, 420px)',
                padding: '38px 28px 30px',
                border: '1px solid rgba(240, 183, 75, 0.55)',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #29283f, #191a2b)',
                color: '#fff',
                textAlign: 'center',
                boxShadow: '0 24px 80px rgba(0,0,0,.5)',
              }}
            >
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  margin: '0 auto 22px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '22px',
                  color: '#ffdc8a',
                  background: 'linear-gradient(145deg, #76582a, #3a2d24)',
                  border: '1px solid rgba(255, 205, 105, .65)',
                  boxShadow: '0 0 35px rgba(235, 177, 75, .2)',
                }}
              >
                <Target size={36} />
              </div>

              <div style={{ color: '#f5bd55', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', marginBottom: '12px' }}>
                MISSION COMPLETED
              </div>

              <h2 id="mission-celebration-title" style={{ margin: '0 0 10px', fontSize: '26px', fontWeight: 800 }}>
                {activeCelebration.payload.title}
              </h2>

              <p style={{ color: '#c4c6d8', margin: '0 0 22px', lineHeight: 1.6 }}>
                {activeCelebration.payload.description}
              </p>

              <div style={{ color: '#ffcf70', fontSize: '22px', fontWeight: 800, marginBottom: '26px' }}>
                +{activeCelebration.payload.xp} XP EARNED
              </div>

              <button
                type="button"
                onClick={handleCloseCelebration}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  border: 0,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #ffe19a, #e9ad42)',
                  color: '#171725',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span>VELOOP REWARDS · LEVEL-UP EXPERIENCE</span>

          <span>
            Progress and rewards shown for demonstration.
          </span>
        </footer>
      </div>
    </main>
  );
}
