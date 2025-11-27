import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import PdfPreview from '../components/PdfPreview';
import RegionSelector, { Rect } from '../components/RegionSelector';

export default function Personal() {
  const navigate = useNavigate();
  const steps = useMemo(() => [
    { key: 'pdf', title: 'データ入力' },
    { key: 'confirm', title: '入力内容確認' },
    { key: 'run', title: '検査実行' },
    { key: 'visual', title: '目視チェック' },
    { key: 'result', title: '結果表示' },
  ], []);

  const [current, setCurrent] = useState<number>(0);
  const [pdfNone, setPdfNone] = useState<string>('');
  const [pdfConstraint, setPdfConstraint] = useState<string>('');
  const [pdfNoneUrl, setPdfNoneUrl] = useState<string | null>(null);
  const [pdfConstraintUrl, setPdfConstraintUrl] = useState<string | null>(null);
  const [isDragOverNone, setIsDragOverNone] = useState<boolean>(false);
  const [isDragOverConstraint, setIsDragOverConstraint] = useState<boolean>(false);
  const [packageOption, setPackageOption] = useState<string>('');
  const [packageUrl, setPackageUrl] = useState<string | null>(null);
  const [factory, setFactory] = useState<string>('');
  const [previousInspection, setPreviousInspection] = useState<string>('');
  const [demoDataSet, setDemoDataSet] = useState<string>('');
  const [product, setProduct] = useState<string>('');
  const [showNgDetail, setShowNgDetail] = useState<boolean>(false);
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerFor, setPickerFor] = useState<'none' | 'constraint' | null>(null);
  const [size, setSize] = useState<string>('A4');
  const pdfNoneFileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfConstraintFileInputRef = useRef<HTMLInputElement | null>(null);
  const [textRules, setTextRules] = useState<string[]>([]);
  const [textRuleToAdd, setTextRuleToAdd] = useState<string>('');
  const [showTextRegionPicker, setShowTextRegionPicker] = useState<boolean>(false);
  const [pendingTextRule, setPendingTextRule] = useState<string>('');
  const [pendingRect, setPendingRect] = useState<Rect>(null);
  const [runProgress, setRunProgress] = useState<number>(0);
  const [visualZoom, setVisualZoom] = useState<number>(1);
  const [visualMode, setVisualMode] = useState<'pan' | 'select'>('select');
  const [visualImagePosition, setVisualImagePosition] = useState({ x: 0, y: 0 });
  const [visualIsDragging, setVisualIsDragging] = useState(false);
  const visualDragStartRef = useRef({ x: 0, y: 0 });
  const visualImageRef = useRef<HTMLImageElement | null>(null);
  const [visualAnnotations, setVisualAnnotations] = useState<{ id: number; rect: { xPct: number; yPct: number; wPct: number; hPct: number }; comment: string; thumbnail?: string; visualImageNaturalWidth?: number; visualImageNaturalHeight?: number }[]>([]);
  const [visualDraftRect, setVisualDraftRect] = useState<{ x: number; y: number; width: number; height: number; imgX?: number; imgY?: number; imgW?: number; imgH?: number } | null>(null);
  const [visualCommentDraft, setVisualCommentDraft] = useState<string>('');
  const [visualSelectedId, setVisualSelectedId] = useState<number | null>(null);
  const visualCanvasRef = useRef<HTMLDivElement | null>(null);
  const visualDraftStartRef = useRef<{ x: number; y: number } | null>(null);
  const [checkOpen, setCheckOpen] = useState<boolean[]>([false, false, false, false, false]);
  type SelectedMark = { name: string; category: string; url: string };
  const [selectedMarks, setSelectedMarks] = useState<SelectedMark[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const resultImageRef = useRef<HTMLImageElement>(null);
  const [resultImageLoaded, setResultImageLoaded] = useState<boolean>(false);
  const [markCategory, setMarkCategory] = useState<string>('');
  const [catalogFiles, setCatalogFiles] = useState<{ name: string; url: string }[]>([]);
  const [moutFiles, setMoutFiles] = useState<{ name: string; url: string }[]>([]);
  const [moutCompanies, setMoutCompanies] = useState<string[]>([]);
  const [showCheckCompleteConfirm, setShowCheckCompleteConfirm] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      if (!markCategory) { setCatalogFiles([]); return; }
      try {
        const res = await fetch(`/api/marks?category=${encodeURIComponent(markCategory)}`);
        const data = await res.json();
        setCatalogFiles(Array.isArray(data.files) ? data.files : []);
      } catch { setCatalogFiles([]); }
    })();
  }, [markCategory]);

  // mout companies (dynamic)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/mout-companies');
        const data = await res.json();
        setMoutCompanies(Array.isArray(data.companies) ? data.companies : []);
      } catch {
        setMoutCompanies([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setPackageOption('');
      setPackageUrl(null);
      if (!factory) { setMoutFiles([]); return; }
      try {
        const res = await fetch(`/api/mouts?company=${encodeURIComponent(factory)}`);
        const data = await res.json();
        setMoutFiles(Array.isArray(data.files) ? data.files : []);
      } catch { setMoutFiles([]); }
    })();
  }, [factory]);
  // 台紙一覧: PDF（検証項目ヒアリング）から抽出（失敗時はデフォルトにフォールバック）
  const [packagesFromDoc, setPackagesFromDoc] = useState<{ name: string; factory: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        // 事前に存在確認して、無ければ処理をスキップ（404ノイズ回避）
        const head = await fetch(encodeURI('/検証項目ヒアリング.pdf'), { method: 'HEAD' });
        if (!head.ok) return;
        const loadingTask = (pdfjsLib as any).getDocument(encodeURI('/検証項目ヒアリング.pdf'));
        const pdf = await loadingTask.promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          const pageText = (tc.items as any[]).map((it) => it.str).join('\n');
          text += '\n' + pageText;
        }
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const results: { name: string; factory: string }[] = [];
        let currentFactory = '';
        for (const line of lines) {
          const facMatch = line.match(/^(.+?社)\b/);
          if (facMatch && facMatch[1]) {
            currentFactory = facMatch[1];
          }
          const pkgMatches = line.match(/\b\d{2,4}ml-[A-Za-z]\b/g);
          if (pkgMatches && currentFactory) {
            for (const m of pkgMatches) {
              if (!results.some(r => r.name === m && r.factory === currentFactory)) {
                results.push({ name: m, factory: currentFactory });
              }
            }
          }
        }
        if (results.length > 0) setPackagesFromDoc(results);
      } catch {
        // no-op: フォールバックに任せる
      }
    })();
  }, []);

  const packagesCatalog = useMemo(
    () =>
      [
        // テトラパック
        { name: 'TBA100', factory: 'テトラパック' },
        { name: 'TBA125', factory: 'テトラパック' },
        { name: 'TBA200スリム', factory: 'テトラパック' },
        { name: 'TBA200リーフ', factory: 'テトラパック' },
        { name: 'TBA250スリム', factory: 'テトラパック' },
        { name: 'TBA1000', factory: 'テトラパック' },
        { name: 'TetraRex1000', factory: 'テトラパック' },
        { name: 'TPA200', factory: 'テトラパック' },
        { name: 'TPA250', factory: 'テトラパック' },
        { name: 'TPA330', factory: 'テトラパック' },
        { name: 'TPA1000', factory: 'テトラパック' },
        // ダイナパック
        { name: '200ml', factory: 'ダイナパック' },
        { name: '900ml', factory: 'ダイナパック' },
      ] as { name: string; factory: string }[],
    []
  );
  const packagesCatalogFinal = useMemo(() => {
    const combined = [...packagesFromDoc, ...packagesCatalog];
    const map = new Map<string, { name: string; factory: string }>();
    for (const p of combined) {
      map.set(`${p.factory}:${p.name}`, p);
    }
    return Array.from(map.values());
  }, [packagesFromDoc, packagesCatalog]);
  const filteredPackages = useMemo(
    () => packagesCatalogFinal.filter(p => !factory || p.factory === factory),
    [factory, packagesCatalogFinal]
  );
  useEffect(() => {
    if (packageOption && !filteredPackages.some(p => p.name === packageOption)) {
      setPackageOption('');
      setPackageUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory]);
  useEffect(() => {
    if (previousInspection === 'dummy1' && factory === 'テトラパック' && moutFiles.length > 0) {
      const tba200SlimFile = moutFiles.find(f => f.name.replace(/\.pdf$/i, '') === 'TBA200スリム');
      if (tba200SlimFile) {
        setPackageOption('TBA200スリム');
        setPackageUrl(tba200SlimFile.url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousInspection, factory, moutFiles]);

  // 目視チェック画面の拡大縮小・ドラッグ処理
  useEffect(() => {
    if (!visualIsDragging || visualMode !== 'pan') return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setVisualImagePosition({
        x: e.clientX - visualDragStartRef.current.x,
        y: e.clientY - visualDragStartRef.current.y
      });
    };
    
    const handleGlobalMouseUp = () => {
      setVisualIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [visualIsDragging, visualMode]);

  // 目視チェック画面の領域選択ドラッグ処理（画像座標系）
  useEffect(() => {
    if (!visualDraftRect || !visualDraftStartRef.current || visualMode !== 'select') return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const el = visualCanvasRef.current;
      const img = visualImageRef.current;
      if (!el || !img || !visualDraftStartRef.current || !img.naturalWidth || !img.naturalHeight) return;
      
      const canvasRect = el.getBoundingClientRect();
      const canvasX = e.clientX - canvasRect.left;
      const canvasY = e.clientY - canvasRect.top;
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
      
      // 画像の元のサイズとアスペクト比
      const imgNaturalWidth = img.naturalWidth;
      const imgNaturalHeight = img.naturalHeight;
      const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      
      // objectFit: containを考慮した画像の実際の表示サイズを計算
      let imgDisplayWidth: number;
      let imgDisplayHeight: number;
      if (imgAspectRatio > canvasAspectRatio) {
        // 画像が横長の場合、幅に合わせる
        imgDisplayWidth = canvasWidth * visualZoom;
        imgDisplayHeight = (canvasWidth / imgAspectRatio) * visualZoom;
      } else {
        // 画像が縦長の場合、高さに合わせる
        imgDisplayHeight = canvasHeight * visualZoom;
        imgDisplayWidth = (canvasHeight * imgAspectRatio) * visualZoom;
      }
      
      // 画像の中心位置（キャンバス座標）
      const imgCenterX = canvasWidth / 2;
      const imgCenterY = canvasHeight / 2;
      
      // 画像の左上位置（キャンバス座標、transformを考慮）
      const imgLeft = imgCenterX - imgDisplayWidth / 2 + visualImagePosition.x;
      const imgTop = imgCenterY - imgDisplayHeight / 2 + visualImagePosition.y;
      
      // キャンバス座標を画像座標（0-1の範囲）に変換
      const imgX1 = (visualDraftStartRef.current.x - imgLeft) / imgDisplayWidth;
      const imgY1 = (visualDraftStartRef.current.y - imgTop) / imgDisplayHeight;
      const imgX2 = (canvasX - imgLeft) / imgDisplayWidth;
      const imgY2 = (canvasY - imgTop) / imgDisplayHeight;
      
      // 画像座標をキャンバス座標に変換して表示
      const x1 = imgX1 * imgDisplayWidth + imgLeft;
      const y1 = imgY1 * imgDisplayHeight + imgTop;
      const x2 = imgX2 * imgDisplayWidth + imgLeft;
      const y2 = imgY2 * imgDisplayHeight + imgTop;
      
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      
      setVisualDraftRect({ x, y, width, height, imgX: Math.min(imgX1, imgX2), imgY: Math.min(imgY1, imgY2), imgW: Math.abs(imgX2 - imgX1), imgH: Math.abs(imgY2 - imgY1) });
    };

    const handleGlobalMouseUp = () => {
      visualDraftStartRef.current = null;
      // visualDraftRectは保持（確定は右パネルの「追加」で行う）
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [visualDraftRect, visualMode, visualZoom, visualImagePosition]);

  // 拡大画像プレビュー機能
  useEffect(() => {
    if (enlargedImage) {
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [enlargedImage]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setImageScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 左クリックのみ
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setImagePosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // 検査実行ステップ（current === 2）で5秒の進捗を表示し、完了後にフチチェックへ
  useEffect(() => {
    if (current !== 2) return;
    setRunProgress(0);
    const start = Date.now();
    const total = 5000;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setRunProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        // 完了エフェクトを表示してから遷移
        setTimeout(() => {
          setCurrent(3);
        }, 1500);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [current]);

  const canNext = () => {
    // データ入力画面（current === 0）の場合、全ての必須項目が入力されているかチェック
    if (current === 0) {
      // デモ用データが選択されているか
      if (!demoDataSet) return false;
      // 版下PDFが選択されているか
      if (!pdfNone || !pdfNoneUrl) return false;
      // 台紙PDFが選択されているか
      if (!pdfConstraint || !pdfConstraintUrl) return false;
      // 製品パッケージ名が入力されているか
      if (!product) return false;
      // 印刷会社が選択されているか
      if (!factory) return false;
      // 台紙が選択されているか（印刷会社が選択されていて、台紙ファイルがある場合）
      if (factory && moutFiles.length > 0 && (!packageOption || !packageUrl)) return false;
    }
    return true;
  };

  return (
    <div>

      <div className="wizard" style={current === 5 ? { marginBottom: 2 } : undefined}>
        {(() => {
          const visibleSteps = steps.filter(s => s.key !== 'confirm');
          const currentForIndicator = (() => {
            let idx = current;
            // 確認ステップ（非表示）にいる場合は一つ前の表示ステップをアクティブ表示
            while (idx >= 0 && steps[idx]?.key === 'confirm') idx--;
            return Math.max(0, idx);
          })();
          return (
            <div className="steps" style={{ gridTemplateColumns: `repeat(${visibleSteps.length}, 1fr)` }}>
              {visibleSteps.map((s, visibleIdx) => {
                const actualIdx = steps.findIndex(t => t.key === s.key);
                const isActive = actualIdx === currentForIndicator;
                const isCompleted = actualIdx < currentForIndicator;
            return (
              <div key={s.key} className={`step${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}>
                    <div className="step-badge">{isCompleted ? '✓' : visibleIdx + 1}</div>
                <div className="step-title">{s.title}</div>
                    {visibleIdx < visibleSteps.length - 1 && <div className="step-connector" />}
              </div>
            );
          })}
        </div>
          );
        })()}

        <div className={`card scrollable ${current === 0 ? 'data-input-panel' : ''}`} style={current === 5 ? { maxHeight: 'none', overflow: 'visible' } : undefined}>
        {current === 0 && (
            <div className="data-input-form" style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 12, textAlign: 'center', display: 'block' }}>検査対象PDF</label>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="form-row">
                      <label className="form-label" htmlFor="demoDataSet">デモ用データを選択</label>
                      <div className="control-offset">
                        <select
                          id="demoDataSet"
                          className={`form-select ${!demoDataSet ? 'pulse-select' : ''}`}
                          style={{ 
                            maxWidth: 'calc(33.333% - 8px)',
                            borderColor: '#9333ea',
                            borderWidth: '2px',
                            boxShadow: demoDataSet ? '0 0 0 3px rgba(147, 51, 234, 0.1)' : 'none',
                            background: demoDataSet ? '#fff' : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                            transition: 'all 0.3s ease'
                          }}
                          value={demoDataSet}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDemoDataSet(value);
                            if (value === 'dummy1') {
                              // デモ用データを設定
                              const designUrl = '/api/data/demo/KORE1_NG/design.pdf';
                              const mountUrl = '/api/data/demo/KORE1_NG/mount.pdf';
                              console.log('Setting demo PDFs:', { designUrl, mountUrl });
                              setPdfNone('design.pdf');
                              setPdfNoneUrl(designUrl);
                              setPdfConstraint('mount.pdf');
                              setPdfConstraintUrl(mountUrl);
                            } else if (value === '') {
                              setPdfNone('');
                              setPdfNoneUrl(null);
                              setPdfConstraint('');
                              setPdfConstraintUrl(null);
                            }
                          }}
                        >
                          <option value="">選択してください</option>
                          <option value="dummy1">野菜一日これ一本 200ml NG</option>
                        </select>
                        <div className="form-hint" style={{ margin: 0, marginTop: 4 }}>※本番ではファイル選択が可能ですが、デモではプリセットからの選択のみとなります</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        background: '#f3f4f6',
                        borderRadius: 10,
                        padding: 12,
                        minHeight: 200,
                        overflow: 'hidden',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                        pointerEvents: 'none'
                      }}
                    >
                      <input
                        ref={pdfNoneFileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        disabled
                      />
                      <div className="form-label nowrap" style={{ marginBottom: 6 }}>版下PDF<span className="label-note">*包材制約表示なし</span></div>
                      {pdfNone ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'auto', opacity: 1 }}>
                          <PdfPreview src={pdfNoneUrl ?? `/pdfs/${encodeURIComponent(pdfNone)}`} maxWidth={360} maxHeight={192} />
                          <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfNone}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>ドラッグアンドドロップ</span>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        border: '2px dashed var(--border)',
                        background: '#f3f4f6',
                        borderRadius: 10,
                        padding: 12,
                        minHeight: 200,
                        overflow: 'hidden',
                        cursor: 'not-allowed',
                        opacity: 0.6,
                        pointerEvents: 'none'
                      }}
                    >
                      <input
                        ref={pdfConstraintFileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        disabled
                      />
                      <div className="form-label" style={{ marginBottom: 6 }}>台紙PDF</div>
                      {pdfConstraint ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'auto', opacity: 1 }}>
                          <PdfPreview src={pdfConstraintUrl ?? `/pdfs/${encodeURIComponent(pdfConstraint)}`} maxWidth={360} maxHeight={192} />
                          <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfConstraint}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>ドラッグアンドドロップ</span>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 12, textAlign: 'center', display: 'block' }}>検査設定</label>
                <div className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gap: 12 }}>
              <div className="form-row">
                    <label className="form-label" htmlFor="previousInspection">過去の検査から設定</label>
                    <div className="control-offset">
                      <select
                        id="previousInspection"
                        className={`form-select ${demoDataSet && !previousInspection ? 'pulse-select' : ''}`}
                        style={{ 
                          maxWidth: 'calc(33.333% - 8px)',
                          borderColor: demoDataSet ? (previousInspection ? '#9333ea' : '#9333ea') : '#e2e8f0',
                          borderWidth: demoDataSet ? '2px' : '1px',
                          boxShadow: demoDataSet && previousInspection ? '0 0 0 3px rgba(147, 51, 234, 0.1)' : 'none',
                          background: demoDataSet ? (previousInspection ? '#fff' : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)') : '#f3f4f6',
                          cursor: demoDataSet ? 'pointer' : 'not-allowed',
                          opacity: demoDataSet ? 1 : 0.6,
                          transition: 'all 0.3s ease'
                        }}
                        value={previousInspection}
                        disabled={!demoDataSet}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPreviousInspection(value);
                          if (value === 'dummy1') {
                            setProduct('野菜一日これ一本 200ml');
                            setFactory('テトラパック');
                          } else if (value === '') {
                            // 選択を解除した場合はリセットしない（ユーザーが手動で変更した可能性があるため）
                          }
                        }}
                      >
                        <option value="">選択してください</option>
                        <option value="dummy1">2024/01/15　野菜一日これ一本 200ml</option>
                      </select>
                    </div>
              </div>
              <div className="form-row">
                    <label className="form-label" htmlFor="product">製品パッケージ名</label>
                    <div className="control-offset" style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                      <input
                        id="product"
                        className="form-input half"
                        placeholder=""
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                      />
                      <div className="form-hint" style={{ margin: 0 }}>デモでは自動入力のみ</div>
                    </div>
              </div>

                  <div className="form-row">
                    <label className="form-label" htmlFor="pkg">台紙選択</label>
                    <div className="control-offset">
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          id="factory"
                          className="form-select half"
                          value={factory}
                          onChange={(e) => {
                            setFactory(e.target.value);
                            setPackageOption('');
                            setPackageUrl(null);
                          }}
                          disabled
                          style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                        >
                          <option value="">印刷会社を選択</option>
                          {moutCompanies.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {factory && moutFiles.length > 0 && (
                          <select
                            className="form-select half"
                            value={packageOption}
                            onChange={(e) => {
                              const selectedFile = moutFiles.find(f => f.name.replace(/\.pdf$/i, '') === e.target.value);
                              if (selectedFile) {
                                setPackageOption(selectedFile.name.replace(/\.pdf$/i, ''));
                                setPackageUrl(selectedFile.url);
                              }
                            }}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f3f4f6' }}
                          >
                            <option value="">台紙を選択</option>
                            {moutFiles.map(f => (
                              <option key={f.url} value={f.name.replace(/\.pdf$/i, '')}>{f.name.replace(/\.pdf$/i, '')}</option>
                            ))}
                          </select>
                        )}
                        <div className="form-hint" style={{ margin: 0 }}>デモでは自動入力のみ</div>
                        {packageUrl && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <PdfPreview src={packageUrl} maxWidth={180} maxHeight={180} />
                          </div>
                        )}
                      </div>
                        {factory && moutFiles.length === 0 && (
                          <div className="form-hint">この印刷会社に表示できる台紙がありません。</div>
                        )}
                      </div>
                    </div>
                  </div>

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
                        onClick={() => {
                          if (pickerFor === 'none') setPdfNone(f.name);
                          if (pickerFor === 'constraint') setPdfConstraint(f.name);
                          
                          setShowPicker(false);
                        }}
                        title={f.name}
                      >{f.name}</button>
                    ))}
                  </div>
                </div>
              )}

              

              {/* 行内プレビューに変更したため下部のまとめ表示は削除 */}
            </div>
          )}

          {false && current === 1}

          {current === 1 && (
            <div className="confirm-form">
                <div className="toolbar" style={{ marginBottom: 20, justifyContent: 'center' }}>
                  <div className="toolbar-title">入力内容確認</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label" style={{ marginBottom: 8, fontSize: '0.9em', textAlign: 'center', display: 'block' }}>製品パッケージ名</label>
                  <div className="form-hint" style={{ textAlign: 'center' }}>{product || '-'}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 2 }}>
                      <label className="form-label" style={{ marginBottom: 8, fontSize: '0.9em', textAlign: 'center', display: 'block' }}>検査対象</label>
                      <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <label className="form-label" style={{ margin: 0, fontSize: '0.9em' }}>版下PDF</label>
                          {pdfNone ? <PdfPreview src={pdfNoneUrl ?? `/pdfs/${encodeURIComponent(pdfNone)}`} maxWidth={120} maxHeight={120} /> : <div className="form-hint" style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>}
                          <div className="form-hint" style={{ margin: 0, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfNone || '-'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <label className="form-label" style={{ margin: 0, fontSize: '0.9em' }}>台紙PDF</label>
                          {pdfConstraint ? <PdfPreview src={pdfConstraintUrl ?? `/pdfs/${encodeURIComponent(pdfConstraint)}`} maxWidth={120} maxHeight={120} /> : <div className="form-hint" style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>}
                          <div className="form-hint" style={{ margin: 0, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfConstraint || '-'}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ marginBottom: 8, fontSize: '0.9em', textAlign: 'center', display: 'block' }}>選択台紙</label>
                      <div style={{ background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px', paddingTop: '40px', borderRadius: '8px' }}>
                        {packageUrl ? <PdfPreview src={packageUrl} maxWidth={120} maxHeight={120} /> : <div className="form-hint" style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>}
                        <div className="form-hint" style={{ margin: 0, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{packageOption || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {current === 2 && (
            <div style={{ 
              padding: 48, 
              display: 'grid', 
              gap: 24, 
              maxWidth: 500,
              margin: '0 auto',
              textAlign: 'center',
              position: 'relative'
            }}>
                <div style={{ display: 'grid', placeItems: 'center', gap: 16 }}>
                  {runProgress === 100 ? (
                    <>
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)',
                        animation: 'successPulse 0.6s ease-out',
                        position: 'relative'
                      }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'checkmark 0.5s ease-out 0.2s both' }}>
                          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '3px solid #059669',
                          animation: 'ripple 1s ease-out infinite'
                        }} />
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          border: '3px solid #059669',
                          animation: 'ripple 1s ease-out 0.3s infinite'
                        }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginBottom: 8, letterSpacing: '-0.5px', animation: 'fadeInUp 0.5s ease-out' }}>
                          検査完了
                        </div>
                        <div style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
                          自動検査が完了しました
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8, letterSpacing: '-0.5px' }}>
                          検査を実行中
                        </div>
                        <div style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6 }}>
                          デザインを分析しています
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>進捗状況</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#9333ea' }}>{runProgress}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: 12, 
                    borderRadius: 999, 
                    background: '#e2e8f0',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ 
                      width: `${runProgress}%`, 
                      height: '100%', 
                      background: runProgress === 100 
                        ? 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)'
                        : 'linear-gradient(90deg, #9333ea 0%, #7c3aed 50%, #a855f7 100%)',
                      borderRadius: 999,
                      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        animation: 'shimmer 2s infinite'
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 8,
                    marginTop: 8
                  }}>
                    {['版下チェック', 'マーク検証', 'テキスト確認'].map((label, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: runProgress > (idx + 1) * 30 ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${runProgress > (idx + 1) * 30 ? '#86efac' : '#e2e8f0'}`,
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ 
                          fontSize: 11, 
                          color: runProgress > (idx + 1) * 30 ? '#059669' : '#94a3b8',
                          fontWeight: 600
                        }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  50% {
                    transform: scale(1.05);
                    opacity: 0.9;
                  }
                }
                @keyframes shimmer {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
                @keyframes successPulse {
                  0% {
                    transform: scale(0.8);
                    opacity: 0;
                  }
                  50% {
                    transform: scale(1.1);
                  }
                  100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                @keyframes checkmark {
                  0% {
                    stroke-dasharray: 0 24;
                    stroke-dashoffset: 24;
                  }
                  100% {
                    stroke-dasharray: 24 0;
                    stroke-dashoffset: 0;
                  }
                }
                @keyframes ripple {
                  0% {
                    transform: scale(1);
                    opacity: 0.8;
                  }
                  100% {
                    transform: scale(1.5);
                    opacity: 0;
                  }
                }
                @keyframes fadeInUp {
                  0% {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )}

          {current === 3 && (
            <div>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
                {/* メインコンテナ: 画像UIのみ */}
                <div className="card" style={{ padding: 16, background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>モード切替</div>
                    <div style={{ 
                      display: 'inline-flex', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff'
                    }}>
                      <button
                        className="menu-item btn-small"
                        style={{
                          background: visualMode === 'pan' ? '#374151' : '#fff',
                          color: visualMode === 'pan' ? '#ffffff' : 'var(--text)',
                          border: 'none',
                          borderRadius: 0,
                          fontWeight: 600,
                          padding: '8px 16px',
                          borderRight: '1px solid var(--border)',
                          margin: 0,
                          boxShadow: visualMode === 'pan' ? 'var(--shadow-md)' : 'none',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          setVisualMode('pan');
                          setVisualDraftRect(null);
                        }}
                      >
                        拡大縮小
                      </button>
                      <button
                        className="menu-item btn-small"
                        style={{
                          background: visualMode === 'select' ? '#374151' : '#fff',
                          color: visualMode === 'select' ? '#ffffff' : 'var(--text)',
                          border: 'none',
                          borderRadius: 0,
                          fontWeight: 600,
                          padding: '8px 16px',
                          margin: 0,
                          boxShadow: visualMode === 'select' ? 'var(--shadow-md)' : 'none',
                          fontSize: '12px'
                        }}
                        onClick={() => {
                          setVisualMode('select');
                        }}
                      >
                        領域選択
                      </button>
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted)',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {visualMode === 'pan' ? (
                        <><strong>拡大縮小モード</strong>: マウスホイールで拡大縮小、ドラッグで画像を移動できます</>
                      ) : (
                        <><strong>領域選択モード</strong>: 画像上でドラッグして領域を選択してください</>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    overflow: 'hidden', 
                    borderRadius: '12px',
                    border: '2px solid var(--border)',
                    background: '#fafbfc',
                    padding: '4px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '356px',
                    maxHeight: '356px',
                    position: 'relative'
                  }}
                  onWheel={(e) => {
                    if (visualMode === 'pan') {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -0.1 : 0.1;
                      setVisualZoom(z => {
                        const newZoom = Math.max(0.25, Math.min(3, Math.round((z + delta) * 100) / 100));
                        return newZoom;
                      });
                    }
                  }}
                  >
                    <div
                      ref={visualCanvasRef}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        userSelect: 'none',
                        cursor: visualMode === 'pan' ? (visualIsDragging ? 'grabbing' : 'grab') : (visualDraftRect ? 'crosshair' : 'default'),
                        transition: visualMode === 'pan' && !visualIsDragging ? 'all 0.1s ease-out' : 'none',
                        margin: 0,
                        padding: 0,
                        overflow: 'hidden'
                      }}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return; // 左クリックのみ
                        e.preventDefault();
                        if (visualMode === 'pan') {
                          setVisualIsDragging(true);
                          visualDragStartRef.current = {
                            x: e.clientX - visualImagePosition.x,
                            y: e.clientY - visualImagePosition.y
                          };
                        } else if (visualMode === 'select') {
                          const el = visualCanvasRef.current;
                          const img = visualImageRef.current;
                          if (!el || !img) return;
                          const canvasRect = el.getBoundingClientRect();
                          const canvasX = e.clientX - canvasRect.left;
                          const canvasY = e.clientY - canvasRect.top;
                          visualDraftStartRef.current = { x: canvasX, y: canvasY };
                          setVisualDraftRect({ x: canvasX, y: canvasY, width: 0, height: 0 });
                        }
                      }}
                    >
                      <img
                        ref={visualImageRef}
                        src="/outputs/checkRequiredArea.png"
                        alt="チェック結果"
                        style={{
                          width: `${100 * visualZoom}%`,
                          height: `${100 * visualZoom}%`,
                          maxWidth: 'none',
                          maxHeight: 'none',
                          display: 'block',
                          objectFit: 'contain',
                          pointerEvents: visualMode === 'pan' ? 'auto' : 'none',
                          margin: 0,
                          padding: 0,
                          transform: `translate(${visualImagePosition.x}px, ${visualImagePosition.y}px)`,
                          cursor: visualMode === 'pan' ? (visualIsDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                      />
              {(() => {
                        const el = visualCanvasRef.current;
                        const img = visualImageRef.current;
                        if (!el || !img || !img.naturalWidth || !img.naturalHeight) return null;
                        
                        // キャンバスのサイズを取得
                        const canvasRect = el.getBoundingClientRect();
                        const canvasWidth = canvasRect.width;
                        const canvasHeight = canvasRect.height;
                        
                        // 画像の元のサイズとアスペクト比
                        const imgNaturalWidth = img.naturalWidth;
                        const imgNaturalHeight = img.naturalHeight;
                        const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
                        const canvasAspectRatio = canvasWidth / canvasHeight;
                        
                        // objectFit: containを考慮した画像の実際の表示サイズを計算
                        let imgDisplayWidth: number;
                        let imgDisplayHeight: number;
                        if (imgAspectRatio > canvasAspectRatio) {
                          // 画像が横長の場合、幅に合わせる
                          imgDisplayWidth = canvasWidth * visualZoom;
                          imgDisplayHeight = (canvasWidth / imgAspectRatio) * visualZoom;
                        } else {
                          // 画像が縦長の場合、高さに合わせる
                          imgDisplayHeight = canvasHeight * visualZoom;
                          imgDisplayWidth = (canvasHeight * imgAspectRatio) * visualZoom;
                        }
                        
                        // 画像の中心位置（キャンバス座標）
                        const imgCenterX = canvasWidth / 2;
                        const imgCenterY = canvasHeight / 2;
                        
                        // 画像の左上位置（キャンバス座標、transformを考慮）
                        const imgLeft = imgCenterX - imgDisplayWidth / 2 + visualImagePosition.x;
                        const imgTop = imgCenterY - imgDisplayHeight / 2 + visualImagePosition.y;
                        
                        return visualAnnotations.map(a => {
                          // 画像座標（パーセンテージ）をキャンバス座標に変換
                          const left = a.rect.xPct * imgDisplayWidth + imgLeft;
                          const top = a.rect.yPct * imgDisplayHeight + imgTop;
                          const width = a.rect.wPct * imgDisplayWidth;
                          const height = a.rect.hPct * imgDisplayHeight;
                          const isSelected = a.id === visualSelectedId;
                          const color = '#dc2626';
                          const fill = 'rgba(220,38,38,0.08)';
                return (
                            <div
                              key={a.id}
                              onClick={(e) => { e.stopPropagation(); setVisualSelectedId(a.id); }}
                              style={{
                                position: 'absolute',
                                left,
                                top,
                                width,
                                height,
                                border: `2px solid ${color}`,
                                boxShadow: isSelected ? `0 0 0 2px rgba(220,38,38,0.25) inset` : undefined,
                                background: fill,
                              }}
                              title=""
                            />
                          );
                        });
                      })()}
                      {visualMode === 'select' && visualDraftRect && (() => {
                        const el = visualCanvasRef.current;
                        const img = visualImageRef.current;
                        if (!el || !img) {
                          // フォールバック: キャンバス座標で表示
                          return (
                            <div
                              style={{
                                position: 'absolute',
                                left: visualDraftRect.x,
                                top: visualDraftRect.y,
                                width: visualDraftRect.width,
                                height: visualDraftRect.height,
                                border: '2px dashed #dc2626',
                                background: 'rgba(220,38,38,0.08)',
                              }}
                            />
                          );
                        }
                        
                        if (visualDraftRect.imgX === undefined || visualDraftRect.imgY === undefined || visualDraftRect.imgW === undefined || visualDraftRect.imgH === undefined) {
                          // フォールバック: キャンバス座標で表示
                          return (
                            <div
                              style={{
                                position: 'absolute',
                                left: visualDraftRect.x,
                                top: visualDraftRect.y,
                                width: visualDraftRect.width,
                                height: visualDraftRect.height,
                                border: '2px dashed #dc2626',
                                background: 'rgba(220,38,38,0.08)',
                              }}
                            />
                          );
                        }
                        
                        // キャンバスのサイズを取得
                        const canvasRect = el.getBoundingClientRect();
                        const canvasWidth = canvasRect.width;
                        const canvasHeight = canvasRect.height;
                        
                        // 画像の元のサイズとアスペクト比
                        const imgNaturalWidth = img.naturalWidth;
                        const imgNaturalHeight = img.naturalHeight;
                        const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
                        const canvasAspectRatio = canvasWidth / canvasHeight;
                        
                        // objectFit: containを考慮した画像の実際の表示サイズを計算
                        let imgDisplayWidth: number;
                        let imgDisplayHeight: number;
                        if (imgAspectRatio > canvasAspectRatio) {
                          // 画像が横長の場合、幅に合わせる
                          imgDisplayWidth = canvasWidth * visualZoom;
                          imgDisplayHeight = (canvasWidth / imgAspectRatio) * visualZoom;
                        } else {
                          // 画像が縦長の場合、高さに合わせる
                          imgDisplayHeight = canvasHeight * visualZoom;
                          imgDisplayWidth = (canvasHeight * imgAspectRatio) * visualZoom;
                        }
                        
                        // 画像の中心位置（キャンバス座標）
                        const imgCenterX = canvasWidth / 2;
                        const imgCenterY = canvasHeight / 2;
                        
                        // 画像の左上位置（キャンバス座標、transformを考慮）
                        const imgLeft = imgCenterX - imgDisplayWidth / 2 + visualImagePosition.x;
                        const imgTop = imgCenterY - imgDisplayHeight / 2 + visualImagePosition.y;
                        
                        // 画像座標をキャンバス座標に変換
                        const x = visualDraftRect.imgX * imgDisplayWidth + imgLeft;
                        const y = visualDraftRect.imgY * imgDisplayHeight + imgTop;
                        const width = visualDraftRect.imgW * imgDisplayWidth;
                        const height = visualDraftRect.imgH * imgDisplayHeight;
                        
                        return (
                          <div
                            style={{
                              position: 'absolute',
                              left: x,
                              top: y,
                              width,
                              height,
                              border: '2px dashed var(--accent)',
                              background: 'rgba(99,102,241,0.08)',
                            }}
                          />
                        );
                      })()}
                    </div>
                  </div>
                </div>
                {/* メモコンテナ: 右隣に配置 */}
                <div className="card" style={{ 
                  padding: 16, 
                  position: 'sticky', 
                  top: 16,
                  background: 'var(--surface)',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  maxHeight: 'calc(100vh - 32px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ 
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>NG登録</div>
                      <div className="form-hint" style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                        領域を選択してNG箇所を登録してください
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0 }}>
                    {visualMode === 'select' && visualDraftRect && (
                      <div style={{ 
                        display: 'grid', 
                        gap: 12,
                        padding: '16px',
                        background: '#fff',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        flexShrink: 0
                      }}>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="コメントを入力..."
                          value={visualCommentDraft}
                          onChange={(e) => setVisualCommentDraft(e.target.value)}
                          style={{
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            padding: '10px',
                            fontSize: '13px',
                            resize: 'vertical',
                            width: '100%'
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="menu-item"
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 600,
                              padding: '10px 16px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              whiteSpace: 'nowrap'
                            }}
                            onClick={() => {
                              const el = visualCanvasRef.current;
                              const img = visualImageRef.current;
                              if (!el || !visualDraftRect || !img || !img.naturalWidth || !img.naturalHeight) return;
                              
                              // 画像を切り取る関数
                              const cropImage = (xPct: number, yPct: number, wPct: number, hPct: number): string | undefined => {
                                try {
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  if (!ctx) return undefined;
                                  
                                  // 切り取りサイズ（最大140px = 200pxの7割）
                                  const maxSize = 140;
                                  const aspectRatio = wPct / hPct;
                                  let cropWidth: number;
                                  let cropHeight: number;
                                  if (aspectRatio > 1) {
                                    cropWidth = maxSize;
                                    cropHeight = maxSize / aspectRatio;
                                  } else {
                                    cropHeight = maxSize;
                                    cropWidth = maxSize * aspectRatio;
                                  }
                                  
                                  canvas.width = cropWidth;
                                  canvas.height = cropHeight;
                                  
                                  // 画像の元のサイズから切り取り領域を計算
                                  const srcX = xPct * img.naturalWidth;
                                  const srcY = yPct * img.naturalHeight;
                                  const srcWidth = wPct * img.naturalWidth;
                                  const srcHeight = hPct * img.naturalHeight;
                                  
                                  // 画像を切り取って描画
                                  ctx.drawImage(
                                    img,
                                    srcX, srcY, srcWidth, srcHeight,
                                    0, 0, cropWidth, cropHeight
                                  );
                                  
                                  return canvas.toDataURL('image/png');
                                } catch (e) {
                                  console.error('画像の切り取りに失敗しました:', e);
                                  return undefined;
                                }
                              };
                              
                              // 画像座標系で保存
                              if (visualDraftRect.imgX !== undefined && visualDraftRect.imgY !== undefined && visualDraftRect.imgW !== undefined && visualDraftRect.imgH !== undefined) {
                                const xPct = Math.max(0, Math.min(1, visualDraftRect.imgX));
                                const yPct = Math.max(0, Math.min(1, visualDraftRect.imgY));
                                const wPct = Math.max(0, Math.min(1, visualDraftRect.imgW));
                                const hPct = Math.max(0, Math.min(1, visualDraftRect.imgH));
                                if (wPct < 0.01 || hPct < 0.01) {
                                  setVisualDraftRect(null);
                                  setVisualCommentDraft('');
                                  return;
                                }
                                const thumbnail = cropImage(xPct, yPct, wPct, hPct);
                                const nextId = (visualAnnotations.at(-1)?.id ?? 0) + 1;
                                const visualImg = visualImageRef.current;
                                const item = { 
                                  id: nextId, 
                                  rect: { xPct, yPct, wPct, hPct }, 
                                  comment: visualCommentDraft.trim(), 
                                  thumbnail,
                                  visualImageNaturalWidth: visualImg?.naturalWidth,
                                  visualImageNaturalHeight: visualImg?.naturalHeight
                                };
                                setVisualAnnotations(prev => [...prev, item]);
                                setVisualSelectedId(nextId);
                                setVisualDraftRect(null);
                                setVisualCommentDraft('');
                              } else {
                                // フォールバック: キャンバス座標で保存
                                const cw = el.clientWidth || 1;
                                const ch = el.clientHeight || 1;
                                const xPct = Math.max(0, Math.min(1, visualDraftRect.x / cw));
                                const yPct = Math.max(0, Math.min(1, visualDraftRect.y / ch));
                                const wPct = Math.max(0, Math.min(1, visualDraftRect.width / cw));
                                const hPct = Math.max(0, Math.min(1, visualDraftRect.height / ch));
                                if (wPct < 0.01 || hPct < 0.01) {
                                  setVisualDraftRect(null);
                                  setVisualCommentDraft('');
                                  return;
                                }
                                const thumbnail = cropImage(xPct, yPct, wPct, hPct);
                                const nextId = (visualAnnotations.at(-1)?.id ?? 0) + 1;
                                const visualImg = visualImageRef.current;
                                const item = { 
                                  id: nextId, 
                                  rect: { xPct, yPct, wPct, hPct }, 
                                  comment: visualCommentDraft.trim(), 
                                  thumbnail,
                                  visualImageNaturalWidth: visualImg?.naturalWidth,
                                  visualImageNaturalHeight: visualImg?.naturalHeight
                                };
                                setVisualAnnotations(prev => [...prev, item]);
                                setVisualSelectedId(nextId);
                                setVisualDraftRect(null);
                                setVisualCommentDraft('');
                              }
                            }}
                          >NG登録</button>
                          <button
                            className="menu-item"
                            style={{ 
                              background: '#fff', 
                              color: 'var(--text)', 
                              borderColor: 'var(--border)',
                              padding: '10px 16px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '13px'
                            }}
                            onClick={() => { setVisualDraftRect(null); setVisualCommentDraft(''); }}
                          >キャンセル</button>
                        </div>
                      </div>
                    )}
                    {visualAnnotations.length > 0 && (
                      <div style={{ 
                        height: 2, 
                        background: 'linear-gradient(to right, transparent, var(--border), transparent)', 
                        margin: '8px 0',
                        flexShrink: 0
                      }} />
                    )}
                    <div style={{ 
                      display: 'grid', 
                      gap: 12, 
                      overflowY: 'auto',
                      flex: 1,
                      minHeight: 0,
                      paddingRight: 4
                    }}>
                      {visualAnnotations.length === 0 && (
                        <div style={{ 
                          padding: '24px', 
                          textAlign: 'center',
                          color: 'var(--muted)',
                          fontSize: '13px'
                        }}>
                          NG登録はまだありません
                        </div>
                      )}
                      {visualAnnotations.length > 0 && (
                        <div style={{ display: 'grid', gap: 10 }}>
                          <div className="form-label" style={{ marginBottom: 0, fontSize: '13px', fontWeight: 600 }}>登録済み一覧</div>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {visualAnnotations.map((a, index) => (
                              <div key={`${a.id}-${index}`} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10, 
                                padding: '10px 12px', 
                                background: '#fef2f2', 
                                borderRadius: 6, 
                                border: '1px solid #fee2e2',
                                transition: 'all 0.2s ease'
                              }}>
                                {a.thumbnail ? (
                                  <div style={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: 4, 
                                    overflow: 'hidden',
                                    border: '1px solid #fee2e2',
                                    background: '#fff',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0
                                  }}>
                                    <img 
                                      src={a.thumbnail} 
                                      alt={`NG${a.id}の画像`}
                                      style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: 4,
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#dc2626',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    flexShrink: 0
                                  }}>
                                    NG{a.id}
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#dc2626', marginBottom: 2 }}>NG{a.id}</div>
                                  {a.comment && (
                                    <div style={{ margin: 0, fontSize: '11px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {a.comment}
                                    </div>
                                  )}
                                  {!a.comment && (
                                    <div style={{ margin: 0, fontSize: '11px', color: '#334155' }}>
                                      コメントなし
                                    </div>
                                  )}
                                </div>
                                <button
                                  className="menu-item btn-small"
                                  style={{ 
                                    background: '#fff', 
                                    color: '#64748b', 
                                    borderColor: '#e2e8f0', 
                                    flexShrink: 0,
                                    padding: '6px',
                                    minWidth: 'auto',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    border: '1px solid #e2e8f0'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fee2e2';
                                    e.currentTarget.style.borderColor = '#fecaca';
                                    e.currentTarget.style.color = '#dc2626';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.color = '#64748b';
                                  }}
                                  onClick={() => {
                                    setVisualAnnotations(prev => prev.filter(x => x.id !== a.id));
                                    if (visualSelectedId === a.id) {
                                      setVisualSelectedId(null);
                                    }
                                  }}
                                  title="削除"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {current === 4 && (
            <div style={{ maxHeight: 'none', overflow: 'visible' }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
                  <div className="card" style={{ padding: 12, paddingTop: 0, position: 'sticky', top: 8, border: 'none', boxShadow: 'none', background: 'transparent' }}>
                    <div className="card" style={{ padding: 12, marginBottom: 12, marginTop: 0, borderRadius: 8, background: '#fff', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>製品パッケージ名</div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{product || '野菜一日これ一本 200ml'}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>検査日</div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {/* NG1 */}
                      <div className="card" style={{ padding: '4px 6px', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '28px 70px 1fr', gap: 6, alignItems: 'center' }}>
                          <div style={{ display: 'grid', placeItems: 'center' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 9 }}>1</div>
                          </div>
                          <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/outputs/ng/mark1.png')}>
                            <img
                              src="/outputs/ng/mark1.png"
                              alt="NG1"
                              style={{ width: 64, height: 40, objectFit: 'contain', display: 'block' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gap: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '12px' }}>紙リサイクルマーク</div>
                            <div style={{ lineHeight: 1.3, color: 'var(--muted)', fontSize: '11px' }}>形状に異常があります。</div>
                          </div>
                        </div>
                      </div>
                      {/* NG2 */}
                      <div className="card" style={{ padding: '4px 6px', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '28px 70px 1fr', gap: 6, alignItems: 'center' }}>
                          <div style={{ display: 'grid', placeItems: 'center' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 9 }}>2</div>
                          </div>
                          <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/outputs/ng/text1.png')}>
                            <img
                              src="/outputs/ng/text1.png"
                              alt="NG2"
                              style={{ width: 64, height: 40, objectFit: 'contain', display: 'block' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gap: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '12px' }}>一括表示</div>
                            <div style={{ lineHeight: 1.3, color: 'var(--muted)', fontSize: '11px' }}>フォントサイズが8pt未満です。</div>
                          </div>
                        </div>
                      </div>
                      {/* 目視チェックで登録したNG */}
                      {visualAnnotations.map((a, index) => {
                        const ngNumber = 3 + index; // 既存のNG1、NG2の後に続く番号
                        return (
                          <div key={`visual-ng-${a.id}`} className="card" style={{ padding: '4px 6px', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '28px 70px 1fr', gap: 6, alignItems: 'center' }}>
                              <div style={{ display: 'grid', placeItems: 'center' }}>
                                <div style={{ width: 18, height: 18, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 9 }}>{ngNumber}</div>
                              </div>
                              <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => a.thumbnail && setEnlargedImage(a.thumbnail)}>
                                {a.thumbnail ? (
                                  <img
                                    src={a.thumbnail}
                                    alt={`NG${ngNumber}`}
                                    style={{ width: 64, height: 40, objectFit: 'contain', display: 'block' }}
                                  />
                                ) : (
                                  <div style={{ width: 64, height: 40, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: '10px', fontWeight: 600 }}>
                                    NG{ngNumber}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'grid', gap: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '12px' }}>目視チェック</div>
                                <div style={{ lineHeight: 1.3, color: 'var(--muted)', fontSize: '11px' }}>{a.comment || 'コメントなし'}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
                    <img
                      ref={resultImageRef}
                      src="/outputs/mark_text_NG_highlight1.png"
                      alt="結果表示"
                      style={{ width: '100%', maxWidth: 381, maxHeight: 229, height: 'auto', display: 'block', objectFit: 'contain' }}
                      onLoad={() => {
                        setResultImageLoaded(true);
                      }}
                    />
                    {resultImageRef.current && resultImageLoaded && visualAnnotations.length > 0 && resultImageRef.current.complete && resultImageRef.current.naturalWidth > 0 && (() => {
                      const resultImg = resultImageRef.current!;
                      const resultImgRect = resultImg.getBoundingClientRect();
                      const resultContainerWidth = resultImgRect.width;
                      const resultContainerHeight = resultImgRect.height;
                      const resultNaturalWidth = resultImg.naturalWidth;
                      const resultNaturalHeight = resultImg.naturalHeight;
                      const resultAspectRatio = resultNaturalWidth / resultNaturalHeight;
                      const resultContainerAspectRatio = resultContainerWidth / resultContainerHeight;
                      
                      // objectFit: containを考慮した画像の実際の表示サイズを計算
                      let resultDisplayWidth: number;
                      let resultDisplayHeight: number;
                      let resultOffsetX: number;
                      let resultOffsetY: number;
                      
                      if (resultAspectRatio > resultContainerAspectRatio) {
                        // 画像が横長の場合、幅に合わせる
                        resultDisplayWidth = resultContainerWidth;
                        resultDisplayHeight = resultContainerWidth / resultAspectRatio;
                        resultOffsetX = 0;
                        resultOffsetY = (resultContainerHeight - resultDisplayHeight) / 2;
                      } else {
                        // 画像が縦長の場合、高さに合わせる
                        resultDisplayHeight = resultContainerHeight;
                        resultDisplayWidth = resultContainerHeight * resultAspectRatio;
                        resultOffsetX = (resultContainerWidth - resultDisplayWidth) / 2;
                        resultOffsetY = 0;
                      }
                      
                      // 親要素の位置を取得
                      const parentEl = resultImg.parentElement;
                      const parentRect = parentEl?.getBoundingClientRect();
                      const parentLeft = parentRect?.left || 0;
                      const parentTop = parentRect?.top || 0;
                      const imgLeft = resultImgRect.left - parentLeft;
                      const imgTop = resultImgRect.top - parentTop;
                      
                      return (
                        <div style={{
                          position: 'absolute',
                          left: imgLeft + resultOffsetX,
                          top: imgTop + resultOffsetY,
                          width: resultDisplayWidth,
                          height: resultDisplayHeight,
                          pointerEvents: 'none'
                        }}>
                          {visualAnnotations.map((a, index) => {
                            // 座標は画像の自然サイズに対するパーセンテージ（0-1の範囲）として保存されている
                            // 目視チェック画面と同じ計算方法で、表示サイズに変換
                            const x = a.rect.xPct * resultDisplayWidth;
                            const y = a.rect.yPct * resultDisplayHeight;
                            const width = a.rect.wPct * resultDisplayWidth;
                            const height = a.rect.hPct * resultDisplayHeight;
                            
                            return (
                              <div
                                key={`result-annotation-${a.id}`}
                                style={{
                                  position: 'absolute',
                                  left: x,
                                  top: y,
                                  width,
                                  height,
                                  border: '2px solid #dc2626',
                                  background: 'rgba(220, 38, 38, 0.15)',
                                  borderRadius: 2,
                                  boxSizing: 'border-box'
                                }}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, marginTop: 2 }}>
                  <div style={{ display: 'grid', gap: 10, lineHeight: 1.5, fontSize: '11px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 6, fontSize: '11px' }}>
                        版下
                      </div>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>版下の種類と寸法</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>規定の範囲内にデザインが配置されているか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>規定の範囲内に文字が配置されているか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>ストローが文字やデザインにかかっていないか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 6, fontSize: '11px' }}>
                        工場制約
                      </div>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>印字範囲のサイズ、範囲内が白無地</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>JANコードエリアのサイズ、範囲内が白無地</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>工場別の制約</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 6, fontSize: '11px' }}>
                        テキスト
                      </div>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>文字の最小サイズが5.5pt以上</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8, background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                          <div style={{ fontSize: '11px' }}>一括表示の文字が8pt以上</div><span className="result-fail" aria-label="不合格" style={{ color: '#dc2626', textAlign: 'right' }}>✕</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>栄養成分表示の文字が8pt以上</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>注意表記の文字が6pt以上</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>アレルギー表示の文字が8pt以上</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>お客様相談センターの文字が5.5pt以上</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>栄養成分表示の炭水化物以降は1文字下げ、糖類は2文字下げ</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ textAlign: 'center', marginBottom: 6, fontSize: '11px' }}>
                        マーク
                      </div>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>マークのサイズと縦横比</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>マークの色に異常がないか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>適切なフチが付いているか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8 }}>
                          <div style={{ fontSize: '11px' }}>クリアスペースが確保されているか</div><span className="result-pass" aria-label="合格" style={{ color: '#059669', textAlign: 'right' }}>◯</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px', alignItems: 'start', gap: 8, background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                          <div style={{ fontSize: '11px' }}>マークの形状と要素に過不足がないか</div><span className="result-fail" aria-label="不合格" style={{ color: '#dc2626', textAlign: 'right' }}>✕</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {current !== 2 && (
        <div className="wizard-nav data-input-nav" style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'flex-end', 
          marginTop: current === 4 ? 2 : 0,
          paddingTop: current === 0 ? 0 : current === 4 ? 0 : '16px',
          paddingBottom: current === 4 ? 8 : '16px',
          borderTop: '1px solid var(--border)'
        }}>
            {current > 0 && current !== 3 && current !== 4 && (
              <button
                onClick={() => {
                  setCurrent((s) => Math.max(0, s - 1));
                }}
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
                 戻る
              </button>
            )}
          {current < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (!canNext()) return;
                  if (current === 3) {
                    // 目視チェック完了時の確認ポップアップ
                    setShowCheckCompleteConfirm(true);
                  } else {
                    setCurrent((s) => Math.min(steps.length - 1, s + 1));
                  }
                }}
                disabled={!canNext()}
                 style={{
                   padding: '8px 16px',
                   fontSize: '12px',
                   fontWeight: 700,
                   color: '#ffffff',
                   background: canNext() 
                     ? (current === 3 
                       ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                       : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)')
                     : '#cbd5e1',
                   border: 'none',
                   borderRadius: '8px',
                   cursor: canNext() ? 'pointer' : 'not-allowed',
                   transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                   boxShadow: canNext() 
                     ? (current === 3
                       ? '0 4px 14px rgba(5, 150, 105, 0.25)'
                       : '0 4px 14px rgba(147, 51, 234, 0.25)')
                     : 'none',
                   display: 'flex',
                   alignItems: 'center',
                   gap: 5,
                   opacity: canNext() ? 1 : 0.6
                 }}
                onMouseEnter={(e) => {
                  if (canNext()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    if (current === 3) {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.35)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.35)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (canNext()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    if (current === 3) {
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.25)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(147, 51, 234, 0.25)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)';
                    }
                  }
                }}
                onMouseDown={(e) => {
                  if (canNext()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                 {current === 0 ? '入力内容を確認する' : current === 1 ? '検査開始' : current === 3 ? 'チェック完了' : '次へ'}
                 {current !== 0 && current !== 1 && current !== 3 && (
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 )}
                 {current === 3 && (
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 )}
              </button>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => alert('ダミー: 結果をエクスポート')}
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
              >
                結果をエクスポート
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                onClick={() => navigate('/group')}
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
                終了
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        )}
      </div>
      {enlargedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={() => setEnlargedImage(null)}
          onWheel={handleWheel}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                lineHeight: 1,
                color: '#333',
                fontWeight: 'bold',
                zIndex: 1001,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              ×
            </button>
            <img
              ref={imageRef}
              src={enlargedImage}
              alt="拡大表示"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>
      )}
      {showCheckCompleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowCheckCompleteConfirm(false)}
        >
          <div
            className="card"
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                チェックを完了しますか？
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                ※チェック完了後は、この画面に戻ることはできません。
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="menu-item"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#64748b',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowCheckCompleteConfirm(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                キャンセル
              </button>
              <button
                className="menu-item"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                }}
                onClick={() => {
                  setShowCheckCompleteConfirm(false);
                  setCurrent((s) => Math.min(steps.length - 1, s + 1));
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.35)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.25)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                }}
              >
                チェック完了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


