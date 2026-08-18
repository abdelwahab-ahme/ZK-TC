import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface VisitorRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  joinedAt: string;
  lastVisitAt: string;
  visitCount: number;
  accessLevel: "full" | "restricted_5pct" | "blocked";
  activeCourseId?: string | null;
  completedLessons?: string[];
  points?: number;
  notes?: string;
}

const VISITORS_FILE_PATH = path.join(process.cwd(), "visitors_store.json");

// Default initial seed records
const defaultSeedVisitors: VisitorRecord[] = [
  {
    id: "admin_abdelwahab",
    name: "المهندس عبدالوهاب أحمد (المشرف العام)",
    email: "abdelwahabhagag.ml2pg@gmail.com",
    avatar: "🎓",
    isGuest: false,
    joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastVisitAt: new Date().toISOString(),
    visitCount: 42,
    accessLevel: "full",
    activeCourseId: null,
    completedLessons: ["cs50-w0", "cs50-w1", "cs50-w2", "sql-01"],
    points: 1500,
    notes: "مدير النظام وصاحب الأكاديمية"
  },
  {
    id: "admin_abdelwahab_main",
    name: "المهندس عبدالوهاب أحمد (الأدمن)",
    email: "abdelwahabhagag3@gmail.com",
    avatar: "🎓",
    isGuest: false,
    joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastVisitAt: new Date().toISOString(),
    visitCount: 65,
    accessLevel: "full",
    activeCourseId: null,
    completedLessons: ["cs50-w0", "cs50-w1", "cs50-w2", "cs50-w3", "sql-01", "sql-02"],
    points: 2500,
    notes: "المشرف وصاحب المنصة"
  },
  {
    id: "student_ahmed",
    name: "أحمد علي محمود",
    email: "ahmed.ali.tech@gmail.com",
    avatar: "💻",
    isGuest: false,
    joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastVisitAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    visitCount: 8,
    accessLevel: "full",
    activeCourseId: "cs50",
    completedLessons: ["cs50-w0", "cs50-w1"],
    points: 120,
    notes: "طالب مجتهد تم منحه الصلاحية الكاملة 100%"
  },
  {
    id: "student_sarah",
    name: "سارة محمد إبراهيم",
    email: "sarah.mohamed.dev@gmail.com",
    avatar: "🌟",
    isGuest: false,
    joinedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastVisitAt: new Date().toISOString(),
    visitCount: 4,
    accessLevel: "restricted_5pct",
    activeCourseId: "cs50",
    completedLessons: ["cs50-w0"],
    points: 65,
    notes: "طالبة جديدة - تصريح 5% (بانتظار الموافقة على 100%)"
  }
];

// Helper: load from disk or create
function loadVisitorsFromDisk(): VisitorRecord[] {
  try {
    if (fs.existsSync(VISITORS_FILE_PATH)) {
      const data = fs.readFileSync(VISITORS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading visitors from disk:", e);
  }
  return defaultSeedVisitors;
}

// Helper: save to disk
function saveVisitorsToDisk(records: VisitorRecord[]) {
  try {
    fs.writeFileSync(VISITORS_FILE_PATH, JSON.stringify(records, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving visitors to disk:", e);
  }
}

let visitorsDatabase: VisitorRecord[] = loadVisitorsFromDisk();

let inquiriesDatabase: any[] = [];
let jobApplicationsDatabase: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // GET & POST API ROUTES
  // ==========================================

  // 1. Health check (GET)
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      server: "Zakora-TC Backend API", 
      timestamp: new Date().toISOString(),
      capabilities: {
        getEnabled: true,
        postEnabled: true
      }
    });
  });

  // 2. Visitors / Students Tracking (GET)
  app.get("/api/visitors", (req, res) => {
    res.json(visitorsDatabase);
  });

  // 3. Log Visitor / Sign-in (POST)
  app.post("/api/visitors/log", (req, res) => {
    const { name, email, avatar, isGuest, activeCourseId, completedLessons, points } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingIndex = visitorsDatabase.findIndex(v => v.email.toLowerCase() === normalizedEmail);

    if (existingIndex >= 0) {
      const existing = visitorsDatabase[existingIndex];
      existing.name = name || existing.name;
      existing.avatar = avatar || existing.avatar;
      existing.lastVisitAt = new Date().toISOString();
      existing.visitCount = (existing.visitCount || 1) + 1;
      if (activeCourseId !== undefined) existing.activeCourseId = activeCourseId;
      if (completedLessons) existing.completedLessons = completedLessons;
      if (points !== undefined) existing.points = points;

      return res.json({ success: true, updated: true, visitor: existing });
    } else {
      // Is admin check
      const isAdmin = normalizedEmail.includes("abdelwahab") || 
                      normalizedEmail.includes("hagag") ||
                      normalizedEmail === "zakora.tc.admin@gmail.com" ||
                      normalizedEmail.includes("admin") ||
                      normalizedEmail.endsWith("@zakora.tc");

      const newRecord: VisitorRecord = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name || (isGuest ? "زائر جديد" : normalizedEmail.split("@")[0]),
        email: normalizedEmail,
        avatar: avatar || (isGuest ? "🤖" : "💻"),
        isGuest: !!isGuest,
        joinedAt: new Date().toISOString(),
        lastVisitAt: new Date().toISOString(),
        visitCount: 1,
        // Default permission: Admins get full, guests/new visitors get restricted_5pct until admin approves
        accessLevel: isAdmin ? "full" : "restricted_5pct",
        activeCourseId: activeCourseId || null,
        completedLessons: completedLessons || [],
        points: points || 50,
        notes: isGuest ? "حساب زائر سريع" : "مستخدم مسجل جديد"
      };

      visitorsDatabase.unshift(newRecord);
      saveVisitorsToDisk(visitorsDatabase);
      return res.json({ success: true, created: true, visitor: newRecord });
    }
  });

  // 4. Update Visitor Access / Permissions (POST)
  app.post("/api/visitors/update-access", (req, res) => {
    const { email, accessLevel, activeCourseId, notes } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = visitorsDatabase.find(v => v.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // If user is not yet in visitorsDatabase, create them with specified access level
      const isAdmin = normalizedEmail.includes("abdelwahab") || 
                      normalizedEmail.includes("hagag") ||
                      normalizedEmail === "zakora.tc.admin@gmail.com" ||
                      normalizedEmail.includes("admin") ||
                      normalizedEmail.endsWith("@zakora.tc");

      const newRec: VisitorRecord = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        avatar: "🎓",
        isGuest: false,
        joinedAt: new Date().toISOString(),
        lastVisitAt: new Date().toISOString(),
        visitCount: 1,
        accessLevel: accessLevel || (isAdmin ? "full" : "restricted_5pct"),
        activeCourseId: activeCourseId || null,
        completedLessons: [],
        points: 50,
        notes: notes || "طالب مسجل"
      };
      visitorsDatabase.unshift(newRec);
      saveVisitorsToDisk(visitorsDatabase);
      return res.json({ success: true, message: "تمت إضافة الطالب وتحديث صلاحياته بنجاح", user: newRec });
    }

    if (accessLevel && ["full", "restricted_5pct", "blocked"].includes(accessLevel)) {
      user.accessLevel = accessLevel;
    }
    if (activeCourseId !== undefined) {
      user.activeCourseId = activeCourseId;
    }
    if (notes !== undefined) {
      user.notes = notes;
    }

    saveVisitorsToDisk(visitorsDatabase);
    res.json({ success: true, message: "تم تحديث الصلاحيات بنجاح", user });
  });

  // 5. Delete visitor record (POST)
  app.post("/api/visitors/delete", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    visitorsDatabase = visitorsDatabase.filter(v => v.email.toLowerCase() !== email.toLowerCase().trim());
    saveVisitorsToDisk(visitorsDatabase);
    res.json({ success: true, message: "تم حذف السجل بنجاح" });
  });

  // 6. Inquiries API (GET & POST)
  app.get("/api/inquiries", (req, res) => {
    res.json({ success: true, inquiries: inquiriesDatabase });
  });

  app.post("/api/inquiries", (req, res) => {
    const newInquiry = {
      id: `inq_${Date.now()}`,
      ...req.body,
      timestamp: new Date().toISOString()
    };
    inquiriesDatabase.unshift(newInquiry);
    res.json({ success: true, inquiry: newInquiry });
  });

  // 7. Job Applications (POST)
  app.post("/api/job-applications", (req, res) => {
    const application = {
      id: `app_${Date.now()}`,
      ...req.body,
      appliedAt: new Date().toISOString(),
      status: "قيد المراجعة"
    };
    jobApplicationsDatabase.unshift(application);
    res.json({ success: true, application });
  });

  // ==========================================
  // Vite Middleware / Static Serving
  // ==========================================
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
    console.log(`Zakora-TC Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
