import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MYQURAN_BASE_URL = 'https://api.myquran.com/v3';
const DEFAULT_ERROR_MESSAGE = "Gagal mengambil data Al-Qur'an. Silakan coba lagi.";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const fetchHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MurottalSyncStudio/1.0',
  };

  /**
   * GET /api/quran/surahs
   * Proxies https://api.myquran.com/v3/quran
   */
  app.get('/api/quran/surahs', async (_req: Request, res: Response) => {
    try {
      const response = await fetch(`${MYQURAN_BASE_URL}/quran`, { headers: fetchHeaders });
      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      if (!data || data.status === false || !Array.isArray(data.data) || data.data.length === 0) {
        return res.status(404).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      return res.json(data);
    } catch (err) {
      console.error('API Error /api/quran/surahs:', err);
      return res.status(500).json({
        status: false,
        message: DEFAULT_ERROR_MESSAGE,
      });
    }
  });

  /**
   * GET /api/quran/surah/:surah
   * Proxies https://api.myquran.com/v3/quran/:surah
   */
  app.get('/api/quran/surah/:surah', async (req: Request, res: Response) => {
    const { surah } = req.params;
    try {
      const response = await fetch(`${MYQURAN_BASE_URL}/quran/${surah}`, { headers: fetchHeaders });
      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      if (!data || data.status === false || !data.data) {
        return res.status(404).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      return res.json(data);
    } catch (err) {
      console.error(`API Error /api/quran/surah/${surah}:`, err);
      return res.status(500).json({
        status: false,
        message: DEFAULT_ERROR_MESSAGE,
      });
    }
  });

  /**
   * GET /api/quran/ayah/:surah/:ayah
   * Proxies https://api.myquran.com/v3/quran/:surah/:ayah
   */
  app.get('/api/quran/ayah/:surah/:ayah', async (req: Request, res: Response) => {
    const { surah, ayah } = req.params;
    try {
      const response = await fetch(`${MYQURAN_BASE_URL}/quran/${surah}/${ayah}`, { headers: fetchHeaders });
      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      if (!data || data.status === false || !data.data) {
        return res.status(404).json({
          status: false,
          message: DEFAULT_ERROR_MESSAGE,
        });
      }

      return res.json(data);
    } catch (err) {
      console.error(`API Error /api/quran/ayah/${surah}/${ayah}:`, err);
      return res.status(500).json({
        status: false,
        message: DEFAULT_ERROR_MESSAGE,
      });
    }
  });

  // Setup Vite middlewares for SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Murottal Sync Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
