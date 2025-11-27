import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfPreview from '../../components/PdfPreview';
import RegionSelector, { Rect } from '../../components/RegionSelector';

export default function PackageSettings() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [basePaper, setBasePaper] = useState('');
  const [marks, setMarks] = useState<string[]>([]);
  const [markToAdd, setMarkToAdd] = useState<string>('');
  // 工場制約（パッケージに内包）
  const [printWidth, setPrintWidth] = useState('');
  const [printHeight, setPrintHeight] = useState('');
  const [janWidth, setJanWidth] = useState('');
  const [janHeight, setJanHeight] = useState('');
  const [blackBan, setBlackBan] = useState<'あり' | 'なし' | ''>('');
  const [blackAreaRect, setBlackAreaRect] = useState<Rect>(null);
  const [blackAreaMeta, setBlackAreaMeta] = useState<{ containerWidth: number; containerHeight: number } | null>(null);
  const [strawPdf, setStrawPdf] = useState<string>('');
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const PX_TO_MM = 0.1; // ダミー変換: 1px = 0.1ｍｍ 相当で表示

  return (
    <div>
      <div className="card">
        <div className="form-row">
          <label className="form-label" htmlFor="productName">製品名</label>
          <input id="productName" className="form-input" placeholder="製品名を入力" value={productName} onChange={(e) => setProductName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="basePaper">版下台紙</label>
          <select id="basePaper" className="form-select" value={basePaper} onChange={(e) => setBasePaper(e.target.value)}>
            <option value="">選択してください</option>
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="B4">B4</option>
            <option value="テトラパック">テトラパック</option>
          </select>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="markToAdd">存在マーク</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select id="markToAdd" className="form-select" value={markToAdd} onChange={(e) => setMarkToAdd(e.target.value)} style={{ maxWidth: 240 }}>
              <option value="">選択してください</option>
              <option value="JIS">JIS</option>
              <option value="FDA">FDA</option>
              <option value="CE">CE</option>
              <option value="ISO">ISO</option>
            </select>
            <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => {
              if (!markToAdd) return;
              if (marks.includes(markToAdd)) return;
              setMarks([...marks, markToAdd]);
              setMarkToAdd('');
            }}>追加</button>
          </div>
        </div>
        {marks.length > 0 && (
          <div className="form-row" style={{ alignItems: 'start' }}>
            <label className="form-label">追加済み</label>
            <div className="chips">
              {marks.map((m) => (
                <span key={m} className="chip">
                  {m}
                  <button aria-label={`${m} を削除`} onClick={() => setMarks(marks.filter(x => x !== m))}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="form-row">
          <label className="form-label">ストロー</label>
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
            {strawPdf && (
              <PdfPreview src={`/pdfs/${encodeURIComponent(strawPdf)}`} maxWidth={220} maxHeight={160} />
            )}
            {strawPdf && <div className="form-hint" style={{ margin: 0 }}>{strawPdf}</div>}
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
                onClick={() => { setStrawPdf(f.name); setShowPicker(false); }}
                title={f.name}
              >{f.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="form-row">
          <label className="form-label">印字範囲</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="幅" value={printWidth} onChange={(e) => setPrintWidth(e.target.value)} style={{ width: 120 }} />
            <span style={{ alignSelf: 'center' }}>x</span>
            <input className="form-input" placeholder="高さ" value={printHeight} onChange={(e) => setPrintHeight(e.target.value)} style={{ width: 120 }} />
            <span style={{ alignSelf: 'center' }}>mm</span>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">JANコードエリア</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="幅" value={janWidth} onChange={(e) => setJanWidth(e.target.value)} style={{ width: 120 }} />
            <span style={{ alignSelf: 'center' }}>x</span>
            <input className="form-input" placeholder="高さ" value={janHeight} onChange={(e) => setJanHeight(e.target.value)} style={{ width: 120 }} />
            <span style={{ alignSelf: 'center' }}>mm</span>
          </div>
        </div>

        

        <div className="form-row">
          <label className="form-label">黒禁止エリア</label>
          <div className="radio-group">
            <label className="radio"><input type="radio" name="black" checked={blackBan==='あり'} onChange={() => setBlackBan('あり')} /> <span>あり</span></label>
            <label className="radio"><input type="radio" name="black" checked={blackBan==='なし'} onChange={() => setBlackBan('なし')} /> <span>なし</span></label>
          </div>
        </div>

        {blackBan === 'あり' && (
          <div className="form-row" style={{ alignItems: 'start' }}>
            <label className="form-label">指定エリア</label>
            <div style={{ width: '100%' }}>
              <RegionSelector
                imageSrc={'/png/枠線.png'}
                height={280}
                onChange={(r, meta) => { setBlackAreaRect(r); if (meta) setBlackAreaMeta(meta); }}
              />
              <div className="form-hint" style={{ marginTop: 8 }}>
                現在の矩形: {blackAreaRect ? `${Math.round(blackAreaRect.x)},${Math.round(blackAreaRect.y)} ${Math.round(blackAreaRect.width)}x${Math.round(blackAreaRect.height)}` : '未指定'}
              </div>
              {blackAreaRect && blackAreaMeta && (
                <div className="form-hint" style={{ marginTop: 4 }}>
                  {(() => {
                    const leftPx = Math.max(0, Math.round(blackAreaRect.x));
                    const topPx = Math.max(0, Math.round(blackAreaRect.y));
                    const rightPx = Math.max(0, Math.round(blackAreaMeta.containerWidth - (blackAreaRect.x + blackAreaRect.width)));
                    const bottomPx = Math.max(0, Math.round(blackAreaMeta.containerHeight - (blackAreaRect.y + blackAreaRect.height)));
                    const toMm = (px: number) => (Math.round(px * PX_TO_MM * 10) / 10).toFixed(1);
                    return `余白: 上 ${toMm(topPx)}ｍｍ / 右 ${toMm(rightPx)}ｍｍ / 下 ${toMm(bottomPx)}ｍｍ / 左 ${toMm(leftPx)}ｍｍ`;
                  })()}
                </div>
              )}
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
          onClick={() => alert('ダミー保存')}
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
        >保存</button>
        <button 
          onClick={() => { setProductName(''); setBasePaper(''); setMarks([]); setMarkToAdd(''); setStrawPdf(''); setPrintWidth(''); setPrintHeight(''); setJanWidth(''); setJanHeight(''); setBlackBan(''); setBlackAreaRect(null); setBlackAreaMeta(null); }}
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
          onClick={() => navigate('/settings/package')}
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


