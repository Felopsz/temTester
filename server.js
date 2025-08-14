import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

const {
  PORT = 80,
  NODE_ENV,
  FIREBASE_PROJECT_ID,
  FIREBASE_WEB_API_KEY,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY,
  COOKIE_NAME = "sess",
  COOKIE_SECRET,
  SESSION_TTL_DAYS = "7",
} = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'"],
      },
    },
  })
);
app.disable("x-powered-by");

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser(COOKIE_SECRET));

const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });

function setSessionCookie(res, sessionCookie) {
  const maxAgeMs = Number(SESSION_TTL_DAYS) * 24 * 60 * 60 * 1000;
  res.cookie(COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: maxAgeMs,
    signed: true,
  });
}
function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

async function requireAuth(req, res, next) {
  try {
    const signed = req.signedCookies[COOKIE_NAME];
    if (!signed) return res.status(401).json({ error: "unauthorized" });
    const decoded = await admin.auth().verifySessionCookie(signed, true);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

app.post("/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing_credentials" });

  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!resp.ok) return res.status(401).json({ error: "invalid_credentials" });
  const { idToken } = await resp.json();

  const expiresIn = Number(SESSION_TTL_DAYS) * 24 * 60 * 60 * 1000;
  const sessionCookie = await admin
    .auth()
    .createSessionCookie(idToken, { expiresIn });
  setSessionCookie(res, sessionCookie);
  return res.json({ ok: true });
});

app.post("/auth/logout", requireAuth, (req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

function deepMerge(target, source) {
  if (typeof source !== "object" || source === null) return target;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    if (srcVal && typeof srcVal === "object" && !Array.isArray(srcVal)) {
      target[key] = deepMerge(target[key] || {}, srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

app.get("/api/db", requireAuth, (req, res) => {
  fs.readFile(DB_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read db" });
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

app.patch("/api/db", requireAuth, (req, res) => {
  const patch = req.body || {};
  fs.readFile(DB_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read db" });
    let json = {};
    try {
      json = JSON.parse(data);
    } catch {}
    deepMerge(json, patch);
    fs.writeFile(DB_PATH, JSON.stringify(json, null, 2), "utf8", (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to write db" });
      res.json({ status: "ok" });
    });
  });
});

app.use(
  "/assets",
  express.static(path.join(__dirname, "assets"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  })
);

app.use(
  "/priv-assets",
  requireAuth,
  express.static(path.join(__dirname, "dist_priv"), {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "private, max-age=3600");
    },
  })
);

app.get("/manifest-priv.json", requireAuth, (req, res) => {
  res.json({});
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
