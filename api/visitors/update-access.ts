import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  try {
    // ==============================
    // METHOD
    // ==============================

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    // ==============================
    // ENV
    // ==============================

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl) {
      return res.status(500).json({
        success: false,
        error: "VITE_SUPABASE_URL is missing in Vercel",
      });
    }

    if (!supabaseSecretKey) {
      return res.status(500).json({
        success: false,
        error: "SUPABASE_SECRET_KEY is missing in Vercel",
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
    // REQUEST DATA
    // ==============================

    const {
      email,
      accessLevel,
      activeCourseId,
      notes,
    } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // ==============================
    // VALID ACCESS LEVEL
    // ==============================

    const allowedAccessLevels = [
      "full",
      "restricted_5pct",
      "blocked",
    ];

    if (
      accessLevel &&
      !allowedAccessLevels.includes(accessLevel)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid access level",
        allowed: allowedAccessLevels,
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // ==============================
    // FIND STUDENT
    // ==============================

    const {
      data: user,
      error: searchError,
    } = await supabase
      .from("students")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (searchError) {
      console.error(
        "SEARCH STUDENT ERROR:",
        searchError
      );

      return res.status(500).json({
        success: false,
        error: searchError.message,
        code: searchError.code,
        details: searchError.details,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // ==============================
    // UPDATE DATA
    // ==============================

    const updates: any = {};

    if (accessLevel !== undefined) {
      updates.access_level = accessLevel;
    }

    if (activeCourseId !== undefined) {
      updates.active_course_id = activeCourseId;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    // Make sure something is being updated
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No update data provided",
      });
    }

    // ==============================
    // UPDATE SUPABASE
    // ==============================

    const {
      data: updated,
      error: updateError,
    } = await supabase
      .from("students")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "UPDATE STUDENT ERROR:",
        updateError
      );

      return res.status(500).json({
        success: false,
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
    }

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(200).json({
      success: true,
      message: "تم تحديث الصلاحيات بنجاح",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        isGuest: updated.is_guest,
        joinedAt: updated.joined_at,
        lastVisitAt: updated.last_visit_at,
        visitCount: updated.visit_count,
        accessLevel: updated.access_level,
        activeCourseId: updated.active_course_id,
        completedLessons:
          updated.completed_lessons || [],
        points: updated.points || 0,
        notes: updated.notes || "",
      },
    });

  } catch (error: any) {
    console.error(
      "UPDATE ACCESS CRASH:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to update visitor access",
    });
  }
}
