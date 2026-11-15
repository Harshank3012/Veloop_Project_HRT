import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, LockKeyhole, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { XP_PER_LEVEL } from '../../data/levelData';
import RankEmblem from '../LevelDashboard/RankEmblem.jsx';
import styles from './LevelRoadmap.module.css';

const XP_STORAGE_KEY = 'veloop-total-xp';

const tiers = [
  { name: 'Bronze Explorer', min: 1, max: 10, color: 'bronze' },
  { name: 'Silver Adventurer', min: 11, max: 20, color: 'silver' },
  { name: 'Gold Champion', min: 21, max: 35, color: 'gold' },
  { name: 'Platinum Master', min: 36, max: 50, color: 'platinum' },
  { name: 'Diamond Elite', min: 51, max: 75, color: 'diamond' },
  { name: 'Legendary', min: 76, max: 100, color: 'legendary' },
  { name: 'Transcendent', min: 101, max: Infinity, color: 'transcendent' },
];

const getTier = (level) => tiers.find((tier) => level >= tier.min && level <= tier.max) || tiers[tiers.length - 1];
const readXP = () => {
  try {
    return Math.max(0, Number(localStorage.getItem(XP_STORAGE_KEY)) || 0);
  } catch {
    return 0;
  }
};

export default function LevelRoadmap() {
  const [totalXP, setTotalXP] = useState(readXP);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const activeCardRef = useRef(null);

  useEffect(() => {
    const refreshXP = () => setTotalXP(readXP());
    window.addEventListener('storage', refreshXP);
    window.addEventListener('veloop-xp-updated', refreshXP);
    window.addEventListener('veloop-activity-updated', refreshXP);
    window.addEventListener('focus', refreshXP);
    return () => {
      window.removeEventListener('storage', refreshXP);
      window.removeEventListener('veloop-xp-updated', refreshXP);
      window.removeEventListener('veloop-activity-updated', refreshXP);
      window.removeEventListener('focus', refreshXP);
    };
  }, []);

  const currentLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXP % XP_PER_LEVEL;
  const remainingXP = XP_PER_LEVEL - xpIntoLevel;
  const progress = (xpIntoLevel / XP_PER_LEVEL) * 100;

  const levels = useMemo(() => {
    const start = Math.max(1, currentLevel - 3);
    return Array.from({ length: 10 }, (_, index) => start + index);
  }, [currentLevel]);

  useEffect(() => {
    if (activeCardRef.current) {
      const scroller = activeCardRef.current.parentElement;
      const card = activeCardRef.current;
      scroller.scrollLeft = card.offsetLeft - (scroller.clientWidth / 2) + (card.clientWidth / 2);
    }
  }, [currentLevel]);

  const selected = selectedLevel || currentLevel;
  const selectedState = selected < currentLevel ? 'completed' : selected === currentLevel ? 'current' : 'locked';
  const selectedTier = getTier(selected);
  const xpToUnlock = Math.max(0, (selected - 1) * XP_PER_LEVEL - totalXP);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link to="/Lvl-Dashboard" className={styles.backLink}><ArrowLeft size={16} /> Back to dashboard</Link>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><Sparkles size={14} /> VELOOP REWARDS / PROGRESSION MAP</span>
            <h1>Your journey.<br /><em>Every milestone.</em></h1>
            <p>Explore the levels ahead, revisit the milestones you have cleared and see what it takes to unlock the next rank.</p>
          </div>
          <div className={styles.heroStats}>
            <div><span>CURRENT LEVEL</span><strong>{String(currentLevel).padStart(2, '0')}</strong><small>{getTier(currentLevel).name}</small></div>
            <div><span>TOTAL EXPERIENCE</span><strong>{totalXP.toLocaleString('en-IN')} <small>XP</small></strong><small>{remainingXP.toLocaleString('en-IN')} XP to Level {currentLevel + 1}</small></div>
          </div>
        </header>

        <section className={styles.progressPanel} aria-label="Current level progress">
          <div className={styles.progressTop}>
            <div><span className={styles.kicker}>CURRENT MILESTONE</span><h2>Level {String(currentLevel).padStart(2, '0')} <span>·</span> {getTier(currentLevel).name}</h2></div>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className={styles.progressTrack} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
          <div className={styles.progressFoot}><span>{xpIntoLevel.toLocaleString('en-IN')} / {XP_PER_LEVEL.toLocaleString('en-IN')} XP</span><span>{remainingXP.toLocaleString('en-IN')} XP remaining</span></div>
        </section>

        <section className={styles.roadmapSection}>
          <div className={styles.sectionHeading}>
            <div><span className={styles.kicker}>THE ROAD AHEAD</span><h2>Level roadmap</h2><p>Swipe, scroll or use the arrows to explore your progression.</p></div>
            <div className={styles.legend}><span><i className={styles.doneDot} /> Completed</span><span><i className={styles.currentDot} /> Current</span><span><i className={styles.lockedDot} /> Locked</span></div>
          </div>

          <div className={styles.roadmapFrame}>
            <div className={styles.roadmapTrack} aria-hidden="true" />
            <div className={styles.roadmap} id="level-roadmap-scroller" tabIndex="0" aria-label="Horizontally scrollable level roadmap">
              {levels.map((level) => {
                const state = level < currentLevel ? 'completed' : level === currentLevel ? 'current' : 'locked';
                const tier = getTier(level);
                const isCurrent = level === currentLevel;
                return (
                  <button
                    type="button"
                    key={level}
                    ref={isCurrent ? activeCardRef : null}
                    className={`${styles.levelCard} ${styles[state]} ${selected === level ? styles.selected : ''}`}
                    onClick={() => setSelectedLevel(level)}
                    aria-pressed={selected === level}
                  >
                    <span className={styles.cardTop}><span>LEVEL {String(level).padStart(2, '0')}</span>{state === 'completed' ? <Check size={15} /> : state === 'current' ? <Zap size={15} /> : <LockKeyhole size={14} />}</span>
                    <span className={styles.emblem}><RankEmblem tier={tier.color} state={state} variant="roadmap" /></span>
                    <strong className={styles.tierName}>{tier.name}</strong>
                    <span className={styles.stateLabel}>{state === 'completed' ? 'COMPLETED' : state === 'current' ? 'YOU ARE HERE' : 'LOCKED'}</span>
                    <span className={styles.cardRule} />
                    <span className={styles.cardXP}>{state === 'completed' ? 'Milestone reached' : state === 'current' ? `${remainingXP.toLocaleString('en-IN')} XP to next` : `${((level - 1) * XP_PER_LEVEL).toLocaleString('en-IN')} XP required`}</span>
                    <span className={styles.rewardHint}>{state === 'completed' ? 'Reward milestone cleared' : state === 'current' ? 'Next reward in progress' : 'Reward preview locked'}</span>
                  </button>
                );
              })}
            </div>
            <div className={styles.scrollControls}>
              <button type="button" aria-label="Scroll roadmap left" onClick={() => document.getElementById('level-roadmap-scroller')?.scrollBy({ left: -320, behavior: 'smooth' })}><ArrowLeft size={17} /></button>
              <span>SCROLL TO EXPLORE</span>
              <button type="button" aria-label="Scroll roadmap right" onClick={() => document.getElementById('level-roadmap-scroller')?.scrollBy({ left: 320, behavior: 'smooth' })}><ArrowRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className={styles.detailPanel} aria-live="polite">
          <div className={styles.detailEmblem}><RankEmblem tier={selectedTier.color} state={selectedState} variant="roadmap" /></div>
          <div className={styles.detailCopy}>
            <span className={styles.kicker}>SELECTED MILESTONE · {selectedState.toUpperCase()}</span>
            <h2>Level {String(selected).padStart(2, '0')} <span>·</span> {selectedTier.name}</h2>
            <p>{selectedState === 'completed' ? 'You have already cleared this milestone. Keep building your VELOOP journey.' : selectedState === 'current' ? `You are ${remainingXP.toLocaleString('en-IN')} XP away from your next level.` : `Earn ${xpToUnlock.toLocaleString('en-IN')} more XP to reach this locked milestone.`}</p>
          </div>
          <div className={styles.detailMetric}><span>{selectedState === 'completed' ? 'STATUS' : 'XP TO UNLOCK'}</span><strong>{selectedState === 'completed' ? 'Cleared' : selectedState === 'current' ? `${remainingXP.toLocaleString('en-IN')} XP` : `${xpToUnlock.toLocaleString('en-IN')} XP`}</strong></div>
          <Link to="/Lvl-Dashboard" className={styles.dashboardLink}>Back to dashboard <ChevronRight size={16} /></Link>
        </section>

        <p className={styles.disclaimer}>Level thresholds and XP are calculated from the current frontend demo configuration. Reward values and eligibility remain subject to the product's approved reward rules.</p>
      </div>
    </main>
  );
}
