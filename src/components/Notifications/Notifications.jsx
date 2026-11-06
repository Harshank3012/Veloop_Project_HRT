import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Zap,
  Trophy,
  Flame,
  Target,
  Gamepad2,
  Info,
} from 'lucide-react';

import { getActivitiesWithStatus } from '../../utils/ActivityTracker';
import styles from './Notifications.module.css';

const READ_KEY = 'veloop-read-notifications';
const DISMISSED_KEY = 'veloop-dismissed-notifications';

function getStoredIds(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getNotificationDetails(activity) {
  const type = String(activity.type || '').toLowerCase();

  if (type === 'level') {
    return { icon: Trophy, title: 'Level Up!', color: 'gold' };
  }

  if (type === 'streak') {
    return { icon: Flame, title: 'Streak Reward', color: 'orange' };
  }

  if (type === 'badge') {
    return { icon: Trophy, title: 'Badge Unlocked', color: 'purple' };
  }

  if (type === 'mission') {
    return { icon: Target, title: 'Mission Completed', color: 'blue' };
  }

  if (type === 'game') {
    return { icon: Gamepad2, title: 'Game Completed', color: 'green' };
  }

  if (type === 'xp') {
    return { icon: Zap, title: 'XP Earned', color: 'green' };
  }

  return { icon: Info, title: 'Activity Update', color: 'blue' };
}

export default function Notifications({ isOpen, onClose, onUnreadChange }) {
  const [activities, setActivities] = useState([]);
  const [readIds, setReadIds] = useState(() => getStoredIds(READ_KEY));
  const [dismissedIds, setDismissedIds] = useState(
    () => getStoredIds(DISMISSED_KEY)
  );
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(() => {
    const result = getActivitiesWithStatus();

    setActivities(result.activities);
    setError(result.error);
  }, []);

  useEffect(() => {
    loadNotifications();

    window.addEventListener('veloop-activity-updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('focus', loadNotifications);

    return () => {
      window.removeEventListener('veloop-activity-updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('focus', loadNotifications);
    };
  }, [loadNotifications]);

  const notifications = activities.filter(
    (activity) => !dismissedIds.includes(activity.id)
  );

  const unreadCount = notifications.filter(
    (activity) => !readIds.includes(activity.id)
  ).length;
  
  useEffect(() => {
  onUnreadChange?.(unreadCount);
}, [unreadCount, onUnreadChange]);

  const markAllAsRead = () => {
    const updatedIds = [
      ...new Set([...readIds, ...notifications.map((item) => item.id)]),
    ];

    localStorage.setItem(READ_KEY, JSON.stringify(updatedIds));
    setReadIds(updatedIds);
  };

  const clearAll = () => {
    const updatedIds = [
      ...new Set([
        ...dismissedIds,
        ...notifications.map((item) => item.id),
      ]),
    ];

    localStorage.setItem(DISMISSED_KEY, JSON.stringify(updatedIds));
    setDismissedIds(updatedIds);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <section
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="notifications-title">Notifications</h2>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : 'You are all caught up!'}
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={15} />
            Clear all
          </button>
        </div>

        <div className={styles.list}>
          {error ? (
            <div className={styles.empty}>
              <Info size={30} />
              <p>{error}</p>
              <button type="button" onClick={loadNotifications}>
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={34} />
              <h3>No notifications</h3>
              <p>Your XP, badges and level updates will appear here.</p>
            </div>
          ) : (
            notifications.map((activity) => {
              const details = getNotificationDetails(activity);
              const Icon = details.icon;
              const isRead = readIds.includes(activity.id);

              return (
                <article
                  key={activity.id}
                  className={`${styles.notificationItem} ${
                    !isRead ? styles.unread : ''
                  }`}
                >
                  <div
                    className={`${styles.icon} ${styles[details.color]}`}
                  >
                    <Icon size={19} />
                  </div>

                  <div className={styles.details}>
                    <h3>{details.title}</h3>
                    <p>
                      {activity.description ||
                        activity.message ||
                        `${activity.xp || 0} XP earned`}
                    </p>
                    <time>
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString()
                        : 'Recently'}
                    </time>
                  </div>

                  {!isRead && (
                    <span className={styles.unreadDot} />
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}