import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

type Props = {
  src: string; // URL path served by Vite middleware
  maxWidth?: number; // px
  maxHeight?: number; // px
};

export default function PdfPreview({ src, maxWidth = 220, maxHeight = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let destroyed = false;
    (async () => {
      try {
        const loadingTask = (pdfjsLib as any).getDocument(src);
        const pdf = await loadingTask.promise;
        if (destroyed) return;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        // Fit to bounds while keeping aspect ratio
        const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const w = Math.round(scaledViewport.width);
        const h = Math.round(scaledViewport.height);
        canvas.width = w;
        canvas.height = h;
        setDim({ w, h });
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
      } catch (e) {
        // noop for mock
      }
    })();
    return () => { destroyed = true; };
  }, [src, maxWidth, maxHeight]);

  const displayW = dim?.w ?? maxWidth;
  const displayH = dim?.h ?? maxHeight;

  return (
    <div style={{ width: displayW, height: displayH }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', border: '1px solid var(--border)', borderRadius: 12, display: 'block' }} />
    </div>
  );
}


