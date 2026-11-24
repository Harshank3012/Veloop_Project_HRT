import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Sparkles, Zap } from 'lucide-react';
import RankEmblem from './RankEmblem.jsx';
import styles from './LevelJourney.module.css';

const tiers = [
  { id: 'bronze', name: 'Bronze Explorer', range: 'LEVEL 01–10', min: 1, max: 10, subtitle: 'The beginning of your journey', mark: 'I' },
  { id: 'silver', name: 'Silver Adventurer', range: 'LEVEL 11–20', min: 11, max: 20, subtitle: 'Build your momentum', mark: 'II' },
  { id: 'gold', name: 'Gold Champion', range: 'LEVEL 21–35', min: 21, max: 35, subtitle: 'Earn your place among the best', mark: 'III' },
  { id: 'platinum', name: 'Platinum Master', range: 'LEVEL 36–50', min: 36, max: 50, subtitle: 'A mark of consistency', mark: 'IV' },
  { id: 'diamond', name: 'Diamond Elite', range: 'LEVEL 51–75', min: 51, max: 75, subtitle: 'Stand out from the crowd', mark: 'V' },
  { id: 'legendary', name: 'Legendary', range: 'LEVEL 76–100', min: 76, max: 100, subtitle: 'A legacy in the making', mark: 'VI' },
  { id: 'transcendent', name: 'Transcendent', range: 'LEVEL 101+', min: 101, max: Infinity, subtitle: 'Beyond every boundary', mark: 'VII' },
];

export default function LevelJourney({ currentLevel, currentXP, xpPerLevel }) {
  const scroller = useRef(null);
  const active = useRef(null);
  const currentTier = tiers.find((tier) => currentLevel >= tier.min && currentLevel <= tier.max) || tiers[0];
  const xpInLevel = currentXP % xpPerLevel;
  const progress = Math.min(100, (xpInLevel / xpPerLevel) * 100);
  const remaining = xpPerLevel - xpInLevel;

  useEffect(() => {
    if (!active.current || !scroller.current) return;
    const container = scroller.current;
    const card = active.current;
    container.scrollTo({ left: card.offsetLeft - (container.clientWidth - card.clientWidth) / 2, behavior: 'smooth' });
  }, [currentLevel]);

  const scroll = (direction) => scroller.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });

  return (
    <section className={styles.section} aria-labelledby="journey-title">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={13} /> YOUR RANK COLLECTION</span>
          <h2 id="journey-title">The level journey</h2>
          <p>Seven ranks. One journey. Every milestone brings you closer to the top.</p>
        </div>
        <div className={styles.controls}>
          <span>SCROLL TO EXPLORE</span>
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll levels left"><ArrowLeft size={16} /></button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll levels right"><ArrowRight size={16} /></button>
        </div>
      </div>

      <div className={styles.trackWrap}>
        <div className={styles.trackLine} aria-hidden="true" />
        <div className={styles.scroller} ref={scroller} tabIndex={0} aria-label="Seven horizontally scrollable level badges">
          {tiers.map((tier, index) => {
            const state = currentLevel > tier.max ? 'completed' : currentLevel >= tier.min ? 'current' : 'locked';
            const isCurrent = tier.id === currentTier.id;
            const Icon = state === 'completed' ? Check : state === 'current' ? Zap : LockKeyhole;
            return (
              <article key={tier.id} ref={isCurrent ? active : null} className={`${styles.tierCard} ${styles[tier.id]} ${styles[state]} ${isCurrent ? styles.active : ''}`}>
                <div className={styles.cardTop}><span className={styles.rankNo}>RANK {tier.mark}</span><span className={styles.state}><Icon size={12} />{state === 'completed' ? 'UNLOCKED' : state === 'current' ? 'YOUR RANK' : 'LOCKED'}</span></div>
                <div className={styles.artStage}>
                  <span className={styles.artHalo} />
                  <RankEmblem tier={tier.id} state={state} variant="roadmap" />
                  <span className={styles.levelStamp}>{String(tier.min).padStart(2, '0')}</span>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.range}>{tier.range}</span>
                  <h3>{tier.name}</h3>
                  <p>{tier.subtitle}</p>
                </div>
                {isCurrent ? (
                  <div className={styles.currentProgress}>
                    <div className={styles.progressLabels}><span>LEVEL {currentLevel} PROGRESS</span><b>{Math.round(progress)}%</b></div>
                    <div className={styles.progressBar}><span style={{ width: `${progress}%` }} /></div>
                    <small>{remaining.toLocaleString('en-IN')} XP to next level</small>
                  </div>
                ) : (
                  <div className={styles.cardFoot}>{state === 'completed' ? 'Milestone achieved' : `Unlock at level ${tier.min}`}<span>{state === 'completed' ? '✓' : '✧'}</span></div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <div className={styles.journeyFoot}><span><i className={styles.dotDone} /> Unlocked</span><span><i className={styles.dotCurrent} /> Current rank</span><span><i className={styles.dotLocked} /> Future rank</span><strong>{currentTier.name} <span>·</span> {currentXP.toLocaleString('en-IN')} TOTAL XP</strong></div>
    </section>
  );
}
