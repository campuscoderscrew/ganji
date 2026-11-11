import React, { Suspense, lazy, useEffect, useState } from 'react';
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

// Loaded on demand so the dashboard and its GitHub client stay out of the
// bundle every ordinary visitor downloads.
const AdminPage = lazy(() => import('./pages/Admin.js'));

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
  // The dashboard is a tool, not a page of the site: it gets no navbar, and
  // nothing links to it. That is for tidiness, not security -- the page is
  // public and inert until someone supplies their own GitHub token.
  const isAdmin = pathname === '/admin';

  const page =
    isNotFound ? <NotFoundPage /> :
    isAdmin ? (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    ) :
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
      {!isNotFound && !isAdmin && <SiteNavbar activePath={pathname} />}
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
