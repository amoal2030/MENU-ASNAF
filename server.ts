import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const distPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');

// Serve static assets from dist if build exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Serve public directory
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Fallback to index.html for client routes
app.get('*', (_req: Request, res: Response) => {
  const indexInDist = path.resolve(distPath, 'index.html');
  const indexInRoot = path.resolve(__dirname, 'index.html');
  if (fs.existsSync(indexInDist)) {
    res.sendFile(indexInDist);
  } else {
    res.sendFile(indexInRoot);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
