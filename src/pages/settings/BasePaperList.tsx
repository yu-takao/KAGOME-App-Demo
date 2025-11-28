import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BasePaperList() {
  const navigate = useNavigate();
  const rows = [
    { id: 'B-001', company: 'テトラパック', name: '200ml 台紙A', basePdf: 'tba200a.pdf', straw: false, strawPdf: '' },
    { id: 'B-002', company: 'ダイナパック', name: '900ml 台紙B', basePdf: 'dp900b.pdf', straw: true, strawPdf: 'straw900.pdf' },
  ];
  const [sort, setSort] = useState<{ key: 'company' | 'name' | 'basePdf' | 'straw' | 'strawPdf'; dir: 'asc' | 'desc' }>({ key: 'company', dir: 'asc' });
  const toggleSort = (key: 'company' | 'name' | 'basePdf' | 'straw' | 'strawPdf') => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };
  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'company') {
        cmp = a.company.localeCompare(b.company, 'ja');
      } else if (sort.key === 'name') {
        cmp = a.name.localeCompare(b.name, 'ja');
      } else if (sort.key === 'basePdf') {
        cmp = (a.basePdf || '').localeCompare(b.basePdf || '', 'ja');
      } else if (sort.key === 'straw') {
        cmp = (a.straw ? 1 : 0) - (b.straw ? 1 : 0);
      } else if (sort.key === 'strawPdf') {
        cmp = (a.strawPdf || '').localeCompare(b.strawPdf || '', 'ja');
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort]);
  return (
    <div>
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <div className="spacer" />
        <button className="menu-item btn-small" onClick={() => navigate('/settings/base/new')}>新規登録</button>
      </div>
      <div className="card scrollable">
        <div className="form-hint" style={{ marginBottom: 8 }}>印刷会社と台紙名をクリックするとソートできます。</div>
        <div className="table">
          <div className="thead">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 100px 120px' }}>
              <div className="th" style={{ width: 160, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => toggleSort('company')}>
                <span>印刷会社</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'company' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'company' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => toggleSort('name')}>
                <span>台紙名</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'name' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'name' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ width: 100 }}>ストロー</div>
              <div className="th" style={{ width: 120 }} aria-hidden="true"></div>
            </div>
          </div>
          <div className="tbody">
            {sorted.map(r => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 100px 120px' }}>
                <div className="td" style={{ width: 160 }}>{r.company}</div>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 100 }}>{r.straw ? 'あり' : 'なし'}</div>
                <div className="td" style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => alert(`ダミー: 編集（${r.id}）`)}
                    aria-label={`${r.name}を編集`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" fill="#6b7280"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


