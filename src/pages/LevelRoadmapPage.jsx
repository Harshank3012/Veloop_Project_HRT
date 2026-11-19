import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole, Sparkles, Trophy, Zap } from 'lucide-react';
import RankEmblem from '../components/LevelDashboard/RankEmblem.jsx';
import { XP_PER_LEVEL } from '../data/levelData';
import styles from './LevelRoadmapPage.module.css';

const XP_KEY = 'veloop-total-xp';
const tiers = [
  { name: 'Bronze Explorer', color: 'bronze', min: 1, max: 10 },
  { name: 'Silver Adventurer', color: 'silver', min: 11, max: 20 },
  { name: 'Gold Champion', color: 'gold', min: 21, max: 35 },
  { name: 'Platinum Master', color: 'platinum', min: 36, max: 50 },
  { name: 'Diamond Elite', color: 'diamond', min: 51, max: 75 },
  { name: 'Legendary', color: 'legendary', min: 76, max: 100 },
  { name: 'Transcendent', color: 'transcendent', min: 101, max: Infinity },
];

function readXP() {
  try { return Math.max(0, Number(localStorage.getItem(XP_KEY)) || 0); }
  catch { return 0; }
}

export default function LevelRoadmapPage() {
  const [totalXP, setTotalXP] = useState(readXP);
  const [selectedRank, setSelectedRank] = useState(null);

  useEffect(() => {
    const sync = () => setTotalXP(readXP());
    const syncVisible = () => { if (document.visibilityState === 'visible') sync(); };
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('veloop-xp-updated', sync);
    document.addEventListener('visibilitychange', syncVisible);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('veloop-xp-updated', sync);
      document.removeEventListener('visibilitychange', syncVisible);
    };
  }, []);

  const currentLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const progress = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const remaining = XP_PER_LEVEL - xpInLevel;
  const currentTier = tiers.find((tier) => currentLevel >= tier.min && currentLevel <= tier.max) || tiers[tiers.length - 1];
  const selected = useMemo(() => tiers.find((tier) => tier.color === selectedRank) || currentTier, [selectedRank, currentTier]);
  const selectedState = currentLevel > selected.max ? 'completed' : currentLevel >= selected.min ? 'current' : 'locked';
  const xpToEnter = Math.max(0, (selected.min - 1) * XP_PER_LEVEL - totalXP);
  const xpToComplete = selected.max === Infinity ? 'UNLIMITED' : `${(selected.max * XP_PER_LEVEL).toLocaleString('en-IN')} XP`;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link to="/Lvl-Dashboard" className={styles.back}><ArrowLeft size={16} /> Back to dashboard</Link>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={14} /> YOUR VELOOP JOURNEY</span>
            <h1>Level <em>Roadmap</em></h1>
            <p>Seven ranks. One journey. Keep moving forward. Earn experience, conquer milestones and rise through the VELOOP ranks.</p>
          </div>
          <div className={styles.progressBox}>
            <div className={styles.progressTop}><span>LEVEL {currentLevel} PROGRESS</span><strong>{progress}%</strong></div>
            <div className={styles.track}><span style={{ width: `${progress}%` }} /></div>
            <small>{remaining.toLocaleString('en-IN')} XP to your next level</small>
          </div>
        </header>

        <section className={styles.stats} aria-label="Your progression stats">
          <div><span>TOTAL XP</span><strong>{totalXP.toLocaleString('en-IN')} XP</strong></div>
          <div><span>CURRENT LEVEL</span><strong>{currentLevel}</strong></div>
          <div><span>CURRENT RANK</span><strong>{currentTier.name}</strong></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>THE ROYAL ASCENSION</span><h2>Your Rank Journey</h2><p>Choose a rank to view its milestones and XP requirements.</p></div>
            <div className={styles.legend}><span><i className={styles.doneDot}/>Completed</span><span><i className={styles.currentDot}/>Current</span><span><i className={styles.lockedDot}/>Locked</span></div>
          </div>

          <div className={styles.rankGrid}>
            {tiers.map((tier) => {
              const state = currentLevel > tier.max ? 'completed' : currentLevel >= tier.min ? 'current' : 'locked';
              const range = tier.max === Infinity ? `LEVEL ${tier.min}+` : `LEVEL ${tier.min}–${tier.max}`;
              const active = selected.color === tier.color;
              return (
                <button
                  type="button"
                  key={tier.color}
                  className={`${styles.rankCard} ${styles[state]} ${active ? styles.selected : ''}`}
                  onClick={() => setSelectedRank(tier.color)}
                  aria-pressed={active}
                >
                  <span className={styles.cardTop}><span>{range}</span>{state === 'completed' ? <Check size={16}/> : state === 'current' ? <Zap size={16}/> : <LockKeyhole size={15}/>}</span>
                  <span className={styles.emblem}><RankEmblem tier={tier.color} state={state} variant="roadmap"/></span>
                  <strong>{tier.name}</strong>
                  <span className={styles.status}>{state === 'completed' ? 'COMPLETED' : state === 'current' ? 'CURRENT RANK' : 'LOCKED'}</span>
                </button>
              );
            })}
            <div className={styles.comingSoon}>
              <span><Trophy size={27}/></span>
              <small>THE JOURNEY CONTINUES</small>
              <strong>More Ranks</strong>
              <b>COMING SOON</b>
              <p>New challenges. New milestones. New legends to unlock.</p>
            </div>
          </div>
        </section>

        <section className={styles.detail} aria-live="polite">
          <div className={styles.detailEmblem}><RankEmblem tier={selected.color} state={selectedState} variant="roadmap"/></div>
          <div className={styles.detailCopy}>
            <span className={styles.eyebrow}>SELECTED RANK · {selectedState.toUpperCase()}</span>
            <h2>{selected.name}</h2>
            <p>{selectedState === 'completed' ? 'You have cleared this rank. Keep building your VELOOP journey.' : selectedState === 'current' ? `${remaining.toLocaleString('en-IN')} XP to your next level.` : `Earn ${xpToEnter.toLocaleString('en-IN')} more XP to unlock this rank.`}</p>
          </div>
          <div className={styles.detailMetrics}><span>LEVEL RANGE</span><strong>{selected.max === Infinity ? `${selected.min}+` : `${selected.min}–${selected.max}`}</strong><span>XP TO COMPLETE</span><strong>{xpToComplete}</strong></div>
        </section>
      </div>
    </main>
  );
}
