import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Inspect() {
  const navigate = useNavigate();
  return (
    <div className="app-root">
      <main className="menu-container" style={{ maxWidth: 720 }}>
        <h1 className="app-title">検査（ダミー）</h1>
        <p className="app-subtitle" style={{ marginBottom: 24 }}>ここに画像比較や設定などのUIが入ります。</p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ height: 160, border: '1px dashed var(--border)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
              参照画像（ダミー）
            </div>
            <div style={{ height: 160, border: '1px dashed var(--border)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
              検査対象（ダミー）
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="menu-item" style={{ flex: 1 }} onClick={() => alert('ダミー: 検査実行')}>検査を実行</button>
          <button className="menu-item" style={{ flex: 1, background: '#ffffff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/')}>戻る</button>
        </div>
      </main>
    </div>
  );
}


