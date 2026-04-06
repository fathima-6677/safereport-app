import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative selection:bg-accent/30">
      {/* Mobile Header - with safe area inset for notch support */}
      <div 
        style={{ paddingTop: 'env(safe-area-inset-top)', height: 'var(--header-offset)' }}
        className="lg:hidden fixed top-0 left-0 right-0 glass z-30 border-b border-white/5 flex items-center justify-between px-6 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-2 rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2c0 0-4.5 4-4.5 8.5C7.5 13.5 9.5 17 12 22c2.5-5 4.5-8.5 4.5-11.5C16.5 6 12 2 12 2z"/>
            </svg>
          </div>
          <span className="font-serif text-[18px] text-txt font-black tracking-tight uppercase">Rift Flame</span>
        </div>
        
        <button 
          onClick={toggleMenu}
          className="p-2 text-txt-2 hover:text-white transition-colors active:scale-95"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Overlay - optimized for touch */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-10 lg:block lg:w-[240px] lg:flex-shrink-0 transition-all duration-300
        ${isMobileMenuOpen ? 'visible' : 'invisible lg:visible'}
      `}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-md lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />
        
        {/* Sidebar content */}
        <div className={`
          absolute top-0 left-0 bottom-0 w-[280px] lg:w-[240px] transition-transform duration-300 ease-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar onMobileNavigate={closeMenu} />
        </div>
      </div>

      <main 
        style={{ 
          paddingTop: 'var(--header-offset)',
          paddingBottom: 'var(--safe-area-bottom)'
        }}
        className="flex-1 min-w-0 overflow-hidden flex flex-col"
      >
        <Outlet />
      </main>
    </div>
  );
}

