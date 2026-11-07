
import { createPortal } from 'react-dom';

import {
  X,
  Crown,
  Sparkles,
  ArrowUpRight,
  PartyPopper,
  ChevronRight,
  Shield,
  Star,
  Zap,
} from 'lucide-react';

import styles from './LevelUpCelebration.module.css';

const LEVEL_TIERS = [
  { name: 'Bronze Explorer', color: 'bronze', min: 1, max: 10 },
  { name: 'Silver Adventurer', color: 'silver', min: 11, max: 20 },
  { name: 'Gold Champion', color: 'gold', min: 21, max: 35 },
  { name: 'Platinum Master', color: 'platinum', min: 36, max: 50 },
  { name: 'Diamond Elite', color: 'diamond', min: 51, max: 75 },
  { name: 'Legendary', color: 'legendary', min: 76, max: 100 },
  { name: 'Transcendent', color: 'transcendent', min: 101, max: Infinity },
];

const getTier = (level) =>
  LEVEL_TIERS.find((tier) => level >= tier.min && level <= tier.max) ||
  LEVEL_TIERS[LEVEL_TIERS.length - 1];

export default function LevelUpCelebration({
  isOpen,
  previousLevel,
  newLevel,
  levelName,
  onClose,
}) {
  if (!isOpen) return null;

  const currentTier = getTier(Number(newLevel));
  const previousTier = getTier(Number(previousLevel));

  const tierChanged = previousTier.color !== currentTier.color;

  return createPortal((
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      <div
        className={`${styles.modal} ${styles[currentTier.color]}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.backgroundParticles}>
          {Array.from({ length: 16 }, (_, index) => (
  <span
    key={index}
    style={{
      '--particle-index': index,
      top: `${(index * 19 + 7) % 100}%`,
      left: `${(index * 37 + 5) % 100}%`,
    }}
  />
))}
        </div>

        <div className={styles.topGlow} />

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close celebration"
        >
          <X size={19} />
        </button>

        <div className={styles.celebrationHeader}>
          <span className={styles.eyebrow}>
            <PartyPopper size={15} />
            ACHIEVEMENT UNLOCKED
          </span>

          <h1 id="level-up-title">
            LEVEL <span>UP!</span>
          </h1>

          <p className={styles.subtitle}>
            Your power grows. Your legend continues.
          </p>
        </div>

        <div className={styles.rankShowcase}>
          <div className={`${styles.rankOrbit} ${styles.rankOrbitOne}`} />
          <div className={`${styles.rankOrbit} ${styles.rankOrbitTwo}`} />
          <div className={styles.rankAura} />

          <div className={styles.rankEmblem}>
            <div className={styles.rankEmblemBorder}>
              <div className={styles.rankEmblemCore}>
                <Crown size={34} />
              </div>
            </div>
          </div>

          <Sparkles className={styles.sparkleOne} size={23} />
          <Star className={styles.sparkleTwo} size={17} />
          <Zap className={styles.sparkleThree} size={18} />
        </div>

        <div className={styles.levelTransition}>
          <div className={styles.levelBox}>
            <span>PREVIOUS LEVEL</span>
            <strong>{String(previousLevel).padStart(2, '0')}</strong>
            <small>{previousTier.name}</small>
          </div>

          <div className={styles.transitionArrow}>
            <ArrowUpRight size={27} />
          </div>

          <div className={styles.levelBox}>
            <span>NEW LEVEL</span>
            <strong>{String(newLevel).padStart(2, '0')}</strong>
            <small>{currentTier.name}</small>
          </div>
        </div>

        {tierChanged && (
          <div className={styles.tierUpgrade}>
            <Sparkles size={15} />
            RANK EVOLUTION COMPLETE
          </div>
        )}

        <button
          type="button"
          className={styles.continueButton}
          onClick={onClose}
        >
          Continue Your Journey
          <ChevronRight size={19} />
        </button>

        <span className={styles.footerText}>
          VELOOP REWARDS · KEEP RISING
        </span>
      </div>
    </div>
  ), document.body);
}
