import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarkList() {
  const navigate = useNavigate();
  const rows = [
    { id: 'M-001', name: 'JIS 安全マーク', type: '公共', variant: 'あり' },
    { id: 'M-002', name: '自社品質マーク', type: '自社', variant: 'なし' },
  ];

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-title">マーク一覧</div>
        <div className="spacer" />
        <button className="menu-item" onClick={() => navigate('/settings/mark/new')}>新規登録</button>
      </div>
      <div className="card">
        <div className="table">
          <div className="thead">
            <div className="tr">
              <div className="th" style={{ width: 120 }}>ID</div>
              <div className="th">マーク名</div>
              <div className="th" style={{ width: 120 }}>種別</div>
              <div className="th" style={{ width: 120 }}>色違い</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div className="tr" key={r.id}>
                <div className="td" style={{ width: 120 }}>{r.id}</div>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 120 }}>{r.type}</div>
                <div className="td" style={{ width: 120 }}>{r.variant}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


