import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TextRuleList() {
  const navigate = useNavigate();

  // 共通ルール（最小/最大）編集用の状態
  const [commonMinPt, setCommonMinPt] = useState<string>('');
  const [commonMaxPt, setCommonMaxPt] = useState<string>('');
  const [isEditingCommon, setIsEditingCommon] = useState<boolean>(false);
  const [draftMin, setDraftMin] = useState<string>('');
  const [draftMax, setDraftMax] = useState<string>('');
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
  const openEditCommon = () => {
    setDraftMin(commonMinPt);
    setDraftMax(commonMaxPt);
    setIsEditingCommon(true);
  };
  const saveCommon = () => {
    const min = draftMin.trim();
    const max = draftMax.trim();
    setCommonMinPt(min);
    setCommonMaxPt(max);
    localStorage.setItem('commonTextRule', JSON.stringify({ min, max }));
    setIsEditingCommon(false);
  };
  const cancelCommon = () => {
    setDraftMin(commonMinPt);
    setDraftMax(commonMaxPt);
    setIsEditingCommon(false);
  };
  const rows = [
    { id: 'T-001', name: '栄養成分表示', minFont: '8', maxFont: '', required: true, keywords: ['栄養成分表示', 'Nutrition Facts'] },
    { id: 'T-002', name: 'アレルギー表示', minFont: '8', maxFont: '12', required: false, keywords: ['アレルギー', '卵', '小麦'] },
    { id: 'T-003', name: 'お客様相談センター', minFont: '5.5', maxFont: '', required: false, keywords: ['お客様相談センター', 'お問い合わせ'] },
  ];

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-title">テキストルール一覧</div>
        <div className="spacer" />
        
      </div>

      <div className="card" style={{ marginTop: 0 }}>
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <div className="toolbar-title">共通ルール</div>
          <div className="spacer" />
          {!isEditingCommon && (
            <button className="menu-item" onClick={openEditCommon}>編集</button>
          )}
        </div>
        {!isEditingCommon ? (
          <div className="table">
            <div className="thead">
              <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 160px' }}>
                <div className="th" style={{ width: 160 }}>最小フォントサイズ</div>
                <div className="th" style={{ width: 160 }}>最大フォントサイズ</div>
              </div>
            </div>
            <div className="tbody">
              <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 160px' }}>
                <div className="td" style={{ width: 160 }}>{commonMinPt ? `${commonMinPt}pt` : '-'}</div>
                <div className="td" style={{ width: 160 }}>{commonMaxPt ? `${commonMaxPt}pt` : '-'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="form-label" style={{ width: 160 }}>最小フォントサイズ</label>
              <input
                className="form-input"
                placeholder="例: 5.5（未指定可）"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                style={{ maxWidth: 160 }}
              />
              <span className="form-hint">pt</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="form-label" style={{ width: 160 }}>最大フォントサイズ</label>
              <input
                className="form-input"
                placeholder="例: 12（未指定可）"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                style={{ maxWidth: 160 }}
              />
              <span className="form-hint">pt</span>
            </div>
            <div className="form-hint">最小/最大はどちらか片方のみでも可。空欄は制限なし。</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="menu-item" onClick={saveCommon}>保存</button>
              <button
                className="menu-item"
                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                onClick={cancelCommon}
              >キャンセル</button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <div className="toolbar-title">ブロック別ルール</div>
          <div className="spacer" />
          <button className="menu-item" onClick={() => navigate('/settings/text/new')}>新規登録</button>
        </div>
        <div className="table">
          <div className="thead">
            <div className="tr" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 1fr' }}>
              <div className="th">ルール名</div>
              <div className="th" style={{ width: 140 }}>最小フォント</div>
              <div className="th" style={{ width: 140 }}>最大フォント</div>
              <div className="th" style={{ width: 100 }}>要否</div>
              <div className="th">自動検出用キーワード</div>
            </div>
          </div>
          <div className="tbody">
            {rows.map((r) => (
              <div className="tr" key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 100px 1fr' }}>
                <div className="td">{r.name}</div>
                <div className="td" style={{ width: 140 }}>{r.minFont ? `${r.minFont}pt` : '-'}</div>
                <div className="td" style={{ width: 140 }}>{r.maxFont ? `${r.maxFont}pt` : '-'}</div>
                <div className="td" style={{ width: 100 }}>{r.required ? '要' : '任意'}</div>
                <div className="td">{(r.keywords && r.keywords.length) ? r.keywords.join(', ') : '-'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


