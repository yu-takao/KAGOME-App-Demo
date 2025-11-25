import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseDir = path.join(process.cwd(), 'data', 'webDesign');
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean) as string[];
    const rel = decodeURIComponent(parts.join('/')).replace(/^\/+/, '');
    const filePath = path.join(baseDir, rel);
    if (!filePath.startsWith(baseDir)) return res.status(403).end('Forbidden');
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return res.status(404).end('Not Found');
    const ext = path.extname(filePath).toLowerCase();
    const ct = ext === '.png' ? 'image/png' :
      (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' :
      ext === '.gif' ? 'image/gif' :
      ext === '.webp' ? 'image/webp' : 'application/octet-stream';
    res.setHeader('Content-Type', ct);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).end('Server Error');
  }
}


