import React, { useRef, useState } from 'react';
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
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [borderType, setBorderType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>(['コーポレート', 'プロダクトブランド', 'マーク', '活動']);
  const [showNewCategory, setShowNewCategory] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('');
  const markPdfFileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      <div className="card scrollable" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
            onClick={() => {
              if (!markPdfName) markPdfFileInputRef.current?.click();
            }}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOver ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
              cursor: markPdfName ? 'default' : 'pointer',
            }}
            title={markPdfName ? "ここにマークPDFをドロップ" : "クリックまたはドラッグアンドドロップでマークPDFを選択"}
          >
            <input
              ref={markPdfFileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
              const f = e.target.files?.[0];
                if (!f || f.type !== 'application/pdf') return;
                const url = URL.createObjectURL(f);
                setMarkPdfUrl(url);
                setMarkPdfName(f.name);
              }}
            />
            {markPdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={markPdfUrl ?? `/pdfs/${encodeURIComponent(markPdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{markPdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={(e) => { e.stopPropagation(); setMarkPdfName(''); setMarkPdfUrl(null); }}
                  >選択取消</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>ドラッグアンドドロップ</span>
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
        <div className="form-row">
          <label className="form-label">フチ</label>
          <div className="control-offset" style={{ display: 'grid', gap: 8 }}>
            <label className="radio" style={{ gap: 10, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={hasBorder}
                onChange={(e) => {
                  const v = e.target.checked;
                  setHasBorder(v);
                  if (!v) {
                    setBorderType('');
                  }
                }}
              />
              <span>あり</span>
            </label>
            {hasBorder && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="form-select" value={borderType} onChange={(e) => setBorderType(e.target.value)} style={{ maxWidth: 200 }}>
                  <option value="">選択してください</option>
                  <option value="単色">単色</option>
                  <option value="ぼかし">ぼかし</option>
                </select>
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
                className="menu-item btn-small"
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
                className="menu-item btn-small"
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

      <div className="form-actions" style={{ 
        display: 'flex', 
        gap: 12, 
        marginTop: 16,
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        justifyContent: 'flex-end',
        position: 'sticky',
        bottom: 0,
        background: 'var(--bg)',
        zIndex: 10
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
          onClick={() => { setMarkName(''); setMarkPdfName(''); setMarkPdfUrl(null); setMinWidthMm(''); setMaxWidthMm(''); setMinHeightMm(''); setMaxHeightMm(''); setHasClearSpace(false); setClearMinWidthMm(''); setClearMaxWidthMm(''); setClearMinHeightMm(''); setClearMaxHeightMm(''); setHasBorder(false); setBorderType(''); setCategory(''); setNewCategory(''); setShowNewCategory(false); setShapeOnly(false); }}
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
          onClick={() => navigate('/settings/mark')}
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


