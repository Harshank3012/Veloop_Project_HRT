import { Gift, Rocket, Sparkles, Star } from 'lucide-react';
import styles from './ReferEarn.module.css';

export default function ReferEarn() {
  return (
    <main className={styles.page}>
      <div className={styles.comingSoon} aria-label="Refer and Earn coming soon">
        <div className={styles.rings} aria-hidden="true">
          <div className={styles.outerRing} />
          <div className={styles.innerRing} />

          <span className={`${styles.decoration} ${styles.sparkle}`}><Sparkles /></span>
          <span className={`${styles.decoration} ${styles.starOne}`}><Star /></span>
          <span className={`${styles.decoration} ${styles.starTwo}`}><Star /></span>
          <span className={`${styles.decoration} ${styles.rocketOne}`}><Rocket /></span>
          <span className={`${styles.decoration} ${styles.rocketTwo}`}><Rocket /></span>

          <div className={styles.giftBox}>
            <Gift size={72} strokeWidth={1.8} />
          </div>
        </div>
        <p className={styles.label}>COMING SOON</p>
      </div>
    </main>
  );
}
