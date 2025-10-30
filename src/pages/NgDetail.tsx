import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NgDetail() {
  const navigate = useNavigate();
  return (
    <div className="app-root app-with-sidebar" style={{ display: 'block' }}>
      <div className="content-inner">
        <div style={{ marginBottom: 12 }}>
          <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate(-1)}>戻る</button>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <img src="/demo_pics/screen1.png" alt="NG拡大" style={{ width: '100%', maxWidth: 960, height: 'auto', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}


