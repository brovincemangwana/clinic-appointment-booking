import crypto from "node:crypto";
import jsonServer from "json-server";
import {
  signToken,
  verifyToken,
  checkPassword,
  requiresAdmin,
  createLimiter,
} from "./server/auth.js";

const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = crypto.randomBytes(32);
const limiter = createLimiter();

if (!PASSWORD) {
  console.warn("ADMIN_PASSWORD is not set, so staff login is disabled.");
}

const server = jsonServer.create();
const router = jsonServer.router("db.json");

server.set("trust proxy", 1);
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

server.post("/login", (req, res) => {
  const key = req.ip;
  if (limiter.blocked(key)) {
    return res
      .status(429)
      .json({ error: "Too many attempts. Try again later." });
  }
  if (!checkPassword(req.body && req.body.password, PASSWORD)) {
    limiter.fail(key);
    return res.status(401).json({ error: "Incorrect password." });
  }
  limiter.reset(key);
  return res.json(signToken(SECRET));
});

server.use((req, res, next) => {
  const check = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body || {},
  };
  if (!requiresAdmin(check)) return next();

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (verifyToken(SECRET, token)) return next();
  return res.status(401).json({ error: "Staff login required." });
});

server.use(router);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MediBook API running on port ${PORT}`);
});
