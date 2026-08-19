import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);

// ===============================
// HEALTH
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "Zakora-TC Backend API",
    database: "Supabase"
  });
});

// ===============================
// GET VISITORS
// ===============================

app.get("/api/visitors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("joined_at", {
        ascending: false
      });

    if (error) {
      console.error("Supabase error:", error);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    const visitors = (data || []).map((student: any) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      isGuest: student.is_guest,
      joinedAt: student.joined_at,
      lastVisitAt: student.last_visit_at,
      visitCount: student.visit_count,
      accessLevel: student.access_level,
      activeCourseId: student.active_course_id,
      completedLessons: student.completed_lessons || [],
      points: student.points || 0,
      notes: student.notes || ""
    }));

    return res.json(visitors);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch visitors"
    });
  }
});

// ===============================
// LOG VISITOR
// ===============================

app.post("/api/visitors/log", async (req, res) => {
  try {
    const {
      name,
      email,
      avatar,
      isGuest,
      activeCourseId,
      completedLessons,
      points
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const normalizedEmail =
      String(email).toLowerCase().trim();

    const {
      data: existing,
      error: searchError
    } = await supabase
      .from("students")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (searchError) {
      return res.status(500).json({
        success: false,
        error: searchError.message
      });
    }

    // Existing user
    if (existing) {

      const updatedStudent = {
        name: name || existing.name,
        avatar: avatar || existing.avatar,

        last_visit_at:
          new Date().toISOString(),

        visit_count:
          (existing.visit_count || 0) + 1,

        active_course_id:
          activeCourseId !== undefined
            ? activeCourseId
            : existing.active_course_id,

        completed_lessons:
          completedLessons !== undefined
            ? completedLessons
            : existing.completed_lessons || [],

        points:
          points !== undefined
            ? points
            : existing.points || 0
      };

      const {
        data: updated,
        error: updateError
      } = await supabase
        .from("students")
        .update(updatedStudent)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({
          success: false,
          error: updateError.message
        });
      }

      return res.json({
        success: true,
        updated: true,
        visitor: updated
      });
    }

    // Admin
    const isAdmin =
      normalizedEmail.includes("abdelwahab") ||
      normalizedEmail.includes("hagag") ||
      normalizedEmail ===
        "zakora.tc.admin@gmail.com" ||
      normalizedEmail.includes("admin") ||
      normalizedEmail.endsWith("@zakora.tc");

    const now =
      new Date().toISOString();

    const newStudent = {
      id:
        `user_${Date.now()}_` +
        Math.random()
          .toString(36)
          .substring(2, 7),

      name:
        name ||
        (isGuest
          ? "زائر جديد"
          : normalizedEmail.split("@")[0]),

      email: normalizedEmail,

      avatar:
        avatar ||
        (isGuest
          ? "🤖"
          : "💻"),

      is_guest: !!isGuest,

      joined_at: now,

      last_visit_at: now,

      visit_count: 1,

      access_level:
        isAdmin
          ? "full"
          : "restricted_5pct",

      active_course_id:
        activeCourseId || null,

      completed_lessons:
        completedLessons || [],

      points:
        points || 50,

      notes:
        isGuest
          ? "حساب زائر سريع"
          : "مستخدم مسجل جديد"
    };

    const {
      data: created,
      error: insertError
    } = await supabase
      .from("students")
      .insert(newStudent)
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        success: false,
        error: insertError.message
      });
    }

    return res.json({
      success: true,
      created: true,
      visitor: created
    });

  } catch (error) {
    console.error(
      "Visitor log error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to log visitor"
    });
  }
});

export default app;
