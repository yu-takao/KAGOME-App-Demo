import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarkList() {
  const navigate = useNavigate();
  const rows = [
    {
      id: 'M-001',
      name: 'リサイクルロゴ',
      category: 'マーク',
      pdf: 'recycle.pdf',
      width: { min: '5', max: '20' },
      height: { min: '5', max: '20' },
      colorCheck: true,
      clearSpace: { has: true, width: { min: '2', max: '' }, height: { min: '2', max: '' } },
    },
    {
      id: 'M-002',
      name: '自社ロゴ',
      category: 'コーポレート',
      pdf: 'brand.pdf',
      width: { min: '', max: '' },
      height: { min: '', max: '' },
      colorCheck: false,
      clearSpace: { has: false, width: { min: '', max: '' }, height: { min: '', max: '' } },
    },
  ] as const;

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
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 140px 140px 180px' }}>
              <div className="th">マーク名</div>
              <div className="th" style={{ width: 140 }}>カテゴリ</div>
              <div className="th" style={{ width: 160 }}>マークPDF</div>
              <div className="th" style={{ width: 140 }}>幅(mm)</div>
              <div className="th" style={{ width: 140 }}>高さ(mm)</div>
              <div className="th" style={{ width: 180 }}>クリアスペース</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map(r => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 160px 140px 140px 180px' }}>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 140 }}>{r.category}</div>
                <div className="td" style={{ width: 160 }}>{r.pdf || '-'}</div>
                <div className="td" style={{ width: 140 }}>{`${r.width.min || '-'}${r.width.min || r.width.max ? '～' : ''}${r.width.max || ''}`}</div>
                <div className="td" style={{ width: 140 }}>{`${r.height.min || '-'}${r.height.min || r.height.max ? '～' : ''}${r.height.max || ''}`}</div>
                <div className="td" style={{ width: 180 }}>
                  {r.clearSpace.has
                    ? `あり（幅:${r.clearSpace.width.min || '-'}～${r.clearSpace.width.max || '-'} / 高:${r.clearSpace.height.min || '-'}～${r.clearSpace.height.max || '-' }）`
                    : 'なし'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


