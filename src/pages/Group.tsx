import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults } from '../data/results';

export default function Group() {
  const navigate = useNavigate();
  const results = getResults();
  return (
    <>
      <div className="card">
        <div className="table results">
          <div className="thead">
            <div className="tr">
              <div className="th" style={{ width: 160 }}>日時</div>
              <div className="th">パッケージ名</div>
              <div className="th" style={{ width: 120 }}>合否</div>
              <div className="th" style={{ width: 120 }}>検査実行者</div>
            </div>
          </div>
          <div className="tbody">
            {results.map(r => (
              <div className="tr clickable" key={r.id} onClick={() => navigate(`/group/${r.id}`)}>
                <div className="td" style={{ width: 160 }}>{r.at}</div>
                <div className="td">{r.packageName}</div>
                <div className="td" style={{ width: 120 }}>
                  {r.pass ? (
                    <span className="result-pass" aria-label="合格">◯ 合格</span>
                  ) : (
                    <span className="result-fail" aria-label="不合格">✕ 不合格</span>
                  )}
                </div>
                <div className="td" style={{ width: 120 }}>{r.executor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


