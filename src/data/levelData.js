
export const XP_PER_LEVEL = 1500;

export const levelData = {
  userName: 'VeLooper',

  // Starting level
  currentLevel: 1,
  levelName: 'Bronze Explorer',
  currentXP: 0,

  // Next level progression
  nextLevel: 2,
  requiredXP: XP_PER_LEVEL,

  // Demo reward only — not an official company reward
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
