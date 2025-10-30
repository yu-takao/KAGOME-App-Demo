import React, { useRef, useState } from 'react';

export type Rect = { x: number; y: number; width: number; height: number } | null;

type Props = {
  height?: number; // px
  onChange?: (rect: Rect, meta?: { containerWidth: number; containerHeight: number }) => void;
  imageSrc?: string; // 背景に表示する画像（オプション）
};

export default function RegionSelector({ height = 320, onChange, imageSrc }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<Rect>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const toLocal = (clientX: number, clientY: number) => {
    const el = containerRef.current!;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - r.left), r.width);
    const y = Math.min(Math.max(0, clientY - r.top), r.height);
    return { x, y };
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const p = toLocal(e.clientX, e.clientY);
    setDragStart(p);
    setRect({ x: p.x, y: p.y, width: 0, height: 0 });
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return;
    const el = containerRef.current!;
    const bounds = el.getBoundingClientRect();
    const p = toLocal(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, p.x);
    const y = Math.min(dragStart.y, p.y);
    const width = Math.abs(p.x - dragStart.x);
    const height = Math.abs(p.y - dragStart.y);
    const next = { x, y, width, height };
    setRect(next);
    onChange?.(next, { containerWidth: Math.round(bounds.width), containerHeight: Math.round(bounds.height) });
  };

  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    setDragStart(null);
  };

  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    const el = containerRef.current!;
    const bounds = el.getBoundingClientRect();
    setRect(null);
    onChange?.(null, { containerWidth: Math.round(bounds.width), containerHeight: Math.round(bounds.height) });
  };

  const canvasStyle: React.CSSProperties = imgSize
    ? { aspectRatio: `${imgSize.w}/${imgSize.h}` }
    : { height };

  return (
    <div className="region-card">
      <div
        ref={containerRef}
        className="region-canvas"
        style={canvasStyle}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onDoubleClick={onDoubleClick}
        title=""
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="preview"
            className="region-img"
            onLoad={(e) => {
              const el = e.currentTarget;
              if (el.naturalWidth && el.naturalHeight) {
                setImgSize({ w: el.naturalWidth, h: el.naturalHeight });
              }
            }}
          />
        ) : (
          <div className="region-placeholder">画像プレビュー（ダミー）</div>
        )}
        {rect && (
          <div
            className="region-box"
            style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
          />
        )}
      </div>
      <div className="region-help" style={{ display: 'none' }} />
    </div>
  );
}


