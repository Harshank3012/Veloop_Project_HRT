const ACTIVITY_KEY = 'veloop-activity-history';

export function getActivities() {
  try {
    const data = JSON.parse(
      localStorage.getItem(ACTIVITY_KEY) || '[]'
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function logActivity(activity) {
  try {
    const activities = getActivities();

    const newActivity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...activity,
    };

    const updated = [newActivity, ...activities].slice(0, 500);

    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));

    window.dispatchEvent(new Event('veloop-activity-updated'));

    return newActivity;
  } catch (error) {
    console.error('Activity save failed:', error);
    return null;
  }
}

export function clearActivities() {
  localStorage.removeItem(ACTIVITY_KEY);
  window.dispatchEvent(new Event('veloop-activity-updated'));
}