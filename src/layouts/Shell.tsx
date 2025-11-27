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
          <NavLink to="/personal" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>デザイン検査</NavLink>
          <NavLink to="/group" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ marginRight: 6 }}>☰</span>検査記録</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`} style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ marginRight: 6 }}>⚙</span>設定登録</NavLink>
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


