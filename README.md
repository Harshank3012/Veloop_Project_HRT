# VELOOP Rewards — Dashboard UI

A separate dashboard-only reconstruction based on the supplied project source.

## Included
- React + Vite setup
- Dashboard navigation and hero
- Current level and XP summary
- XP progress and remaining XP
- Next-level reward card
- Five-step level roadmap
- Responsive dashboard styling

## Not included
The XP Catcher game, game statistics, daily missions, streak bonus, badges, notifications, activity history, and celebration modals are intentionally excluded from this snapshot.

## Run
```bash
npm install
npm run dev
```
Open the Vite URL and navigate to `/Lvl-Dashboard`.

## Note
This is a reconstructed Day 8 dashboard-only demonstration, not an archived copy of the exact historical source state. All reward/XP values are demo values.

## XP Catcher mini-game
The dashboard includes a 15-second XP Catcher game. Select **Start game**, then click each glowing orb to earn 10 XP. Earned XP updates the dashboard level/progress and is saved in browser localStorage (`veloop-total-xp`). Use **Play again** after the timer ends to replay.
