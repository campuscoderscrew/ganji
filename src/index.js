import React from 'react';
import ReactDOM from 'react-dom/client';
import './pages/events.css';
import EventsPage from './App.js';
import NotFoundPage from './pages/NotFoundPage.js';
import reportWebVitals from './reportWebVitals';
import OfficersPage from './pages/Officers.js';
import ArchivePage from './pages/Archive.js';
import WorkshopsPage from './pages/Workshops.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
const page =  window.location.pathname === '/404' ? <NotFoundPage /> :
  window.location.pathname === '/officers' ? <OfficersPage /> :
  window.location.pathname === '/archive' ? <ArchivePage /> :
  window.location.pathname === '/workshops' ? <WorkshopsPage /> :
  <EventsPage />;
root.render(
  <React.StrictMode>
    {page}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
