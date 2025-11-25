import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfPreview from '../components/PdfPreview';
import RegionSelector, { Rect } from '../components/RegionSelector';

export default function Personal() {
  const steps = useMemo(() => [
    { key: 'pdf', title: 'データ入力' },
    { key: 'confirm', title: '入力内容確認' },
    { key: 'run', title: '検査実行' },
    { key: 'edge', title: 'マークのフチチェック' },
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
  const [product, setProduct] = useState<string>('');
  const [showNgDetail, setShowNgDetail] = useState<boolean>(false);
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerFor, setPickerFor] = useState<'none' | 'constraint' | null>(null);
  const [size, setSize] = useState<string>('A4');
  const [textRules, setTextRules] = useState<string[]>([]);
  const [textRuleToAdd, setTextRuleToAdd] = useState<string>('');
  const [showTextRegionPicker, setShowTextRegionPicker] = useState<boolean>(false);
  const [pendingTextRule, setPendingTextRule] = useState<string>('');
  const [pendingRect, setPendingRect] = useState<Rect>(null);
  const [runProgress, setRunProgress] = useState<number>(0);
  const edgeMarks = useMemo(() => [
    '/demo_pics/mark1.png',
    '/demo_pics/mark2.png',
    '/demo_pics/mark3.png',
  ], []);
  const [edgeIndex, setEdgeIndex] = useState<number>(0);
  const [visualZoom, setVisualZoom] = useState<number>(1);
  const [visualAnnotations, setVisualAnnotations] = useState<{ id: number; rect: { xPct: number; yPct: number; wPct: number; hPct: number }; comment: string; status: 'ok' | 'ng' }[]>([]);
  const [visualDraftRect, setVisualDraftRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [visualCommentDraft, setVisualCommentDraft] = useState<string>('');
  const [visualSelectedId, setVisualSelectedId] = useState<number | null>(null);
  const visualCanvasRef = useRef<HTMLDivElement | null>(null);
  const [checkOpen, setCheckOpen] = useState<boolean[]>([false, false, false, false, false]);
  const [visualDraftStatus, setVisualDraftStatus] = useState<'ok' | 'ng'>('ng');
  type SelectedMark = { name: string; category: string; url: string };
  const [selectedMarks, setSelectedMarks] = useState<SelectedMark[]>([]);
  const [markCategory, setMarkCategory] = useState<string>('');
  const [catalogFiles, setCatalogFiles] = useState<{ name: string; url: string }[]>([]);
  const [moutFiles, setMoutFiles] = useState<{ name: string; url: string }[]>([]);
  const [moutCompanies, setMoutCompanies] = useState<string[]>([]);
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
          if (facMatch) {
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
    if (steps[current]?.key === 'edge') setEdgeIndex(0);
  }, [current, steps]);

  // 検査実行ステップ（current === 2）で2秒の進捗を表示し、完了後にフチチェックへ
  useEffect(() => {
    if (current !== 2) return;
    setRunProgress(0);
    const start = Date.now();
    const total = 2000;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setRunProgress(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        // マークのフチチェックへ遷移（新ステップ3）
        setCurrent(3);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [current]);

  const canNext = () => {
    return true; // モックのため常に次へ進める
  };

  return (
    <div>

      <div className="wizard">
        {(() => {
          const visibleSteps = steps.filter(s => s.key !== 'confirm');
          const currentForIndicator = (() => {
            let idx = current;
            // 確認ステップ（非表示）にいる場合は一つ前の表示ステップをアクティブ表示
            while (idx >= 0 && steps[idx] && steps[idx].key === 'confirm') idx--;
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

        <div className="wizard-panel card">
          {current === 0 && (
            <div>
              <div className="form-row">
                <label className="form-label">検査対象PDF選択</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOverNone(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragOverNone(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragOverNone(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverNone(false);
                      const f = e.dataTransfer.files?.[0];
                      if (!f || f.type !== 'application/pdf') return;
                      const url = URL.createObjectURL(f);
                      setPdfNoneUrl(url);
                      setPdfNone(f.name);
                    }}
                    style={{
                      border: `2px dashed ${isDragOverNone ? 'var(--accent)' : 'var(--border)'}`,
                      background: isDragOverNone ? '#f1ecff' : 'transparent',
                      borderRadius: 10,
                      padding: 12,
                      minHeight: 200,
                      overflow: 'hidden',
                    }}
                    title="ここに版下PDFをドロップ"
                  >
                    <div className="form-label nowrap" style={{ marginBottom: 6 }}>版下PDF<span className="label-note">*包材制約表示なし</span></div>
                    {pdfNone ? (
                      <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                        <PdfPreview src={pdfNoneUrl ?? `/pdfs/${encodeURIComponent(pdfNone)}`} maxWidth={300} maxHeight={160} />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfNone}</div>
                          <button
                            className="menu-item btn-small"
                            style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                            onClick={() => { setPdfNone(''); setPdfNoneUrl(null); }}
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
                      setPickerFor('none');
                      setShowPicker(true);
                    }}
                  >フォルダを開く</button>
                        <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>またはドラッグアンドドロップ</span>
                      </div>
                    )}
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOverConstraint(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragOverConstraint(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragOverConstraint(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverConstraint(false);
                      const f = e.dataTransfer.files?.[0];
                      if (!f || f.type !== 'application/pdf') return;
                      const url = URL.createObjectURL(f);
                      setPdfConstraintUrl(url);
                      setPdfConstraint(f.name);
                    }}
                    style={{
                      border: `2px dashed ${isDragOverConstraint ? 'var(--accent)' : 'var(--border)'}`,
                      background: isDragOverConstraint ? '#f1ecff' : 'transparent',
                      borderRadius: 10,
                      padding: 12,
                      minHeight: 200,
                      overflow: 'hidden',
                    }}
                    title="ここに台紙PDFをドロップ"
                  >
                    <div className="form-label" style={{ marginBottom: 6 }}>台紙PDF</div>
                    {pdfConstraint ? (
                      <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                        <PdfPreview src={pdfConstraintUrl ?? `/pdfs/${encodeURIComponent(pdfConstraint)}`} maxWidth={300} maxHeight={160} />
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                          <div className="form-hint" style={{ margin: 0, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pdfConstraint}</div>
                          <button
                            className="menu-item btn-small"
                            style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                            onClick={() => { setPdfConstraint(''); setPdfConstraintUrl(null); }}
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
                      setPickerFor('constraint');
                      setShowPicker(true);
                    }}
                  >フォルダを開く</button>
                        <span className="form-hint" style={{ margin: 0, whiteSpace: 'nowrap' }}>またはドラッグアンドドロップ</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">検査設定</label>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className="form-row">
                    <label className="form-label" htmlFor="product">製品パッケージ名</label>
                    <div className="control-offset" style={{ display: 'grid', gap: 6 }}>
                      <input
                        id="product"
                        className="form-input half"
                        placeholder="例: 野菜一日これ一本 200ml"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                      />
                      <div className="form-hint">結果出力のタイトルに使用します。検査に直接影響はしません。</div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label className="form-label" htmlFor="pkg">台紙選択</label>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          id="factory"
                          className="form-select half"
                          value={factory}
                          onChange={(e) => setFactory(e.target.value)}
                        >
                          <option value="">印刷会社を選択</option>
                          {moutCompanies.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="card" style={{ padding: 8 }}>
                        {factory ? (
                          packageUrl ? (
                            <div style={{ display: 'grid', placeItems: 'center', gap: 8 }}>
                              <PdfPreview src={packageUrl} maxWidth={240} maxHeight={240} />
                              <div className="form-hint" style={{ margin: 0 }}>{packageOption}</div>
                              <button
                                className="menu-item btn-small"
                                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                                onClick={() => { setPackageOption(''); setPackageUrl(null); }}
                              >選択取消</button>
                            </div>
                          ) : (
                            <>
                              <div className="form-hint" style={{ marginBottom: 8 }}>候補（{factory}）</div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
                                {moutFiles.map(f => (
                                  <div key={f.url} style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                                    <PdfPreview src={f.url} maxWidth={120} maxHeight={120} />
                                    <button
                                      className="menu-item btn-small"
                                      style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                                      onClick={() => { setPackageOption(f.name.replace(/\.pdf$/i, '')); setPackageUrl(f.url); }}
                                      title={f.name}
                                    >選択</button>
                                  </div>
                                ))}
                                {moutFiles.length === 0 && <div className="form-hint">この印刷会社に表示できる台紙がありません。</div>}
                              </div>
                            </>
                          )
                        ) : (
                          <div className="form-hint">印刷会社を選ぶと候補が表示されます。</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <label className="form-label" htmlFor="markCategory">マーク選択</label>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                          id="markCategory"
                          className="form-select half"
                          value={markCategory}
                          onChange={(e) => setMarkCategory(e.target.value)}
                        >
                          <option value="">カテゴリを選択</option>
                          <option value="コーポレート">コーポレート</option>
                          <option value="プロダクトブランド">プロダクトブランド</option>
                          <option value="マーク">マーク</option>
                          <option value="活動">活動</option>
                        </select>
                      </div>
                      <div className="card" style={{ padding: 8 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
                          {catalogFiles.map(f => (
                            <div key={f.url} style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                              <PdfPreview src={f.url} maxWidth={60} maxHeight={60} />
                              <button
                                className="menu-item btn-small"
                                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                                onClick={() => setSelectedMarks(prev => prev.find(p => p.url === f.url) ? prev : [...prev, { name: f.name.replace(/\\.pdf$/i, ''), category: markCategory, url: f.url }])}
                                title={`${f.name}`}
                              >追加</button>
                            </div>
                          ))}
                        </div>
                        {(!markCategory) && <div className="form-hint" style={{ marginTop: 8 }}>カテゴリを選ぶと候補が表示されます。</div>}
                        {(markCategory && catalogFiles.length === 0) && <div className="form-hint" style={{ marginTop: 8 }}>このカテゴリに表示できるマークがありません。</div>}
                      </div>
                    </div>
                  </div>

                  {selectedMarks.length > 0 && (
                    <div className="form-row" style={{ alignItems: 'start' }}>
                      <label className="form-label">選択済み</label>
                      <div className="card" style={{ padding: 8, width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, alignItems: 'start' }}>
                          {selectedMarks.map((m) => (
                            <div key={m.url} style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                              <PdfPreview src={m.url} maxWidth={60} maxHeight={60} />
                              <button
                                className="menu-item btn-small"
                                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                                aria-label={`${m.name} を削除`}
                                onClick={() => setSelectedMarks(selectedMarks.filter(x => x.url !== m.url))}
                              >× 削除</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
            <div>
              <div className="card">
                <div className="toolbar" style={{ marginBottom: 8 }}>
                  <div className="toolbar-title">入力内容確認</div>
                </div>
                <div className="form-row">
                  <label className="form-label">製品パッケージ名</label>
                  <div className="form-hint">{product || '-'}</div>
                </div>
                <div className="form-row">
                  <label className="form-label">印刷会社</label>
                  <div className="form-hint">{factory || '-'}</div>
                </div>
                <div className="form-row">
                  <label className="form-label">台紙</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {packageUrl ? <PdfPreview src={packageUrl} maxWidth={120} maxHeight={120} /> : <div className="form-hint">-</div>}
                    <div className="form-hint" style={{ margin: 0 }}>{packageOption || '-'}</div>
                  </div>
                </div>
                <div className="form-row">
                  <label className="form-label">版下PDF</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {pdfNone ? <PdfPreview src={pdfNoneUrl ?? `/pdfs/${encodeURIComponent(pdfNone)}`} maxWidth={120} maxHeight={96} /> : <div className="form-hint">-</div>}
                    <div className="form-hint">{pdfNone || '-'}</div>
                  </div>
                    </div>
                <div className="form-row">
                  <label className="form-label">台紙PDF</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {pdfConstraint ? <PdfPreview src={pdfConstraintUrl ?? `/pdfs/${encodeURIComponent(pdfConstraint)}`} maxWidth={120} maxHeight={96} /> : <div className="form-hint">-</div>}
                    <div className="form-hint">{pdfConstraint || '-'}</div>
                      </div>
                    </div>
                <div className="form-row" style={{ alignItems: 'start' }}>
                  <label className="form-label">選択マーク</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0,1fr))', gap: 8 }}>
                    {selectedMarks.length === 0 && <div className="form-hint">-</div>}
                    {selectedMarks.map(m => (
                      <div key={m.url} style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
                        <PdfPreview src={m.url} maxWidth={50} maxHeight={50} />
                        <div className="form-hint" style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  </div>
                    ))}
                  </div>
                  </div>
                  </div>
            </div>
          )}

          {current === 2 && (
            <div>
              <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
                <div className="toolbar-title">検査実行中</div>
                <div className="form-hint">検査を開始しています。しばらくお待ちください。</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div className="form-hint">進捗: {runProgress}%</div>
                  <div style={{ width: '100%', height: 10, borderRadius: 999, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: `${runProgress}%`, height: '100%', background: 'var(--accent)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {current === 3 && (
            <div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ marginBottom: 8, fontSize: 20, fontWeight: 800, textAlign: 'center' }}>マークのフチチェック（{edgeIndex + 1}/{edgeMarks.length}）</div>
                <div style={{ padding: 0, display: 'grid', placeItems: 'center' }}>
                  <img src={edgeMarks[edgeIndex]} alt={`マーク${edgeIndex + 1}`} style={{ width: '100%', maxWidth: 260, maxHeight: 220, height: 'auto', display: 'block', objectFit: 'contain' }} />
                </div>
                <div className="wizard-nav" style={{ justifyContent: 'center', marginTop: 12 }}>
                  <button
                    className="menu-item"
                    style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                    onClick={() => {
                      if (edgeIndex < edgeMarks.length - 1) setEdgeIndex(edgeIndex + 1);
                      else setCurrent(4);
                    }}
                  >NG</button>
                  <button
                    className="menu-item"
                    style={{ background: '#059669', borderColor: '#059669', color: '#fff' }}
                    onClick={() => {
                      if (edgeIndex < edgeMarks.length - 1) setEdgeIndex(edgeIndex + 1);
                      else setCurrent(4);
                    }}
                  >OK</button>
                </div>
              </div>
            </div>
          )}

          {current === 4 && (
            <div>
              <div className="card" style={{ padding: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <button
                      className="menu-item btn-small"
                      style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                      onClick={() => setVisualZoom(z => Math.max(0.25, Math.round((z - 0.1) * 100) / 100))}
                    >−</button>
                    <input
                      type="range"
                      min={0.25}
                      max={3}
                      step={0.05}
                      value={visualZoom}
                      onChange={(e) => setVisualZoom(parseFloat(e.target.value))}
                      style={{ width: 200 }}
                      aria-label="ズーム"
                    />
                    <button
                      className="menu-item btn-small"
                      style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                      onClick={() => setVisualZoom(z => Math.min(3, Math.round((z + 0.1) * 100) / 100))}
                    >＋</button>
                    <div className="form-hint" style={{ minWidth: 48, textAlign: 'right' }}>{Math.round(visualZoom * 100)}%</div>
                    <button
                      className="menu-item btn-small"
                      style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                      onClick={() => setVisualZoom(1)}
                    >等倍</button>
                  </div>
                  <div style={{ padding: 0, overflow: 'auto' }}>
                    <div
                      ref={visualCanvasRef}
                      style={{
                        position: 'relative',
                        width: `${760 * visualZoom}px`,
                        height: 'auto',
                        display: 'inline-block',
                        userSelect: 'none',
                        cursor: visualDraftRect ? 'crosshair' : 'default',
                      }}
                      onMouseDown={(e) => {
                        const el = visualCanvasRef.current;
                        if (!el) return;
                        const r = el.getBoundingClientRect();
                        const x = Math.min(Math.max(0, e.clientX - r.left), r.width);
                        const y = Math.min(Math.max(0, e.clientY - r.top), r.height);
                        setVisualDraftRect({ x, y, width: 0, height: 0 });
                      }}
                      onMouseMove={(e) => {
                        if (!visualDraftRect) return;
                        const el = visualCanvasRef.current;
                        if (!el) return;
                        const r = el.getBoundingClientRect();
                        const cx = Math.min(Math.max(0, e.clientX - r.left), r.width);
                        const cy = Math.min(Math.max(0, e.clientY - r.top), r.height);
                        const x = Math.min(visualDraftRect.x, cx);
                        const y = Math.min(visualDraftRect.y, cy);
                        const width = Math.abs(cx - visualDraftRect.x);
                        const height = Math.abs(cy - visualDraftRect.y);
                        setVisualDraftRect({ x, y, width, height });
                      }}
                      onMouseUp={() => {
                        // 確定は右パネルの「追加」で行う
                      }}
                    >
                      <img
                        src="/outputs/checkRequiredArea.png"
                        alt="チェック結果"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                          pointerEvents: 'none',
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
                <div className="card" style={{ padding: 8, position: 'sticky', top: 8 }}>
                  <div className="toolbar-title" style={{ marginBottom: 8 }}>メモ</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div className="form-hint">画像上でドラッグして領域を選択してください。</div>
                    {visualDraftRect && (
                      <div style={{ display: 'grid', gap: 6 }}>
                        <div className="form-hint">選択中の領域: {Math.round(visualDraftRect.width)}×{Math.round(visualDraftRect.height)}px</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div className="form-hint" style={{ margin: 0, minWidth: 36 }}>判定</div>
                          <button
                            className="menu-item btn-small"
                            style={{ background: visualDraftStatus === 'ok' ? '#059669' : '#fff', color: visualDraftStatus === 'ok' ? '#fff' : 'var(--text)', borderColor: '#059669' }}
                            onClick={() => setVisualDraftStatus('ok')}
                          >OK</button>
                          <button
                            className="menu-item btn-small"
                            style={{ background: visualDraftStatus === 'ng' ? '#dc2626' : '#fff', color: visualDraftStatus === 'ng' ? '#fff' : 'var(--text)', borderColor: '#dc2626' }}
                            onClick={() => setVisualDraftStatus('ng')}
                          >NG</button>
                        </div>
                        <textarea
                          className="form-input"
                          rows={3}
                          placeholder="この領域についてのコメント"
                          value={visualCommentDraft}
                          onChange={(e) => setVisualCommentDraft(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="menu-item"
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
                          >追加</button>
                          <button
                            className="menu-item"
                            style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                            onClick={() => { setVisualDraftRect(null); setVisualCommentDraft(''); setVisualDraftStatus('ng'); }}
                          >キャンセル</button>
                        </div>
                      </div>
                    )}
                    <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                    <div style={{ display: 'grid', gap: 8 }}>
                      {visualAnnotations.length === 0 && <div className="form-hint">判定はまだありません。</div>}
                      {visualAnnotations.map(a => (
                        <div key={a.id} className="card" style={{ padding: 8, borderColor: a.id === visualSelectedId ? 'var(--accent)' : 'var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <div className="form-hint">領域 #{a.id}</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="menu-item btn-small"
                                style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
                                onClick={() => setVisualSelectedId(a.id)}
                              >選択</button>
                              <button
                                className="menu-item btn-small"
                                style={{ background: '#fff', color: '#dc2626', borderColor: '#dc2626' }}
                                onClick={() => {
                                  setVisualAnnotations(prev => prev.filter(x => x.id !== a.id));
                                  if (visualSelectedId === a.id) setVisualSelectedId(null);
                                }}
                              >削除</button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                            <div className="form-hint" style={{ margin: 0, minWidth: 36 }}>判定</div>
                            <button
                              className="menu-item btn-small"
                              style={{ background: a.status === 'ok' ? '#059669' : '#fff', color: a.status === 'ok' ? '#fff' : 'var(--text)', borderColor: '#059669' }}
                              onClick={() => setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, status: 'ok' } : x))}
                            >OK</button>
                            <button
                              className="menu-item btn-small"
                              style={{ background: a.status === 'ng' ? '#dc2626' : '#fff', color: a.status === 'ng' ? '#fff' : 'var(--text)', borderColor: '#dc2626' }}
                              onClick={() => setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, status: 'ng' } : x))}
                            >NG</button>
                          </div>
                          <textarea
                            className="form-input"
                            rows={3}
                            placeholder="コメントを入力"
                            value={a.comment}
                            onChange={(e) => {
                              const v = e.target.value;
                              setVisualAnnotations(prev => prev.map(x => x.id === a.id ? { ...x, comment: v } : x));
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

          {current === 5 && (
            <div>
              <div className="card" style={{ padding: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 320px 480px', alignItems: 'start' }}>
                <div style={{ display: 'grid', placeItems: 'center' }}>
                  <img
                    src="/outputs/mark_text_NG_highlight1.png"
                    alt="結果表示"
                    style={{ width: '100%', maxWidth: 760, maxHeight: 440, height: 'auto', display: 'block', objectFit: 'contain' }}
                  />
                </div>
                <div className="card" style={{ padding: 12, position: 'sticky', top: 8 }}>
                  <div className="toolbar-title" style={{ marginBottom: 8 }}>チェックリスト</div>
                  <div style={{ display: 'grid', gap: 10, lineHeight: 1.5 }}>
                    <div>
                      <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', width: '100%', textAlign: 'left' }} onClick={() => setCheckOpen((s) => { const n=[...s]; n[0]=!n[0]; return n; })}>
                        <span style={{ marginRight: 6 }}>{checkOpen[0] ? '▼' : '▶'}</span>
                        <span style={{ color: '#059669', marginRight: 6 }}>◯</span>
                        ① 版下サイズの確認
                      </button>
                      {checkOpen[0] && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6, paddingLeft: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（1）版下の種類：200ml、200mlリーフ、330ml・・・など多様なサイズ、包材が存在</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（2）版下台紙記載の寸法と合っているか</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（3）規定の範囲内にデザインが配置されているか</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（4）規定の範囲内に文字が配置されているか</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', width: '100%', textAlign: 'left' }} onClick={() => setCheckOpen((s) => { const n=[...s]; n[1]=!n[1]; return n; })}>
                        <span style={{ marginRight: 6 }}>{checkOpen[1] ? '▼' : '▶'}</span>
                        <span style={{ color: '#059669', marginRight: 6 }}>◯</span>
                        ② 工場制約確認
                      </button>
                      {checkOpen[1] && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6, paddingLeft: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（5）印字範囲のサイズ、範囲内が白無地、要素が入っていない</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（6）JANコードエリアの保持、範囲内が白無地</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（7）ストロー位置（工場により異なる）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（8）黒が入ってはならないエリアなど工場別の制約</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', width: '100%', textAlign: 'left' }} onClick={() => setCheckOpen((s) => { const n=[...s]; n[2]=!n[2]; return n; })}>
                        <span style={{ marginRight: 6 }}>{checkOpen[2] ? '▼' : '▶'}</span>
                        <span style={{ color: '#dc2626', marginRight: 6 }}>✕</span>
                        ③ 文字サイズの確認
                      </button>
                      {checkOpen[2] && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6, paddingLeft: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（10）文字の最小サイズが5.5pt以上（カゴメルール）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-fail" aria-label="不合格" style={{ color: '#dc2626' }}>✕</span><div>（11）一括表示の文字が8pt以上（法的ルール）※●や◆は対象外</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（12）栄養成分表示の文字が8pt以上（法的ルール）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（13）注意表記の文字が6pt以上（法的ルール）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（14）アレルギー表示の文字が8pt以上（カゴメルール）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（15）お客様相談センターの文字が5.5pt以上（カゴメルール）</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', width: '100%', textAlign: 'left' }} onClick={() => setCheckOpen((s) => { const n=[...s]; n[3]=!n[3]; return n; })}>
                        <span style={{ marginRight: 6 }}>{checkOpen[3] ? '▼' : '▶'}</span>
                        <span style={{ color: '#059669', marginRight: 6 }}>◯</span>
                        ④ 文字配置ルール確認
                      </button>
                      {checkOpen[3] && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6, paddingLeft: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（16）栄養成分表示の炭水化物以降は１文字下げる、糖類は２文字下げる（法定ルール）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（17）裏面ストロー範囲に文字がかかっていない</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <button className="menu-item btn-small" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)', width: '100%', textAlign: 'left' }} onClick={() => setCheckOpen((s) => { const n=[...s]; n[4]=!n[4]; return n; })}>
                        <span style={{ marginRight: 6 }}>{checkOpen[4] ? '▼' : '▶'}</span>
                        <span style={{ color: '#dc2626', marginRight: 6 }}>✕</span>
                        ⑤ マークの照合
                      </button>
                      {checkOpen[4] && (
                        <div style={{ display: 'grid', gap: 4, marginTop: 6, paddingLeft: 18 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（18）サイズ（規定サイズ○mm以上あるか）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（19）色（単色、フルカラーのマークあり、正しいかカラーリングが守られているか）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（20）複雑な背景の場合、マークにフチが付く場合がある（実線/ぼかしフチ）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（21）周囲の要素からのマークの独立性を保持するための保護エリア設定（クリアスペースという）があるマークがある</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（22）複雑な背景の場合、可読性の保持</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（23）縦横比（縦幅は横幅に準ずる）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（24）テキストありのものはテキスト内容があっているか</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（25）テキストとマークの位置関係（通常は一体化しているので優先度低）</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（26）不自然な形状のゆがみがないか</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-fail" aria-label="不合格" style={{ color: '#dc2626' }}>✕</span><div>（27）要素欠けがないか</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr', alignItems: 'start', gap: 8 }}>
                            <span className="result-pass" aria-label="合格" style={{ color: '#059669' }}>◯</span><div>（28）余分な要素がないか</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card" style={{ padding: 12, position: 'sticky', top: 8 }}>
                  <div className="toolbar-title" style={{ marginBottom: 8 }}>NG箇所</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {/* NG1 */}
                    <div className="card" style={{ padding: 10, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>1</div>
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
                          <img
                            src="/outputs/ng/mark1.png"
                            alt="NG1"
                            style={{ width: 100, height: 64, objectFit: 'contain', display: 'block', borderRadius: 6 }}
                          />
                        </div>
                        <div style={{ display: 'grid', gap: 2 }}>
                          <div style={{ fontWeight: 700 }}>紙リサイクルマーク</div>
                          <div style={{ lineHeight: 1.5, color: 'var(--muted)' }}>形状に異常があります。</div>
                        </div>
                      </div>
                    </div>
                    {/* NG2 */}
                    <div className="card" style={{ padding: 10, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>2</div>
                        </div>
                        <div style={{ display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
                          <img
                            src="/outputs/ng/text1.png"
                            alt="NG2"
                            style={{ width: 100, height: 64, objectFit: 'contain', display: 'block', borderRadius: 6 }}
                          />
                        </div>
                        <div style={{ display: 'grid', gap: 2 }}>
                          <div style={{ fontWeight: 700 }}>一括表示</div>
                          <div style={{ lineHeight: 1.5, color: 'var(--muted)' }}>フォントサイズが8pt未満です。</div>
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
        <div className="wizard-nav">
            <button
              className="menu-item"
              style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }}
              onClick={() => {
                setCurrent((s) => Math.max(0, s - 1));
              }}
              disabled={current === 0}
            >戻る</button>
          {current < steps.length - 1 ? (
              <button
                className="menu-item"
                onClick={() => {
                  if (!canNext()) return;
                  setCurrent((s) => Math.min(steps.length - 1, s + 1));
                }}
                disabled={!canNext()}
              >{current === 1 ? '検査開始' : '次へ'}</button>
          ) : (
            <button className="menu-item" onClick={() => alert('ダミー: 検査完了')}>完了</button>
          )}
        </div>
        )}
      </div>
    </div>
  );
}


