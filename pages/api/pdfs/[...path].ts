import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseDir = path.join(process.cwd(), 'server_pdfs');
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean) as string[];
    const rel = decodeURIComponent(parts.join('/')).replace(/^\/+/, '');
    const filePath = path.join(baseDir, rel);
    if (!filePath.startsWith(baseDir)) {
      res.status(403).end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.status(404).end('Not Found');
      return;
    }
    const stats = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).end('Server Error');
  }
}


