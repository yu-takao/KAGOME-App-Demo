import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const category = url.searchParams.get('category') || '';
    const safeCategory = category.replace(/[\\.\\/]/g, '');
    const marksDir = path.join(process.cwd(), 'data', 'mark', safeCategory);
    if (!safeCategory || !fs.existsSync(marksDir)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify({ files: [] }));
    }
    const files = fs
      .readdirSync(marksDir)
      .filter((f) => {
        const full = path.join(marksDir, f);
        return fs.statSync(full).isFile() && f.toLowerCase().endsWith('.pdf');
      })
      .map((name) => ({ name, url: `/marks/${encodeURIComponent(safeCategory)}/${encodeURIComponent(name)}` }));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ files }));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Failed to list marks' }));
  }
}


