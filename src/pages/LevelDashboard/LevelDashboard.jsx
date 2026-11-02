import { useEffect, useState } from 'react';
import { CircleHelp, Coins, Gift, Sparkles, Trophy, Zap } from 'lucide-react';
import { levelData, XP_PER_LEVEL } from '../../data/levelData';
import styles from './LevelDashboard.module.css';
import XPCatcher from '../../components/XPCatcher/XPCatcher.jsx';

export default function LevelDashboard() {
  const [currentXP, setCurrentXP] = useState(() => {
    const savedXP = window.localStorage.getItem('veloop-total-xp');
    return savedXP === null ? Number(levelData.currentXP) || 0 : Math.max(0, Number(savedXP) || 0);
  });
  useEffect(() => {
    window.localStorage.setItem('veloop-total-xp', String(currentXP));
  }, [currentXP]);
  const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = currentXP % XP_PER_LEVEL;
  const progress = (xpIntoLevel / XP_PER_LEVEL) * 100;
  const remainingXP = XP_PER_LEVEL - xpIntoLevel;
  const nextLevel = currentLevel + 1;
  const levelNames = ['Bronze Explorer', 'Silver Explorer', 'Gold Explorer', 'Platinum Explorer', 'Diamond Explorer'];
  const currentLevelName = levelNames[Math.min(currentLevel - 1, levelNames.length - 1)];
  const addXP = (amount) => setCurrentXP((xp) => xp + amount);

  return (
    <main className={styles.dashboard}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="#home" aria-label="VELOOP Rewards home">
          <span className={styles.brandMark}>V</span>
          <span>VELOOP<span className={styles.brandAccent}> Rewards</span></span>
        </a>
        <div className={styles.topbarRight}>
          <span className={styles.status}><i /> Rewards journey</span>
          <span className={styles.avatar}>V</span>
        </div>
      </header>

      <div className={styles.content} id="home">
        <section className={styles.welcome}>
          <div>
            <div className={styles.eyebrow}><Sparkles size={15} /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Every level brings <span>more possibilities.</span></h1>
            <p>Keep earning, keep progressing, and see what you can unlock next.</p>
          </div>
          <div className={styles.welcomeBadge}>
            <Trophy size={24} />
            <span>YOUR JOURNEY</span>
            <strong>Level {currentLevel}</strong>
          </div>
        </section>

        <section className={styles.heroGrid}>
          <article className={styles.levelCard}>
            <div className={styles.cardHeading}>
              <span>YOUR CURRENT LEVEL</span>
              <span className={styles.helpButton} title="Level information"><CircleHelp size={17} /></span>
            </div>
            <div className={styles.levelBody}>
              <div className={styles.levelBadge}>
                <span>LEVEL</span>
                <strong>{String(currentLevel).padStart(2, '0')}</strong>
              </div>
              <div className={styles.xpSummary}>
                <small>TOTAL EXPERIENCE</small>
                <div className={styles.xpNumber}>{currentXP.toLocaleString('en-IN')} <span>XP</span></div>
                <span className={styles.levelName}>{currentLevelName}</span>
              </div>
            </div>
            <div className={styles.progressSection}>
              <div className={styles.progressLabels}>
                <span>Level {currentLevel}</span>
                <strong>{progress.toFixed(1)}%</strong>
                <span>Level {nextLevel}</span>
              </div>
              <div className={styles.progressTrack} role="progressbar" aria-label="Progress toward next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Number(progress.toFixed(1))}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.remaining}><Zap size={15} /><strong>{remainingXP.toLocaleString('en-IN')} XP</strong> left to your next level</div>
            </div>
          </article>

          <article className={styles.rewardCard}>
            <div className={styles.cardHeading}>
              <span>NEXT LEVEL REWARD</span>
              <span className={styles.helpButton} title="Reward information"><CircleHelp size={17} /></span>
            </div>
            <div className={styles.chest}>
              <div className={styles.chestHalo} />
              <Gift size={65} strokeWidth={1.2} />
              <Sparkles className={styles.chestSparkle} size={22} />
            </div>
            <div className={styles.rewardAmount}>
              <Coins size={24} />
              <strong>{Number(levelData.reward) || 500}</strong>
              <span>{levelData.rewardCurrency || 'VEs'}</span>
            </div>
            <p className={styles.rewardCaption}>A new milestone. A new reward.</p>
            <div className={styles.lockedMessage}>
              <span>LOCKED</span>
              Reach Level {nextLevel} to unlock
            </div>
            <p className={styles.demoNotice}>Illustrative demo reward — not redeemable.</p>
          </article>
        </section>

        <XPCatcher onEarnXP={addXP} />

        <section className={styles.roadmapSection}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>YOUR PROGRESSION</div>
              <h2>The journey ahead</h2>
            </div>
            <span className={styles.smallPill}>LEVEL {currentLevel}</span>
          </div>
          <div className={styles.roadmap}>
            {Array.from({ length: 5 }, (_, index) => currentLevel + index).map((level) => {
              const state = level < currentLevel ? 'completed' : level === currentLevel ? 'current' : 'locked';
              return (
                <div className={styles.roadmapItem} key={level}>
                  <div className={`${styles.roadmapNode} ${styles[state]}`}>
                    {state === 'completed' ? '✓' : state === 'current' ? <Trophy size={20} /> : String(level).padStart(2, '0')}
                  </div>
                  <strong>Level {level}</strong>
                  <span className={styles.roadmapState}>{state === 'completed' ? 'Completed' : state === 'current' ? 'You are here' : 'Locked'}</span>
                </div>
              );
            })}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>VELOOP Rewards · Level-Up Experience</span>
          <span>Dashboard UI milestone · Demo data</span>
        </footer>
      </div>
    </main>
  );
}
