import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  try {
    // ==============================
    // CHECK ENVIRONMENT VARIABLES
    // ==============================

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl) {
      return res.status(500).json({
        success: false,
        error: "VITE_SUPABASE_URL is missing in Vercel"
      });
    }

    if (!supabaseSecretKey) {
      return res.status(500).json({
        success: false,
        error: "SUPABASE_SECRET_KEY is missing in Vercel"
      });
    }

    // ==============================
    // SUPABASE
    // ==============================

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey
    );

    // ==============================
    // METHOD
    // ==============================

    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    // ==============================
    // GET STUDENTS
    // ==============================

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("joined_at", {
        ascending: false
      });

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      });
    }

    // ==============================
    // RESPONSE
    // ==============================

    const visitors = (data || []).map(
      (student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        isGuest: student.is_guest,
        joinedAt: student.joined_at,
        lastVisitAt: student.last_visit_at,
        visitCount: student.visit_count,
        accessLevel: student.access_level,
        activeCourseId:
          student.active_course_id,

        completedLessons:
          student.completed_lessons || [],

        points:
          student.points || 0,

        notes:
          student.notes || ""
      })
    );

    return res.status(200).json(visitors);

  } catch (error: any) {

    console.error(
      "VISITORS API CRASH:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unknown server error"
    });
  }
}
