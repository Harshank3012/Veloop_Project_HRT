
import { useEffect, useRef, useState } from 'react';
import { Clock3, RotateCcw, Target, Zap, Trophy, Rocket, Satellite, Star } from 'lucide-react';
import styles from './XPCatcher.module.css';
import { logActivity } from '../../utils/ActivityTracker';

const GAME_SECONDS = 15;
const XP_PER_CATCH = 10;

const GAMES_KEY = 'veloop-games-played';
const OBJECTS_KEY = 'veloop-objects-caught';
const BEST_GAME_KEY = 'veloop-best-single-game-objects';

export default function XPCatcher({ onEarnXP }) {
  const [gameStatus, setGameStatus] = useState('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ left: 50, top: 50 });

  // Prevent duplicate game recording.
  const gameRecordedRef = useRef(false);

  useEffect(() => {
    if (gameStatus !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((time) => Math.max(0, time - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft === 0) {
      setGameStatus('finished');
    }
  }, [gameStatus, timeLeft]);

  // Save completed game exactly once.
  useEffect(() => {
    if (gameStatus !== 'finished' || gameRecordedRef.current) return;

    gameRecordedRef.current = true;

    // Update total games played.
    const previousGames =
      Number(localStorage.getItem(GAMES_KEY)) || 0;

    localStorage.setItem(
      GAMES_KEY,
      String(previousGames + 1)
    );

    // Update highest objects caught in a single game.
    const previousBest =
      Number(localStorage.getItem(BEST_GAME_KEY)) || 0;

    if (score > previousBest) {
      localStorage.setItem(BEST_GAME_KEY, String(score));
    }

    // Record game activity.
    logActivity({
      type: 'game',
      title: 'XP Catcher Completed',
      description: `You caught ${score} orbs and earned ${score * XP_PER_CATCH} XP.`,
      xp: 0,
    });


    window.dispatchEvent(
      new Event('veloop-achievements-updated')
    );
  }, [gameStatus, score]);

  const startGame = () => {
    setScore(0);
    gameRecordedRef.current = false;
    setTimeLeft(GAME_SECONDS);

    setTarget({
      left: 15 + Math.random() * 70,
      top: 18 + Math.random() * 64,
    });

    setGameStatus('playing');
  };

  const catchOrb = () => {
    if (gameStatus !== 'playing') return;

    setScore((current) => current + 1);

    // Update lifetime objects caught.
    const previousObjects =
      Number(localStorage.getItem(OBJECTS_KEY)) || 0;

    localStorage.setItem(
      OBJECTS_KEY,
      String(previousObjects + 1)
    );

    window.dispatchEvent(
      new Event('veloop-achievements-updated')
    );

    onEarnXP(XP_PER_CATCH);

    setTarget({
      left: 10 + Math.random() * 80,
      top: 15 + Math.random() * 70,
    });
  };

  return (
    <section className={styles.gameSection}>
<div className={styles.stats}>
        <div>
          <span>TIME LEFT</span>
          <strong>
            <Clock3 size={16} /> {timeLeft}s
          </strong>
        </div>

        <div>
          <span>ORBS CAUGHT</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>XP EARNED</span>
          <strong className={styles.xpEarned}>
            +{score * XP_PER_CATCH} XP
          </strong>
        </div>
      </div>

      <div className={`${styles.playArea} ${gameStatus === 'playing' ? styles.isPlaying : ''} ${gameStatus === 'finished' ? styles.isFinished : ''}`}>
        <div className={styles.spaceDecor} aria-hidden="true">
          <span className={`${styles.spaceStar} ${styles.starOne}`}><Star size={10} fill="currentColor" /></span>
          <span className={`${styles.spaceStar} ${styles.starTwo}`}><Star size={7} fill="currentColor" /></span>
          <span className={`${styles.spaceStar} ${styles.starThree}`}><Star size={8} fill="currentColor" /></span>
          <span className={`${styles.spaceStar} ${styles.starFour}`}><Star size={6} fill="currentColor" /></span>
          <span className={styles.spacePlanet}><span /></span>
          <span className={styles.spaceSat}><Satellite size={25} /></span>
          <span className={styles.spaceRocket}><Rocket size={23} /></span>
          <span className={styles.spaceMoon} />
        </div>
        {gameStatus === 'playing' ? (
          <button
            type="button"
            className={styles.orb}
            style={{
              left: `${target.left}%`,
              top: `${target.top}%`,
            }}
            onClick={catchOrb}
            aria-label="Catch XP orb"
          >
            <Zap size={22} fill="currentColor" />
          </button>
        ) : (
          <div className={styles.gameMessage}>
            <div className={styles.gameIcon}>
              {gameStatus === 'finished' ? <Trophy size={25} /> : <Zap size={27} />}
            </div>

            {gameStatus === 'finished' && <span className={styles.resultEyebrow}>CHALLENGE COMPLETE</span>}
            <strong>
              {gameStatus === 'finished'
                ? 'Time is up!'
                : 'Ready to catch XP?'}
            </strong>

            <span className={styles.messageDescription}>
              {gameStatus === 'finished'
                ? 'Great run. Your rewards have been added to your progress.'
                : 'You have 15 seconds. Tap each orb to collect XP.'}
            </span>

            {gameStatus === 'finished' && (
              <div className={styles.resultStats}>
                <div className={styles.resultStat}><span>ORBS CAUGHT</span><strong>{score}</strong></div>
                <div className={`${styles.resultStat} ${styles.resultXp}`}><span>XP EARNED</span><strong>+{score * XP_PER_CATCH} XP</strong></div>
              </div>
            )}

            <button
              type="button"
              className={styles.startButton}
              onClick={startGame}
            >
              {gameStatus === 'finished' ? (
                <>
                  <RotateCcw size={16} /> Play again
                </>
              ) : (
                'Start game'
              )}
            </button>
          </div>
        )}
      </div>

      <div className={styles.gameFootnote}>
        <Zap size={13} /> Every orb adds 10 XP to your dashboard · Progress saves automatically.
      </div>
    </section>
  );
}