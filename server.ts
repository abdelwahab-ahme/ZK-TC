import express from "express";
import path from "path";
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

// In-memory data store with default seed records
let visitorsDatabase: VisitorRecord[] = [
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
    notes: "طالب مجتهد تم منحه الصلاحية الكاملة"
  },
  {
    id: "guest_demo",
    name: "زائر تجريبي 104",
    email: "guest104@student.zakora.tc",
    avatar: "🤖",
    isGuest: true,
    joinedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastVisitAt: new Date().toISOString(),
    visitCount: 3,
    accessLevel: "restricted_5pct",
    activeCourseId: null,
    completedLessons: [],
    points: 50,
    notes: "حساب زائر سريع مقيد بالرئيسية فقط"
  }
];

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
      return res.status(404).json({ success: false, error: "User not found" });
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

    res.json({ success: true, message: "تم تحديث الصلاحيات بنجاح", user });
  });

  // 5. Delete visitor record (POST)
  app.post("/api/visitors/delete", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    visitorsDatabase = visitorsDatabase.filter(v => v.email.toLowerCase() !== email.toLowerCase().trim());
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
