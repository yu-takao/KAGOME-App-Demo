import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PackageList() {
  const navigate = useNavigate();
  // ダミーデータ
  const rows = [
    { id: 'P-001', name: 'ジュースA', base: 'A4', mark: 'JIS' },
    { id: 'P-002', name: 'お茶C', base: 'A3', mark: 'CE' },
  ];
  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-title">パッケージ一覧</div>
        <div className="spacer" />
        <button className="menu-item" onClick={() => navigate('/settings/package/new')}>新規登録</button>
      </div>
      <div className="card">
        <div className="table">
          <div className="thead">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px' }}>
              <div className="th">製品名</div>
              <div className="th" style={{ width: 120 }}>版下台紙</div>
              <div className="th" style={{ width: 120 }}>存在マーク</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px' }}>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 120 }}>{r.base}</div>
                <div className="td" style={{ width: 120 }}>{r.mark}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


