import React, { useState, useEffect } from "react";
import { 
  Users, Shield, CheckCircle2, AlertTriangle, 
  Ban, RefreshCw, Search, Filter, Lock, Unlock, 
  Mail, Calendar, BookOpen, Trash2, UserCheck, Plus, Check
} from "lucide-react";
import { VisitorRecord, Course } from "../types";

interface AdminVisitorsManagerProps {
  courses: Course[];
  onNotify: (msg: string, isError?: boolean) => void;
}

export default function AdminVisitorsManager({
  courses,
  onNotify
}: AdminVisitorsManagerProps) {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "google" | "guest" | "full" | "restricted_5pct" | "blocked">("all");
  
  // Manual add student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAccess, setNewStudentAccess] = useState<"full" | "restricted_5pct">("full");

  // Fetch visitors list from backend API
  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/visitors");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVisitors(data);
        } else if (data && Array.isArray(data.data)) {
          setVisitors(data.data);
        } else {
          setVisitors([]);
        }
      }
    } catch (e) {
      console.error("Error fetching visitors:", e);
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Update Access Level of a student
  const handleUpdateAccess = async (
    email: string, 
    accessLevel: "full" | "restricted_5pct" | "blocked", 
    activeCourseId?: string | null
  ) => {
    try {
      const res = await fetch("/api/visitors/update-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessLevel, activeCourseId })
      });
      if (res.ok) {
        setVisitors(prev => prev.map(v => v.email.toLowerCase() === email.toLowerCase() ? {
          ...v,
          accessLevel,
          ...(activeCourseId !== undefined ? { activeCourseId } : {})
        } : v));
        onNotify(`تم تحديث صلاحية الطالب (${email}) بنجاح!`);
      } else {
        onNotify("حدث خطأ أثناء تحديث الصلاحية", true);
      }
    } catch (e) {
      onNotify("تعذر الاتصال بالخادم", true);
    }
  };

  // Delete visitor record
  const handleDeleteVisitor = async (email: string) => {
    if (!confirm(`هل أنت متأكد من حذف سجل الزائر (${email})؟`)) return;
    try {
      const res = await fetch("/api/visitors/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setVisitors(prev => prev.filter(v => v.email.toLowerCase() !== email.toLowerCase()));
        onNotify("تم حذف سجل الزائر بنجاح!");
      }
    } catch (e) {
      onNotify("فشل حذف الزائر", true);
    }
  };

  // Grant 100% full access to all students
  const handleApproveAll = async () => {
    if (!confirm("هل تريد منح الصلاحية الكاملة (100%) لجميع الطلاب المسجلين دفعة واحدة؟")) return;
    try {
      for (const v of visitors) {
        if (v.accessLevel !== "full") {
          await fetch("/api/visitors/update-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: v.email, accessLevel: "full" })
          });
        }
      }
      setVisitors(prev => prev.map(v => ({ ...v, accessLevel: "full" })));
      onNotify("تم منح الصلاحية الكاملة 100% لجميع الطلاب بنجاح!");
    } catch (e) {
      onNotify("حدث خطأ أثناء التحديث الجماعي", true);
    }
  };

  // Manually add student
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail || !newStudentEmail.includes("@")) {
      onNotify("الرجاء إدخال بريد إلكتروني صحيح", true);
      return;
    }
    const name = newStudentName.trim() || newStudentEmail.split("@")[0];
    try {
      const res = await fetch("/api/visitors/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: newStudentEmail.toLowerCase(),
          avatar: "🎓",
          isGuest: false,
          points: 100
        })
      });
      if (res.ok) {
        await handleUpdateAccess(newStudentEmail.toLowerCase(), newStudentAccess);
        setShowAddModal(false);
        setNewStudentEmail("");
        setNewStudentName("");
        fetchVisitors();
        onNotify("تمت إضافة وتصريح الطالب بنجاح!");
      }
    } catch (e) {
      onNotify("تعذر إضافة الطالب", true);
    }
  };

  // Filtered list
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === "google") return !v.isGuest;
    if (filterType === "guest") return v.isGuest;
    if (filterType === "full") return v.accessLevel === "full";
    if (filterType === "restricted_5pct") return v.accessLevel === "restricted_5pct";
    if (filterType === "blocked") return v.accessLevel === "blocked";

    return true;
  });

  // Calculate statistics
  const totalCount = visitors.length;
  const googleCount = visitors.filter(v => !v.isGuest).length;
  const guestCount = visitors.filter(v => v.isGuest).length;
  const fullAccessCount = visitors.filter(v => v.accessLevel === "full").length;
  const restricted5PctCount = visitors.filter(v => v.accessLevel === "restricted_5pct").length;
  const blockedCount = visitors.filter(v => v.accessLevel === "blocked").length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>مراقبة وإدارة زوار وطلاب الأكاديمية والتصاريح (5% / 100%)</span>
          </h3>
          <p className="text-xs text-slate-400">
            تتبع كل شخص زار المنصة، تحكّم في صلاحيات مشاهدة الكورسات بالكامل أو تقييدها بنسبة 5% ومنع الزوار الضيوف.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchVisitors}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#131b2e] hover:bg-[#1a253f] border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث السجلات</span>
          </button>

          <button
            onClick={handleApproveAll}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تصريح 100% للكل</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة طالب يدوياً</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-[#131b2e] border border-white/5 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400">إجمالي الزوار</span>
          <p className="text-xl font-bold text-white font-mono">{totalCount}</p>
        </div>
        <div className="p-3 bg-[#131b2e] border border-white/5 rounded-xl space-y-1">
          <span className="text-[11px] text-indigo-400">حسابات Google</span>
          <p className="text-xl font-bold text-indigo-300 font-mono">{googleCount}</p>
        </div>
        <div className="p-3 bg-[#131b2e] border border-white/5 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400">ضيوف (Guest)</span>
          <p className="text-xl font-bold text-slate-300 font-mono">{guestCount}</p>
        </div>
        <div className="p-3 bg-[#131b2e] border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-1">
          <span className="text-[11px] text-emerald-400">صلاحية كاملة (100%)</span>
          <p className="text-xl font-bold text-emerald-300 font-mono">{fullAccessCount}</p>
        </div>
        <div className="p-3 bg-[#131b2e] border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-1">
          <span className="text-[11px] text-amber-400">مقيد (5% فقط)</span>
          <p className="text-xl font-bold text-amber-300 font-mono">{restricted5PctCount}</p>
        </div>
        <div className="p-3 bg-[#131b2e] border border-rose-500/20 bg-rose-500/5 rounded-xl space-y-1">
          <span className="text-[11px] text-rose-400">محظورون</span>
          <p className="text-xl font-bold text-rose-300 font-mono">{blockedCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد الإلكتروني (Gmail)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-2.5 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "all" ? "bg-indigo-600 text-white" : "bg-[#131b2e] text-slate-400 hover:text-white"
            }`}
          >
            الكل ({totalCount})
          </button>
          <button
            onClick={() => setFilterType("google")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "google" ? "bg-indigo-600 text-white" : "bg-[#131b2e] text-slate-400 hover:text-white"
            }`}
          >
            Google ({googleCount})
          </button>
          <button
            onClick={() => setFilterType("guest")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "guest" ? "bg-indigo-600 text-white" : "bg-[#131b2e] text-slate-400 hover:text-white"
            }`}
          >
            ضيوف ({guestCount})
          </button>
          <button
            onClick={() => setFilterType("restricted_5pct")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "restricted_5pct" ? "bg-amber-600 text-white" : "bg-[#131b2e] text-amber-400/80 hover:text-amber-300"
            }`}
          >
            مقيد 5% ({restricted5PctCount})
          </button>
          <button
            onClick={() => setFilterType("full")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "full" ? "bg-emerald-600 text-white" : "bg-[#131b2e] text-emerald-400/80 hover:text-emerald-300"
            }`}
          >
            كامل 100% ({fullAccessCount})
          </button>
          <button
            onClick={() => setFilterType("blocked")}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === "blocked" ? "bg-rose-600 text-white" : "bg-[#131b2e] text-rose-400/80 hover:text-rose-300"
            }`}
          >
            محظور ({blockedCount})
          </button>
        </div>
      </div>

      {/* Visitors Table / List */}
      <div className="bg-[#131b2e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0b101d] text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3.5">الزائر / الطالب</th>
                <th className="p-3.5">نوع الدخول</th>
                <th className="p-3.5">تاريخ الانضمام وآخر زيارة</th>
                <th className="p-3.5">الكورس النشط والإنجاز</th>
                <th className="p-3.5">مستوى الصلاحية</th>
                <th className="p-3.5 text-center">إجراءات التحكم والتصريح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">
                    لا يوجد زوار يطابقون معايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => {
                  const activeCourseObj = courses.find(c => c.id === visitor.activeCourseId);

                  return (
                    <tr key={visitor.id || visitor.email} className="hover:bg-white/[0.02] transition-all">
                      
                      {/* Name & Avatar & Email */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/10 shrink-0">
                            {visitor.avatar || "👤"}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-snug">{visitor.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono ltr-dir text-right flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{visitor.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Login Type */}
                      <td className="p-3.5">
                        {visitor.isGuest ? (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-white/10 rounded-lg text-[10px] font-bold">
                            زائر (تصفح فقط)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                            <Shield className="w-3 h-3 text-indigo-400" />
                            <span>حساب Google</span>
                          </span>
                        )}
                      </td>

                      {/* Dates & Visits */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        <p className="flex items-center gap-1 text-slate-300 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{visitor.lastVisitAt ? new Date(visitor.lastVisitAt).toLocaleDateString("ar-EG") : "اليوم"}</span>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          عدد الزيارات: <span className="font-mono text-indigo-300 font-bold">{visitor.visitCount || 1}</span>
                        </p>
                      </td>

                      {/* Active Course & Progress */}
                      <td className="p-3.5">
                        {activeCourseObj ? (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-indigo-300 block">
                              {activeCourseObj.titleAr}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              الدروس المنجزة: {visitor.completedLessons?.length || 0} من {activeCourseObj.lessons.length}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">لم يبدأ كورس محدد بعد</span>
                        )}
                      </td>

                      {/* Access Level Badge */}
                      <td className="p-3.5">
                        {visitor.accessLevel === "full" ? (
                          <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-bold inline-flex items-center gap-1">
                            <Unlock className="w-3 h-3 text-emerald-400" />
                            <span>صلاحية كاملة (100%)</span>
                          </span>
                        ) : visitor.accessLevel === "blocked" ? (
                          <span className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-bold inline-flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-400" />
                            <span>محظور من المنصة</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>مقيّد بنسبة 5%</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          
                          {/* Grant 100% full access */}
                          {visitor.accessLevel !== "full" && (
                            <button
                              onClick={() => handleUpdateAccess(visitor.email, "full")}
                              title="منح الصلاحية الكاملة 100%"
                              className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تصريح 100%</span>
                            </button>
                          )}

                          {/* Restrict to 5% */}
                          {visitor.accessLevel !== "restricted_5pct" && (
                            <button
                              onClick={() => handleUpdateAccess(visitor.email, "restricted_5pct")}
                              title="تقييد المحتوى بـ 5% فقط"
                              className="px-2.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Lock className="w-3 h-3" />
                              <span>تقييد 5%</span>
                            </button>
                          )}

                          {/* Block user */}
                          {visitor.accessLevel !== "blocked" && (
                            <button
                              onClick={() => handleUpdateAccess(visitor.email, "blocked")}
                              title="حظر المستخدم"
                              className="px-2 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteVisitor(visitor.email)}
                            title="حذف السجل"
                            className="px-2 py-1.5 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 border border-white/10 rounded-lg text-[11px] transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD STUDENT MANUALLY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 rtl-dir">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>إضافة وتصريح طالب جديد يدوياً</span>
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  placeholder="مثال: محمد أحمد"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">البريد الإلكتروني (Google Email):</label>
                <input
                  type="email"
                  placeholder="student@gmail.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left ltr-dir"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">مستوى الصلاحية الممنوح:</label>
                <select
                  value={newStudentAccess}
                  onChange={(e) => setNewStudentAccess(e.target.value as any)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="full">🟢 صلاحية كاملة (100% Full Access)</option>
                  <option value="restricted_5pct">🟡 مقيّد بنسبة 5% فقط</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  إضافة وتفعيل
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-[#1e293b] text-slate-300 font-bold rounded-xl text-xs hover:bg-[#28384f]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
