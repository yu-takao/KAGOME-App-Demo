import React, { useMemo, useState } from 'react';
import PdfPreview from '../components/PdfPreview';

export default function Personal() {
  const steps = useMemo(() => [
    { key: 'pdf', title: 'データ入力' },
    { key: 'visual', title: '目視チェック' },
    { key: 'result', title: '検査結果表示' },
  ], []);

  const [current, setCurrent] = useState<number>(0);
  const [pdfNone, setPdfNone] = useState<string>('');
  const [pdfConstraint, setPdfConstraint] = useState<string>('');
  const [packageOption, setPackageOption] = useState<string>('');
  const [factory, setFactory] = useState<string>('');
  const [product, setProduct] = useState<string>('');
  const [showNgDetail, setShowNgDetail] = useState<boolean>(false);
  const [pdfs, setPdfs] = useState<{ name: string; url: string }[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerFor, setPickerFor] = useState<'none' | 'constraint' | null>(null);
  const [size, setSize] = useState<string>('A4');

  const canNext = () => {
    return true; // モックのため常に次へ進める
  };

  return (
    <div>

      <div className="wizard">
        <div className="steps">
          {steps.map((s, idx) => {
            const isActive = idx === current;
            const isCompleted = idx < current;
            return (
              <div key={s.key} className={`step${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}>
                <div className="step-badge">{isCompleted ? '✓' : idx + 1}</div>
                <div className="step-title">{s.title}</div>
                {idx < steps.length - 1 && <div className="step-connector" />}
              </div>
            );
          })}
        </div>

        <div className="wizard-panel card">
          {current === 0 && (
            <div>
              <div className="form-row">
                <label className="form-label" htmlFor="product">製品選択</label>
                <select id="product" className="form-select half control-offset" value={product} onChange={(e) => setProduct(e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="ジュースA">ジュースA</option>
                  <option value="お茶C">お茶C</option>
                  <option value="パッケージB">パッケージB</option>
                  <option value="野菜一日これ一本">野菜一日これ一本</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="factory">印刷会社</label>
                <select id="factory" className="form-select half control-offset" value={factory} onChange={(e) => setFactory(e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="A社">A社</option>
                  <option value="B社">B社</option>
                </select>
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="pkg">パッケージ選択</label>
                <select id="pkg" className="form-select half control-offset" value={packageOption} onChange={(e) => setPackageOption(e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="200ml-A">200ml-A</option>
                  <option value="200ml-B">200ml-B</option>
                  <option value="900ml-A">900ml-A</option>
                  <option value="900ml-B">900ml-B</option>
                </select>
              </div>


              <div className="form-row">
                <label className="form-label nowrap">版下PDF<span className="label-note">*包材制約表示なし</span></label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 16 }}>
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
                  {pdfNone && (
                    <PdfPreview src={`/pdfs/${encodeURIComponent(pdfNone)}`} maxWidth={220} maxHeight={160} />
                  )}
                  {pdfNone && <div className="form-hint" style={{ margin: 0 }}>{pdfNone}</div>}
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">台紙PDF</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 16 }}>
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
                  {pdfConstraint && (
                    <>
                      <PdfPreview src={`/pdfs/${encodeURIComponent(pdfConstraint)}`} maxWidth={220} maxHeight={160} />
                      <div className="form-hint" style={{ margin: 0 }}>{pdfConstraint}</div>
                      <div style={{ color: '#059669', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 24 }}>台紙OK 適切な台紙が使用されています</div>
                    </>
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
              {showNgDetail ? (
                <>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
                    <img src="/demo_pics/screen2.png" alt="NG拡大" style={{ width: '100%', maxWidth: 480, height: 'auto', display: 'block' }} />
                    </div>
                    <div className="card results" style={{ padding: 12, minWidth: 320 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr', columnGap: 10, rowGap: 8 }}>
                        <span className="result-pass" aria-label="合格">◯</span><div>（18）サイズ（規定サイズ以上）</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（19）色ルール準拠</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（20）複雑背景時のフチ</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（21）保護エリア（クリアスペース）</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（22）複雑背景時の可読性</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（23）縦横比の維持</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（24）テキスト内容が正しい</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（25）テキストとマークの位置関係</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（26）不自然なゆがみがない</div>
                        <span className="result-fail" aria-label="不合格">✕</span><div>（27）要素欠けがない</div>
                        <span className="result-pass" aria-label="合格">◯</span><div>（28）余分な要素がない</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => setShowNgDetail(false)}>戻る</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="card" style={{ padding: 0, display: 'grid', placeItems: 'center' }}>
                    <img src={'/demo_pics/screen1.png'} alt="プレビュー" style={{ width: '100%', maxWidth: 640, height: 'auto', display: 'block' }} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="menu-item" onClick={() => setShowNgDetail(true)}>NG箇所を表示</button>
                  </div>
                </>
              )}
            </div>
          )}

          {current === 2 && (
            <div>
              {(() => {
                const now = new Date().toLocaleString('ja-JP', { hour12: false });
                const pass = !!(pdfNone || pdfConstraint);
                return (
                  <div className="table results">
                    <div className="thead">
                      <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 120px' }}>
                        <div className="th" style={{ width: 160 }}>日時</div>
                        <div className="th">対象PDF</div>
                        <div className="th" style={{ width: 120 }}>合否</div>
                      </div>
                    </div>
                    <div className="tbody">
                      <div className="tr" style={{ display: 'grid', gridTemplateColumns: '160px 1fr 120px' }}>
                        <div className="td" style={{ width: 160 }}>{now}</div>
                        <div className="td">{[pdfNone, pdfConstraint].filter(Boolean).join(', ') || '-'}</div>
                        <div className="td" style={{ width: 120 }}>
                          <span className={pass ? 'result-pass' : 'result-fail'}>{pass ? '◯ 合格' : '✕ 不合格'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div style={{ marginTop: 12 }}>
                <button className="menu-item" onClick={() => alert('ダミー: 結果を出力')}>結果を出力</button>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-nav">
          <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => setCurrent((s) => Math.max(0, s - 1))} disabled={current === 0}>戻る</button>
          {current < steps.length - 1 ? (
            <button className="menu-item" onClick={() => canNext() && setCurrent((s) => Math.min(steps.length - 1, s + 1))} disabled={!canNext()}>次へ</button>
          ) : (
            <button className="menu-item" onClick={() => alert('ダミー: 検査完了')}>完了</button>
          )}
        </div>
      </div>
    </div>
  );
}


