import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageColorPicker from '../../components/ImageColorPicker';

export default function BasePaperForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState<'frame' | 'fill' | ''>('');
  const [color, setColor] = useState<string>('');
  const placeholderPreview = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='480' height='300'>
        <defs>
          <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
            <stop offset='0%' stop-color='#f7f9fc'/>
            <stop offset='100%' stop-color='#e8eef5'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)'/>
        <rect x='24' y='24' width='432' height='252' fill='none' stroke='#d1d9e6' stroke-width='2' stroke-dasharray='6 6'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#5b6b7f' font-family='sans-serif' font-size='16'>台紙プレビュー（ダミー）</text>
      </svg>
    `);
    return `data:image/svg+xml;utf8,${svg}`;
  }, []);

  return (
    <div>
      <div className="card">
        <div className="form-row">
          <label className="form-label" htmlFor="bpName">台紙名</label>
          <input id="bpName" className="form-input" placeholder="台紙名を入力" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-row">
          <label className="form-label">台紙画像登録</label>
          <div className="file-input">
            <input id="bpPdf" type="file" accept="application/pdf" onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f ? f.name : '');
            }} />
            <div className="form-hint">PDFファイルを選択してください{fileName ? `（${fileName}）` : ''}。</div>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">タイプ選択</label>
          <div className="radio-group">
            <label className="radio">
              <input type="radio" name="bpType" checked={type==='frame'} onChange={() => setType('frame')} />
              <span>枠線</span>
            </label>
            <label className="radio">
              <input type="radio" name="bpType" checked={type==='fill'} onChange={() => setType('fill')} />
              <span>領域塗りつぶし</span>
            </label>
          </div>
        </div>

        <div className="form-row" style={{ alignItems: 'start' }}>
          <label className="form-label">台紙色選択</label>
          <div style={{ width: '100%' }}>
            <ImageColorPicker onColorSelected={setColor} imageSrc={placeholderPreview} showUploader={false} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="menu-item" onClick={() => alert('ダミー保存')}>保存</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => { setName(''); setFileName(''); setType(''); setColor(''); }}>クリア</button>
        <button className="menu-item" style={{ background: '#fff', color: 'var(--text)', borderColor: 'var(--border)' }} onClick={() => navigate('/settings/base')}>一覧に戻る</button>
      </div>
    </div>
  );
}


