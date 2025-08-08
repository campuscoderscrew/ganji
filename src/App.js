import React, { useState } from 'react';
import './events.css';
import ganjiLogo from './ganjiLogoWhite.png';


function EventsPage() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to move to previous month
    const handlePrev = () => {
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        setCurrentDate(prevMonth);
    };

    // Helper to move to next month
    const handleNext = () => {
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
        setCurrentDate(nextMonth);
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getStartDayOfWeek = (year, month) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const startDay = getStartDayOfWeek(currentDate.getFullYear(), currentDate.getMonth());

    // Generate empty days at start and actual days
    const calendarDays = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    // Events on the Calendar
    const eventMap = {
    '2025-08-10': { label: 'Practice 1', link: '/events/practice', color: 'purple' },
    '2025-08-16': { label: 'Practice 2', link: '/events/practice', color: 'purple' },
    '2025-08-30': { label: 'Practice 3', link: '/events/practice', color: 'purple' },
    '2025-09-01': { label: 'Practice 4', link: '/events/practice', color: 'purple' },
    };

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <a href="about.asp">
                            <img
                                src={ganjiLogo}
                                alt="White Ganji Logo"
                                style={{ width: '40px', height: '40px' }}
                            />
                        </a>
                    </li>
                    <li><a href="about.asp">About</a></li>
                    <li><a href="officers.asp">Officers</a></li>
                    <li><a href="events.asp">Events</a></li>
                    <li><a href="workshops.asp">Workshops</a></li>
                    <li><a href="performances.asp">Performances</a></li>
                    <li><a href="competitions.asp">Competitions</a></li>
                    <li><a href="archives.asp">Archives</a></li>
                </ul>
            </nav>

            <main>
                <h1>Events</h1>
                <h2>
                    Check out all of our events! <br />
                    Click through the months to look at our present and past events. <br />
                    Tap into the event’s banner for more details.
                </h2>
            </main>

            <section className="calendar">
                <div className="wrapper">
                    <header>
                        <p className="current-date">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </p>
                        <div className="icons">
                            <span className="materials-symbols-rounded" onClick={handlePrev}> &lt; </span>
                            <span className="materials-symbols-rounded" onClick={handleNext}> &gt; </span>
                        </div>
                    </header>

                    <div className="weekAndDays">
                        <ul className="daysOfWeek">
                            <li>Sun</li>
                            <li>Mon</li>
                            <li>Tue</li>
                            <li>Wed</li>
                            <li>Thu</li>
                            <li>Fri</li>
                            <li>Sat</li>
                        </ul>
                        <ul className="days">
                            {calendarDays.map((day, index) => {
                                const dayNumber = day || '';
                                const isToday =
                                    dayNumber === new Date().getDate() &&
                                    currentDate.getMonth() === new Date().getMonth() &&
                                    currentDate.getFullYear() === new Date().getFullYear();

                                // Format YYYY-MM-DD
                                const formattedDate = day
                                    ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                    : null;

                                const event = formattedDate ? eventMap[formattedDate] : null;

                                return (
                                    <li key={index} className={isToday ? 'today' : ''}>
                                        {dayNumber}
                                        {event && (
                                            <div className="event">
                                                <a href={event.link} className="event-link">{event.label}</a>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default EventsPage;
