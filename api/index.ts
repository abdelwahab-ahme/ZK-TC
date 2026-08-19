import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();

app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    server: "Zakora-TC Vercel API",
    timestamp: new Date().toISOString(),
    database: "Supabase"
  });
});

/* =====================================================
   GET VISITORS
===================================================== */

app.get("/api/visitors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("GET visitors error:", error);

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

/* =====================================================
   LOG VISITOR
===================================================== */

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

    const normalizedEmail = String(email)
      .toLowerCase()
      .trim();

    /* البحث عن المستخدم */

    const {
      data: existing,
      error: searchError
    } = await supabase
      .from("students")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (searchError) {
      console.error(searchError);

      return res.status(500).json({
        success: false,
        error: searchError.message
      });
    }

    /* =================================================
       EXISTING USER
    ================================================= */

    if (existing) {

      const updatedStudent = {
        name: name || existing.name,

        avatar:
          avatar ||
          existing.avatar,

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
        console.error(updateError);

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

    /* =================================================
       ADMIN CHECK
    ================================================= */

    const isAdmin =
      normalizedEmail.includes("abdelwahab") ||
      normalizedEmail.includes("hagag") ||
      normalizedEmail === "zakora.tc.admin@gmail.com" ||
      normalizedEmail.includes("admin") ||
      normalizedEmail.endsWith("@zakora.tc");

    const now = new Date().toISOString();

    /* =================================================
       NEW USER
    ================================================= */

    const newStudent = {

      id:
        `user_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 7)}`,

      name:
        name ||
        (
          isGuest
            ? "زائر جديد"
            : normalizedEmail.split("@")[0]
        ),

      email:
        normalizedEmail,

      avatar:
        avatar ||
        (
          isGuest
            ? "🤖"
            : "💻"
        ),

      is_guest:
        !!isGuest,

      joined_at:
        now,

      last_visit_at:
        now,

      visit_count:
        1,

      access_level:
        isAdmin
          ? "full"
          : "restricted_5pct",

      active_course_id:
        activeCourseId || null,

      completed_lessons:
        completedLessons || [],

      points:
        points ?? 50,

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
      console.error(insertError);

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

/* =====================================================
   UPDATE ACCESS
===================================================== */

app.post(
  "/api/visitors/update-access",
  async (req, res) => {

    try {

      const {
        email,
        accessLevel,
        activeCourseId,
        notes
      } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      const normalizedEmail =
        String(email)
          .toLowerCase()
          .trim();

      const {
        data: user,
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

      /* إنشاء المستخدم إذا لم يكن موجود */

      if (!user) {

        const isAdmin =
          normalizedEmail.includes("abdelwahab") ||
          normalizedEmail.includes("hagag") ||
          normalizedEmail === "zakora.tc.admin@gmail.com" ||
          normalizedEmail.includes("admin") ||
          normalizedEmail.endsWith("@zakora.tc");

        const now =
          new Date().toISOString();

        const newStudent = {

          id:
            `user_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 7)}`,

          name:
            normalizedEmail.split("@")[0],

          email:
            normalizedEmail,

          avatar:
            "🎓",

          is_guest:
            false,

          joined_at:
            now,

          last_visit_at:
            now,

          visit_count:
            1,

          access_level:
            accessLevel ||
            (
              isAdmin
                ? "full"
                : "restricted_5pct"
            ),

          active_course_id:
            activeCourseId || null,

          completed_lessons:
            [],

          points:
            50,

          notes:
            notes || "طالب مسجل"
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
          message:
            "تمت إضافة الطالب وتحديث صلاحياته بنجاح",
          user: created
        });
      }

      /* تحديث المستخدم */

      const updates: any = {};

      if (
        accessLevel &&
        [
          "full",
          "restricted_5pct",
          "blocked"
        ].includes(accessLevel)
      ) {
        updates.access_level =
          accessLevel;
      }

      if (
        activeCourseId !== undefined
      ) {
        updates.active_course_id =
          activeCourseId;
      }

      if (
        notes !== undefined
      ) {
        updates.notes =
          notes;
      }

      const {
        data: updated,
        error: updateError
      } = await supabase
        .from("students")
        .update(updates)
        .eq("id", user.id)
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
        message:
          "تم تحديث الصلاحيات بنجاح",
        user: updated
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to update visitor"
      });
    }
  }
);

/* =====================================================
   DELETE VISITOR
===================================================== */

app.post(
  "/api/visitors/delete",
  async (req, res) => {

    try {

      const { email } =
        req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      const normalizedEmail =
        String(email)
          .toLowerCase()
          .trim();

      const { error } =
        await supabase
          .from("students")
          .delete()
          .eq(
            "email",
            normalizedEmail
          );

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        message:
          "تم حذف السجل بنجاح"
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to delete visitor"
      });
    }
  }
);

/* =====================================================
   INQUIRIES - GET
===================================================== */

app.get(
  "/api/inquiries",
  async (req, res) => {

    try {

      const {
        data,
        error
      } = await supabase
        .from("inquiries")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        inquiries: data || []
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to fetch inquiries"
      });
    }
  }
);

/* =====================================================
   INQUIRIES - POST
===================================================== */

app.post(
  "/api/inquiries",
  async (req, res) => {

    try {

      const newInquiry = {
        id:
          `inq_${Date.now()}`,

        ...req.body,

        created_at:
          new Date().toISOString()
      };

      const {
        data,
        error
      } = await supabase
        .from("inquiries")
        .insert(newInquiry)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        inquiry: data
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to create inquiry"
      });
    }
  }
);

/* =====================================================
   JOB APPLICATIONS
===================================================== */

app.post(
  "/api/job-applications",
  async (req, res) => {

    try {

      const application = {

        id:
          `app_${Date.now()}`,

        ...req.body,

        applied_at:
          new Date().toISOString(),

        status:
          "قيد المراجعة"
      };

      const {
        data,
        error
      } = await supabase
        .from("job_applications")
        .insert(application)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        application: data
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          "Failed to create application"
      });
    }
  }
);

/* =====================================================
   VERCEL EXPORT
===================================================== */

export default app;