import { Link } from "react-router-dom"

export default function Navbar() {
    return (
        <nav className="w-full bg-[#1F1F1F] text-[#D1D1FF] flex justify-between py-4 px-8 items-center sticky z-10 top-0 left-0">
            <Link to="/" className="aspect-square w-8 rounded-full bg-white">

            </Link>
            <div className="flex gap-4">
                <Link to="/about">About</Link>
                <Link to="/officers">Officers</Link>
                <Link to="/events">Events</Link>
                <Link to="/workshops">Workshops</Link>
                <Link to="/performances">Performances</Link>
                <Link to="/archive">Archive</Link>
            </div>
        </nav>
    )
}