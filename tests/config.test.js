import { describe, it, expect, vi, afterEach } from 'vitest';

async function loadConfig(hostname) {
  vi.resetModules();
  vi.stubGlobal('location', hostname ? { hostname } : undefined);
  return import('../src/js/config.js');
}

afterEach(() => vi.unstubAllGlobals());

describe('API_URL', () => {
  it('uses the local API on localhost', async () => {
    const { API_URL } = await loadConfig('localhost');
    expect(API_URL).toBe('http://localhost:3000');
  });

  it('uses the local API on 127.0.0.1', async () => {
    const { API_URL } = await loadConfig('127.0.0.1');
    expect(API_URL).toBe('http://localhost:3000');
  });

  it('uses the deployed API on any other host', async () => {
    const { API_URL } = await loadConfig('brovincemangwana.github.io');
    expect(API_URL).toBe('https://clinic-appointment-booking-6pr4.onrender.com');
  });

  it('uses the deployed API when there is no browser location', async () => {
    const { API_URL } = await loadConfig(null);
    expect(API_URL).toBe('https://clinic-appointment-booking-6pr4.onrender.com');
  });
});