// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request } from "../src/js/api.js";
import { getToken } from "../src/js/auth.js";

const KEY = "medibook-staff-token";
const reply = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => sessionStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("request authorization", () => {
  it("sends the staff token when logged in", async () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ token: "tok", expiresAt: Date.now() + 60000 }),
    );
    const fetchMock = vi.fn().mockResolvedValue(reply(200, []));
    vi.stubGlobal("fetch", fetchMock);
    await request("/appointments");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("sends no Authorization header when logged out", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, []));
    vi.stubGlobal("fetch", fetchMock);
    await request("/doctors");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("puts the status code on the error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(401)));
    const error = await request("/appointments").catch((e) => e);
    expect(error.status).toBe(401);
  });

  it("ends the session when the server rejects a saved token", async () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ token: "old", expiresAt: Date.now() + 60000 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(401)));
    await expect(request("/appointments")).rejects.toThrow(
      "Request failed (401)",
    );
    expect(getToken()).toBe("");
  });
});
