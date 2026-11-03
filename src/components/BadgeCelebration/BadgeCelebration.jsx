import {
  X,
  Award,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';

import styles from './BadgeCelebration.module.css';

export default function BadgeCelebration({
  badge,
  onClose,
}) {
  if (!badge) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close badge celebration"
        >
          <X size={20} />
        </button>

        <div className={styles.sparkleOne}>
          <Sparkles size={23} />
        </div>

        <div className={styles.sparkleTwo}>
          <Star size={19} />
        </div>

        <div className={styles.badgeIcon}>
          <Award size={48} />
        </div>

        <div className={styles.eyebrow}>
          <Trophy size={15} />
          ACHIEVEMENT UNLOCKED
        </div>

        <h1>{badge.title}</h1>

        <p className={styles.description}>
          {badge.description}
        </p>

        <div className={styles.rarity}>
          <Sparkles size={15} />
          {badge.rarity || 'COMMON'} BADGE
        </div>

        <div className={styles.congrats}>
          Congratulations! Keep collecting achievements.
        </div>

        <button
          className={styles.claimButton}
          onClick={onClose}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}