import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResultDetail() {
  const navigate = useNavigate();
  const [showNgDetail, setShowNgDetail] = useState<boolean>(false);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/group')}>一覧に戻る</button>
      </div>

      {showNgDetail ? (
        <>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
          <div className="card" style={{ padding: 0 }}>
            <img src={'/demo_pics/screen1.png'} alt="プレビュー" style={{ width: '100%', maxWidth: 640, height: 'auto', display: 'block' }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="menu-item" onClick={() => setShowNgDetail(true)}>NG箇所を表示</button>
          </div>
        </>
      )}
    </div>
  );
}


