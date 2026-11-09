
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
    title: 'Watch & Earn',
    description: 'Watch eligible videos and earn XP.',
    reward: 'Up to +100 XP',
    status: 'AVAILABLE',
    icon: PlayCircle,
    color: 'blue',
    link: '/Lvl-Dashboard/watch-earn',
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
  const [selectedRoadmapTier, setSelectedRoadmapTier] = useState(currentTier.color);
  const [pinnedFlippedRank, setPinnedFlippedRank] = useState(null);
  useEffect(() => {
    setSelectedRoadmapTier(currentTier.color);
  }, [currentTier.color]);

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

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <Sparkles size={15} />
              <span>VELOOP REWARDS EXPERIENCE</span>
            </div>

            <h1>
              YOUR JOURNEY.
              <br />
              <span>YOUR LEGACY.</span>
            </h1>

            <p>
              Every Activity takes you closer to the next Rank.
              Keep Earning, Keep Progressing, and Unlock your Potential.
            </p>

          </div>

          <div className={styles.heroRank}>
            <div className={styles.heroOrbitSystem} aria-hidden="true">
              <div className={styles.heroRankOrbit} />
              <span className={`${styles.heroOrbitBall} ${styles.heroOrbitBallTop}`} />
              <span className={`${styles.heroOrbitBall} ${styles.heroOrbitBallBottom}`} />
            </div>
            <div className={styles.heroRankInner}>
              <RankEmblem
                tier={currentTier.color}
                state="current"
                variant="hero"
                className={styles.heroRankEmblem}
              />
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className={styles.overviewGrid}>

          {/* CURRENT LEVEL */}
          <article className={styles.progressCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.sectionLabel}>PLAYER STATUS</span>
                <h2>Your  Current  Level</h2>
              </div>

              <span className={styles.livePill}>
                <span />
                ACTIVE
              </span>
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


{/* LEVEL ROADMAP */}
        <section className={styles.roadmapSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Level Roadmap</h2>
              <p className={styles.sectionDescription}>
                Seven Ranks. One Journey. Keep Moving Forward.
              </p>
            </div>

            <span className={styles.roadmapCaption}>
              <Trophy size={15} />
              YOUR RANK JOURNEY
            </span>
          </div>

          <div className={styles.roadmap}>
            {levelTiers.map((tier) => {
              const state =
                currentLevel > tier.max
                  ? 'completed'
                  : currentLevel >= tier.min
                    ? 'current'
                    : 'locked';

              return (
                <button
                  type="button"
                  className={`${styles.roadmapItem} ${styles[`roadmap${state}`]} ${selectedRoadmapTier === tier.color ? styles.roadmapSelected : ''} ${pinnedFlippedRank === tier.color ? styles.roadmapPinnedFlip : ''}`}
                  key={tier.color}
                  data-rank={tier.color}
                  aria-pressed={pinnedFlippedRank === tier.color}
                  aria-label={`${tier.name}. Hover or tap to view rank details.`}
                  onClick={() => {
                    setSelectedRoadmapTier(tier.color);
                    setPinnedFlippedRank((active) => active === tier.color ? null : tier.color);
                  }}
                >
                  <span className={styles.roadmapFlipInner}>
                    <span className={styles.roadmapFlipFront}>
                      <RankEmblem tier={tier.color} state={state} variant="roadmap" className={styles.roadmapEmblem} />
                      <strong className={styles.rankTitle}>{tier.name}</strong>
                      <span className={styles.roadmapState}>
                        {state === 'completed' ? 'COMPLETED' : state === 'current' ? 'CURRENT RANK' : 'LOCKED'}
                      </span>
                      <small className={styles.roadmapRank}>
                        {tier.max === Infinity ? `LEVEL ${tier.min}+` : `LEVEL ${tier.min}–${tier.max}`}
                      </small>
                    </span>

                    <span className={styles.roadmapFlipBack}>
                      <span className={styles.rankBackEyebrow}>RANK INTEL</span>
                      <strong className={styles.rankBackTitle}>{tier.name}</strong>
                      <span className={styles.rankBackStatus}>
                        {state === 'completed' ? '✓ RANK COMPLETED' : state === 'current' ? '★ YOUR ACTIVE RANK' : '🔒 RANK LOCKED'}
                      </span>
                      <span className={styles.rankBackStat}>
                        <small>LEVEL RANGE</small>
                        <b>{tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`}</b>
                      </span>
                      <span className={styles.rankBackStat}>
                        <small>XP TO ENTER</small>
                        <b>{((tier.min - 1) * XP_PER_LEVEL).toLocaleString('en-IN')} XP</b>
                      </span>
                      <span className={styles.rankBackStat}>
                        <small>XP TO COMPLETE</small>
                        <b>{tier.max === Infinity ? 'UNLIMITED' : `${(tier.max * XP_PER_LEVEL).toLocaleString('en-IN')} XP`}</b>
                      </span>
                      {state !== 'completed' && (
                        <span className={styles.rankBackHint}>
                          {state === 'current'
                            ? `${Math.max(0, tier.max * XP_PER_LEVEL - currentXP).toLocaleString('en-IN')} XP until next rank.`
                            : `Earn ${Math.max(0, (tier.min - 1) * XP_PER_LEVEL - currentXP).toLocaleString('en-IN')} more XP to unlock.`}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}

            <article className={styles.comingSoonRank} aria-label="More ranks coming soon">
              <div className={styles.comingSoonIcon}>
                <Sparkles size={34} />
              </div>
              <span className={styles.comingSoonKicker}>THE JOURNEY CONTINUES</span>
              <strong>More Ranks</strong>
              <span className={styles.comingSoonBadge}>COMING SOON</span>
              <p>New challenges. New milestones. New legends to unlock.</p>
            </article>
          </div>

          {(() => {
            const selectedTier = levelTiers.find((tier) => tier.color === selectedRoadmapTier) || currentTier;
            const selectedState = currentLevel > selectedTier.max
              ? 'completed'
              : currentLevel >= selectedTier.min
                ? 'current'
                : 'locked';
            const TierIcon = selectedTier.icon;

            return (
              <div className={`${styles.rankIntelPanel} ${styles[`rankIntel${selectedTier.color}`]}`} key={selectedTier.color}>
                <div className={styles.rankIntelIcon}>
                  <TierIcon size={22} />
                </div>
                <div className={styles.rankIntelCopy}>
                  <span>RANK INTEL · {selectedState === 'completed' ? 'CONQUERED' : selectedState === 'current' ? 'ACTIVE TIER' : 'UPCOMING TIER'}</span>
                  <strong>{selectedTier.name}</strong>
                  <p>
                    {selectedState === 'completed'
                      ? `Levels ${selectedTier.min}–${selectedTier.max} conquered. This rank is part of your legacy.`
                      : selectedState === 'current'
                        ? `You're competing in this tier now. Keep earning XP to reach level ${nextLevel}.`
                        : `Reach level ${selectedTier.min} to unlock this rank and enter a new chapter of your journey.`}
                  </p>
                </div>
                <div className={styles.rankIntelRange}>
                  <small>RANK RANGE</small>
                  <strong>{selectedTier.max === Infinity ? `${selectedTier.min}+` : `${selectedTier.min}–${selectedTier.max}`}</strong>
                </div>
              </div>
            );
          })()}

        </section>

        {/* EARNING FEATURES */}
        <section className={styles.earnSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>LEVEL UP FASTER</span>
              <h2>Choose your next move</h2>
              <p className={styles.sectionDescription}>
                Explore activities and collect more experience points.
              </p>
            </div>

            <span className={styles.roadmapCaption}>
              <Zap size={15} />
              EARN MORE XP
            </span>
          </div>

          <div className={styles.earningGrid}>
            {earningFeatures.map((feature, index) => {
              const Icon = feature.icon;

              const cardContent = (
                <>
                  <div className={styles.featureTop}>
                    <div
                      className={`${styles.earningIcon} ${styles[feature.color]}`}
                    >
                      <Icon size={23} />
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
                  </div>

                  <div className={styles.earningInfo}>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>

                  <div className={styles.featureBottom}>
                    <span>{feature.reward}</span>
                    {feature.link ? (
                      <ArrowRight size={17} />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                  </div>
                </>
              );

              return feature.link ? (
                <Link
                  to={feature.link}
                  className={styles.earningCard}
                  key={feature.title}
                  style={{ '--feature-index': index }}
                >
                  {cardContent}
                </Link>
              ) : (
                <article
                  className={styles.earningCard}
                  key={feature.title}
                  style={{ '--feature-index': index }}
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        </section>

        {/* XP CATCHER */}
        <section className={styles.gameSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>PLAY TO EARN</span>
              <h2>XP Catcher Arena</h2>
              <p className={styles.sectionDescription}>
                Catch XP and get closer to your next level.
              </p>
            </div>

            <span className={styles.gamePill}>
              <PlayCircle size={15} />
              MINI GAME
            </span>
          </div>

          <div className={styles.gameCard}>
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
