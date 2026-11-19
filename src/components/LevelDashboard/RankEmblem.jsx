import React from 'react';
import styles from './RankEmblem.module.css';

import bronzeEmblem from '../../assets/rank-emblems/bronze.png';
import silverEmblem from '../../assets/rank-emblems/silver.png';
import goldEmblem from '../../assets/rank-emblems/gold.png';
import platinumEmblem from '../../assets/rank-emblems/platinum.png';
import diamondEmblem from '../../assets/rank-emblems/diamond.png';
import legendaryEmblem from '../../assets/rank-emblems/legendary.png';
import transcendentEmblem from '../../assets/rank-emblems/transcendent.png';

const rankArtwork = {
  bronze: bronzeEmblem,
  silver: silverEmblem,
  gold: goldEmblem,
  platinum: platinumEmblem,
  diamond: diamondEmblem,
  legendary: legendaryEmblem,
  transcendent: transcendentEmblem,
};

const rankNames = {
  bronze: 'Bronze Explorer',
  silver: 'Silver Adventurer',
  gold: 'Gold Champion',
  platinum: 'Platinum Master',
  diamond: 'Diamond Elite',
  legendary: 'Legendary',
  transcendent: 'Transcendent',
};

export default function RankEmblem({ tier, state = 'locked', className = '', variant = 'default' }) {
  const artwork = rankArtwork[tier] || rankArtwork.bronze;

  return (
    <div
      className={`${styles.emblem} ${styles[tier] || ''} ${styles[state] || ''} ${variant === 'roadmap' ? styles.roadmapVariant : ''} ${variant === 'hero' ? styles.heroVariant : ''} ${className}`}
      data-state={state}
    >
      <span className={styles.emblemAura} aria-hidden="true" />
      <img
        className={styles.artwork}
        src={artwork}
        alt={`${rankNames[tier] || 'Rank'} emblem`}
        draggable="false"
      />
      {state === 'completed' && (
        <span className={styles.stateMark} aria-label="Completed">✓</span>
      )}
      {state === 'locked' && (
        <span className={styles.lockMark} aria-label="Locked">✦</span>
      )}
    </div>
  );
}
