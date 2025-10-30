import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BasePaperList() {
  const navigate = useNavigate();
  const rows = [
    { id: 'B-001', name: '200ml 台紙A', type: '枠線', color: '#7C3AED' },
    { id: 'B-002', name: '330ml 台紙B', type: '領域塗りつぶし', color: '#1E66F5' },
  ];
  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-title">台紙一覧</div>
        <div className="spacer" />
        <button className="menu-item" onClick={() => navigate('/settings/base/new')}>新規登録</button>
      </div>
      <div className="card">
        <div className="table">
          <div className="thead">
            <div className="tr">
              <div className="th" style={{ width: 120 }}>ID</div>
              <div className="th">台紙名</div>
              <div className="th" style={{ width: 140 }}>タイプ</div>
              <div className="th" style={{ width: 120 }}>台紙色</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div className="tr" key={r.id}>
                <div className="td" style={{ width: 120 }}>{r.id}</div>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 140 }}>{r.type}</div>
                <div className="td" style={{ width: 120 }}>
                  <span className="swatch" style={{ background: r.color }} /> {r.color}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


