# VELOOP final maintenance update

## Fixes included

- Watch & Earn claims are stored per local calendar date. Each demo video can be claimed once per day, and the daily earned-XP summary resets on the next local day.
- Watch & Earn refreshes daily claim state on a 30-second check, browser focus, tab visibility return, and cross-tab storage updates. An unfinished/finished session from the prior day is reset so yesterday's completion cannot be claimed today.
- Legacy Watch & Earn permanent-claim arrays are migrated to a fresh daily claim record.
- Daily Missions reset on the next local calendar day even if the page stays open, and refresh on focus, visibility return, and storage changes.
- Daily mission completion updates both the current mission-streak key and the legacy streak key, and emits a streak-updated event.
- Streak Rewards reads the synchronized streak data, preserves the best streak across both keys, and treats a current streak as inactive after a missed local calendar day.
- Badge streak stats use the same date-aware current-streak calculation.
- Removed the unused `levelName` destructured prop from the Level Up Celebration component.

## Validation

- ESLint passed for the nested Vite app source and the root duplicate source.
- Daily-reset smoke assertions passed.
- ZIP integrity checked after packaging.
- Vite production build could not be run in this Linux validation environment because the uploaded `node_modules` contained Windows Rolldown native binaries and no Linux binding. `node_modules` is intentionally excluded from the final ZIP; run `npm install` on the target machine before building.

## Important note

This project currently uses browser `localStorage` for demo XP and rewards. Daily claim limits are therefore frontend-only and should be enforced by a backend before real rewards are issued.
