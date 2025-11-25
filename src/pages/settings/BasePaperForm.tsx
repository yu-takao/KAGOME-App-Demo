import React, { useEffect, useState } from 'react';
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

  return (
    <div>
      <div className="card">
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
            style={{
              border: `2px dashed ${isDragOverBase ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOverBase ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
            }}
            title="ここに台紙PDFをドロップ"
          >
            <div className="form-label" style={{ marginBottom: 6 }}>台紙PDF</div>
            {basePdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={basePdfUrl ?? `/pdfs/${encodeURIComponent(basePdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{basePdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={() => { setBasePdfName(''); setBasePdfUrl(null); }}
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
                    setPickerFor('base');
                    setShowPicker(true);
                  }}
                >フォルダを開く</button>
                <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>またはドラッグアンドドロップ</span>
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
            style={{
              border: `2px dashed ${isDragOverStraw ? 'var(--accent)' : 'var(--border)'}`,
              background: isDragOverStraw ? '#f1ecff' : 'transparent',
              borderRadius: 10,
              padding: 12,
              minHeight: 200,
              overflow: 'hidden',
            }}
            title="ここにストローPDFをドロップ"
          >
            <div className="form-label" style={{ marginBottom: 6 }}>ストローPDF</div>
            {strawPdfName ? (
              <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                <PdfPreview src={strawPdfUrl ?? `/pdfs/${encodeURIComponent(strawPdfName)}`} maxWidth={300} maxHeight={160} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strawPdfName}</div>
                  <button
                    className="menu-item btn-small"
                    style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onClick={() => { setStrawPdfName(''); setStrawPdfUrl(null); }}
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
                    setPickerFor('straw'); setShowPicker(true);
                  }}
                >フォルダを開く</button>
                <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>またはドラッグアンドドロップ</span>
              </div>
            )}
          </div>
        </div>
        )}

        
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

      <div className="form-actions">
        <button className="menu-item" onClick={() => alert('ダミー保存')}>保存</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => { setName(''); setCompany(''); setNewCompany(''); setBasePdfName(''); setBasePdfUrl(null); setHasStraw(false); setStrawPdfName(''); setStrawPdfUrl(null); }}>クリア</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/settings/base')}>一覧に戻る</button>
      </div>
    </div>
  );
}


