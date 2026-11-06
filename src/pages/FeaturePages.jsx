import { useEffect, useState } from 'react';
import {
  getActivitiesWithStatus,
  clearActivities,
  logActivity,
} from '../utils/ActivityTracker';

import {
  Award,
  Target,
  Flame,
  History,
  CheckCircle2,
  Lock,
  Zap,
  CalendarDays,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './FeaturePages.module.css';

function FeatureLayout({ eyebrow, title, description, icon: Icon, children }) {
  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <div className={styles.headingIcon}>
          <Icon size={25} />
        </div>
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </main>
  );
}


const MISSION_STREAK_KEY = 'veloop-mission-streak-data';
export function MissionsPage() {
  const missions = [
    {
      id: 1,
      title: 'Complete your profile',
      description: 'Keep your VELOOP profile updated.',
      xp: 30,
    },
    {
      id: 2,
      title: 'Play XP Catcher',
      description: 'Play one round of the XP Catcher game.',
      xp: 30,
    },
    {
      id: 3,
      title: 'Explore your rewards',
      description: 'Visit your Rewards & Badges page.',
      xp: 20,
    },
  ];

  const XP_KEY = 'veloop-total-xp';
  const DAILY_KEY = 'veloop-daily-missions';
  const DATE_KEY = 'veloop-daily-missions-date';
  const TOTAL_KEY = 'veloop-total-missions-completed';

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [completed, setCompleted] = useState(() => {
    try {
      const today = getToday();
      const savedDate = localStorage.getItem(DATE_KEY);

      if (savedDate !== today) {
        localStorage.setItem(DATE_KEY, today);
        localStorage.setItem(DAILY_KEY, '[]');
        return [];
      }

      const saved = JSON.parse(
        localStorage.getItem(DAILY_KEY) || '[]'
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const toggleMission = (id) => {
    // Prevent duplicate completion and duplicate XP.
    if (completed.includes(id)) return;

    const mission = missions.find((item) => item.id === id);
    if (!mission) return;

    const updated = [...completed, id];

    // Save today's completed missions.
    setCompleted(updated);
    localStorage.setItem(DAILY_KEY, JSON.stringify(updated));
    // Update daily mission streak only after all missions are completed.
if (updated.length === missions.length) {
  const today = getToday();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = [
    yesterdayDate.getFullYear(),
    String(yesterdayDate.getMonth() + 1).padStart(2, '0'),
    String(yesterdayDate.getDate()).padStart(2, '0'),
  ].join('-');

let missionStreak;

try {
  missionStreak = JSON.parse(
    localStorage.getItem(MISSION_STREAK_KEY) || '{}'
  );
} catch {
  missionStreak = {};
}

  if (missionStreak.lastCompletedDate !== today) {
    const previousStreak =
      Number(missionStreak.currentStreak) || 0;

    const newStreak =
      missionStreak.lastCompletedDate === yesterday
        ? previousStreak + 1
        : 1;

    const bestStreak = Math.max(
      Number(missionStreak.bestStreak) || 0,
      newStreak
    );

    localStorage.setItem(
      MISSION_STREAK_KEY,
      JSON.stringify({
        currentStreak: newStreak,
        bestStreak,
        lastCompletedDate: today,
      })
    );
  }
}
    localStorage.setItem(DATE_KEY, getToday());

    // Update total lifetime mission count.
    const previousTotal = Number(
      localStorage.getItem(TOTAL_KEY) || 0
    );

    localStorage.setItem(
      TOTAL_KEY,
      String(previousTotal + 1)
    );

    // Award XP.
    const previousXP = Number(
      localStorage.getItem(XP_KEY) || 0
    );

    const updatedXP = previousXP + mission.xp;

    localStorage.setItem(XP_KEY, String(updatedXP));

    // Record mission activity.
    logActivity({
      type: 'mission',
      title: `${mission.title} Completed`,
      description: `You completed a daily mission and earned ${mission.xp} XP.`,
      xp: mission.xp,
    });

    // Record XP transaction separately.
    logActivity({
      type: 'xp',
      title: 'Mission XP Earned',
      description: `You earned ${mission.xp} XP from ${mission.title}.`,
      xp: mission.xp,
    });

    // Queue a mission-completed popup for the Dashboard. It is stored first
    // because the Dashboard may be unmounted while this page is open.
    try {
      const pending = JSON.parse(
        localStorage.getItem('veloop-pending-mission-celebrations') || '[]'
      );

      pending.push({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        xp: mission.xp,
        completedAt: new Date().toISOString(),
      });

      localStorage.setItem(
        'veloop-pending-mission-celebrations',
        JSON.stringify(pending)
      );
    } catch (error) {
      console.error('Unable to queue mission celebration:', error);
    }

    // Notify other VELOOP components.
    window.dispatchEvent(new Event('veloop-mission-completed'));
    window.dispatchEvent(new Event('veloop-xp-updated'));
    window.dispatchEvent(new Event('veloop-achievements-updated'));
  };

  const totalXP = missions.reduce(
    (sum, mission) => sum + mission.xp,
    0
  );

  return (
    <FeatureLayout
      eyebrow="YOUR DAILY CHALLENGES"
      title="Daily Missions"
      description="Complete activities, build consistency and earn experience."
      icon={Target}
    >
      <div className={styles.stats}>
        <div>
          <span>MISSIONS COMPLETED</span>
          <strong>{completed.length}/{missions.length}</strong>
        </div>

        <div>
          <span>XP AVAILABLE</span>
          <strong>{totalXP} XP</strong>
        </div>
      </div>

      <div className={styles.sectionTitle}>Today's missions</div>

      <div className={styles.cards}>
        {missions.map((mission) => {
          const done = completed.includes(mission.id);

          return (
            <article className={styles.card} key={mission.id}>
              <div className={styles.cardIcon}>
                <Target size={21} />
              </div>

              <div className={styles.cardBody}>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
                <strong>+{mission.xp} XP</strong>
              </div>

              <button
                className={
                  done
                    ? styles.completedButton
                    : styles.actionButton
                }
                onClick={() => toggleMission(mission.id)}
                disabled={done}
              >
                {done ? (
                  <>
                    <CheckCircle2 size={15} /> Completed
                  </>
                ) : (
                  'Complete Mission'
                )}
              </button>
            </article>
          );
        })}
      </div>

      <p className={styles.notice}>
        Complete each daily mission once to earn XP.
        Your lifetime mission achievements are tracked separately.
      </p>
    </FeatureLayout>
  );
}


export function StreaksPage() {
  const STREAK_KEY = 'veloop-streak-data';
  const CLAIMED_KEY = 'veloop-claimed-streak-rewards';
  const XP_KEY = 'veloop-total-xp';

  const milestones = [
    { days: 3, reward: 50 },
    { days: 7, reward: 150 },
    { days: 14, reward: 350 },
    { days: 30, reward: 750 },
  ];

  const readStreakData = () => {
    try {
      return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const readClaimedRewards = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CLAIMED_KEY) || '[]');
      return Array.isArray(saved) ? saved.map(Number) : [];
    } catch {
      return [];
    }
  };

  const [streakData, setStreakData] = useState(readStreakData);
  const [claimedRewards, setClaimedRewards] = useState(readClaimedRewards);
  const [claimMessage, setClaimMessage] = useState('');

  useEffect(() => {
    const refresh = () => {
      setStreakData(readStreakData());
      setClaimedRewards(readClaimedRewards());
    };

    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('veloop-streak-updated', refresh);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('veloop-streak-updated', refresh);
    };
  }, []);

  const currentStreak = Math.max(
    0,
    Number(streakData.currentStreak ?? streakData.streak ?? 0) || 0
  );

  const bestStreak = Math.max(
    currentStreak,
    Number(streakData.bestStreak ?? streakData.longestStreak ?? 0) || 0
  );

  const claimReward = (milestone) => {
    const latestClaimed = readClaimedRewards();

    if (latestClaimed.includes(milestone.days)) {
      setClaimedRewards(latestClaimed);
      setClaimMessage('This reward has already been claimed.');
      return;
    }

    const latestData = readStreakData();
    const latestStreak = Number(
      latestData.currentStreak ?? latestData.streak ?? 0
    );

    if (latestStreak < milestone.days) {
      setClaimMessage('Streak milestone not reached yet.');
      return;
    }

    const previousXP = Math.max(
      0,
      Number(localStorage.getItem(XP_KEY)) || 0
    );

    const updatedXP = previousXP + milestone.reward;
    const updatedClaimed = [...latestClaimed, milestone.days];

    try {
      localStorage.setItem(CLAIMED_KEY, JSON.stringify(updatedClaimed));
      localStorage.setItem(XP_KEY, String(updatedXP));
    } catch (error) {
      console.error('Could not save streak reward:', error);
      setClaimMessage('Unable to save reward. Please try again.');
      return;
    }

    setClaimedRewards(updatedClaimed);
    setClaimMessage(`Congratulations! You earned ${milestone.reward} XP.`);

    logActivity({
      type: 'streak',
      title: `${milestone.days}-Day Streak Reward Claimed`,
      description: `You claimed your ${milestone.days}-day streak reward.`,
      xp: milestone.reward,
    });

    logActivity({
      type: 'xp',
      title: 'Streak Bonus XP Earned',
      description: `You earned ${milestone.reward} XP for reaching a ${milestone.days}-day streak.`,
      xp: milestone.reward,
    });

    window.dispatchEvent(new Event('veloop-xp-updated'));
    window.dispatchEvent(new Event('veloop-achievements-updated'));
  };

  return (
    <FeatureLayout
      eyebrow="BUILD YOUR CONSISTENCY"
      title="Streak Rewards"
      description="Stay active every day and claim XP when you reach a streak milestone."
      icon={Flame}
    >
      <div className={styles.stats}>
        <div>
          <span>CURRENT STREAK</span>
          <strong>{currentStreak} Days</strong>
        </div>
        <div>
          <span>BEST STREAK</span>
          <strong>{bestStreak} Days</strong>
        </div>
      </div>

      <div className={styles.sectionTitle}>Streak milestones</div>

      <div className={styles.cards}>
        {milestones.map((item) => {
          const achieved = currentStreak >= item.days;
          const claimed = claimedRewards.includes(item.days);

          return (
            <article className={styles.card} key={item.days}>
              <div className={styles.cardIcon}>
                <Flame size={22} />
              </div>

              <div className={styles.cardBody}>
                <h3>{item.days}-Day Streak</h3>
                <p>
                  {claimed
                    ? 'Reward successfully claimed.'
                    : achieved
                      ? 'Milestone reached! Claim your XP reward.'
                      : `${item.days - currentStreak} more days to reach this milestone.`}
                </p>
                <strong>+{item.reward} XP</strong>
              </div>

              {claimed ? (
                <span className={styles.completedButton}>
                  <CheckCircle2 size={15} /> Claimed
                </span>
              ) : achieved ? (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => claimReward(item)}
                  aria-label={`Claim ${item.reward} XP for ${item.days}-day streak`}
                >
                  Claim Reward
                </button>
              ) : (
                <span className={styles.locked}>
                  <Lock size={13} /> LOCKED
                </span>
              )}
            </article>
          );
        })}
      </div>

      {claimMessage && (
        <p className={styles.notice} role="status" aria-live="polite">
          {claimMessage}
        </p>
      )}

      <p className={styles.notice}>
        Each streak milestone can be claimed only once. Claimed rewards are saved on this device.
      </p>
    </FeatureLayout>
  );
}


export function ActivityPage() {
  const [activities, setActivities] = useState(
    () => getActivitiesWithStatus().activities
  );

  const [filter, setFilter] = useState('all');
  const [activityError, setActivityError] = useState(
    () => getActivitiesWithStatus().error
  );

  // Load or reload activity history
  const refreshActivities = () => {
    const result = getActivitiesWithStatus();

    setActivities(result.activities);
    setActivityError(result.error);
  };

  useEffect(() => {
    const refresh = () => {
      refreshActivities();
    };

    window.addEventListener('veloop-activity-updated', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener('veloop-activity-updated', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const totalXP = (() => {
    try {
      return Math.max(
        0,
        Number(localStorage.getItem('veloop-total-xp')) || 0
      );
    } catch {
      return 0;
    }
  })();

  const currentLevel = Math.floor(totalXP / 1500) + 1;

  const filteredActivities = activities.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type) => {
    if (type === 'game') return <Trophy size={20} />;
    if (type === 'level') return <Zap size={20} />;
    if (type === 'mission') return <Target size={20} />;
    if (type === 'badge') return <Award size={20} />;

    return <Zap size={20} />;
  };

  const handleClearHistory = () => {
    if (!window.confirm('Clear all activity history?')) {
      return;
    }

    const result = clearActivities();

    if (result.success) {
      setActivities([]);
      setActivityError(null);
    } else {
      setActivityError(result.error);
    }
  };

  return (
    <FeatureLayout
      eyebrow="YOUR VELOOP JOURNEY"
      title="Activity History"
      description="Every XP earned and achievement unlocked, all in one place."
      icon={History}
    >
      <div className={styles.stats}>
        <div>
          <span>TOTAL XP</span>
          <strong>{totalXP.toLocaleString('en-IN')} XP</strong>
        </div>

        <div>
          <span>CURRENT LEVEL</span>
          <strong>{currentLevel}</strong>
        </div>
      </div>

      <div className={styles.activityToolbar}>
        <div>
          <h2>Recent Activity</h2>
          <p>{activities.length} recorded activities</p>
        </div>

        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearHistory}
          disabled={activities.length === 0 || !!activityError}
        >
          Clear History
        </button>
      </div>

      <div className={styles.activityFilters}>
        {[
          ['all', 'All'],
          ['xp', 'XP Earned'],
          ['game', 'Games'],
          ['level', 'Level Ups'],
          ['mission', 'Missions'],
          ['badge', 'Badges'],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={
              filter === value
              ? styles.activeFilter
              : styles.filterButton
            }
        >
            {label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {activityError ? (
        <div
          className={styles.emptyState}
          role="alert"
          aria-live="assertive"
        >
          <div className={styles.emptyIcon}>
            <History size={30} />
          </div>

          <h3>Unable to Load Activity</h3>

          <p>{activityError}</p>

          <button
            type="button"
            className={styles.actionButton}
            onClick={refreshActivities}
          >
            Try Again
          </button>
        </div>
      ) : filteredActivities.length > 0 ? (
        /* Activity List */
        <div className={styles.activityList}>
          {filteredActivities.map((item) => (
            <article
              className={styles.activityItem}
              key={item.id}
            >
              <div className={styles.activityIcon}>
                {getActivityIcon(item.type)}
              </div>

              <div className={styles.activityDetails}>
                <strong>{item.title || 'Activity'}</strong>

                <p>{item.description || 'No description available.'}</p>

                <small>{formatDate(item.timestamp)}</small>
              </div>

              {Number(item.xp) > 0 && (
                <strong className={styles.activityXP}>
                  +{item.xp} XP
                </strong>
              )}
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <CalendarDays size={30} />
          </div>

          <h3>
            {activities.length === 0
              ? 'No activity yet'
              : 'No activities found'}
          </h3>

          <p>
            {activities.length === 0
              ? 'Play XP Catcher and earn XP. Your activity will automatically appear here.'
              : 'Try selecting another activity filter.'}
          </p>

          <Link
            to="/Lvl-Dashboard"
            className={styles.actionButton}
          >
            <Trophy size={15} />
            Back to Overview
          </Link>
        </div>
      )}
    </FeatureLayout>
  );
}