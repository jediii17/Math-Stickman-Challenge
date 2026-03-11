const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchShopItems() {
  // First verify server is reachable
  const health = await fetch(`${BASE_URL}/api/health`).catch(() => null);
  if (!health?.ok) throw new Error('Server unreachable');

  const res = await fetch(`${BASE_URL}/api/shop/items`);
  if (!res.ok) throw new Error(`Shop fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchArenaMatches(userId) {
  const res = await fetch(`${BASE_URL}/api/arena/matches/${userId}`);
  if (!res.ok) throw new Error(`Arena fetch failed: ${res.status}`);
  return res.json();
}
