import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultDetail() {
  const navigate = useNavigate();
  const [checkOpen, setCheckOpen] = useState<boolean[]>([false, false, false, false, false]);
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/group')}>一覧に戻る</button>
      </div>
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
  );
}


