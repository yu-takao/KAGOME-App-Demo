import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseDir = path.join(process.cwd(), 'server_pdfs');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    const files = fs
      .readdirSync(baseDir)
      .filter((f) => {
        const full = path.join(baseDir, f);
        return fs.statSync(full).isFile() && f.toLowerCase().endsWith('.pdf');
      })
      .map((name) => ({ name, url: `/pdfs/${encodeURIComponent(name)}` }));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ files }));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Failed to list PDFs' }));
  }
}


