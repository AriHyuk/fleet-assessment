import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#070d1a]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">

        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3 font-bold text-[#f0f6ff] no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center text-sm">
            🚗
          </div>
          <span className="text-lg tracking-wide">SewaApp</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/units"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-md text-sm font-medium transition-all no-underline ${
                isActive
                  ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)]'
                  : 'text-[#8b9bb4] hover:text-[#f0f6ff] hover:bg-white/5'
              }`
            }
          >
            Unit Kendaraan
          </NavLink>
          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-md text-sm font-medium transition-all no-underline ${
                isActive
                  ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)]'
                  : 'text-[#8b9bb4] hover:text-[#f0f6ff] hover:bg-white/5'
              }`
            }
          >
            Pemesanan
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
