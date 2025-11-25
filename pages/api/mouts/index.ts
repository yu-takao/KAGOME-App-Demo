import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const company = url.searchParams.get('company') || '';
    const safeCompany = company.replace(/[\.\/]/g, '');
    const moutsDir = path.join(process.cwd(), 'data', 'mount', safeCompany);
    if (!safeCompany || !fs.existsSync(moutsDir)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify({ files: [] }));
    }
    const files = fs
      .readdirSync(moutsDir)
      .filter((f) => {
        const full = path.join(moutsDir, f);
        return fs.statSync(full).isFile() && f.toLowerCase().endsWith('.pdf');
      })
      .map((name) => ({ name, url: `/mouts/${encodeURIComponent(safeCompany)}/${encodeURIComponent(name)}` }));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ files }));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Failed to list mouts' }));
  }
}


