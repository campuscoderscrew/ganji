import React from 'react'; 
import './officers.css'; 
import icon from '../icon.jpg';

function OfficersPage() { 

    const boardMembers = [
        { name: 'First Last', position: 'President', image: icon },
        { name: 'First Last', position: 'Vice President', image: icon },
        { name: 'First Last', position: 'Treasurer', image: icon },
        { name: 'First Last', position: 'Secretary', image: icon },
        { name: 'First Last', position: 'Position', image: icon },
        { name: 'First Last', position: 'Position', image: icon },
        { name: 'First Last', position: 'Position', image: icon },
        { name: 'First Last', position: 'Position', image: icon },
    ];

    return ( 
    <div className="officers-page">
      <main className="heading-officers">
        <h1 className="h1-officers">Meet the Ganji E-Board</h1>
        <h2 className="h2-officers"> 2025-2026
        </h2>
      </main>

      <div className="icons-and-positions">
        {boardMembers.map((member, index) => (
          <div className="board-member" key={index}>
            <img src={member.image} alt={member.name} className="board-circle" />
            <p className="board-name">{member.name}</p>
            <p className="board-position">{member.position}</p>
          </div>
        ))}
      
      </div>
    </div>
  );
}

export default OfficersPage;