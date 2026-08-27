import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './pages/events.css';
import EventsPage from './App.js';
import NotFoundPage from './pages/NotFoundPage.js';
import reportWebVitals from './reportWebVitals';
import OfficersPage from './pages/Officers.js';
import ArchivePage from './pages/Archive.js';
import WorkshopsPage from './pages/Workshops.js';
import PerformancesPage from './pages/Performances.js';
import AboutPage from './pages/About.js';

function Router() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('codex:navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('codex:navigate', handleLocationChange);
    };
  }, []);

  const page =
    pathname === '/404' ? <NotFoundPage /> :
    pathname === '/about' ? <AboutPage /> :
    pathname === '/officers' ? <OfficersPage /> :
    pathname === '/archive' ? <ArchivePage /> :
    pathname === '/performances' ? <PerformancesPage /> :
    pathname === '/workshops' ? <WorkshopsPage /> :
    <EventsPage />;

  return page;
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

reportWebVitals();
