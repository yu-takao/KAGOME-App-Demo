import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TextRuleSettings() {
  const navigate = useNavigate();
  const [ruleName, setRuleName] = useState<string>('');
  const [minFontPt, setMinFontPt] = useState<string>('');
  const [maxFontPt, setMaxFontPt] = useState<string>('');
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [hookKeywordInput, setHookKeywordInput] = useState<string>('');
  const [hookKeywords, setHookKeywords] = useState<string[]>([]);

  return (
    <div>
      <div className="card">
        <div className="form-row">
          <label className="form-label" htmlFor="ruleName">ルール名</label>
          <input id="ruleName" className="form-input" placeholder="ルール名を入力" value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label">フォントサイズ</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
            <input className="form-input" placeholder="" value={minFontPt} onChange={(e) => setMinFontPt(e.target.value)} style={{ width: 80 }} />
            <span className="form-hint">～</span>
            <input className="form-input" placeholder="" value={maxFontPt} onChange={(e) => setMaxFontPt(e.target.value)} style={{ width: 80 }} />
            <span style={{ alignSelf: 'center' }}>pt</span>
            <span className="form-hint" style={{ marginLeft: 12, whiteSpace: 'nowrap' }}>最小/最大はどちらか片方のみでも可。空欄は制限なし。</span>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="required">存在チェック</label>
          <div className="control-offset">
            <label className="radio" style={{ gap: 10 }}>
              <input id="required" type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
              <span>チェックを入れた場合、このテキストブロックが版下で検出されなかった場合はNGとします</span>
            </label>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="hookWord">自動検出用キーワード</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              id="hookWord"
              className="form-input"
              placeholder="例: 内容量"
              value={hookKeywordInput}
              onChange={(e) => setHookKeywordInput(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <button
              className="menu-item btn-small"
              style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
              onClick={() => {
                const v = hookKeywordInput.trim();
                if (!v) return;
                if (hookKeywords.includes(v)) return;
                setHookKeywords([...hookKeywords, v]);
                setHookKeywordInput('');
              }}
            >追加</button>
          </div>
        </div>
        {hookKeywords.length > 0 && (
          <div className="form-row" style={{ alignItems: 'start' }}>
            <label className="form-label">追加済み</label>
            <div className="chips">
              {hookKeywords.map((w) => (
                <span key={w} className="chip">
                  {w}
                  <button aria-label={`${w} を削除`} onClick={() => setHookKeywords(hookKeywords.filter(x => x !== w))}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
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
          onClick={() => alert('ダミー登録')}
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
          onClick={() => { setRuleName(''); setMinFontPt(''); setMaxFontPt(''); setIsRequired(false); setHookKeywordInput(''); setHookKeywords([]); }}
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


