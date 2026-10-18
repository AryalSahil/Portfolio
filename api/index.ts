import type { Request, Response } from 'express';
import app from '../server.ts';

export default function handler(req: Request, res: Response) {
  // Ensure the request path has /api prefix for Express route matching in Vercel serverless environment
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}

export { app };
