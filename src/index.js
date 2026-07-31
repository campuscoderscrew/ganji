import React from 'react';
import ReactDOM from 'react-dom/client';
import './pages/events.css';
import EventsPage from './App.js';
import NotFoundPage from './pages/NotFoundPage.js';
import reportWebVitals from './reportWebVitals';
import OfficersPage from './pages/Officers.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
const page =  window.location.pathname === '/404' ? <NotFoundPage /> :
  window.location.pathname === '/officers' ? <OfficersPage /> :
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
