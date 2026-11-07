
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LevelDashboard from './components/LevelDashboard/LevelDashboard.jsx';
import Badges from './components/Badges/Badges.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import WatchEarn from './components/WatchEarn/WatchEarn.jsx';

import {
  MissionsPage,
  StreaksPage,
  ActivityPage,
} from './pages/FeaturePages.jsx';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/Lvl-Dashboard"
          element={<AppLayout><LevelDashboard /></AppLayout>}
        />

        <Route
          path="/Lvl-Dashboard/missions"
          element={<AppLayout><MissionsPage /></AppLayout>}
        />

        <Route
          path="/Lvl-Dashboard/streaks"
          element={<AppLayout><StreaksPage /></AppLayout>}
        />

        <Route
          path="/Lvl-Dashboard/watch-earn"
          element={<AppLayout><WatchEarn /></AppLayout>}
        />

        <Route
          path="/Lvl-Dashboard/badges"
          element={<AppLayout><Badges /></AppLayout>}
        />

        <Route
          path="/Lvl-Dashboard/activity"
          element={<AppLayout><ActivityPage /></AppLayout>}
        />

        <Route path="/" element={<Navigate to="/Lvl-Dashboard" replace />} />
        <Route path="*" element={<Navigate to="/Lvl-Dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
