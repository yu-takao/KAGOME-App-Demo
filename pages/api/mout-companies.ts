import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const base = path.join(process.cwd(), 'data', 'mount');
    if (!fs.existsSync(base)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).end(JSON.stringify({ companies: [] }));
    }
    const dirs = fs.readdirSync(base).filter((d) => {
      const full = path.join(base, d);
      return fs.existsSync(full) && fs.statSync(full).isDirectory();
    });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify({ companies: dirs }));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: 'Failed to list mout companies' }));
  }
}


