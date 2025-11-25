import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BasePaperList() {
  const navigate = useNavigate();
  const rows = [
    { id: 'B-001', company: 'テトラパック', name: '200ml 台紙A', basePdf: 'tba200a.pdf', straw: false, strawPdf: '' },
    { id: 'B-002', company: 'ダイナパック', name: '900ml 台紙B', basePdf: 'dp900b.pdf', straw: true, strawPdf: 'straw900.pdf' },
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
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 200px 100px 200px' }}>
              <div className="th" style={{ width: 160 }}>印刷会社</div>
              <div className="th">台紙名</div>
              <div className="th" style={{ width: 200 }}>台紙PDF</div>
              <div className="th" style={{ width: 100 }}>ストロー</div>
              <div className="th" style={{ width: 200 }}>ストローPDF</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 200px 100px 200px' }}>
                <div className="td" style={{ width: 160 }}>{r.company}</div>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 200 }}>{r.basePdf || '-'}</div>
                <div className="td" style={{ width: 100 }}>{r.straw ? 'あり' : 'なし'}</div>
                <div className="td" style={{ width: 200 }}>{r.straw ? (r.strawPdf || '-') : '-'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


