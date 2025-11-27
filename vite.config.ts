import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pdf-list-plugin',
      configureServer(server) {
        const baseDir = path.join(process.cwd(), 'server_pdfs');
        const outputsDir = path.join(process.cwd(), 'data', 'output');
        const webDesignDir = path.join(process.cwd(), 'data', 'webDesign');

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

        // Serve images from data/output as /outputs/*
        server.middlewares.use('/outputs', (req, res, next) => {
          try {
            const reqPath = decodeURIComponent(req.url || '/').replace(/^\/+/, '');
            const filePath = path.join(outputsDir, reqPath);
            if (!filePath.startsWith(outputsDir)) {
              res.statusCode = 403;
              return res.end('Forbidden');
            }
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              res.statusCode = 404;
              return res.end('Not Found');
            }
            const ext = path.extname(filePath).toLowerCase();
            const ct =
              ext === '.png' ? 'image/png' :
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
              ext === '.webp' ? 'image/webp' :
              'application/octet-stream';
            res.setHeader('Content-Type', ct);
            fs.createReadStream(filePath).pipe(res);
          } catch (e) {
            res.statusCode = 500;
            res.end('Server Error');
          }
        });

        // Serve images/assets from data/webDesign as /webDesign/*
        server.middlewares.use('/webDesign', (req, res, next) => {
          try {
            const reqPath = decodeURIComponent(req.url || '/').replace(/^\/+/, '');
            const filePath = path.join(webDesignDir, reqPath);
            if (!filePath.startsWith(webDesignDir)) {
              res.statusCode = 403;
              return res.end('Forbidden');
            }
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              res.statusCode = 404;
              return res.end('Not Found');
            }
            const ext = path.extname(filePath).toLowerCase();
            const ct =
              ext === '.png' ? 'image/png' :
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
              ext === '.gif' ? 'image/gif' :
              ext === '.webp' ? 'image/webp' :
              'application/octet-stream';
            res.setHeader('Content-Type', ct);
            fs.createReadStream(filePath).pipe(res);
          } catch (e) {
            res.statusCode = 500;
            res.end('Server Error');
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

        // Marks listing from data/mark/<category> (*.pdf)
        server.middlewares.use('/api/marks', (req, res, next) => {
          try {
            const url = new URL(req.url || '', 'http://localhost');
            const category = url.searchParams.get('category') || '';
            const safeCategory = category.replace(/[\\.\\/]/g, '');
            const marksDir = path.join(process.cwd(), 'data', 'mark', safeCategory);
            if (!safeCategory || !fs.existsSync(marksDir)) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ files: [] }));
            }
            const files = fs
              .readdirSync(marksDir)
              .filter((f) => {
                const full = path.join(marksDir, f);
                return fs.statSync(full).isFile() && f.toLowerCase().endsWith('.pdf');
              })
              .map((name) => ({ name, url: `/marks/${encodeURIComponent(safeCategory)}/${encodeURIComponent(name)}` }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ files }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to list marks' }));
          }
        });

        // Stream individual mark pdfs
        server.middlewares.use('/marks', (req, res, next) => {
          try {
            const reqPath = decodeURIComponent(req.url || '/');
            const cleanPath = reqPath.replace(/^\/+/, ''); // drop leading slashes
            const parts = cleanPath.split('/'); // [category, ...fileParts]
            const category = parts[0] || '';
            const file = parts.slice(1).join('/');
            const safeCategory = category.replace(/[\.\/]/g, '');
            const base = path.join(process.cwd(), 'data', 'mark', safeCategory);
            const filePath = path.join(base, file);
            if (!filePath.startsWith(base)) {
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

        // Mouts listing from data/mount/<company> (*.pdf)
        server.middlewares.use('/api/mouts', (req, res, next) => {
          try {
            const url = new URL(req.url || '', 'http://localhost');
            const company = url.searchParams.get('company') || '';
            const safeCompany = company.replace(/[\.\/]/g, '');
            const moutsDir = path.join(process.cwd(), 'data', 'mount', safeCompany);
            if (!safeCompany || !fs.existsSync(moutsDir)) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ files: [] }));
            }
            const files = fs
              .readdirSync(moutsDir)
              .filter((f) => {
                const full = path.join(moutsDir, f);
                return fs.statSync(full).isFile() && f.toLowerCase().endsWith('.pdf');
              })
              .map((name) => ({ name, url: `/mouts/${encodeURIComponent(safeCompany)}/${encodeURIComponent(name)}` }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ files }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to list mouts' }));
          }
        });

        // Stream individual mount pdfs
        server.middlewares.use('/mouts', (req, res, next) => {
          try {
            const reqPath = decodeURIComponent(req.url || '/');
            const cleanPath = reqPath.replace(/^\/+/, '');
            const parts = cleanPath.split('/'); // [company, ...fileParts]
            const company = parts[0] || '';
            const file = parts.slice(1).join('/');
            const safeCompany = company.replace(/[\.\/]/g, '');
            const base = path.join(process.cwd(), 'data', 'mount', safeCompany);
            const filePath = path.join(base, file);
            if (!filePath.startsWith(base)) {
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

        // List available mount companies (directories under data/mount)
        server.middlewares.use('/api/mout-companies', (req, res, next) => {
          try {
            const base = path.join(process.cwd(), 'data', 'mount');
            if (!fs.existsSync(base)) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ companies: [] }));
            }
            const dirs = fs.readdirSync(base).filter((d) => {
              const full = path.join(base, d);
              return fs.existsSync(full) && fs.statSync(full).isDirectory();
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ companies: dirs }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to list mout companies' }));
          }
        });

        // Serve demo PDFs from data/demo/*
        server.middlewares.use('/data/demo', (req, res, next) => {
          try {
            // req.url will be like '/KORE1_NG/design.pdf' when request is '/data/demo/KORE1_NG/design.pdf'
            const reqPath = decodeURIComponent(req.url || '/');
            // Remove leading slash
            const cleanPath = reqPath.replace(/^\/+/, '');
            const demoDir = path.join(process.cwd(), 'data', 'demo');
            const filePath = path.join(demoDir, cleanPath);
            console.log('Demo PDF request:', { reqUrl: req.url, cleanPath, filePath, exists: fs.existsSync(filePath) });
            if (!filePath.startsWith(demoDir)) {
              res.statusCode = 403;
              return res.end('Forbidden');
            }
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
              console.error('File not found:', filePath);
              res.statusCode = 404;
              return res.end('Not Found');
            }
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.pdf') {
              res.setHeader('Content-Type', 'application/pdf');
            } else {
              res.setHeader('Content-Type', 'application/octet-stream');
            }
            fs.createReadStream(filePath).pipe(res);
          } catch (e) {
            console.error('Demo PDF server error:', e);
            res.statusCode = 500;
            res.end('Server Error');
          }
        });
      },
    },
  ],
});


