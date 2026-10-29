import { describe, it, expect } from 'vitest';
import {
  signToken,
  verifyToken,
  checkPassword,
  requiresAdmin,
  createLimiter,
} from '../server/auth.js';

const SECRET = 'test-secret';
const NOW = 1_000_000;

describe('tokens', () => {
  it('accepts a fresh token', () => {
    const { token } = signToken(SECRET, NOW);
    expect(verifyToken(SECRET, token, NOW + 1000)).toBe(true);
  });

  it('reports when the token expires', () => {
    expect(signToken(SECRET, NOW, 5000).expiresAt).toBe(NOW + 5000);
  });

  it('rejects an expired token', () => {
    const { token } = signToken(SECRET, NOW, 1000);
    expect(verifyToken(SECRET, token, NOW + 999)).toBe(true);
    expect(verifyToken(SECRET, token, NOW + 1000)).toBe(false);
  });

  it('rejects a token signed with another secret', () => {
    const { token } = signToken('other-secret', NOW);
    expect(verifyToken(SECRET, token, NOW)).toBe(false);
  });

  it('rejects a tampered payload', () => {
    const { token } = signToken(SECRET, NOW, 1000);
    const signature = token.split('.')[1];
    const forged = Buffer.from(JSON.stringify({ exp: NOW + 999_999_999 })).toString('base64url');
    expect(verifyToken(SECRET, `${forged}.${signature}`, NOW)).toBe(false);
  });

  it('rejects malformed values', () => {
    [undefined, null, 42, '', 'abc', 'a.b.c', '.'].forEach((value) => {
      expect(verifyToken(SECRET, value, NOW)).toBe(false);
    });
  });
});

describe('checkPassword', () => {
  it('accepts the right password', () => {
    expect(checkPassword('s3cret', 's3cret')).toBe(true);
  });

  it('rejects a wrong password', () => {
    expect(checkPassword('guess', 's3cret')).toBe(false);
  });

  it('rejects everything when no password is configured', () => {
    expect(checkPassword('anything', undefined)).toBe(false);
    expect(checkPassword('', '')).toBe(false);
  });

  it('rejects a missing or non-text password', () => {
    expect(checkPassword(undefined, 's3cret')).toBe(false);
    expect(checkPassword(123, 's3cret')).toBe(false);
  });
});

describe('requiresAdmin', () => {
  const needs = (method, path, query = {}, body = {}) =>
    requiresAdmin({ method, path, query, body });

  it('lets anyone read doctors', () => {
    expect(needs('GET', '/doctors')).toBe(false);
    expect(needs('GET', '/doctors/3')).toBe(false);
  });

  it('lets patients look up and check availability', () => {
    expect(needs('GET', '/appointments', { phone: '0712345678' })).toBe(false);
    expect(needs('GET', '/appointments', { doctorId: '1', date: '2026-10-27' })).toBe(false);
  });

  it('lets patients book, reschedule and cancel', () => {
    expect(needs('POST', '/appointments', {}, { status: 'Booked' })).toBe(false);
    expect(needs('PUT', '/appointments/5', {}, { status: 'Booked' })).toBe(false);
    expect(needs('PATCH', '/appointments/5', {}, { status: 'Cancelled' })).toBe(false);
  });

  it('lets the login request and preflight requests through', () => {
    expect(needs('POST', '/login')).toBe(false);
    expect(needs('OPTIONS', '/doctors/3')).toBe(false);
  });

  it('protects doctor changes', () => {
    expect(needs('POST', '/doctors')).toBe(true);
    expect(needs('PUT', '/doctors/3')).toBe(true);
    expect(needs('PATCH', '/doctors/3')).toBe(true);
    expect(needs('DELETE', '/doctors/3')).toBe(true);
  });

  it('protects the full appointment list and single records', () => {
    expect(needs('GET', '/appointments')).toBe(true);
    expect(needs('GET', '/appointments', { phone: '' })).toBe(true);
    expect(needs('GET', '/appointments', { q: '0712' })).toBe(true);
    expect(needs('GET', '/appointments', { doctorId: ['1', '2'] })).toBe(true);
    expect(needs('GET', '/appointments/5')).toBe(true);
  });

  it('protects the whole-database routes', () => {
    expect(needs('GET', '/db')).toBe(true);
    expect(needs('GET', '/doctors', { _embed: 'appointments' })).toBe(true);
  });

  it('protects status changes other than a patient cancelling', () => {
    expect(needs('POST', '/appointments', {}, { status: 'Completed' })).toBe(true);
    expect(needs('PUT', '/appointments/5', {}, { status: 'Completed' })).toBe(true);
    expect(needs('PATCH', '/appointments/5', {}, { status: 'Confirmed' })).toBe(true);
    expect(needs('PATCH', '/appointments/5', {}, { status: 'Cancelled', patientName: 'X' })).toBe(true);
  });

  it('protects deleting appointments', () => {
    expect(needs('DELETE', '/appointments/5')).toBe(true);
  });

  it('denies unknown routes', () => {
    expect(needs('GET', '/profile')).toBe(true);
  });
});

describe('createLimiter', () => {
  it('blocks a key after too many failures', () => {
    const limiter = createLimiter({ max: 3, windowMs: 1000 });
    expect(limiter.blocked('a', 0)).toBe(false);
    limiter.fail('a', 0);
    limiter.fail('a', 1);
    limiter.fail('a', 2);
    expect(limiter.blocked('a', 3)).toBe(true);
  });

  it('forgets failures after the window passes', () => {
    const limiter = createLimiter({ max: 2, windowMs: 1000 });
    limiter.fail('a', 0);
    limiter.fail('a', 1);
    expect(limiter.blocked('a', 2000)).toBe(false);
  });

  it('can be reset after a successful login', () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    limiter.fail('a', 0);
    limiter.reset('a');
    expect(limiter.blocked('a', 1)).toBe(false);
  });

  it('tracks each key separately', () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    limiter.fail('a', 0);
    expect(limiter.blocked('b', 1)).toBe(false);
  });
});