// routes.ts
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

function asyncHandler(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err) => {
      console.error(`API Error [${req.method} ${req.path}]:`, err);

      // Distinguish Supabase/network errors from generic ones
      if (err?.code === 'PGRST116') {
        return res.status(404).json({ error: 'Resource not found' });
      }
      if (err?.name === 'AbortError' || err?.message?.includes('timeout')) {
        return res.status(503).json({ error: 'Service temporarily unavailable. Please retry.' });
      }

      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

export async function registerRoutes(app: Express): Promise<Server> {

  // --- Health Check (use this on mobile to verify connectivity) ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Shop Routes ---
  app.get('/api/shop/items', asyncHandler(async (_req, res) => {
    const items = await storage.getShopItems();
    res.json({ data: items, count: items.length });
  }));

  // --- Arena Routes ---
  app.get('/api/arena/matches/:userId', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const matches = await storage.getArenaMatches(userId as string);
    res.json({ data: matches });
  }));

  app.post('/api/arena/match', asyncHandler(async (req, res) => {
    const { player1_id, player2_id } = req.body;
    if (!player1_id || !player2_id) {
      return res.status(400).json({ error: 'Both player IDs are required' });
    }

    const match = await storage.createArenaMatch(player1_id, player2_id);
    res.status(201).json({ data: match });
  }));

  // --- User Routes ---
  app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const user = await storage.getUser(req.params.id as string);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  }));

  app.post('/api/users', asyncHandler(async (req, res) => {
    const user = await storage.createUser(req.body);
    res.status(201).json({ data: user });
  }));

  const httpServer = createServer(app);
  return httpServer;
}