import React, { useEffect, useRef, useState } from 'react';

type Props = {
  height?: number; // canvas display height
  onColorSelected?: (hex: string) => void;
  imageSrc?: string; // 既存の登録画像のURL（ある場合はアップローダ非表示）
  showUploader?: boolean; // 明示的にアップローダ表示を切り替え（デフォルト: true、imageSrc指定時はfalse同等）
};

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export default function ImageColorPicker({ height = 240, onColorSelected, imageSrc, showUploader = true }: Props) {
  const [src, setSrc] = useState<string | null>(imageSrc || null);
  const [hex, setHex] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (imageSrc) setSrc(imageSrc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = img.width / img.height;
    const displayH = height;
    const displayW = Math.round(displayH * ratio);
    canvas.width = displayW;
    canvas.height = displayH;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, displayW, displayH);
  };

  const handleClick: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(x, y, 1, 1).data;
    const picked = toHex(data[0], data[1], data[2]);
    setHex(picked);
    onColorSelected?.(picked);
  };

  return (
    <div className="color-picker">
      { (showUploader && !imageSrc) && (
        <div className="form-row">
          <label className="form-label" htmlFor="imgUpload">プレビュー画像（色抽出用）</label>
          <input id="imgUpload" type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) { setSrc(null); return; }
            const url = URL.createObjectURL(f);
            setSrc(url);
          }} />
        </div>
      )}
      <div className="color-picker-canvas">
        {src ? (
          <canvas ref={canvasRef} style={{ borderRadius: 12, border: '1px solid var(--border)', cursor: 'crosshair' }} height={height} onClick={handleClick} />
        ) : (
          <div className="form-hint">台紙画像が未登録のため、色抽出はできません。</div>
        )}
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <label className="form-label">選択色</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="swatch" style={{ background: hex || '#ffffff' }} />
          <div style={{ minWidth: 80 }}>{hex || '-'}</div>
        </div>
      </div>
    </div>
  );
}


