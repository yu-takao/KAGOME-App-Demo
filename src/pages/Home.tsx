import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Home() {
  return (
    <div className="app-root app-with-sidebar">
      <aside className="sidebar">
        <div className="sidebar-logo">デザインチェックシステム</div>
        <nav className="menu">
          <NavLink to="/inspect" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>検査開始</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>設定</NavLink>
          <NavLink to="/history" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>履歴</NavLink>
        </nav>
      </aside>
      <main className="content">
        <div className="content-inner">
          <h1 className="app-title">ようこそ</h1>
          <p className="app-subtitle">左のメニューから選択してください。</p>
        </div>
      </main>
    </div>
  );
}


