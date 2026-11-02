import { useEffect, useState } from 'react';
import { Clock3, RotateCcw, Target, Zap } from 'lucide-react';
import styles from './XPCatcher.module.css';

const GAME_SECONDS = 15;
const XP_PER_CATCH = 10;

export default function XPCatcher({ onEarnXP }) {
  const [gameStatus, setGameStatus] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ left: 50, top: 50 });

  useEffect(() => {
    if (gameStatus !== 'playing') return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((time) => Math.max(0, time - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft === 0) setGameStatus('finished');
  }, [gameStatus, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setTarget({ left: 15 + Math.random() * 70, top: 18 + Math.random() * 64 });
    setGameStatus('playing');
  };

  const catchOrb = () => {
    if (gameStatus !== 'playing') return;
    setScore((current) => current + 1);
    onEarnXP(XP_PER_CATCH);
    setTarget({ left: 10 + Math.random() * 80, top: 15 + Math.random() * 70 });
  };

  return (
    <section className={styles.gameSection} aria-labelledby="xp-catcher-title">
      <div className={styles.heading}>
        <div>
          <div className={styles.eyebrow}><Zap size={14} /> MINI GAME</div>
          <h2 id="xp-catcher-title">XP Catcher</h2>
          <p>Catch as many glowing XP orbs as you can before time runs out.</p>
        </div>
        <div className={styles.gameTag}><Target size={15} /> +{XP_PER_CATCH} XP / catch</div>
      </div>

      <div className={styles.stats}>
        <div><span>TIME LEFT</span><strong><Clock3 size={16} /> {timeLeft}s</strong></div>
        <div><span>ORBS CAUGHT</span><strong>{score}</strong></div>
        <div><span>XP EARNED</span><strong className={styles.xpEarned}>+{score * XP_PER_CATCH} XP</strong></div>
      </div>

      <div className={styles.playArea}>
        {gameStatus === 'playing' ? (
          <button
            type="button"
            className={styles.orb}
            style={{ left: `${target.left}%`, top: `${target.top}%` }}
            onClick={catchOrb}
            aria-label="Catch XP orb"
          ><Zap size={22} fill="currentColor" /></button>
        ) : (
          <div className={styles.gameMessage}>
            <div className={styles.gameIcon}><Zap size={27} /></div>
            <strong>{gameStatus === 'finished' ? 'Time is up!' : 'Ready to catch XP?'}</strong>
            <span>{gameStatus === 'finished' ? `You caught ${score} orbs and earned ${score * XP_PER_CATCH} XP.` : 'You have 15 seconds. Tap each orb to collect XP.'}</span>
            <button type="button" className={styles.startButton} onClick={startGame}>
              {gameStatus === 'finished' ? <><RotateCcw size={16} /> Play again</> : 'Start game'}
            </button>
          </div>
        )}
      </div>
      <div className={styles.gameFootnote}>Each caught orb adds 10 XP to your dashboard. Your XP is saved in this browser.</div>
    </section>
  );
}
