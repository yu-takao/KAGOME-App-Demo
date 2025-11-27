import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultDetail() {
  const navigate = useNavigate();
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

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
  return (
    <div>
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <div className="card" style={{ padding: 12, position: 'sticky', top: 8, border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <div className="card" style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: '#fff', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>製品パッケージ名</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>野菜一日これ一本 200ml</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>検査日</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>2024年12月15日</div>
                </div>
              </div>
            </div>
            <div className="toolbar-title" style={{ marginBottom: 8, fontSize: '13px', textAlign: 'center' }}>NG箇所</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="card" style={{ padding: 10, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 10 }}>1</div>
                  </div>
                  <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/api/outputs/ng/mark1.png')}>
                    <img
                      src="/api/outputs/ng/mark1.png"
                      alt="NG1"
                      style={{ width: 100, height: 64, objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>紙リサイクルマーク</div>
                    <div style={{ lineHeight: 1.5, color: 'var(--muted)', fontSize: '13px' }}>形状に異常があります。</div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 10, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', background: '#fee2e2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 112px 1fr', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 999, background: '#dc2626', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 10 }}>2</div>
                  </div>
                  <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/api/outputs/ng/text1.png')}>
                    <img
                      src="/api/outputs/ng/text1.png"
                      alt="NG2"
                      style={{ width: 100, height: 64, objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>一括表示</div>
                    <div style={{ lineHeight: 1.5, color: 'var(--muted)', fontSize: '13px' }}>フォントサイズが8pt未満です。</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div style={{ display: 'grid', placeItems: 'center', cursor: 'pointer' }} onClick={() => setEnlargedImage('/api/outputs/mark_text_NG_highlight1.png')}>
          <img
            src="/api/outputs/mark_text_NG_highlight1.png"
            alt="結果表示"
              style={{ width: '100%', maxWidth: 476, maxHeight: 286, height: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>
        </div>
        <div className="card" style={{ padding: 12, marginTop: -20 }}>
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
      <div className="wizard-nav data-input-nav" style={{ 
        display: 'flex', 
        gap: 12, 
        justifyContent: 'space-between', 
        marginTop: 24,
        padding: '16px 0',
        borderTop: '1px solid var(--border)'
      }}>
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          一覧へ戻る
        </button>
        <button
          onClick={() => {}}
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
        >エクスポート</button>
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
    </div>
  );
}


