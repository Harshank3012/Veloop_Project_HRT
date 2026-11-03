import { useEffect, useState } from 'react';
import { getActivities, clearActivities } from '../utils/ActivityTracker';

import {
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

export function MissionsPage() {
  const missions = [
    { id: 1, title: 'Complete your profile', description: 'Keep your VELOOP profile updated.', xp: 30 },
    { id: 2, title: 'Play XP Catcher', description: 'Play one round of the XP Catcher game.', xp: 30 },
    { id: 3, title: 'Explore your rewards', description: 'Visit your Rewards & Badges page.', xp: 20 },
  ];

  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('veloop-daily-missions') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const toggleMission = (id) => {
    // Completion is tracked here. XP integration will be connected to
    // the shared rewards system in the next step.
    const updated = completed.includes(id)
      ? completed.filter((item) => item !== id)
      : [...completed, id];

    setCompleted(updated);
    localStorage.setItem('veloop-daily-missions', JSON.stringify(updated));
  };

  return (
    <FeatureLayout
      eyebrow="YOUR DAILY CHALLENGES"
      title="Daily Missions"
      description="Complete activities, build consistency and earn experience."
      icon={Target}
    >
      <div className={styles.stats}>
        <div><span>MISSIONS COMPLETED</span><strong>{completed.length}/{missions.length}</strong></div>
        <div><span>XP AVAILABLE</span><strong>{missions.reduce((sum, m) => sum + m.xp, 0)} XP</strong></div>
      </div>

      <div className={styles.sectionTitle}>Today's missions</div>

      <div className={styles.cards}>
        {missions.map((mission) => {
          const done = completed.includes(mission.id);

          return (
            <article className={styles.card} key={mission.id}>
              <div className={styles.cardIcon}><Target size={21} /></div>
              <div className={styles.cardBody}>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
                <strong>+{mission.xp} XP</strong>
              </div>
              <button
                className={done ? styles.completedButton : styles.actionButton}
                onClick={() => toggleMission(mission.id)}
              >
                {done ? <><CheckCircle2 size={15} /> Completed</> : 'Mark complete'}
              </button>
            </article>
          );
        })}
      </div>

      <p className={styles.notice}>
        Mission completion is currently saved locally. XP rewards will be connected in the next integration step.
      </p>
    </FeatureLayout>
  );
}

export function StreaksPage() {
  const [streakData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('veloop-streak-data') || '{}');
    } catch {
      return {};
    }
  });

  const currentStreak = Number(streakData.currentStreak ?? streakData.streak ?? 0);
  const bestStreak = Number(streakData.bestStreak ?? streakData.longestStreak ?? 0);

  const milestones = [
    { days: 3, reward: 50 },
    { days: 7, reward: 150 },
    { days: 14, reward: 350 },
    { days: 30, reward: 750 },
  ];

  return (
    <FeatureLayout
      eyebrow="BUILD YOUR CONSISTENCY"
      title="Streak Rewards"
      description="Stay active every day and reach exciting streak milestones."
      icon={Flame}
    >
      <div className={styles.stats}>
        <div><span>CURRENT STREAK</span><strong>{currentStreak} Days</strong></div>
        <div><span>BEST STREAK</span><strong>{bestStreak} Days</strong></div>
      </div>

      <div className={styles.sectionTitle}>Streak milestones</div>

      <div className={styles.cards}>
        {milestones.map((item) => {
          const achieved = currentStreak >= item.days;

          return (
            <article className={styles.card} key={item.days}>
              <div className={styles.cardIcon}><Flame size={22} /></div>
              <div className={styles.cardBody}>
                <h3>{item.days}-Day Streak</h3>
                <p>{achieved ? 'Milestone reached!' : `${item.days - currentStreak} more days to reach this milestone.`}</p>
                <strong>+{item.reward} XP</strong>
              </div>
              <span className={achieved ? styles.unlocked : styles.locked}>
                {achieved ? 'UNLOCKED' : <><Lock size={13} /> LOCKED</>}
              </span>
            </article>
          );
        })}
      </div>

      <p className={styles.notice}>
        Streak information is read from your existing streak data. Reward claiming will be connected to the shared XP system next.
      </p>
    </FeatureLayout>
  );
}

export function ActivityPage() {
  const [activities, setActivities] = useState(getActivities);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const refresh = () => setActivities(getActivities());

    window.addEventListener('veloop-activity-updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('veloop-activity-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const totalXP = Number(
    localStorage.getItem('veloop-total-xp') || 0
  );

  const currentLevel = Math.floor(totalXP / 1500) + 1;

  const filteredActivities = activities.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
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
          className={styles.clearButton}
          onClick={() => {
            if (window.confirm('Clear all activity history?')) {
              clearActivities();
              setActivities([]);
            }
          }}
          disabled={activities.length === 0}
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
            key={value}
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

      {filteredActivities.length > 0 ? (
        <div className={styles.activityList}>
          {filteredActivities.map((item) => (
            <article className={styles.activityItem} key={item.id}>
              <div className={styles.activityIcon}>
                {getActivityIcon(item.type)}
              </div>

              <div className={styles.activityDetails}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <small>{formatDate(item.timestamp)}</small>
              </div>

              {item.xp > 0 && (
                <strong className={styles.activityXP}>
                  +{item.xp} XP
                </strong>
              )}
            </article>
          ))}
        </div>
      ) : (
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

          <Link to="/Lvl-Dashboard" className={styles.actionButton}>
            <Trophy size={15} />
            Back to Overview
          </Link>
        </div>
      )}
    </FeatureLayout>
  );
}