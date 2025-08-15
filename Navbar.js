import logo from "../src/ganjiLogo.png";
import './App.css';

function Navbar() {
  return (
    <div>
      <nav id="navbar">
        <ul className="ganji-font">
          <li>
            <a href="#default" style={{ padding: 0 }}>
              <img id="logo" src={logo} alt="Ganji logo" />
            </a>
          </li>
          <div>
            <li><a href="#about">About</a></li>
            <li><a href="#officers">Officers</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="#workshops">Workshops</a></li>
            <li><a href="#performances">Performances</a></li>
            <li><a href="#archives">Archives</a></li>
          </div>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
