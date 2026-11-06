const ACTIVITY_KEY = 'veloop-activity-history';

// Get activities with error status
export function getActivitiesWithStatus() {
  try {
    const rawData = localStorage.getItem(ACTIVITY_KEY);

    if (rawData === null) {
      return {
        activities: [],
        error: null,
      };
    }

    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      return {
        activities: [],
        error: 'Invalid activity history data.',
      };
    }

    return {
      activities: data.filter(
        (item) => item && typeof item === 'object'
      ),
      error: null,
    };
  } catch (error) {
    console.error('Activity history loading failed:', error);

    return {
      activities: [],
      error: 'Unable to load activity history. Please try again.',
    };
  }
}

// Existing function kept for backward compatibility
export function getActivities() {
  return getActivitiesWithStatus().activities;
}

// Save new activity
export function logActivity(activity) {
  try {
    const result = getActivitiesWithStatus();

    if (result.error) {
      console.error('Activity not saved because history could not be loaded.');
      return null;
    }

const activities = result.activities;

    const newActivity = {
    ...activity,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
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

// Clear activity history
export function clearActivities() {
  try {
    localStorage.removeItem(ACTIVITY_KEY);

    window.dispatchEvent(new Event('veloop-activity-updated'));

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Activity history clearing failed:', error);

    return {
      success: false,
      error: 'Unable to clear activity history. Please try again.',
    };
  }
}