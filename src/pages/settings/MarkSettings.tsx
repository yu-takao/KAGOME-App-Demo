import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfPreview from '../../components/PdfPreview';

export default function MarkSettings() {
  const navigate = useNavigate();
  const [markName, setMarkName] = useState<string>('');
  const [markPdfName, setMarkPdfName] = useState<string>('');
  const [markPdfUrl, setMarkPdfUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [minWidthMm, setMinWidthMm] = useState<string>('');
  const [minHeightMm, setMinHeightMm] = useState<string>('');
  const [maxWidthMm, setMaxWidthMm] = useState<string>('');
  const [maxHeightMm, setMaxHeightMm] = useState<string>('');
  const [shapeOnly, setShapeOnly] = useState<boolean>(false);
  const [hasClearSpace, setHasClearSpace] = useState<boolean>(false);
  const [clearMinWidthMm, setClearMinWidthMm] = useState<string>('');
  const [clearMaxWidthMm, setClearMaxWidthMm] = useState<string>('');
  const [clearMinHeightMm, setClearMinHeightMm] = useState<string>('');
  const [clearMaxHeightMm, setClearMaxHeightMm] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>(['コーポレート', 'プロダクトブランド', 'マーク', '活動']);
  const [showNewCategory, setShowNewCategory] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('');

  return (
    <div>
      <div className="card">
        <div className="form-row">
          <label className="form-label" htmlFor="markName">マーク名</label>
          <input id="markName" className="form-input" placeholder="マーク名を入力" value={markName} onChange={(e) => setMarkName(e.target.value)} />
        </div>
        

        <div className="form-row">
          <label className="form-label">マークPDF</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (!f || f.type !== 'application/pdf') return;
              const url = URL.createObjectURL(f);
              setMarkPdfUrl(url);
              setMarkPdfName(f.name);
            }}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOver ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
            }}
            title="ここにマークPDFをドロップ"
          >
            {markPdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={markPdfUrl ?? `/pdfs/${encodeURIComponent(markPdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{markPdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={() => { setMarkPdfName(''); setMarkPdfUrl(null); }}
                  >選択取消</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/pdfs');
                      const data = await res.json();
                      setPdfs(Array.isArray(data.files) ? data.files : []);
                    } catch {}
                    setShowPicker(true);
                  }}
                >フォルダを開く</button>
                <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>またはドラッグアンドドロップ</span>
              </div>
            )}
          </div>
        </div>
        
        

        <div className="form-row">
          <label className="form-label" htmlFor="categorySelect">カテゴリ</label>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select id="categorySelect" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 280 }}>
                <option value="">選択してください</option>
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              {!showNewCategory && (
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => setShowNewCategory(true)}
                >新しくカテゴリを追加する</button>
              )}
            </div>
            {showNewCategory && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="form-input half"
                  placeholder="新規のカテゴリ名を入力"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => {
                    const v = newCategory.trim();
                    if (!v) return;
                    if (!categories.includes(v)) setCategories([...categories, v]);
                    setCategory(v);
                    setNewCategory('');
                    setShowNewCategory(false);
                  }}
                >追加</button>
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => { setNewCategory(''); setShowNewCategory(false); }}
                >キャンセル</button>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">サイズ</label>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>幅</span>
              <input className="form-input" placeholder="最小" value={minWidthMm} onChange={(e) => setMinWidthMm(e.target.value)} style={{ width: 120 }} />
              <span className="form-hint">～</span>
              <input className="form-input" placeholder="最大" value={maxWidthMm} onChange={(e) => setMaxWidthMm(e.target.value)} style={{ width: 120 }} />
              <span style={{ alignSelf: 'center' }}>mm</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>高さ</span>
              <input className="form-input" placeholder="最小" value={minHeightMm} onChange={(e) => setMinHeightMm(e.target.value)} style={{ width: 120 }} />
              <span className="form-hint">～</span>
              <input className="form-input" placeholder="最大" value={maxHeightMm} onChange={(e) => setMaxHeightMm(e.target.value)} style={{ width: 120 }} />
              <span style={{ alignSelf: 'center' }}>mm</span>
            </div>
            <div className="form-hint">空欄の場合は制限なし</div>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="shapeOnly">色検査</label>
          <div className="control-offset">
            <label className="radio" style={{ gap: 10, alignItems: 'center' }}>
              <input id="shapeOnly" type="checkbox" checked={shapeOnly} onChange={(e) => setShapeOnly(e.target.checked)} />
              <span>する</span>
            </label>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">クリアスペース</label>
          <div className="control-offset" style={{ display: 'grid', gap: 8 }}>
            <label className="radio" style={{ gap: 10, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={hasClearSpace}
                onChange={(e) => {
                  const v = e.target.checked;
                  setHasClearSpace(v);
                  if (!v) {
                    setClearMinWidthMm(''); setClearMaxWidthMm('');
                    setClearMinHeightMm(''); setClearMaxHeightMm('');
                  }
                }}
              />
              <span>あり</span>
            </label>
            {hasClearSpace && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>幅</span>
                  <input className="form-input" placeholder="最小" value={clearMinWidthMm} onChange={(e) => setClearMinWidthMm(e.target.value)} style={{ width: 120 }} />
                  <span className="form-hint">～</span>
                  <input className="form-input" placeholder="最大" value={clearMaxWidthMm} onChange={(e) => setClearMaxWidthMm(e.target.value)} style={{ width: 120 }} />
                  <span style={{ alignSelf: 'center' }}>mm</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>高さ</span>
                  <input className="form-input" placeholder="最小" value={clearMinHeightMm} onChange={(e) => setClearMinHeightMm(e.target.value)} style={{ width: 120 }} />
                  <span className="form-hint">～</span>
                  <input className="form-input" placeholder="最大" value={clearMaxHeightMm} onChange={(e) => setClearMaxHeightMm(e.target.value)} style={{ width: 120 }} />
                  <span style={{ alignSelf: 'center' }}>mm</span>
                </div>
                <div className="form-hint">空欄の場合は制限なし</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPicker && (
        <div className="card" style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="form-hint">server_pdfs フォルダ内のPDF</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="menu-item"
                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                onClick={async () => {
                  try {
                    const res = await fetch('/api/pdfs');
                    const data = await res.json();
                    setPdfs(Array.isArray(data.files) ? data.files : []);
                  } catch {}
                }}
              >再読み込み</button>
              <button
                className="menu-item"
                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                onClick={() => setShowPicker(false)}
              >閉じる</button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {pdfs.length === 0 && <div className="form-hint">PDFがありません。プロジェクト直下の server_pdfs に配置してください。</div>}
            {pdfs.map((f) => (
              <button
                key={f.name}
                className="menu-item"
                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', textAlign: 'left' }}
                onClick={() => { setMarkPdfName(f.name); setMarkPdfUrl(null); setShowPicker(false); }}
                title={f.name}
              >{f.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button className="menu-item" onClick={() => alert('ダミー保存')}>保存</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => { setMarkName(''); setMarkPdfName(''); setMarkPdfUrl(null); setMinWidthMm(''); setMaxWidthMm(''); setMinHeightMm(''); setMaxHeightMm(''); setHasClearSpace(false); setClearMinWidthMm(''); setClearMaxWidthMm(''); setClearMinHeightMm(''); setClearMaxHeightMm(''); setCategory(''); setNewCategory(''); setShowNewCategory(false); setShapeOnly(false); }}>クリア</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/settings/mark')}>一覧に戻る</button>
      </div>
    </div>
  );
}


