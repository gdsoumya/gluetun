import { NavLink } from 'react-router-dom';
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

  return (
    <header className="border-b border-ink-600 bg-ink-900/80 backdrop-blur sticky top-0 z-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-7 rounded-md bg-signal-dark border border-signal/40 grid place-items-center">
              <svg className="h-4 w-4 text-signal" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 2 3 5.5v4.2c0 4 2.9 6.8 7 8.3 4.1-1.5 7-4.3 7-8.3V5.5L10 2z" strokeLinejoin="round" />
                <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="font-display font-bold text-base tracking-wide text-fog">GLUETUN</span>
              <span className="ml-2 label-xs text-signal/70">control deck</span>
            </div>
          </div>

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

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono ${
              isConnected
                ? 'border-signal/30 bg-signal-dark text-signal'
                : 'border-danger/30 bg-danger-dark text-danger'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-signal animate-pulse-ring' : 'bg-danger'
              }`}
            />
            {isConnected ? `online ${version?.version ? `· ${version.version}` : ''}` : 'offline'}
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1 rounded-md font-display text-sm whitespace-nowrap ${
                  isActive ? 'text-signal bg-signal-dark' : 'text-fog-dim'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
