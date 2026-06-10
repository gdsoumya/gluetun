import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useServer } from '../context/ServerContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/vpn', label: 'VPN' },
  { to: '/dns', label: 'DNS' },
  { to: '/updater', label: 'Updater' },
  { to: '/config', label: 'Server' },
];

const Navbar = () => {
  const { isConnected, version } = useServer();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close the mobile menu on route change
  useEffect(() => setOpen(false), [location.pathname]);

  const statusPill = (
    <div
      className={`flex shrink-0 items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-xs font-mono ${
        isConnected
          ? 'border-signal/30 bg-signal-dark text-signal'
          : 'border-danger/30 bg-danger-dark text-danger'
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          isConnected ? 'bg-signal animate-pulse-ring' : 'bg-danger'
        }`}
      />
      <span className="hidden xs:inline">
        {isConnected ? `online ${version?.version ? `· ${version.version}` : ''}` : 'offline'}
      </span>
      <span className="xs:hidden">{isConnected ? 'online' : 'offline'}</span>
    </div>
  );

  return (
    <header className="border-b border-ink-600 bg-ink-900/80 backdrop-blur sticky top-0 z-20">
      <div className="container mx-auto max-w-5xl px-3 sm:px-4">
        <div className="flex items-center justify-between gap-3 h-14">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-7 w-7 shrink-0 rounded-md bg-signal-dark border border-signal/40 grid place-items-center">
              <svg className="h-4 w-4 text-signal" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 2 3 5.5v4.2c0 4 2.9 6.8 7 8.3 4.1-1.5 7-4.3 7-8.3V5.5L10 2z" strokeLinejoin="round" />
                <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-none truncate">
              <span className="font-display font-bold text-base tracking-wide text-fog">GLUETUN</span>
              <span className="ml-2 label-xs text-signal/70 hidden sm:inline">control deck</span>
            </div>
          </div>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md font-display text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'text-signal bg-signal-dark border border-signal/20'
                      : 'text-fog-dim hover:text-fog hover:bg-ink-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {statusPill}
            {/* hamburger - mobile only */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="md:hidden grid place-items-center h-9 w-9 shrink-0 rounded-md border border-ink-500 bg-ink-700 text-fog-dim hover:text-fog focus:outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* mobile dropdown menu */}
        {open && (
          <nav className="md:hidden pb-3 flex flex-col gap-1 animate-fade-up">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg font-display text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'text-signal bg-signal-dark border border-signal/20'
                      : 'text-fog-dim hover:text-fog hover:bg-ink-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
