import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // Custom Local Dev API Mock Server to allow running CMS locally without Vercel CLI
      {
        name: 'local-api-mock',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            
            // 1. Mock Login Endpoint
            if (url.startsWith('/api/login') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { password } = JSON.parse(body);
                  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
                  if (password === adminPassword) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, token: password }));
                  } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid password' }));
                  }
                } catch (e) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Bad Request' }));
                }
              });
              return;
            }

            // 2. Mock Save Content Endpoint
            if (url.startsWith('/api/save-content') && req.method === 'POST') {
              const authHeader = req.headers.authorization;
              const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
              if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
              }

              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { content } = JSON.parse(body);
                  const filePath = path.resolve(__dirname, 'public/content-local.json');
                  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, url: '/content-local.json' }));
                } catch (e) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Bad Request' }));
                }
              });
              return;
            }

            // 3. Mock Upload Image Endpoint
            if (url.startsWith('/api/upload-image') && req.method === 'POST') {
              const authHeader = req.headers.authorization;
              const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
              if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
              }

              const uploadDir = path.resolve(__dirname, 'public/uploads');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }

              const fileName = req.headers['x-file-name'] || `upload-${Date.now()}.png`;
              const filePath = path.join(uploadDir, fileName);
              const writeStream = fs.createWriteStream(filePath);
              
              req.pipe(writeStream);
              writeStream.on('finish', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: `/uploads/${fileName}` }));
              });
              return;
            }

            // 4. Mock Get Content Endpoint
            if (url.startsWith('/api/get-content')) {
              const filePath = path.resolve(__dirname, 'public/content-local.json');
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'local content not found' }));
              }
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
