import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import About from "./pages/About"
import Officers from "./pages/Officers"
import Events from "./pages/Events"
import Workshops from "./pages/Workshops"
import Performances from "./pages/Performances"
import Archive from "./pages/Archive"

function App() {

  return (
    <Router>
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
    </Router>
  )
}

export default App
