import React, { useState } from 'react'; 
import './pages/events.css'; 
import practiceImage from './Chungha.png'; 
import holdImage from './ComingSoon.png'; 

function EventsPage() { 
    const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; 
    const [currentDate, setCurrentDate] = useState(new Date()); const [modalData, setModalData] = useState({ title: '', description: '', image: '' }); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
 
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate(); 
    const getStartDayOfWeek = (year, month) => new Date(year, month, 1).getDay(); 

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()); 
    const startDay = getStartDayOfWeek(currentDate.getFullYear(), currentDate.getMonth()); 

    const calendarDays = [...Array(startDay).fill(null), ...Array.from({length: daysInMonth}, (_,i)=>i+1)];
 
    const eventMap = { 
        '2025-09-10': { 
            label: 'Eenie Meenie', 
            description: 'Like eenie ☝️meenie☝️minie ☝️moe☝️\n\nCome learn ⭐️❤️EENIE MEENIE by CHUNG HA❤️⭐️ taught by ✨@ije.526✨ THIS THURSDAY ‼️\n\nWORKSHOP DETAILS ‼️\n🗓️: Tuesday, July 1st\n⏰: 7-8PM\n📍: Activities Room near Terpzone (STAMP)', 
            color: 'purple', 
            image: practiceImage 
        }, 
        '2025-09-16': { 
            label: 'Practice ?', 
            description: 'Description text here', 
            color: 'purple', 
            image: holdImage 
        }, 
        '2025-09-30': {
            label: 'Practice ?', 
            description: 'Description text here', 
            color: 'purple', 
            image: holdImage 
        }, 
        '2025-10-01': {
            label: 'Practice ?', 
            description: 'Description text here', 
            color: 'purple', 
            image: holdImage 
        }, 
    }; 

    
    const openModal = (title, description, image) => setModalData({title, description, image}) || setIsModalOpen(true);

    const closeModal = () => setIsModalOpen(false);

    return ( 
    <div className="heading-container">
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
              <span onClick={handlePrev}> &lt; </span>
              <span onClick={handleNext}> &gt; </span>
            </div>
          </header>

          <ul className="daysOfWeek">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <li key={d}>{d}</li>)}
          </ul>

          <ul className="days">
            {calendarDays.map((day, index) => {
              const dayNumber = day || '';
              const isToday =
                dayNumber === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              const formattedDate = day
                ? `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                : null;

              const event = formattedDate ? eventMap[formattedDate] : null;

              return (
                <li key={index} className={isToday ? 'today' : ''}>
                  {dayNumber}
                  {event && <span className="dot-highlight"></span>}
                  {event && (
                    <div className="event">
                      <span className="event-link" onClick={() => openModal(event.label, event.description, event.image)}>
                        {event.label}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal" onClick={e => e.target.className === 'modal' && closeModal()}>
          <div className="modal-content">
            <div className="modal-left">
              <img src={modalData.image} alt={modalData.title} />
            </div>
            <div className="modal-right">
              <span className="close-button" onClick={closeModal}>&times;</span>
              <h2>{modalData.title}</h2>
              <p>{modalData.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;