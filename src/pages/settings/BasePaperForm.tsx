import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfPreview from '../../components/PdfPreview';

export default function BasePaperForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState<string>('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [newCompany, setNewCompany] = useState<string>('');
  const [showNewCompany, setShowNewCompany] = useState<boolean>(false);
  const [basePdfName, setBasePdfName] = useState<string>('');
  const [basePdfUrl, setBasePdfUrl] = useState<string | null>(null);
  const [isDragOverBase, setIsDragOverBase] = useState<boolean>(false);
  const [moutFiles, setMoutFiles] = useState<string[]>([]);
  const [strawPdfName, setStrawPdfName] = useState<string>('');
  const [strawPdfUrl, setStrawPdfUrl] = useState<string | null>(null);
  const [isDragOverStraw, setIsDragOverStraw] = useState<boolean>(false);
  const [hasStraw, setHasStraw] = useState<boolean>(false);
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerFor, setPickerFor] = useState<'base' | 'straw' | null>(null);
  const basePdfFileInputRef = useRef<HTMLInputElement | null>(null);
  const strawPdfFileInputRef = useRef<HTMLInputElement | null>(null);
  const [markCategory, setMarkCategory] = useState<string>('');
  const [markCategories] = useState<string[]>(['コーポレート', 'プロダクトブランド', 'マーク', '活動']);
  const [markFiles, setMarkFiles] = useState<{ name: string; url: string }[]>([]);
  const [selectedMarks, setSelectedMarks] = useState<{ name: string; category: string; url: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/mout-companies');
        const data = await res.json();
        setCompanies(Array.isArray(data.companies) ? data.companies : []);
      } catch {
        setCompanies([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!company) { setMoutFiles([]); return; }
      try {
        const res = await fetch(`/api/mouts?company=${encodeURIComponent(company)}`);
        const data = await res.json();
        const names: string[] = Array.isArray(data.files)
          ? data.files.map((f: any) => typeof f === 'string' ? f : f?.name).filter(Boolean)
          : [];
        setMoutFiles(names);
      } catch {
        setMoutFiles([]);
      }
    })();
  }, [company]);

  useEffect(() => {
    (async () => {
      if (!markCategory) { setMarkFiles([]); return; }
      try {
        const res = await fetch(`/api/marks?category=${encodeURIComponent(markCategory)}`);
        const data = await res.json();
        setMarkFiles(Array.isArray(data.files) ? data.files : []);
      } catch {
        setMarkFiles([]);
      }
    })();
  }, [markCategory]);

  return (
    <div>
      <div className="card scrollable" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <div className="form-row">
          <label className="form-label" htmlFor="bpCompany">印刷会社</label>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select id="bpCompany" className="form-select half" value={company} onChange={(e) => setCompany(e.target.value)}>
                <option value="">選択してください</option>
                {companies.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              {!showNewCompany && (
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => setShowNewCompany(true)}
                >新しく印刷会社を追加する</button>
              )}
            </div>
            {showNewCompany && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  className="form-input half"
                  placeholder="新規の印刷会社名を入力"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => {
                    if (!newCompany.trim()) return;
                    const v = newCompany.trim();
                    if (!companies.includes(v)) setCompanies([...companies, v]);
                    setCompany(v);
                    setNewCompany('');
                    setShowNewCompany(false);
                  }}
                >追加</button>
                <button
                  className="menu-item btn-small"
                  style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                  onClick={() => { setNewCompany(''); setShowNewCompany(false); }}
                >キャンセル</button>
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="bpName">台紙名</label>
          <input id="bpName" className="form-input" placeholder="台紙名を入力" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label">台紙PDF</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOverBase(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOverBase(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOverBase(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverBase(false);
              const f = e.dataTransfer.files?.[0];
              if (!f || f.type !== 'application/pdf') return;
              const url = URL.createObjectURL(f);
              setBasePdfUrl(url);
              setBasePdfName(f.name);
            }}
            onClick={() => {
              if (!basePdfName) basePdfFileInputRef.current?.click();
            }}
            style={{
              border: `2px dashed ${isDragOverBase ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOverBase ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
              cursor: basePdfName ? 'default' : 'pointer',
            }}
            title={basePdfName ? "ここに台紙PDFをドロップ" : "クリックまたはドラッグアンドドロップで台紙PDFを選択"}
          >
            <input
              ref={basePdfFileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
              const f = e.target.files?.[0];
                if (!f || f.type !== 'application/pdf') return;
                const url = URL.createObjectURL(f);
                setBasePdfUrl(url);
                setBasePdfName(f.name);
              }}
            />
            {basePdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={basePdfUrl ?? `/pdfs/${encodeURIComponent(basePdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{basePdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={(e) => { e.stopPropagation(); setBasePdfName(''); setBasePdfUrl(null); }}
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
          <label className="form-label">ストロー</label>
            <label className="radio">
            <input
              type="checkbox"
              checked={hasStraw}
              onChange={(e) => {
                const v = e.target.checked;
                setHasStraw(v);
                if (!v) { setStrawPdfName(''); setStrawPdfUrl(null); }
              }}
            />
            <span>あり</span>
            </label>
          </div>

        {hasStraw && (
        <div className="form-row">
          <label className="form-label">ストローPDF</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOverStraw(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOverStraw(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOverStraw(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverStraw(false);
              const f = e.dataTransfer.files?.[0];
              if (!f || f.type !== 'application/pdf') return;
              const url = URL.createObjectURL(f);
              setStrawPdfUrl(url);
              setStrawPdfName(f.name);
            }}
            onClick={() => {
              if (!strawPdfName) strawPdfFileInputRef.current?.click();
            }}
            style={{
              border: `2px dashed ${isDragOverStraw ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOverStraw ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
              cursor: strawPdfName ? 'default' : 'pointer',
            }}
            title={strawPdfName ? "ここにストローPDFをドロップ" : "クリックまたはドラッグアンドドロップでストローPDFを選択"}
          >
            <input
              ref={strawPdfFileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f || f.type !== 'application/pdf') return;
                const url = URL.createObjectURL(f);
                setStrawPdfUrl(url);
                setStrawPdfName(f.name);
              }}
            />
            {strawPdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={strawPdfUrl ?? `/pdfs/${encodeURIComponent(strawPdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strawPdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={(e) => { e.stopPropagation(); setStrawPdfName(''); setStrawPdfUrl(null); }}
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
        )}

        <div className="form-row">
          <label className="form-label">必須マーク</label>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                className="form-select"
                value={markCategory}
                onChange={(e) => {
                  setMarkCategory(e.target.value);
                }}
                style={{ maxWidth: 240 }}
              >
                <option value="">カテゴリを選択</option>
                {markCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {markCategory && markFiles.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                  {markFiles.map((file) => {
                    const isSelected = selectedMarks.some(m => m.url === file.url);
                    return (
                      <div
                        key={file.url}
                        style={{
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 8,
                          padding: 8,
                          cursor: 'pointer',
                          background: isSelected ? '#f1ecff' : '#fff',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMarks(prev => prev.filter(m => m.url !== file.url));
                          } else {
                            setSelectedMarks(prev => [...prev, { name: file.name.replace(/\.pdf$/i, ''), category: markCategory, url: file.url }]);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                      >
                        <PdfPreview src={file.url} maxWidth={60} maxHeight={60} />
                        <div className="form-hint" style={{ margin: 0, marginTop: 4, fontSize: '11px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name.replace(/\.pdf$/i, '')}
                        </div>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {markCategory && markFiles.length === 0 && (
              <div className="form-hint">このカテゴリにマークがありません。</div>
            )}
            {selectedMarks.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div className="form-label" style={{ marginBottom: 0 }}>選択された必須マーク ({selectedMarks.length}件)</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {selectedMarks.map((mark, index) => (
                    <div key={`${mark.url}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f1ecff', borderRadius: 8, border: '1px solid var(--accent)' }}>
                      <PdfPreview src={mark.url} maxWidth={36} maxHeight={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{mark.name}</div>
                        <div className="form-hint" style={{ margin: 0, fontSize: '11px' }}>カテゴリ: {mark.category}</div>
                      </div>
                      <button
                        className="menu-item btn-small"
                        style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                        onClick={() => setSelectedMarks(prev => prev.filter(m => m.url !== mark.url))}
                      >削除</button>
                    </div>
                  ))}
                </div>
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
                onClick={() => {
                  if (pickerFor === 'base') { setBasePdfName(f.name); setBasePdfUrl(null); }
                  if (pickerFor === 'straw') { setStrawPdfName(f.name); setStrawPdfUrl(null); }
                  setShowPicker(false);
                }}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        bottom: 0,
        background: 'var(--bg)',
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate('/settings/base')}
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
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            onClick={() => { setName(''); setCompany(''); setNewCompany(''); setBasePdfName(''); setBasePdfUrl(null); setHasStraw(false); setStrawPdfName(''); setStrawPdfUrl(null); setMarkCategory(''); setSelectedMarks([]); }}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b';
            }}
          >クリア</span>
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
        </div>
      </div>
    </div>
  );
}


