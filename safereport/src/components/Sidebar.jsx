import { NavLink } from 'react-router-dom';
import SafetyTimer from './SafetyTimer';

const navItems = [
  {
    section: 'Report',
    items: [
      {
        to: '/',
        label: 'Report Incident',
        badge: '!',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Emergency',
    items: [
      {
        to: '/sos',
        label: 'SOS Panic',
        badge: '⚡',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94M2 2l20 20M8.5 7.5L2.5 21.5l6-2.5 6 2.5-1.5-3.5" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Explore',
    items: [
      {
        to: '/map',
        label: 'Safety Map',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Admin',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        ),
      },
      {
        to: '/analytics',
        label: 'Analytics',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
      },
      {
        to: '/settings',
        label: 'Settings',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ onMobileNavigate }) {
  return (
    <aside className="w-full h-full glass border-r border-white/5 flex flex-col z-10 shadow-2xl">
      {/* Brand */}
      <div className="px-6 pt-6 pb-6 border-b border-white/5 hidden lg:block">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-2 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-accent/30 animate-pulse-slow">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2c0 0-4.5 4-4.5 8.5C7.5 13.5 9.5 17 12 22c2.5-5 4.5-8.5 4.5-11.5C16.5 6 12 2 12 2z"/>
            <path d="M12 18c1.5-2.5 2-4.5 2-6s-.5-2.5-2-4.5" opacity="0.6" />
          </svg>
        </div>
        <div className="font-serif text-[20px] text-txt tracking-tight font-black">RIFT FLAME</div>
        <div className="text-[10px] text-txt-3 mt-0.5 tracking-[0.2em] font-bold uppercase opacity-80">Safety Network</div>
        <div className="inline-flex items-center gap-1.5 bg-success/10 text-success text-[10px] font-bold px-2.5 py-1 rounded-full mt-3 border border-success/20">
          <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
          Anonymous Mode
        </div>
      </div>

      {/* Navigation */}
      <nav 
        style={{ paddingTop: 'calc(var(--sat, 0px) + 5rem)' }}
        className="flex-1 p-3 overflow-y-auto custom-scrollbar lg:pt-3"
      >
        {navItems.map((group) => (
          <div key={group.section} className="mb-8 last:mb-0">
            <div className="text-[10px] font-black text-txt-3 tracking-widest uppercase px-3 mb-3 opacity-40">
              {group.section}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onMobileNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-3 rounded-xl text-[13px] mb-1.5 transition-all duration-300
                  ${isActive
                    ? 'btn-primary shadow-lg shadow-accent/25'
                    : 'text-txt-2 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
              >
                <span className={`w-5 h-5 flex-shrink-0 transition-transform duration-300`}>{item.icon}</span>
                <span className="font-semibold tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
        
        <div className="mt-4 pt-6 border-t border-white/5 mb-6">
          <SafetyTimer />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-white/5 text-[10px] text-txt-3 font-medium">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse"></span>
        Secured & Encrypted
      </div>
    </aside>
  );
}

