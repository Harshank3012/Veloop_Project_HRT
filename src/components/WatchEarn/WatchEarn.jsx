
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Coins,
  Gift,
  Info,
  Pause,
  Play,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { logActivity } from '../../utils/ActivityTracker';
import styles from './WatchEarn.module.css';

const XP_STORAGE_KEY = 'veloop-total-xp';
const CLAIMED_STORAGE_KEY = 'veloop-watch-earn-claimed';

const DEMO_VIDEOS = [
  {
    id: 'video-01',
    title: 'Discover the VELOOP Rewards Experience',
    category: 'Platform Spotlight',
    description: 'Explore how VELOOP makes everyday engagement rewarding.',
    duration: 30,
    reward: 50,
    color: 'purple',
    icon: Sparkles,
  },
  {
    id: 'video-02',
    title: 'Smart Ways to Earn More Rewards',
    category: 'Rewards & Lifestyle',
    description: 'Learn about missions, streaks and reward opportunities.',
    duration: 45,
    reward: 75,
    color: 'gold',
    icon: Gift,
  },
  {
    id: 'video-03',
    title: 'Your Journey to the Next Level',
    category: 'Level Up',
    description: 'Discover how XP helps you progress through VELOOP.',
    duration: 60,
    reward: 100,
    color: 'blue',
    icon: Zap,
  },
];

function getClaimedVideos() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CLAIMED_STORAGE_KEY) || '[]'
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function WatchEarn() {
  const [selectedVideoId, setSelectedVideoId] = useState(DEMO_VIDEOS[0].id);
  const [secondsLeft, setSecondsLeft] = useState(DEMO_VIDEOS[0].duration);
  const [isWatching, setIsWatching] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [claimedVideos, setClaimedVideos] = useState(getClaimedVideos);
  const [totalEarned, setTotalEarned] = useState(() =>
    DEMO_VIDEOS.reduce(
      (total, video) =>
        getClaimedVideos().includes(video.id)
          ? total + video.reward
          : total,
      0
    )
  );

  const selectedVideo = useMemo(
    () => DEMO_VIDEOS.find((video) => video.id === selectedVideoId),
    [selectedVideoId]
  );

  const isClaimed = claimedVideos.includes(selectedVideo.id);
  const progress = Math.min(
    100,
    ((selectedVideo.duration - secondsLeft) / selectedVideo.duration) * 100
  );

  useEffect(() => {
    if (!isWatching || secondsLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setIsWatching(false);
          setIsCompleted(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isWatching, secondsLeft]);

  const selectVideo = (video) => {
    if (isWatching) setIsWatching(false);

    setSelectedVideoId(video.id);
    setSecondsLeft(video.duration);
    setIsCompleted(false);
  };

  const startWatching = () => {
    if (isClaimed || isCompleted) return;
    setIsWatching(true);
  };

  const pauseWatching = () => {
    setIsWatching(false);
  };

  const claimReward = () => {
    if (!isCompleted || isClaimed) return;

    const updatedClaimed = [...claimedVideos, selectedVideo.id];
    const currentXP = Math.max(
      0,
      Number(localStorage.getItem(XP_STORAGE_KEY) || 0) || 0
    );
    const updatedXP = currentXP + selectedVideo.reward;

    // Save claimed video IDs to prevent duplicate claims.
    localStorage.setItem(
      CLAIMED_STORAGE_KEY,
      JSON.stringify(updatedClaimed)
    );

    // Update the same XP value used by the Level Dashboard.
    localStorage.setItem(XP_STORAGE_KEY, String(updatedXP));

    setClaimedVideos(updatedClaimed);
    setTotalEarned((previous) => previous + selectedVideo.reward);

    logActivity({
      type: 'xp',
      title: 'Watch & Earn Reward',
      description: `You earned ${selectedVideo.reward} XP by completing "${selectedVideo.title}".`,
      xp: selectedVideo.reward,
    });

    // Notify the existing dashboard XP listener.
    window.dispatchEvent(new Event('veloop-xp-updated'));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  const SelectedIcon = selectedVideo.icon;

  return (
    <main className={styles.page}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        <Link to="/Lvl-Dashboard" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <section className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>
              <PlayCircle size={15} />
              VELOOP EARNING HUB
            </div>

            <h1>
              Watch. Earn. <span>Level Up.</span>
            </h1>

            <p>
              Complete video sessions and collect XP as you progress
              through your VELOOP journey.
            </p>
          </div>

          <div className={styles.earnedCard}>
            <div className={styles.earnedIcon}>
              <Coins size={23} />
            </div>
            <div>
              <span>TOTAL XP EARNED HERE</span>
              <strong>{totalEarned.toLocaleString('en-IN')} XP</strong>
            </div>
          </div>
        </section>

        <div className={styles.demoNotice}>
          <Info size={17} />
          <span>
            <strong>Frontend demo:</strong> Video sessions and XP rewards
            are simulated. Actual advertisements and reward verification
            will be integrated by the company later.
          </span>
        </div>

        <section className={styles.mainGrid}>
          <div className={styles.playerColumn}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>NOW SELECTED</span>
                <h2>Watch & Earn</h2>
              </div>
              <span className={styles.demoTag}>DEMO PLAYER</span>
            </div>

            <article className={styles.playerCard}>
              <div className={`${styles.playerScreen} ${styles[selectedVideo.color]}`}>
                <div className={styles.playerDecorOne} />
                <div className={styles.playerDecorTwo} />

                <div className={styles.playerContent}>
                  <div className={styles.playOrb}>
                    <SelectedIcon size={34} />
                  </div>

                  <span className={styles.previewLabel}>
                    VELOOP VIDEO EXPERIENCE
                  </span>

                  <h3>{selectedVideo.title}</h3>

                  <span className={styles.previewCategory}>
                    {selectedVideo.category}
                  </span>
                </div>

                <div className={styles.playerBottom}>
                  <span>
                    <Video size={14} /> Demo video preview
                  </span>
                  <span>{formatTime(selectedVideo.duration)}</span>
                </div>
              </div>

              <div className={styles.playerDetails}>
                <div className={styles.videoTitleRow}>
                  <div>
                    <span className={styles.sectionEyebrow}>
                      {selectedVideo.category}
                    </span>
                    <h3>{selectedVideo.title}</h3>
                  </div>

                  <div className={styles.rewardPill}>
                    <Zap size={15} />
                    +{selectedVideo.reward} XP
                  </div>
                </div>

                <p className={styles.description}>
                  {selectedVideo.description}
                </p>

                <div className={styles.watchProgress}>
                  <div className={styles.progressLabels}>
                    <span>Watch progress</span>
                    <strong>{Math.round(progress)}%</strong>
                  </div>

                  <div
                    className={styles.progressTrack}
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={Math.round(progress)}
                  >
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className={styles.timerRow}>
                    <span>
                      <Timer size={14} />
                      {isCompleted ? 'Watch completed' : 'Time remaining'}
                    </span>
                    <strong>{formatTime(secondsLeft)}</strong>
                  </div>
                </div>

                {isClaimed ? (
                  <div className={styles.claimedState}>
                    <CheckCircle2 size={19} />
                    Reward already claimed
                  </div>
                ) : isCompleted ? (
                  <button
                    type="button"
                    className={styles.claimButton}
                    onClick={claimReward}
                  >
                    <Gift size={18} />
                    Claim +{selectedVideo.reward} XP
                  </button>
                ) : isWatching ? (
                  <button
                    type="button"
                    className={styles.watchButton}
                    onClick={pauseWatching}
                  >
                    <Pause size={18} />
                    Pause Watch Session
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.watchButton}
                    onClick={startWatching}
                  >
                    <Play size={18} fill="currentColor" />
                    {progress > 0 ? 'Resume Watching' : 'Start Watching'}
                  </button>
                )}

                <p className={styles.eligibilityNote}>
                  <ShieldCheck size={14} />
                  {isClaimed
                    ? 'This video reward has already been collected.'
                    : 'Complete the full watch session to unlock the reward.'}
                </p>
              </div>
            </article>
          </div>

          <aside className={styles.videoColumn}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>EARNING LIBRARY</span>
                <h2>Available Videos</h2>
              </div>
              <span className={styles.videoCount}>
                {DEMO_VIDEOS.length} VIDEOS
              </span>
            </div>

            <div className={styles.videoList}>
              {DEMO_VIDEOS.map((video) => {
                const Icon = video.icon;
                const selected = selectedVideoId === video.id;
                const claimed = claimedVideos.includes(video.id);

                return (
                  <button
                    type="button"
                    key={video.id}
                    className={`${styles.videoItem} ${
                      selected ? styles.selectedVideo : ''
                    }`}
                    onClick={() => selectVideo(video)}
                    disabled={isWatching && !selected}
                  >
                    <div className={`${styles.videoThumb} ${styles[video.color]}`}>
                      <Icon size={23} />
                      <span className={styles.thumbPlay}>
                        <Play size={11} fill="currentColor" />
                      </span>
                    </div>

                    <div className={styles.videoInfo}>
                      <span>{video.category}</span>
                      <strong>{video.title}</strong>
                      <small>
                        <Clock3 size={12} />
                        {formatTime(video.duration)}
                        <b>•</b>
                        +{video.reward} XP
                      </small>
                    </div>

                    <div className={styles.videoStatus}>
                      {claimed ? (
                        <CheckCircle2 size={18} />
                      ) : selected ? (
                        <span className={styles.nowPlaying}>NOW</span>
                      ) : (
                        <PlayCircle size={19} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={styles.rulesCard}>
              <div className={styles.rulesTitle}>
                <ShieldCheck size={18} />
                How it works
              </div>
              <ul>
                <li>Select an available video.</li>
                <li>Start and complete its watch timer.</li>
                <li>Claim your XP after completion.</li>
                <li>Each demo video can be claimed once.</li>
              </ul>
              <div className={styles.rulesFooter}>
                <Info size={14} />
                Demo rewards only. Not redeemable.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
