import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './Archive.css'

const Data = [
  {
    title: "Coming Soon", 
    links: ["a", "b", "c"]
  },

  {
    title: "Coming Soon", 
    links: ["e", "f", "g"]
  },

  {
    title: "Coming Soon", 
    links: ["h", "i", "j"]
  }
];




function Archive() {
  
  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropDown = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  


  return (
    <>
    <div className = "background">
      <div className = "app-container akaya-telivigala-regular">
        <header className = "header">Archive</header>
        <div className="archive-page">
            {Data.map((month, index) => (
              <div key={index} className="accordion-item">
                <div className="tab-strip" onClick={() => toggleDropDown(index)}>
                  <h2 className="tab-title">{month.title}</h2>
                </div>
                {openIndex === index && (
                  <div className="dropdown-links">
                    {month.links.map((link, i) => (
                      <a href="#" key={i} className="archive-link">
                        {link}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        
      </div>
    </div>
      
    </>
  )
}

export default Archive
