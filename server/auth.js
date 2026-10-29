import crypto from 'node:crypto';

const TWO_HOURS = 2 * 60 * 60 * 1000;

export function signToken(secret, now = Date.now(), ttlMs = TWO_HOURS) {
  const expiresAt = now + ttlMs;
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return { token: `${payload}.${signature}`, expiresAt };
}

export function verifyToken(secret, token, now = Date.now()) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
}

export function checkPassword(given, expected) {
  if (!expected || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

const isRead = (method) => method === 'GET' || method === 'HEAD';
const present = (value) => typeof value === 'string' && value.length > 0;

export function requiresAdmin({ method, path, query = {}, body = {} }) {
  const m = String(method).toUpperCase();
  if (m === 'OPTIONS' || path === '/login') return false;
  if ('_embed' in query) return true;

  if (path === '/doctors' || path.startsWith('/doctors/')) return !isRead(m);

  if (path === '/appointments') {
    if (isRead(m)) return !(present(query.phone) || present(query.doctorId));
    if (m === 'POST') return body.status !== 'Booked';
    return true;
  }

  if (/^\/appointments\/[^/]+$/.test(path)) {
    if (m === 'PUT') return body.status !== 'Booked';
    if (m === 'PATCH') {
      const keys = Object.keys(body);
      return !(keys.length === 1 && keys[0] === 'status' && body.status === 'Cancelled');
    }
    return true;
  }

  return true;
}

export function createLimiter({ max = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const hits = new Map();
  const recent = (key, now) => (hits.get(key) || []).filter((time) => now - time < windowMs);
  return {
    blocked: (key, now = Date.now()) => recent(key, now).length >= max,
    fail(key, now = Date.now()) {
      hits.set(key, [...recent(key, now), now]);
    },
    reset(key) {
      hits.delete(key);
    },
  };
}