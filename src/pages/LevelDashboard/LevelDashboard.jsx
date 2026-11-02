import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, Bell, Check, ChevronRight, CircleHelp,
  Coins, Crown, Gift, LockKeyhole, Medal, Sparkles,
  Star, Target, Trophy, Zap
} from 'lucide-react';

import { levelData, XP_PER_LEVEL } from '../../data/levelData';
import styles from './LevelDashboard.module.css';
import XPCatcher from '../../components/XPCatcher/XPCatcher.jsx';

const levelTiers = [
  { name: 'Bronze Explorer', color: 'bronze' },
  { name: 'Silver Explorer', color: 'silver' },
  { name: 'Gold Explorer', color: 'gold' },
  { name: 'Platinum Explorer', color: 'platinum' },
  { name: 'Diamond Explorer', color: 'diamond' },
  { name: 'Elite Explorer', color: 'elite' },
];

const earningFeatures = [
  {
    title: 'Daily Missions',
    description: 'Complete daily activities and earn XP.',
    reward: '+30 XP',
    status: 'AVAILABLE',
    icon: Target,
    color: 'gold',
  },
  {
    title: 'Streak Bonus',
    description: 'Maintain your daily activity streak.',
    reward: 'Coming Soon',
    status: 'COMING SOON',
    icon: Zap,
    color: 'purple',
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

export default function LevelDashboard() {
  const [currentXP, setCurrentXP] = useState(() => {
    const savedXP = localStorage.getItem('veloop-total-xp');

    return savedXP === null
      ? Number(levelData.currentXP) || 0
      : Math.max(0, Number(savedXP) || 0);
  });

  useEffect(() => {
    localStorage.setItem('veloop-total-xp', String(currentXP));
  }, [currentXP]);

  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = currentXP % XP_PER_LEVEL;
  const progress = Math.min(100, (xpIntoLevel / XP_PER_LEVEL) * 100);
  const remainingXP = XP_PER_LEVEL - xpIntoLevel;
  const nextLevel = currentLevel + 1;

  const currentTier =
    levelTiers[Math.min(currentLevel - 1, levelTiers.length - 1)];

  const formattedXP = useMemo(
    () => currentXP.toLocaleString('en-IN'),
    [currentXP]
  );

  const addXP = (amount) => {
    setCurrentXP((previousXP) => previousXP + amount);
  };

  return (
    <main className={styles.dashboard}>
      <div className={styles.ambientGlow} />

      {/* TOP NAVIGATION */}
      <header className={styles.topbar}>
        <a href="#home" className={styles.brand}>
          <span className={styles.brandMark}>V</span>
          <span className={styles.brandName}>
            VELOOP
            <small>REWARDS</small>
          </span>
        </a>

        <div className={styles.topbarRight}>
          <span className={styles.liveStatus}>
            <i /> REWARDS HUB
          </span>

          <button className={styles.iconButton} aria-label="Notifications">
            <Bell size={18} />
            <b />
          </button>

          <span className={styles.avatar}>V</span>
        </div>
      </header>

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

          {/* CURRENT LEVEL */}
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
                  <strong>{String(currentLevel).padStart(2, '0')}</strong>
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
                  <b>{remainingXP.toLocaleString('en-IN')} XP</b>
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

              <span>{levelData.rewardCurrency || 'VEs'}</span>
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
            {Array.from({ length: 5 }, (_, index) => currentLevel + index)
              .map((level) => {
                const state =
                  level < currentLevel
                    ? 'completed'
                    : level === currentLevel
                      ? 'current'
                      : 'locked';

                const tier =
                  levelTiers[Math.min(level - 1, levelTiers.length - 1)];

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
                  </div>
                );
              })}
          </div>
        </section>

        {/* EARNING FEATURES */}
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

              return (
                <article
                  className={styles.earningCard}
                  key={feature.title}
                >
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
                </article>
              );
            })}
          </div>
        </section>

        {/* EXISTING XP CATCHER - FUNCTIONALITY PRESERVED */}
        <XPCatcher onEarnXP={addXP} />

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