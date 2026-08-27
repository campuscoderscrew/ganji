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
import SiteNavbar from './components/SiteNavbar.js';

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

  const isNotFound = pathname === '/404';

  const page =
    isNotFound ? <NotFoundPage /> :
    pathname === '/about' ? <AboutPage /> :
    pathname === '/officers' ? <OfficersPage /> :
    pathname === '/archive' ? <ArchivePage /> :
    pathname === '/performances' ? <PerformancesPage /> :
    pathname === '/workshops' ? <WorkshopsPage /> :
    <EventsPage />;

  // The navbar is rendered here, outside the swapped page, so one instance
  // survives every navigation instead of remounting (and re-animating) with
  // each page. The 404 page intentionally has no navbar.
  return (
    <>
      {!isNotFound && <SiteNavbar activePath={pathname} />}
      {page}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

reportWebVitals();
