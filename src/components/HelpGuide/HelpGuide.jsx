
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronDown,
  Zap,
  Trophy,
  Flame,
  Target,
  Gamepad2,
  Gift,
  CircleHelp,
} from 'lucide-react';

import styles from './HelpGuide.module.css';

const helpSections = [
  {
    title: 'Dashboard Overview',
    icon: Trophy,
    content:
      'Your VELOOP dashboard displays your current level, total XP, progress towards your next level and upcoming rewards.',
  },
  {
    title: 'How to Earn XP',
    icon: Zap,
    content:
      'Earn XP by completing daily missions, playing XP Catcher and participating in supported earning activities.',
  },
  {
    title: 'Daily Missions',
    icon: Target,
    content:
      'Complete your daily missions to earn XP. Your mission progress is tracked automatically in this browser.',
  },
  {
    title: 'Streak Rewards',
    icon: Flame,
    content:
      'Maintain your daily activity streak and unlock milestone rewards. Available streak rewards can be claimed from the Streak Rewards page.',
  },
  {
    title: 'Badges & Achievements',
    icon: Trophy,
    content:
      'Unlock badges by reaching XP milestones, maintaining streaks, completing missions and playing games.',
  },
  {
    title: 'XP Catcher Game',
    icon: Gamepad2,
    content:
      'Start the 15-second XP Catcher game. Tap the glowing orb to collect it. Every successful catch earns 10 demo XP.',
  },
  {
    title: 'Levels & Rewards',
    icon: Gift,
    content:
      'Every 1,500 XP advances you to the next level. The dashboard displays your next-level reward as a demonstration value.',
  },
];

export default function HelpGuide({ isOpen, onClose }) {
  const [expanded, setExpanded] = useState(0);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-guide-title"
      >
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <CircleHelp size={24} />
          </div>

          <div className={styles.headerText}>
            <h2 id="help-guide-title">VELOOP Help Center</h2>
            <p>Everything you need to know about your rewards journey.</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close help guide"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.content}>
          {helpSections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expanded === index;

            return (
              <article className={styles.section} key={section.title}>
                <button
                  type="button"
                  className={styles.sectionButton}
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpanded(isExpanded ? -1 : index)
                  }
                >
                  <span className={styles.sectionIcon}>
                    <Icon size={19} />
                  </span>

                  <span>{section.title}</span>

                  <ChevronDown
                    size={18}
                    className={
                      isExpanded ? styles.rotate : ''
                    }
                  />
                </button>

                {isExpanded && (
                  <div className={styles.sectionContent}>
                    {section.content}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <span>VELOOP REWARDS</span>
          <button type="button" onClick={onClose}>
            Got it
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
