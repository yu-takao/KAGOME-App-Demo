import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Settings() {
  return (
    <>
      <div className="tabs">
        <NavLink to="/settings/base" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>台紙登録</NavLink>
        <NavLink to="/settings/mark" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>マーク登録</NavLink>
        <NavLink to="/settings/text" className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}>テキストルール登録</NavLink>
      </div>
      <div className="tab-panel">
        <Outlet />
      </div>
    </>
  );
}


