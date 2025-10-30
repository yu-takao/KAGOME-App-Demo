import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pdf-list-plugin',
      configureServer(server) {
        const baseDir = path.join(process.cwd(), 'server_pdfs');

        server.middlewares.use('/api/pdfs', (req, res, next) => {
          try {
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
            res.end(JSON.stringify({ files }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to list PDFs' }));
          }
        });

        server.middlewares.use('/pdfs', (req, res, next) => {
          try {
            const urlPath = decodeURIComponent((req.url || '/').replace(/^\/?/, ''));
            const filePath = path.join(baseDir, urlPath);
            if (!filePath.startsWith(baseDir)) {
              res.statusCode = 403;
              return res.end('Forbidden');
            }
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              res.statusCode = 404;
              return res.end('Not Found');
            }
            res.setHeader('Content-Type', 'application/pdf');
            fs.createReadStream(filePath).pipe(res);
          } catch (e) {
            res.statusCode = 500;
            res.end('Server Error');
          }
        });
      },
    },
  ],
});


