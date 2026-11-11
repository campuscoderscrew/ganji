import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './pages/events.css';
import holdImage from './ComingSoon.png';
import PageTemplate from './components/PageTemplate';
import { useEventData } from './data/events.js';
import { imageUrl } from './content';
import SyncStatus from './components/SyncStatus';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Local 'YYYY-MM-DD', matching how event dates are stored. */
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function EventsPage() {
  const { eventsByDate } = useEventData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeEvent, setActiveEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => setCurrentDate(new Date(year, month - 1));
  const handleNext = () => setCurrentDate(new Date(year, month + 1));
  const closeModal = useCallback(() => setActiveEvent(null), []);

  // Escape closes the dialog, and the page behind it is locked so the
  // calendar does not scroll away underneath an open event.
  useEffect(() => {
    if (!activeEvent) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeEvent, closeModal]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const calendarDays = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  /** Everything happening this month, in date order, for the phone list. */
  const monthEvents = Array.from({ length: daysInMonth }, (_, i) => i + 1).flatMap(
    (day) =>
      (eventsByDate[dateKey(year, month, day)] || []).map((event) => ({ day, event }))
  );

  return (
    <div className="events-page site-page">
      <PageTemplate>
        <header className="events-heading page-heading">
          <motion.p
            className="page-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What&apos;s coming up
          </motion.p>

          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            Events
          </motion.h1>

          <motion.p
            className="page-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Browse the months to see what we have coming up and what we have
            already done. Tap an event for the full details.
          </motion.p>
        </header>

        <motion.section
          className="events-calendar-section"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.28 }}
        >
          <div className="events-calendar">
            <header className="events-calendar-header">
              <p className="events-current-date">
                {MONTHS[month]} {year}
              </p>
              <div className="events-month-nav">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={`Show ${MONTHS[(month + 11) % 12]}`}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <polyline
                      points="15 5 8 12 15 19"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={`Show ${MONTHS[(month + 1) % 12]}`}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <polyline
                      points="9 5 16 12 9 19"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </header>

            <ul className="events-weekdays">
              {WEEKDAYS.map((day) => (
                <li key={day}>
                  <span aria-hidden="true">{day.charAt(0)}</span>
                  <span className="events-weekday-full">{day}</span>
                </li>
              ))}
            </ul>

            <ul className="events-days">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <li key={`pad-${index}`} className="events-day events-day-empty" />;
                }

                const isToday = isCurrentMonth && day === today.getDate();
                // A day can hold more than one event -- two posts announcing
                // different things on the same date both belong here.
                const dayEvents = eventsByDate[dateKey(year, month, day)] || [];

                return (
                  <li
                    key={day}
                    className={`events-day${isToday ? ' events-day-today' : ''}`}
                  >
                    <span className="events-day-number">{day}</span>

                    {dayEvents.map((event) => (
                      <button
                        type="button"
                        className={`events-chip events-chip-${(event.type || 'performance').toLowerCase()}`}
                        key={event.id}
                        onClick={() => setActiveEvent(event)}
                      >
                        {/* The clamp lives on this span, not the button:
                            browsers blockify display on a button, so
                            -webkit-box (and the line clamp with it) is
                            discarded there. */}
                        <span className="events-chip-label">{event.label}</span>
                      </button>
                    ))}
                  </li>
                );
              })}
            </ul>

            {/* On a phone a cell is too narrow for a readable title, so the
                chips collapse to dots and the month is listed here instead.
                Rendered always and hidden by CSS above the breakpoint, which
                keeps the breakpoint in one place. */}
            {monthEvents.length > 0 && (
              <ul className="events-month-list">
                {monthEvents.map(({ day, event }) => (
                  <li key={event.id}>
                    <button type="button" onClick={() => setActiveEvent(event)}>
                      <span
                        className={`events-month-list-day events-chip-${(event.type || 'performance').toLowerCase()}`}
                      >
                        {day}
                      </span>
                      <span className="events-month-list-title">{event.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.section>

        <AnimatePresence>
          {activeEvent && (
            <motion.div
              className="event-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.target === e.currentTarget && closeModal()}
              role="presentation"
            >
              <motion.div
                className="event-dialog-card"
                role="dialog"
                aria-modal="true"
                aria-label={activeEvent.label}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.99 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="event-dialog-media">
                  <img
                    src={activeEvent.image ? imageUrl(activeEvent.image) : holdImage}
                    alt=""
                  />
                </div>

                <div className="event-dialog-body">
                  <button
                    type="button"
                    className="event-dialog-close"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  {activeEvent.type && <p className="page-kicker">{activeEvent.type}</p>}
                  <h2>{activeEvent.label}</h2>

                  {(activeEvent.time || activeEvent.location) && (
                    <ul className="event-dialog-facts">
                      {activeEvent.time && <li>{activeEvent.time}</li>}
                      {activeEvent.location && <li>{activeEvent.location}</li>}
                    </ul>
                  )}

                  {activeEvent.description && (
                    <p className="event-dialog-description">{activeEvent.description}</p>
                  )}

                  {activeEvent.link && (
                    <a
                      className="site-button event-dialog-link"
                      href={activeEvent.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Instagram
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <SyncStatus />
      </PageTemplate>
    </div>
  );
}

export default EventsPage;
