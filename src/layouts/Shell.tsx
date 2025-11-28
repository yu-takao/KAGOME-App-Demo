import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function ShellLayout() {
  return (
    <div className="app-root app-with-sidebar">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/webDesign/KAGOME.png" alt="KAGOME" style={{ width: '70%', height: 'auto', display: 'block', margin: '0 auto' }} />
        </div>
        <nav className="menu">
          <NavLink to="/personal" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            デザイン検査
          </NavLink>
          <NavLink to="/group" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            検査記録
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
            </svg>
            設定登録
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


