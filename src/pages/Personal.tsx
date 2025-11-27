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
  const [visualAnnotations, setVisualAnnotations] = useState<{ id: number; rect: { xPct: number; yPct: number; wPct: number; hPct: number }; comment: string; status: 'ok' | 'ng' }[]>([]);
  const [visualDraftRect, setVisualDraftRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [visualCommentDraft, setVisualCommentDraft] = useState<string>('');
  const [visualSelectedId, setVisualSelectedId] = useState<number | null>(null);
  const visualCanvasRef = useRef<HTMLDivElement | null>(null);
  const visualDraftStartRef = useRef<{ x: number; y: number } | null>(null);
  const [checkOpen, setCheckOpen] = useState<boolean[]>([false, false, false, false, false]);
  const [visualDraftStatus, setVisualDraftStatus] = useState<'ok' | 'ng'>('ng');
  type SelectedMark = { name: string; category: string; url: string };
  const [selectedMarks, setSelectedMarks] = useState<SelectedMark[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
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

  // 目視チェック画面の領域選択ドラッグ処理
  useEffect(() => {
    if (!visualDraftRect || !visualDraftStartRef.current) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const el = visualCanvasRef.current;
      if (!el || !visualDraftStartRef.current) return;
      const r = el.getBoundingClientRect();
      const cx = Math.min(Math.max(0, e.clientX - r.left), r.width);
      const cy = Math.min(Math.max(0, e.clientY - r.top), r.height);
      const x = Math.min(visualDraftStartRef.current.x, cx);
      const y = Math.min(visualDraftStartRef.current.y, cy);
      const width = Math.abs(cx - visualDraftStartRef.current.x);
      const height = Math.abs(cy - visualDraftStartRef.current.y);
      setVisualDraftRect({ x, y, width, height });
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
  }, [visualDraftRect]);

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
              <div className="card" style={{ padding: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr 360px', alignItems: 'start', background: 'var(--surface)', boxShadow: 'var(--shadow-md)', maxHeight: 'none', overflow: 'visible' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ 
                    overflow: 'auto', 
                    borderRadius: '12px',
                    border: '2px solid var(--border)',
                    background: '#fafbfc',
                    padding: '4px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '396px',
                    maxHeight: '396px'
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    setVisualZoom(z => {
                      const newZoom = Math.max(0.25, Math.min(3, Math.round((z + delta) * 100) / 100));
                      return newZoom;
                    });
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
                        cursor: visualDraftRect ? 'crosshair' : 'default',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        margin: 0,
                        padding: 0
                      }}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return; // 左クリックのみ
                        e.preventDefault();
                        const el = visualCanvasRef.current;
                        if (!el) return;
                        const r = el.getBoundingClientRect();
                        const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
                        const y = Math.min(Math.max(0, e.clientY - r.top), r.height);
                        visualDraftStartRef.current = { x, y };
                        setVisualDraftRect({ x, y, width: 0, height: 0 });
                      }}
                    >
                      <img
                        src="/outputs/checkRequiredArea.png"
                        alt="チェック結果"
                        style={{
                          width: `${100 * visualZoom}%`,
                          height: `${100 * visualZoom}%`,
                          maxWidth: '100%',
                          maxHeight: '100%',
                          display: 'block',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                          margin: 0,
                          padding: 0
                        }}
                      />
              {(() => {
                        const el = visualCanvasRef.current;
                        const cw = el ? el.clientWidth : 1;
                        const ch = el ? el.clientHeight : 1;
                        return visualAnnotations.map(a => {
                          const left = a.rect.xPct * cw;
                          const top = a.rect.yPct * ch;
                          const width = a.rect.wPct * cw;
                          const height = a.rect.hPct * ch;
                          const isSelected = a.id === visualSelectedId;
                          const color = a.status === 'ok' ? '#059669' : '#dc2626';
                          const fill = a.status === 'ok' ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)';
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
                                border: `2px solid ${isSelected ? color : color}`,
                                boxShadow: isSelected ? `0 0 0 2px ${a.status === 'ok' ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'} inset` : undefined,
                                background: fill,
                              }}
                              title=""
                            />
                          );
                        });
                      })()}
                      {visualDraftRect && (
                        <div
                          style={{
                            position: 'absolute',
                            left: visualDraftRect.x,
                            top: visualDraftRect.y,
                            width: visualDraftRect.width,
                            height: visualDraftRect.height,
                            border: '2px dashed var(--accent)',
                            background: 'rgba(99,102,241,0.08)',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ 
                  padding: 16, 
                  position: 'sticky', 
                  top: 16,
                  background: 'var(--surface)',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: '2px solid var(--border)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="toolbar-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>メモ</div>
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ 
                      padding: '12px', 
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                      borderRadius: '10px',
                      border: '1px solid #bae6fd',
                      fontSize: '13px',
                      color: '#0369a1',
                      fontWeight: 500
                    }}>
                      💡 画像上でドラッグして領域を選択してください
                    </div>
                    {visualDraftRect && (
                      <div style={{ 
                        display: 'grid', 
                        gap: 12,
                        padding: '16px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        borderRadius: '12px',
                        border: '2px solid #fbbf24',
                        boxShadow: '0 4px 6px rgba(251, 191, 36, 0.1)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8,
                          padding: '8px 12px',
                          background: '#fff',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                            選択中の領域: {Math.round(visualDraftRect.width)}×{Math.round(visualDraftRect.height)}px
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', minWidth: 48 }}>判定</span>
                          <button
                            className="menu-item btn-small"
                            style={{ 
                              background: visualDraftStatus === 'ok' ? '#059669' : '#fff', 
                              color: visualDraftStatus === 'ok' ? '#fff' : '#059669', 
                              borderColor: '#059669',
                              fontWeight: 700,
                              padding: '8px 20px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              boxShadow: visualDraftStatus === 'ok' ? '0 2px 4px rgba(5, 150, 105, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onClick={() => setVisualDraftStatus('ok')}
                            onMouseEnter={(e) => {
                              if (visualDraftStatus !== 'ok') {
                                e.currentTarget.style.background = '#d1fae5';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (visualDraftStatus !== 'ok') {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >✓ OK</button>
                          <button
                            className="menu-item btn-small"
                            style={{ 
                              background: visualDraftStatus === 'ng' ? '#dc2626' : '#fff', 
                              color: visualDraftStatus === 'ng' ? '#fff' : '#dc2626', 
                              borderColor: '#dc2626',
                              fontWeight: 700,
                              padding: '8px 20px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              boxShadow: visualDraftStatus === 'ng' ? '0 2px 4px rgba(220, 38, 38, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onClick={() => setVisualDraftStatus('ng')}
                            onMouseEnter={(e) => {
                              if (visualDraftStatus !== 'ng') {
                                e.currentTarget.style.background = '#fee2e2';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (visualDraftStatus !== 'ng') {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >✗ NG</button>
                        </div>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="この領域についてのコメントを入力..."
                          value={visualCommentDraft}
                          onChange={(e) => setVisualCommentDraft(e.target.value)}
                          style={{
                            borderRadius: '10px',
                            border: '2px solid var(--border)',
                            padding: '12px',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="menu-item"
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                              color: '#fff',
                              border: 'none',
                              fontWeight: 700,
                              padding: '8px 16px',
                              borderRadius: '10px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(147, 51, 234, 0.25)',
                              fontSize: '12px'
                            }}
                            onClick={() => {
                              const el = visualCanvasRef.current;
                              if (!el || !visualDraftRect) return;
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
                              const nextId = (visualAnnotations.at(-1)?.id ?? 0) + 1;
                              const item = { id: nextId, rect: { xPct, yPct, wPct, hPct }, comment: visualCommentDraft.trim(), status: visualDraftStatus };
                              setVisualAnnotations(prev => [...prev, item]);
                              setVisualSelectedId(nextId);
                              setVisualDraftRect(null);
                              setVisualCommentDraft('');
                              setVisualDraftStatus('ng');
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(147, 51, 234, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(147, 51, 234, 0.25)';
                            }}
                          >追加</button>
                          <button
                            className="menu-item"
                            style={{ 
                              background: '#fff', 
                              color: 'var(--text)', 
                              borderColor: 'var(--border)',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                              fontSize: '12px'
                            }}
                            onClick={() => { setVisualDraftRect(null); setVisualCommentDraft(''); setVisualDraftStatus('ng'); }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fff';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >キャンセル</button>
                        </div>
                      </div>
                    )}
                    {visualAnnotations.length > 0 && (
                      <div style={{ 
                        height: 2, 
                        background: 'linear-gradient(to right, transparent, var(--border), transparent)', 
                        margin: '8px 0' 
                      }} />
                    )}
                    <div style={{ display: 'grid', gap: 12 }}>
                      {visualAnnotations.length === 0 && (
                        <div style={{ 
                          padding: '24px', 
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          borderRadius: '12px',
                          border: '2px dashed var(--border)',
                          color: 'var(--muted)',
                          fontSize: '14px'
                        }}>
                          📝 判定はまだありません
                        </div>
                      )}
                      {visualAnnotations.map(a => (
                        <div 
                          key={a.id} 
                          className="card" 
                          style={{ 
                            padding: 16, 
                            borderColor: a.id === visualSelectedId ? 'var(--accent)' : 'var(--border)',
                            borderWidth: a.id === visualSelectedId ? '2px' : '1px',
                            background: a.id === visualSelectedId ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : 'var(--surface)',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            boxShadow: a.id === visualSelectedId ? '0 4px 12px rgba(124, 58, 237, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                          onMouseEnter={(e) => {
                            if (a.id !== visualSelectedId) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (a.id !== visualSelectedId) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8,
                              padding: '6px 12px',
                              background: a.id === visualSelectedId ? 'var(--accent)' : 'var(--border)',
                              color: a.id === visualSelectedId ? '#fff' : 'var(--text)',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              領域 #{a.id}
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="menu-item btn-small"
                                style={{ 
                                  background: a.id === visualSelectedId ? 'var(--accent)' : '#fff', 
                                  color: a.id === visualSelectedId ? '#fff' : 'var(--text)', 
                                  borderColor: 'var(--accent)',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => setVisualSelectedId(a.id)}
                                onMouseEnter={(e) => {
                                  if (a.id !== visualSelectedId) {
                                    e.currentTarget.style.background = '#f3e8ff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (a.id !== visualSelectedId) {
                                    e.currentTarget.style.background = '#fff';
                                  }
                                }}
                              >選択</button>
                              <button
                                className="menu-item btn-small"
                                style={{ 
                                  background: '#fff', 
                                  color: '#dc2626', 
                                  borderColor: '#dc2626',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => {
                                  setVisualAnnotations(prev => prev.filter(x => x.id !== a.id));
                                  if (visualSelectedId === a.id) setVisualSelectedId(null);
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fee2e2';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fff';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >削除</button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', minWidth: 48 }}>判定</span>
                            <button
                              className="menu-item btn-small"
                              style={{ 
                                background: a.status === 'ok' ? '#059669' : '#fff', 
                                color: a.status === 'ok' ? '#fff' : '#059669', 
                                borderColor: '#059669',
                                fontWeight: 700,
                                padding: '8px 20px',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                boxShadow: a.status === 'ok' ? '0 2px 4px rgba(5, 150, 105, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              onClick={() => setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, status: 'ok' } : x))}
                              onMouseEnter={(e) => {
                                if (a.status !== 'ok') {
                                  e.currentTarget.style.background = '#d1fae5';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (a.status !== 'ok') {
                                  e.currentTarget.style.background = '#fff';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >✓ OK</button>
                            <button
                              className="menu-item btn-small"
                              style={{ 
                                background: a.status === 'ng' ? '#dc2626' : '#fff', 
                                color: a.status === 'ng' ? '#fff' : '#dc2626', 
                                borderColor: '#dc2626',
                                fontWeight: 700,
                                padding: '8px 20px',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                boxShadow: a.status === 'ng' ? '0 2px 4px rgba(220, 38, 38, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              onClick={() => setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, status: 'ng' } : x))}
                              onMouseEnter={(e) => {
                                if (a.status !== 'ng') {
                                  e.currentTarget.style.background = '#fee2e2';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (a.status !== 'ng') {
                                  e.currentTarget.style.background = '#fff';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            >✗ NG</button>
                          </div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="コメントを入力..."
                            value={a.comment}
                            onChange={(e) => {
                              const v = e.target.value;
                              setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, comment: v } : x));
                            }}
                            style={{
                              borderRadius: '10px',
                              border: '2px solid var(--border)',
                              padding: '12px',
                              fontSize: '13px',
                              transition: 'all 0.2s',
                              resize: 'vertical',
                              width: '100%'
                            }}
                          />
                        </div>
                      ))}
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
                    <div style={{ display: 'grid', gap: 6 }}>
                      {/* NG1 */}
                      <div className="card" style={{ padding: '6px 8px', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 8, alignItems: 'center' }}>
                          <div style={{ display: 'grid', placeItems: 'center' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 10 }}>1</div>
                          </div>
                          <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/outputs/ng/mark1.png')}>
                            <img
                              src="/outputs/ng/mark1.png"
                              alt="NG1"
                              style={{ width: 100, height: 64, objectFit: 'contain', display: 'block' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gap: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>紙リサイクルマーク</div>
                            <div style={{ lineHeight: 1.3, color: 'var(--muted)', fontSize: '13px' }}>形状に異常があります。</div>
                          </div>
                        </div>
                      </div>
                      {/* NG2 */}
                      <div className="card" style={{ padding: '6px 8px', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 8, alignItems: 'center' }}>
                          <div style={{ display: 'grid', placeItems: 'center' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 10 }}>2</div>
                          </div>
                          <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/outputs/ng/text1.png')}>
                            <img
                              src="/outputs/ng/text1.png"
                              alt="NG2"
                              style={{ width: 100, height: 64, objectFit: 'contain', display: 'block' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gap: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>一括表示</div>
                            <div style={{ lineHeight: 1.3, color: 'var(--muted)', fontSize: '13px' }}>フォントサイズが8pt未満です。</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/outputs/mark_text_NG_highlight1.png')}>
                    <img
                      src="/outputs/mark_text_NG_highlight1.png"
                      alt="結果表示"
                      style={{ width: '100%', maxWidth: 381, maxHeight: 229, height: 'auto', display: 'block', objectFit: 'contain' }}
                    />
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


