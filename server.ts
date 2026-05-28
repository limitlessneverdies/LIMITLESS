import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Use JSON request parser
app.use(express.json());

// Dynamic persistent file-based JSON DB setup
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial default schema inside database - pristine, empty of fake profiles
const DEFAULT_DB = {
  users: [
    { name: "Bishowdeep (Admin)", email: "limitlessneverdies369@gmail.com", school: "MET Founder", isAdmin: true }
  ],
  leaderboard: [] as any[],
  mistakes: [] as any[],
  visits: 1, 
  visitors: [] as string[],
  attempts: [] as any[]
};

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
} else {
  // Purge any seeded legacy mock/fake entries from existing local db to maintain pristine, authentic boards!
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    let modified = false;

    if (data.leaderboard && data.leaderboard.length > 0) {
      const initialCount = data.leaderboard.length;
      data.leaderboard = data.leaderboard.filter((item: any) => {
        const isMock = item.id?.startsWith("leader-mock-") || 
                       ["siddharth@gmail.com", "prerna@gmail.com", "samip@live.com"].includes(item.email?.toLowerCase());
        return !isMock;
      });
      if (data.leaderboard.length !== initialCount) {
        modified = true;
      }
    }

    if (data.mistakes && data.mistakes.length > 0) {
      const initialCount = data.mistakes.length;
      data.mistakes = data.mistakes.filter((item: any) => {
        const isMock = item.id?.startsWith("mistake-mock-") || item.email === "siddharth@gmail.com";
        return !isMock;
      });
      if (data.mistakes.length !== initialCount) {
        modified = true;
      }
    }

    if (data.attempts && data.attempts.length > 0) {
      const initialCount = data.attempts.length;
      data.attempts = data.attempts.filter((item: any) => {
        const isMock = item.id?.startsWith("attempt-mock-") || item.email === "siddharth@gmail.com";
        return !isMock;
      });
      if (data.attempts.length !== initialCount) {
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
      console.log("Successfully purged historic mockup student logs to maintain board integrity.");
    }
  } catch (err) {
    console.error("Integrity sweep error:", err);
  }
}

// Function to read the database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_DB;
  }
}

// Function to write to the database
function writeDB(data: typeof DEFAULT_DB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to write server DB:", e);
  }
}

// API Routes
const activeUsersMap = new Map<string, { email: string; name: string; lastSeen: number }>();

function touchActiveUser(email: string | undefined, name: string | undefined) {
  if (email && email.includes("@")) {
    activeUsersMap.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      name: name || "Anonymous Candidate",
      lastSeen: Date.now()
    });
  }
}

function getActiveCount() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  let count = 0;
  for (const [email, info] of activeUsersMap.entries()) {
    if (info.lastSeen >= fiveMinutesAgo) {
      count++;
    } else {
      activeUsersMap.delete(email);
    }
  }
  return Math.max(1, count); // standard minimum to represent the current requester's presence on the boards
}

// Get dynamic online/registration counters across Project Limitless
app.get("/api/stats", (req, res) => {
  const { email, name } = req.query;
  if (email) {
    touchActiveUser(email as string, name as string);
  }
  const db = readDB();
  res.json({
    registeredCount: db.users ? db.users.length : 1,
    activeCount: getActiveCount()
  });
});

app.post("/api/stats/heartbeat", (req, res) => {
  const { email, name } = req.body;
  if (email) {
    touchActiveUser(email, name);
  }
  const db = readDB();
  res.json({
    success: true,
    registeredCount: db.users ? db.users.length : 1,
    activeCount: getActiveCount()
  });
});

// 1. Visit tracker
app.post("/api/track-visit", (req, res) => {
  const { email } = req.body;
  const db = readDB();
  db.visits = (db.visits || 0) + 1;
  if (email && !db.visitors.includes(email)) {
    db.visitors.push(email);
  }
  writeDB(db);
  res.json({ success: true, visits: db.visits, totalVisitors: db.visitors.length });
});

// 2. Get high-level analytics for Administrator Bishowdeep
app.get("/api/analytics", (req, res) => {
  const db = readDB();
  res.json({
    visits: db.visits || 142,
    uniqueVisitorsCount: db.visitors?.length || 1,
    usersCount: db.users?.length || 1,
    users: db.users || [],
    leaderboardEntriesCount: db.leaderboard?.length || 0,
    attemptsCount: db.attempts?.length || 0,
    attempts: db.attempts || [],
    mistakes: db.mistakes || [],
  });
});

// 3. User Login / Registration
app.post("/api/auth/login", (req, res) => {
  const { name, email, school, isAdmin } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "Name and Email keys are required." });
    return;
  }
  
  // Mark this user as active immediately
  touchActiveUser(email, name);
  
  const db = readDB();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  let user = existingUser;
  if (!existingUser) {
    user = { name, email, school: school || "Ordinary MET Candidate", isAdmin: !!isAdmin };
    db.users.push(user);
    // Add to visitors if not already
    if (!db.visitors.includes(email)) {
      db.visitors.push(email);
    }
    writeDB(db);
  } else {
    // Keep user options fresh if they re-login
    user.name = name;
    user.school = school || user.school;
    writeDB(db);
  }
  
  res.json({ success: true, user });
});

// 3.1. Google OAuth Initiator Endpoint
app.get("/api/auth/google/url", (req, res) => {
  const school = (req.query.school as string) || "Ordinary MET Candidate";
  const origin = (req.query.origin as string) || "http://localhost:3000";
  const redirectUri = `${origin}/auth/callback`;
  
  const clientId = process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID || "";
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state: Buffer.from(JSON.stringify({ school, redirectUri })).toString("base64")
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

// 3.2. Google OAuth Callback Endpoint
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    res.send(`<html><body style="background: #121214; color: #f43f5e; font-family: sans-serif; padding: 20px;"><h3>Authentication failed: Missing code.</h3></body></html>`);
    return;
  }
  
  let school = "Ordinary MET Candidate";
  let redirectUri = `${req.protocol}://${req.get("host")}/auth/callback`;
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state as string, "base64").toString("utf-8"));
      if (decoded.school) school = decoded.school;
      if (decoded.redirectUri) redirectUri = decoded.redirectUri;
    } catch (e) {
      console.error("Failed to decode state:", e);
    }
  }
  
  const clientId = process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID || "";
  const clientSecret = process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
  
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to exchange code: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!userinfoResponse.ok) {
      throw new Error(`Failed to fetch userinfo: ${userinfoResponse.status}`);
    }
    
    const googleUser = await userinfoResponse.json();
    const email = googleUser.email;
    const name = googleUser.name;
    
    if (!email) {
      res.send(`<html><body style="background: #121214; color: #f43f5e; font-family: sans-serif; padding: 20px;"><h3>Authentication failed: Missing email from Google.</h3></body></html>`);
      return;
    }
    
    const db = readDB();
    const isAdminEmail = email.toLowerCase() === "limitlessneverdies369@gmail.com";
    
    const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    let user = existingUser;
    if (!existingUser) {
      user = { 
        name, 
        email, 
        school: school || "Ordinary MET Candidate", 
        isAdmin: isAdminEmail
      };
      db.users.push(user);
      if (!db.visitors.includes(email)) {
        db.visitors.push(email);
      }
      writeDB(db);
    } else {
      user.name = name;
      user.school = school || user.school;
      if (isAdminEmail) {
        user.isAdmin = true;
      }
      writeDB(db);
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating with Google...</title>
        </head>
        <body style="background: #121214; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 24px; box-sizing: border-box;">
          <div style="text-align: center; max-width: 400px; padding: 32px; background: #1a1a1e; border: 1px solid #d4af3730; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="border: 4px solid rgba(212, 175, 55, 0.1); border-top-color: #d4af37; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #d4af37; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Linking Account Successful!</h3>
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">Google authorization complete for <b style="color: #fff;">${email}</b>. Closing this popup securely to load your study desk...</p>
          </div>
          <script>
            const userPayload = ${JSON.stringify(user)};
            try {
              if (window.opener) {
                window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS", user: userPayload }, "*");
                window.close();
              } else {
                window.location.href = "/";
              }
            } catch (err) {
              console.error("Popup communication error:", err);
              window.location.href = "/";
            }
          </script>
          <style>
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Google Auth OAuth Error:", err);
    res.send(`
      <html>
        <body style="background: #121214; color: #f43f5e; font-family: sans-serif; padding: 24px;">
          <h3 style="color: #f43f5e;">Google Sign-In Error</h3>
          <p>${err.message || err}</p>
          <hr style="border: 0; border-top: 1px solid #3f3f46; margin: 16px 0;">
          <p style="color: #a1a1aa; font-size: 13px;">Please make sure the environment variables are correctly configured in your AI Studio secrets.</p>
        </body>
      </html>
    `);
  }
});

// 4. Leaderboard APIs - Global or set-specific
app.get("/api/leaderboard", (req, res) => {
  const db = readDB();
  res.json(db.leaderboard);
});

app.get("/api/leaderboard/set/:id", (req, res) => {
  const setNum = parseInt(req.params.id, 10);
  const db = readDB();
  const list = db.leaderboard.filter((item: any) => item.setNum === setNum);
  res.json(list);
});

app.post("/api/leaderboard", (req, res) => {
  const { name, email, score, correctCount, timeSpentSeconds, setNum, school } = req.body;
  
  if (!name || !email || score === undefined || setNum === undefined) {
    res.status(400).json({ error: "Missing score parameter fields." });
    return;
  }
  
  const db = readDB();
  const entryId = "leader-" + Math.random().toString(36).substr(2, 9);
  const newEntry = {
    id: entryId,
    name,
    email,
    score: Number(score),
    correctCount: Number(correctCount),
    timeSpentSeconds: Number(timeSpentSeconds),
    setNum: Number(setNum),
    school: school || "MET Candidate",
    date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  db.leaderboard.push(newEntry);
  // Sort leaderboard descending by score, ascending by time
  db.leaderboard.sort((a: any, b: any) => b.score - a.score || a.timeSpentSeconds - b.timeSpentSeconds);
  writeDB(db);
  
  res.json({ success: true, entry: newEntry });
});

app.delete("/api/leaderboard/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.leaderboard = db.leaderboard.filter((item: any) => item.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Reset Leaderboard
app.post("/api/leaderboard/reset", (req, res) => {
  const db = readDB();
  db.leaderboard = DEFAULT_DB.leaderboard;
  writeDB(db);
  res.json({ success: true, leaderboard: db.leaderboard });
});

// 5. Mistakes log APIs
app.get("/api/mistakes", (req, res) => {
  const { email } = req.query;
  const db = readDB();
  if (email) {
    const list = db.mistakes.filter((m: any) => m.email.toLowerCase() === (email as string).toLowerCase());
    res.json(list);
  } else {
    // If admin, return everything
    res.json(db.mistakes);
  }
});

app.post("/api/mistakes", (req, res) => {
  const { email, name, questionId, setNum, qNum, questionText, options, correctAnswer, selectedAnswer, explanation } = req.body;
  if (!email || !questionId) {
    res.status(400).json({ error: "Missing core mistake attributes." });
    return;
  }
  
  const db = readDB();
  // Check if same mistake is already recorded for user to avoid redundancy
  const exists = db.mistakes.some((m: any) => m.email === email && m.questionId === questionId && m.selectedAnswer === selectedAnswer);
  
  if (!exists) {
    const newMistake = {
      id: "mistake-" + Math.random().toString(36).substr(2, 9),
      email,
      name: name || "Anonymous Candidate",
      questionId,
      setNum: Number(setNum),
      qNum: Number(qNum),
      questionText,
      options,
      correctAnswer,
      selectedAnswer,
      explanation,
      timestamp: new Date().toISOString()
    };
    db.mistakes.unshift(newMistake);
    writeDB(db);
    res.json({ success: true, mistake: newMistake });
  } else {
    res.json({ success: true, message: "Duplicate logs discarded." });
  }
});

app.delete("/api/mistakes/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.mistakes = db.mistakes.filter((m: any) => m.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// 6. Exam Attempts APIs
app.get("/api/attempts", (req, res) => {
  const { email } = req.query;
  const db = readDB();
  if (email) {
    const list = db.attempts.filter((item: any) => item.email.toLowerCase() === (email as string).toLowerCase());
    res.json(list);
  } else {
    res.json(db.attempts);
  }
});

app.post("/api/attempts", (req, res) => {
  const { email, name, setNum, score, correctCount, totalQuestions, timeSpentSeconds, flaggedCount, guessCount } = req.body;
  if (!email || setNum === undefined || score === undefined) {
    res.status(400).json({ error: "Missing attempts fields." });
    return;
  }
  
  const db = readDB();
  const newAttempt = {
    id: "attempt-" + Math.random().toString(36).substr(2, 9),
    email,
    name: name || "Anonymous Candidate",
    setNum: Number(setNum),
    score: Number(score),
    correctCount: Number(correctCount),
    totalQuestions: Number(totalQuestions),
    timeSpentSeconds: Number(timeSpentSeconds),
    date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    flaggedCount: Number(flaggedCount || 0),
    guessCount: Number(guessCount || 0)
  };
  
  db.attempts.unshift(newAttempt);
  writeDB(db);
  res.json({ success: true, attempt: newAttempt });
});

// Setup development server middleware vs production build static file server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application serving port ${PORT} successfully on http://localhost:${PORT}`);
  });
}

startServer();
