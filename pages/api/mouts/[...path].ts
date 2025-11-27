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
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean) as string[];
    const company = decodeURIComponent(parts[0] || '');
    const file = decodeURIComponent(parts.slice(1).join('/'));
    const safeCompany = company.replace(/[\.\/]/g, '');
    const base = path.join(process.cwd(), 'data', 'mount', safeCompany);
    const filePath = path.join(base, file);
    if (!filePath.startsWith(base)) return res.status(403).end('Forbidden');
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return res.status(404).end('Not Found');
    const stats = fs.statSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).end('Server Error');
  }
}


