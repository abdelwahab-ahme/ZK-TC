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
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

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
        points: student.points || 0,
        notes: student.notes || ""
      })
    );

    return res.status(200).json(visitors);

  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}