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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>最小（任意）</span>
            <input className="form-input" placeholder="例: 5.5（未指定可）" value={minFontPt} onChange={(e) => setMinFontPt(e.target.value)} style={{ width: 160 }} />
            <span className="form-hint">～</span>
            <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>最大（任意）</span>
            <input className="form-input" placeholder="例: 12（未指定可）" value={maxFontPt} onChange={(e) => setMaxFontPt(e.target.value)} style={{ width: 160 }} />
            <span style={{ alignSelf: 'center' }}>pt</span>
          </div>
          <div className="form-hint">最小/最大はどちらか片方のみでも可。空欄は制限なし。</div>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="required">要否</label>
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
              className="menu-item"
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

      <div className="form-actions">
        <button className="menu-item" onClick={() => alert('ダミー保存')}>保存</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => { setRuleName(''); setMinFontPt(''); setMaxFontPt(''); setIsRequired(false); setHookKeywordInput(''); setHookKeywords([]); }}>クリア</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/settings/text')}>一覧に戻る</button>
      </div>
    </div>
  );
}


