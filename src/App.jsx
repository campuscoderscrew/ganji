import Navbar from "./Navbar.tsx"
import Home from "./pages/home.js"
import About from "./pages/about.js"
import Officers from "./pages/officers.js"
import Events from "./pages/events.js"
import Workshops from "./pages/workshops.js"
import Performances from "./pages/performances.js"
import Archive from "./pages/archive.js"
import { Route, Routes } from "react-router-dom"
import 'bootstrap'


function App() {

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/officers" element={<Officers />} />
      <Route path="/events" element={<Events />} />
      <Route path="/workshops" element={<Workshops />} />
      <Route path="/performances" element={<Performances />} />
      <Route path="/archive" element={<Archive />} />
    </Routes>
  </>
  )
}
export default App
