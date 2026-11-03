export const XP_PER_LEVEL = 1500;

export const levelData = {
  userName: 'VeLooper',

  currentLevel: 1,
  levelName: 'Bronze Explorer',
  currentXP: 0,

  nextLevel: 2,
  requiredXP: XP_PER_LEVEL,

  reward: 500,
  rewardCurrency: 'VEs',
};

export const activities = [
  {
    id: 1,
    title: 'Daily Missions',
    description: 'Complete daily tasks and earn experience points.',
    reward: '+30 XP',
    status: 'Available',
  },
  {
    id: 2,
    title: 'XP Catcher',
    description: 'Catch XP orbs in the mini-game to earn XP.',
    reward: '+10 XP per catch',
    status: 'Available',
  },
  {
    id: 3,
    title: 'Streak Bonus',
    description: 'Maintain your activity streak to earn bonus XP.',
    reward: 'Coming Soon',
    status: 'Coming Soon',
  },
];