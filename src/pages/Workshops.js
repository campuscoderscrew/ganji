import React from 'react';
import './workshops.css';
import placeholder from '../icon.jpg';
import PageTemplate from '../components/PageTemplate';

function WorkshopsPage() {
  const workshops = [
    { name: 'Workshop 1', link: '[Details]' },
    { name: 'Workshop 2', link: '[Details]' },
    { name: 'Workshop 3', link: '[Details]' },
  ];

  return (
    <div className="workshop-page">
      <PageTemplate>
        <div className="header-section">
          <div>
            <h1 className="ws-title">WORKSHOPS</h1>
            <p className="ws-description">
              Workshops are how we engage with our student body, meaning everyone is
              welcome! Learn today&apos;s K-POP hit dances with Ganji members!
            </p>
          </div>
          <img src={placeholder} alt="Most Recent Workshop" className="ws-image" />
        </div>

        <div className="workshop-list">
          <h1 className="list-title">List of Workshops</h1>
          {workshops.map((ws, index) => (
            <div className="ws" key={index}>
              <p className="ws-name">
                {ws.name} <a href="Events.js">{ws.link}</a>
              </p>
            </div>
          ))}
        </div>
      </PageTemplate>
    </div>
  );
}

export default WorkshopsPage;
