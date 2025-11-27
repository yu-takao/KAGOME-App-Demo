import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults } from '../data/results';

export default function Group() {
  const navigate = useNavigate();
  const results = getResults();
  const [sort, setSort] = useState<{ key: 'id' | 'at' | 'packageName' | 'executor'; dir: 'asc' | 'desc' }>({ key: 'at', dir: 'desc' });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [collapsingIds, setCollapsingIds] = useState<Set<string>>(new Set());
  const toggleSort = (key: 'id' | 'at' | 'packageName' | 'executor') => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };
  const toggleExpand = (id: string) => {
    if (expandedIds.has(id)) {
      // 閉じるアニメーション開始
      setCollapsingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setCollapsingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300); // アニメーション時間と合わせる
    } else {
      // 展開
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };
  const formatAt = (at: string) => {
    // 期待フォーマット: 'YYYY-MM-DD HH:mm' -> 'YYYY年M月D日 HH:mm'
    const m = at.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})$/);
    if (m) {
      const y = m[1];
      const mo = String(parseInt(m[2], 10));
      const d = String(parseInt(m[3], 10));
      const hm = m[4];
      return `${y}年${mo}月${d}日 ${hm}`;
    }
    return at;
  };
  const toTime = (at: string): number => {
    // 'YYYY-MM-DD HH:mm' -> 'YYYY-MM-DDTHH:mm:00'
    const iso = at.replace(' ', 'T') + ':00';
    const t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  };
  const sorted = useMemo(() => {
    const arr = [...results];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'id') {
        cmp = a.id.localeCompare(b.id, 'ja');
      } else if (sort.key === 'at') {
        cmp = toTime(a.at) - toTime(b.at);
      } else if (sort.key === 'packageName') {
        cmp = a.packageName.localeCompare(b.packageName, 'ja');
      } else if (sort.key === 'executor') {
        cmp = (a.executor || '').localeCompare(b.executor || '', 'ja');
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [results, sort]);
  
  // IDごとにグループ化
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    sorted.forEach(r => {
      const existing = map.get(r.id) || [];
      map.set(r.id, [...existing, r]);
    });
    return map;
  }, [sorted]);
  
  // 表示用のリスト（各IDの最初の1つ + 展開された場合は残りも）
  const displayList = useMemo(() => {
    const seenIds = new Set<string>();
    const list: Array<{ record: typeof results[0]; isExpanded: boolean; isCollapsing: boolean; relatedRecords: typeof results }> = [];
    sorted.forEach(r => {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id);
        const records = grouped.get(r.id) || [];
        const [first, ...rest] = records;
        const isExpanded = expandedIds.has(r.id);
        const isCollapsing = collapsingIds.has(r.id);
        list.push({
          record: first,
          isExpanded,
          isCollapsing,
          relatedRecords: (isExpanded || isCollapsing) ? rest : [],
        });
      }
    });
    return list;
  }, [sorted, grouped, expandedIds, collapsingIds]);
  return (
    <div className="group-container">
      <div className="card scrollable">
        <div className="form-hint" style={{ marginBottom: 8 }}>項目名をクリックするとソートできます。</div>
        <div className="table results">
          <div className="thead">
            <div className="tr" style={{ gridTemplateColumns: '120px 200px 1fr 140px 120px 120px' }}>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('id')}>
                <span>ID</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'id' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'id' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('at')}>
                <span>日時</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'at' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'at' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('packageName')}>
                <span>パッケージ名</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'packageName' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'packageName' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('executor')}>
                <span>実行ユーザー</span>
                <span aria-hidden="true" style={{ color: 'var(--muted)', display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 10 }}>
                  <span style={{ opacity: sort.key === 'executor' && sort.dir === 'asc' ? 1 : 0.5 }}>▲</span>
                  <span style={{ opacity: sort.key === 'executor' && sort.dir === 'desc' ? 1 : 0.5 }}>▼</span>
                </span>
              </div>
              <div className="th">合否</div>
              <div className="th" aria-hidden="true"></div>
            </div>
          </div>
          <div className="tbody">
            {displayList.map(({ record, isExpanded, isCollapsing, relatedRecords }) => {
              const hasRelated = relatedRecords.length > 0 || grouped.get(record.id)!.length > 1;
              return (
                <React.Fragment key={`${record.id}-${record.at}`}>
                  <div className="tr" style={{ gridTemplateColumns: '120px 200px 1fr 140px 120px 120px' }}>
                    <div className="td" style={{ cursor: hasRelated ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => hasRelated && toggleExpand(record.id)}>
                      {hasRelated && (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{isExpanded ? '▼' : '▶'}</span>
                      )}
                      <span>{record.id}</span>
                    </div>
                    <div className="td">{formatAt(record.at)}</div>
                    <div className="td">{record.packageName}</div>
                    <div className="td">{record.executor || '—'}</div>
                    <div className="td">
                      {record.pass ? (
                        <span className="status-badge status-pass" aria-label="合格">合格</span>
                      ) : (
                        <span className="status-badge status-fail" aria-label="不合格">不合格</span>
                      )}
                    </div>
                    <div className="td">
                      <button
                        className="menu-item btn-small"
                        style={{ background: 'transparent', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => navigate(`/group/${record.id}?at=${encodeURIComponent(record.at)}`)}
                        aria-label={`${record.id} の詳細`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#4b5563"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {(isExpanded || isCollapsing) && relatedRecords.map((r, idx) => (
                    <div className={`tr expand-row ${isCollapsing ? 'collapse-row' : ''}`} key={`${r.id}-${r.at}`} style={{ gridTemplateColumns: '120px 200px 1fr 140px 120px 120px', background: '#f9fafb', animationDelay: `${idx * 0.05}s` }}>
                      <div className="td" style={{ paddingLeft: 24 }}></div>
                      <div className="td">{formatAt(r.at)}</div>
                      <div className="td"></div>
                      <div className="td">{r.executor || '—'}</div>
                      <div className="td">
                        <span className="status-badge status-fail" aria-label="不合格">不合格</span>
                      </div>
                      <div className="td">
                        <button
                          className="menu-item btn-small"
                          style={{ background: 'transparent', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => navigate(`/group/${r.id}?at=${encodeURIComponent(r.at)}`)}
                          aria-label={`${r.id} の詳細`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#4b5563"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


