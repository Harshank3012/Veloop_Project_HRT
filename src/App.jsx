import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Layout/Navbar.jsx';

const LevelDashboard = lazy(() => import('./components/LevelDashboard/LevelDashboard.jsx'));
const Badges = lazy(() => import('./components/Badges/Badges.jsx'));
const WatchEarn = lazy(() => import('./components/WatchEarn/WatchEarn.jsx'));
const ReferEarn = lazy(() => import('./components/ReferEarn/ReferEarn.jsx'));
const MissionsPage = lazy(() => import('./pages/FeaturePages.jsx').then((module) => ({ default: module.MissionsPage })));
const StreaksPage = lazy(() => import('./pages/FeaturePages.jsx').then((module) => ({ default: module.StreaksPage })));
const ActivityPage = lazy(() => import('./pages/FeaturePages.jsx').then((module) => ({ default: module.ActivityPage })));
const LevelRoadmapPage = lazy(() => import('./pages/FeaturePages.jsx').then((module) => ({ default: module.LevelRoadmapPage })));

function AppLayout({ children }) {
  return <><Navbar />{children}</>;
}
function PageLoader() {
  return <div role="status" aria-live="polite" style={{ minHeight: '45vh', display: 'grid', placeItems: 'center', color: '#d9c8a5', fontSize: 14 }}>Loading VELOOP…</div>;
}
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
