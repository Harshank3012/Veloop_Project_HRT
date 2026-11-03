import {
  X,
  Crown,
  Sparkles,
  ArrowUpRight,
  PartyPopper,
  ChevronRight,
} from 'lucide-react';

import styles from './LevelUpCelebration.module.css';

export default function LevelUpCelebration({
  isOpen,
  previousLevel,
  newLevel,
  levelName,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close celebration"
        >
          <X size={20} />
        </button>

        <div className={styles.sparkleOne}>
          <Sparkles size={24} />
        </div>

        <div className={styles.sparkleTwo}>
          <Sparkles size={18} />
        </div>

        <div className={styles.mainIcon}>
          <Crown size={42} />
        </div>

        <div className={styles.eyebrow}>
          <PartyPopper size={15} />
          MILESTONE ACHIEVED
        </div>

        <h1>
          LEVEL <span>UP!</span>
        </h1>

        <p className={styles.subtitle}>
          Amazing work, Explorer! Your journey continues.
        </p>

        <div className={styles.levelTransition}>
          <div className={styles.levelBox}>
            <small>PREVIOUS LEVEL</small>
            <strong>
              {String(previousLevel).padStart(2, '0')}
            </strong>
          </div>

          <ArrowUpRight size={28} className={styles.arrow} />

          <div className={styles.levelBox}>
            <small>NEW LEVEL</small>
            <strong>
              {String(newLevel).padStart(2, '0')}
            </strong>
          </div>
        </div>

        <div className={styles.rankName}>
          <Crown size={17} />
          {levelName}
        </div>

        <button
          className={styles.continueButton}
          onClick={onClose}
        >
          Continue Journey
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}