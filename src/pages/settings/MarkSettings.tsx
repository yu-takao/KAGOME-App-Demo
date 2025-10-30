import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarkSettings() {
  const navigate = useNavigate();
  const [markName, setMarkName] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [type, setType] = useState<'public' | 'private' | ''>('');
  const [hasVariant, setHasVariant] = useState<'yes' | 'no' | ''>('');

  return (
    <div>
      <div className="card">
        <div className="form-row">
          <label className="form-label" htmlFor="markName">マーク名</label>
          <input id="markName" className="form-input" placeholder="マーク名を入力" value={markName} onChange={(e) => setMarkName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label">テンプレート画像登録</label>
          <div className="file-input">
            <input id="pdfUpload" type="file" accept="application/pdf" onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f ? f.name : '');
            }} />
            <div className="form-hint">PDFファイルを選択してください{fileName ? `（${fileName}）` : ''}。</div>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">マーク種別</label>
          <div className="radio-group">
            <label className="radio">
              <input type="radio" name="type" checked={type==='public'} onChange={() => setType('public')} />
              <span>公共マーク</span>
            </label>
            <label className="radio">
              <input type="radio" name="type" checked={type==='private'} onChange={() => setType('private')} />
              <span>自社マーク</span>
            </label>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">色違いの有無</label>
          <div className="radio-group">
            <label className="radio">
              <input type="radio" name="variant" checked={hasVariant==='yes'} onChange={() => setHasVariant('yes')} />
              <span>あり</span>
            </label>
            <label className="radio">
              <input type="radio" name="variant" checked={hasVariant==='no'} onChange={() => setHasVariant('no')} />
              <span>なし</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="menu-item" onClick={() => alert('ダミー保存')}>保存</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => { setMarkName(''); setFileName(''); setType(''); setHasVariant(''); }}>クリア</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/settings/mark')}>一覧に戻る</button>
      </div>
    </div>
  );
}


