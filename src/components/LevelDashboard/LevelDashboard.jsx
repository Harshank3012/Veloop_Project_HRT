
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

  const [unlockedBadges, setUnlockedBadges] = useState(
    loadUnlockedBadges
  );

  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [activeCelebration, setActiveCelebration] = useState(null);

  useEffect(() => {
    localStorage.setItem(XP_STORAGE_KEY, String(currentXP));
    currentXPRef.current = currentXP;
  }, [currentXP]);

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
