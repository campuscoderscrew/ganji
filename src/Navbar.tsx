import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="nav">
      <ul>
        <li>
          <Link to="/" className="site-name">
            <img src="/ganjilogo.png" alt="Ganji" className="logo" />
          </Link>
        </li>
        <CustomLink to="/about" currentPath={path}>
          About
        </CustomLink>
        <CustomLink to="/officers" currentPath={path}>
          Officers
        </CustomLink>
        <CustomLink to="/events" currentPath={path}>
          Events
        </CustomLink>
        <CustomLink to="/workshops" currentPath={path}>
          Workshops
        </CustomLink>
        <CustomLink to="/performances" currentPath={path}>
          Performances
        </CustomLink>
        <CustomLink to="/archive" currentPath={path}>
          Archive
        </CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, currentPath }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li>
      <Link to={to} className={isActive ? "active" : ""}>
        {children}
      </Link>
    </li>
  );
}
