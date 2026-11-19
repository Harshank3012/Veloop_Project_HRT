import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Layout/Navbar.jsx';

const LevelDashboard = lazy(() => import('./components/LevelDashboard/LevelDashboard.jsx'));
const Badges = lazy(() => import('./components/Badges/Badges.jsx'));
const WatchEarn = lazy(() => import('./components/WatchEarn/WatchEarn.jsx'));
const ReferEarn = lazy(() => import('./components/ReferEarn/ReferEarn.jsx'));

const MissionsPage = lazy(() =>
  import('./pages/FeaturePages.jsx').then((module) => ({ default: module.MissionsPage }))
);
const StreaksPage = lazy(() =>
  import('./pages/FeaturePages.jsx').then((module) => ({ default: module.StreaksPage }))
);
const ActivityPage = lazy(() =>
  import('./pages/FeaturePages.jsx').then((module) => ({ default: module.ActivityPage }))
);
const LevelRoadmapPage = lazy(() => import('./pages/LevelRoadmapPage.jsx'));

function PageFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '42vh',
        display: 'grid',
        placeItems: 'center',
        color: '#c8bfdc',
        fontSize: '14px',
        letterSpacing: '.04em',
      }}
    >
      Loading VELOOP…
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Lvl-Dashboard" element={<AppLayout><LevelDashboard /></AppLayout>} />
        <Route path="/Lvl-Dashboard/missions" element={<AppLayout><MissionsPage /></AppLayout>} />
        <Route path="/Lvl-Dashboard/streaks" element={<AppLayout><StreaksPage /></AppLayout>} />
        <Route path="/Lvl-Dashboard/watch-earn" element={<AppLayout><WatchEarn /></AppLayout>} />
        <Route path="/Lvl-Dashboard/refer-earn" element={<AppLayout><ReferEarn /></AppLayout>} />
        <Route path="/Lvl-Dashboard/badges" element={<AppLayout><Badges /></AppLayout>} />
        <Route path="/Lvl-Dashboard/roadmap" element={<AppLayout><LevelRoadmapPage /></AppLayout>} />
        <Route path="/Lvl-Dashboard/activity" element={<AppLayout><ActivityPage /></AppLayout>} />
        <Route path="/" element={<Navigate to="/Lvl-Dashboard" replace />} />
        <Route path="*" element={<Navigate to="/Lvl-Dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
