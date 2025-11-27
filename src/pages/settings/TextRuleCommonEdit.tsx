import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TextRuleCommonEdit() {
  const navigate = useNavigate();
  const [minPt, setMinPt] = useState<string>('5.5'); // 既定値 5.5
  const [maxPt, setMaxPt] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('commonTextRule');
      if (raw) {
        const obj = JSON.parse(raw);
        setMinPt(typeof obj?.min === 'string' && obj.min !== '' ? obj.min : '5.5');
        setMaxPt(typeof obj?.max === 'string' ? obj.max : '');
      }
    } catch {
      // 既定値を使用
    }
  }, []);

  const handleSave = () => {
    const min = (minPt || '').trim();
    const max = (maxPt || '').trim();
    localStorage.setItem('commonTextRule', JSON.stringify({ min, max }));
    navigate('/settings/text');
  };

  const handleClear = () => {
    setMinPt('');
    setMaxPt('');
  };

  return (
    <div>
      <div className="card">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <div className="toolbar-title">共通ルールの編集</div>
        </div>

        <div className="form-row">
          <label className="form-label">フォントサイズ</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
            <input className="form-input" placeholder="" value={minPt} onChange={(e) => setMinPt(e.target.value)} style={{ width: 80 }} />
            <span className="form-hint">～</span>
            <input className="form-input" placeholder="" value={maxPt} onChange={(e) => setMaxPt(e.target.value)} style={{ width: 80 }} />
            <span style={{ alignSelf: 'center' }}>pt</span>
            <span className="form-hint" style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>最小/最大はどちらか片方のみでも可。空欄は制限なし。</span>
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ 
        display: 'flex', 
        gap: 12, 
        marginTop: 24,
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        justifyContent: 'flex-end'
      }}>
        <button 
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 14px rgba(147, 51, 234, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.35)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(147, 51, 234, 0.25)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >登録</button>
        <button 
          onClick={handleClear}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >クリア</button>
        <button 
          onClick={() => navigate('/settings/text')}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          一覧に戻る
        </button>
      </div>
    </div>
  );
}


