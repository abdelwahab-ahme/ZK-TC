import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);

export default async function handler(
  req: any,
  res: any
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const {
      name,
      email,
      avatar,
      isGuest,
      activeCourseId,
      completedLessons,
      points
    } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

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

      return res.status(200).json({
        success: true,
        updated: true,
        visitor: updated
      });
    }

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
        `user_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 7)}`,

      name:
        name ||
        (isGuest
          ? "زائر جديد"
          : normalizedEmail.split("@")[0]),

      email: normalizedEmail,

      avatar:
        avatar ||
        (isGuest ? "🤖" : "💻"),

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

    return res.status(200).json({
      success: true,
      created: true,
      visitor: created
    });

  } catch (error: any) {
    console.error("Visitor log error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}