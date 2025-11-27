import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean) as string[];
    const filePath = decodeURIComponent(parts.join('/'));
    const demoDir = path.join(process.cwd(), 'data', 'demo');
    const fullPath = path.join(demoDir, filePath);
    
    // Security check: ensure the path is within demoDir
    if (!fullPath.startsWith(demoDir)) {
      return res.status(403).end('Forbidden');
    }
    
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return res.status(404).end('Not Found');
    }
    
    const ext = path.extname(fullPath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    
    fs.createReadStream(fullPath).pipe(res);
  } catch (e) {
    console.error('Demo PDF API error:', e);
    res.status(500).end('Server Error');
  }
}


