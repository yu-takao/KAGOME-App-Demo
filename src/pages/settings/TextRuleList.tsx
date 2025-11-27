import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TextRuleList() {
  const navigate = useNavigate();

  // 共通ルール（最小/最大）の表示用状態（編集は別画面）
  const [commonMinPt, setCommonMinPt] = useState<string>('');
  const [commonMaxPt, setCommonMaxPt] = useState<string>('');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('commonTextRule');
      if (raw) {
        const obj = JSON.parse(raw);
        if (typeof obj?.min === 'string') setCommonMinPt(obj.min);
        if (typeof obj?.max === 'string') setCommonMaxPt(obj.max);
      } else {
        // 既定値（これまでのダミー 5.5pt を最小に設定）
        setCommonMinPt('5.5');
        setCommonMaxPt('');
      }
    } catch {
      setCommonMinPt('5.5');
      setCommonMaxPt('');
    }
  }, []);
  const rows = [
    { id: 'T-001', name: '栄養成分表示', minFont: '8', maxFont: '', required: true, keywords: ['栄養成分表示', 'Nutrition Facts'] },
    { id: 'T-002', name: 'アレルギー表示', minFont: '8', maxFont: '12', required: false, keywords: ['アレルギー', '卵', '小麦'] },
    { id: 'T-003', name: 'お客様相談センター', minFont: '5.5', maxFont: '', required: false, keywords: ['お客様相談センター', 'お問い合わせ'] },
  ];
  const [sort, setSort] = useState<{ key: 'name' | 'minFont' | 'maxFont' | 'required' | 'keywords'; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const toggleSort = (key: 'name' | 'minFont' | 'maxFont' | 'required' | 'keywords') => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };
  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'name') {
        cmp = a.name.localeCompare(b.name, 'ja');
      } else if (sort.key === 'minFont') {
        const aVal = parseFloat(a.minFont || '0');
        const bVal = parseFloat(b.minFont || '0');
        cmp = aVal - bVal;
      } else if (sort.key === 'maxFont') {
        const aVal = parseFloat(a.maxFont || '0');
        const bVal = parseFloat(b.maxFont || '0');
        cmp = aVal - bVal;
      } else if (sort.key === 'required') {
        cmp = (a.required ? 1 : 0) - (b.required ? 1 : 0);
      } else if (sort.key === 'keywords') {
        const aStr = (a.keywords && a.keywords.length) ? a.keywords.join(', ') : '';
        const bStr = (b.keywords && b.keywords.length) ? b.keywords.join(', ') : '';
        cmp = aStr.localeCompare(bStr, 'ja');
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [rows, sort]);

  return (
    <div>
      <div className="card" style={{ marginTop: 0 }}>
        <div className="table">
          <div className="thead">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 1fr 120px' }}>
              <div className="th" aria-hidden="true"></div>
              <div className="th" style={{ width: 140 }}>最小サイズ</div>
              <div className="th" style={{ width: 140 }}>最大サイズ</div>
              <div className="th" aria-hidden="true"></div>
              <div className="th" style={{ width: 120 }} aria-hidden="true"></div>
            </div>
          </div>
          <div className="tbody">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 1fr 120px' }}>
              <div className="td" style={{ fontWeight: 700, fontSize: '1.1em' }}>共通ルール</div>
              <div className="td" style={{ width: 140 }}>{commonMinPt ? `${commonMinPt}pt` : '-'}</div>
              <div className="td" style={{ width: 140 }}>{commonMaxPt ? `${commonMaxPt}pt` : '-'}</div>
              <div className="td"></div>
              <div className="td" style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => navigate('/settings/text/common')}
                  aria-label="編集"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" fill="#6b7280"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar" style={{ marginTop: 16, marginBottom: 8 }}>
        <div className="toolbar-title">ブロック別ルール</div>
        <div className="spacer" />
        <button className="menu-item btn-small" onClick={() => navigate('/settings/text/new')}>新規登録</button>
      </div>
      <div className="card scrollable" style={{ marginTop: 0, maxHeight: 'calc(100vh - 340px)' }}>
        <div className="form-hint" style={{ marginBottom: 8 }}>ルール名をクリックするとソートできます。</div>
        <div className="table">
          <div className="thead">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 1fr 120px' }}>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('name')}>
                <span>ルール名</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'name' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'name' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ width: 140 }}>最小サイズ</div>
              <div className="th" style={{ width: 140 }}>最大サイズ</div>
              <div className="th" style={{ width: 100 }}>存在チェック</div>
              <div className="th">自動検出用キーワード</div>
              <div className="th" style={{ width: 120 }} aria-hidden="true"></div>
            </div>
          </div>
          <div className="tbody">
            {sorted.map((r) => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 1fr 120px' }}>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 140 }}>{r.minFont ? `${r.minFont}pt` : '-'}</div>
                <div className="td" style={{ width: 140 }}>{r.maxFont ? `${r.maxFont}pt` : '-'}</div>
                <div className="td" style={{ width: 100 }}>{r.required ? '要' : '-'}</div>
                <div className="td">{(r.keywords && r.keywords.length) ? r.keywords.join(', ') : '-'}</div>
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


