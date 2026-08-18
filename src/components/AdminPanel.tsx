import React, { useState } from "react";
import { Course, Lesson, SqlChallenge, JobPosition } from "../types";
import { 
  Lock, Unlock, Save, Trash2, Plus, Edit2, 
  Settings, Database, BookOpen, Briefcase, 
  CheckCircle, AlertCircle, RefreshCw, Eye, Users
} from "lucide-react";
import AdminVisitorsManager from "./AdminVisitorsManager";
import { motion } from "motion/react";

interface AdminPanelProps {
  courses: Course[];
  challenges: SqlChallenge[];
  jobs: JobPosition[];
  siteSettings: any;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateChallenges: (updatedChallenges: SqlChallenge[]) => void;
  onUpdateJobs: (updatedJobs: JobPosition[]) => void;
  onUpdateSiteSettings: (settings: any) => void;
  userEmail: string;
}

export default function AdminPanel({
  courses,
  challenges,
  jobs,
  siteSettings,
  onUpdateCourses,
  onUpdateChallenges,
  onUpdateJobs,
  onUpdateSiteSettings,
  userEmail
}: AdminPanelProps) {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("admin_unlocked") === "true";
  });
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<"visitors" | "lessons" | "challenges" | "jobs" | "settings">("visitors");
  
  // Feedback Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Course states
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => courses[0]?.id || "cs50");
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || { id: "no-course", title: "", titleAr: "", description: "", descriptionAr: "", icon: "BookOpen", lessons: [] };
  const [selectedLessonId, setSelectedLessonId] = useState<string>("new_lesson");

  // Course Form/Add states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    id: "",
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    icon: "BookOpen"
  });

  // Lesson Form states
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({
    id: "",
    title: "",
    titleAr: "",
    duration: "",
    youtubeId: "",
    summary: "",
    summaryAr: "",
    quiz: {
      question: "",
      questionAr: "",
      options: ["", "", "", ""],
      correctIndex: 0
    }
  });

  // Challenge states
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("new_challenge");
  const [challengeForm, setChallengeForm] = useState<Partial<SqlChallenge>>({
    id: "",
    title: "",
    titleAr: "",
    difficulty: "سهل",
    difficultyEn: "Easy",
    description: "",
    descriptionAr: "",
    initialQuery: "",
    expectedQuery: "",
    hint: "",
    hintAr: "",
    pointsReward: 15
  });

  // Job states
  const [selectedJobId, setSelectedJobId] = useState<string>("new_job");
  const [jobForm, setJobForm] = useState<Partial<JobPosition>>({
    id: "",
    title: "",
    titleAr: "",
    type: "Full-Time",
    typeAr: "دوام كامل",
    location: "",
    locationAr: "",
    salary: "",
    description: "",
    descriptionAr: "",
    requirements: [""],
    requirementsAr: [""]
  });

  // Site Settings state
  const [settingsForm, setSettingsForm] = useState(siteSettings);

  // Authentication check
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "202210609@Admin") {
      setIsUnlocked(true);
      setPinError("");
      localStorage.setItem("admin_unlocked", "true");
    } else {
      setPinError("رمز المرور خاطئ! الرجاء إدخال الرمز الصحيح ");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem("admin_unlocked");
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // --- LESSON CRUD OPERATIONS ---
  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    if (lessonId === "new_lesson") {
      setLessonForm({
        id: `${selectedCourseId}-lesson-${Date.now()}`,
        title: "",
        titleAr: "",
        duration: "15m",
        youtubeId: "",
        summary: "",
        summaryAr: "",
        quiz: {
          question: "",
          questionAr: "",
          options: ["", "", "", ""],
          correctIndex: 0
        }
      });
    } else {
      const found = currentCourse.lessons.find(l => l.id === lessonId);
      if (found) {
        setLessonForm(JSON.parse(JSON.stringify(found))); // deep clone
      }
    }
  };

  const handleSaveLesson = () => {
    if (!lessonForm.titleAr || !lessonForm.title || !lessonForm.youtubeId) {
      showNotification("الرجاء ملء العناوين البرمجية والعربية ومعرف يوتيوب بالكامل!", true);
      return;
    }

    let updatedLessons = [...currentCourse.lessons];
    const isNew = selectedLessonId === "new_lesson" || !currentCourse.lessons.some(l => l.id === lessonForm.id);

    if (isNew) {
      const finalForm = { ...lessonForm, id: lessonForm.id || `${selectedCourseId}-lesson-${Date.now()}` } as Lesson;
      updatedLessons.push(finalForm);
      setSelectedLessonId(finalForm.id);
      showNotification("تمت إضافة المحاضرة بنجاح!");
    } else {
      updatedLessons = updatedLessons.map(l => l.id === lessonForm.id ? (lessonForm as Lesson) : l);
      showNotification("تم تعديل تفاصيل المحاضرة وحفظها بنجاح!");
    }

    const updatedCourses = courses.map(c => c.id === selectedCourseId ? {
      ...c,
      lessons: updatedLessons
    } : c);
    onUpdateCourses(updatedCourses);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المحاضرة نهائياً؟")) {
      const updatedLessons = currentCourse.lessons.filter(l => l.id !== lessonId);
      
      const updatedCourses = courses.map(c => c.id === selectedCourseId ? {
        ...c,
        lessons: updatedLessons
      } : c);
      onUpdateCourses(updatedCourses);

      setSelectedLessonId("new_lesson");
      setLessonForm({
        id: `${selectedCourseId}-lesson-${Date.now()}`,
        title: "",
        titleAr: "",
        duration: "15m",
        youtubeId: "",
        summary: "",
        summaryAr: "",
        quiz: {
          question: "",
          questionAr: "",
          options: ["", "", "", ""],
          correctIndex: 0
        }
      });
      showNotification("تم حذف المحاضرة بنجاح!");
    }
  };

  // --- CHALLENGE CRUD OPERATIONS ---
  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    if (challengeId === "new_challenge") {
      setChallengeForm({
        id: `chal-${Date.now()}`,
        title: "",
        titleAr: "",
        difficulty: "سهل",
        difficultyEn: "Easy",
        description: "",
        descriptionAr: "",
        initialQuery: "SELECT * FROM students WHERE ...",
        expectedQuery: "SELECT * FROM students WHERE ...",
        hint: "",
        hintAr: "",
        pointsReward: 15
      });
    } else {
      const found = challenges.find(c => c.id === challengeId);
      if (found) {
        setChallengeForm(JSON.parse(JSON.stringify(found)));
      }
    }
  };

  const handleSaveChallenge = () => {
    if (!challengeForm.titleAr || !challengeForm.descriptionAr || !challengeForm.expectedQuery) {
      showNotification("الرجاء إدخال عنوان التحدي، الوصف، والاستعلام الصحيح المتوقع!", true);
      return;
    }

    let updatedChallenges = [...challenges];
    const isNew = selectedChallengeId === "new_challenge" || !challenges.some(c => c.id === challengeForm.id);

    const finalChallenge = {
      ...challengeForm,
      id: challengeForm.id || `chal-${Date.now()}`,
      difficultyEn: challengeForm.difficulty === "سهل" ? "Easy" : challengeForm.difficulty === "متوسط" ? "Medium" : "Hard"
    } as SqlChallenge;

    if (isNew) {
      updatedChallenges.push(finalChallenge);
      setSelectedChallengeId(finalChallenge.id);
      showNotification("تمت إضافة التحدي البرمجي الجديد بنجاح!");
    } else {
      updatedChallenges = updatedChallenges.map(c => c.id === finalChallenge.id ? finalChallenge : c);
      showNotification("تم تحديث وحفظ التحدي البرمجي بنجاح!");
    }

    onUpdateChallenges(updatedChallenges);
  };

  const handleDeleteChallenge = (challengeId: string) => {
    if (confirm("هل تريد حذف هذا التحدي البرمجي نهائياً؟")) {
      const updated = challenges.filter(c => c.id !== challengeId);
      onUpdateChallenges(updated);
      setSelectedChallengeId("new_challenge");
      showNotification("تم حذف التحدي بنجاح!");
    }
  };

  // --- JOBS CRUD OPERATIONS ---
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === "new_job") {
      setJobForm({
        id: `job-${Date.now()}`,
        title: "",
        titleAr: "",
        type: "Full-Time",
        typeAr: "دوام كامل",
        location: "Cairo, Egypt",
        locationAr: "القاهرة، مصر",
        salary: "",
        description: "",
        descriptionAr: "",
        requirements: [""],
        requirementsAr: [""]
      });
    } else {
      const found = jobs.find(j => j.id === jobId);
      if (found) {
        setJobForm(JSON.parse(JSON.stringify(found)));
      }
    }
  };

  const handleSaveJob = () => {
    if (!jobForm.titleAr || !jobForm.descriptionAr) {
      showNotification("الرجاء ملء عنوان الوصف والوظيفة بالعربية على الأقل!", true);
      return;
    }

    let updatedJobs = [...jobs];
    const isNew = selectedJobId === "new_job" || !jobs.some(j => j.id === jobForm.id);

    const finalJob = {
      ...jobForm,
      id: jobForm.id || `job-${Date.now()}`
    } as JobPosition;

    if (isNew) {
      updatedJobs.push(finalJob);
      setSelectedJobId(finalJob.id);
      showNotification("تمت إضافة فرصة العمل الجديدة بنجاح!");
    } else {
      updatedJobs = updatedJobs.map(j => j.id === finalJob.id ? finalJob : j);
      showNotification("تم تحديث تفاصيل الوظيفة بنجاح!");
    }

    onUpdateJobs(updatedJobs);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("هل ترغب بحذف هذه الوظيفة نهائياً من البوابة؟")) {
      const updated = jobs.filter(j => j.id !== jobId);
      onUpdateJobs(updated);
      setSelectedJobId("new_job");
      showNotification("تم حذف فرصة العمل بنجاح!");
    }
  };

  const handleSaveSettings = () => {
    onUpdateSiteSettings(settingsForm);
    showNotification("تم حفظ نصوص وإعدادات واجهة الموقع بنجاح!");
  };

  const isAdminEmail = (email: string) => {
    if (!email) return false;
    const e = email.toLowerCase();
    return e.includes("abdelwahab") || 
           e.includes("hagag") ||
           e === "zakora.tc.admin@gmail.com" || 
           e.includes("admin") || 
           e.endsWith("@zakora.tc") ||
           localStorage.getItem("admin_unlocked") === "true";
  };
    // Google Admin Authorization Guard (Secured externally based on Google login email)
  const isAuthorizedAdmin = isAdminEmail(userEmail);

  if (!isAuthorizedAdmin) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center rtl-dir">
        <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white">خطأ في الصلاحيات (حماية خارجية)</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              عذراً، لوحة التحكم والإدارة مؤمنة خارجياً ومخصصة فقط للمهندس <span className="text-indigo-400 font-bold">عبدالوهاب أحمد</span> والمسؤولين المصرح لهم.
            </p>
            <div className="p-3.5 bg-[#131b2e] border border-white/5 rounded-xl text-xs space-y-1.5 text-right w-full">
              <p className="text-slate-400 font-semibold">
                • بريدك الإلكتروني الحالي: <span className="text-rose-400 font-mono font-bold">{userEmail || "غير متوفر"}</span>
              </p>
              <p className="text-slate-500">
                • نوع الحماية: <span className="text-indigo-400 font-semibold">تحقق خارجي وتفويض ثنائي بواسطة حسابات Google</span>
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal">
             يرجى تسجيل الخروج والدخول مجدداً باستخدام حساب Google الصحيح والمصرح له لتتمكن من إدارة المنصة وتعديل المحتوى.
          </p>
        </div>
      </div>
    );
  }

  // Unlock prompt layout - if not unlocked yet, prompt for PIN
  if (!isUnlocked) {
    return (
      <div className="py-20 px-4 max-w-md mx-auto text-center rtl-dir">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">لوحة الإدارة وتصاريح الطلاب</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              يرجى إدخال رمز المرور السري الخاص بالمهندس عبدالوهاب لإدارة المنصة والمحتوى وتصاريح الطلاب.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                id="admin-pin-input"
                type="password"
                placeholder="أدخل رمز المرور السري..."
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{pinError}</p>
              )}
            </div>

            <button
              id="admin-unlock-submit"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              فك القفل والدخول للوحة الإدارة
            </button>
          </form>

          <div className="p-3 bg-[#131b2e] border border-white/5 rounded-xl text-right text-[11px] space-y-1">
            <p className="text-slate-400">
              • البريد الحالي: <span className="text-indigo-400 font-mono font-bold">{userEmail || "مسؤول النظام"}</span>
            </p>
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 active-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider">لوحة التحكم نشطة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">لوحة تحكم المعلم (الأدمن)</h2>
          <p className="text-xs sm:text-sm text-slate-400">تحكم بمسارات المحاضرات وفيديوهات الكورسات، التحديات البرمجية، وبوابة التوظيف.</p>
        </div>

        <button
          onClick={handleLock}
          className="px-4 py-2 bg-[#1e293b] hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-500/30 border border-white/10 text-slate-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Unlock className="w-4 h-4" />
          <span>قفل لوحة الإدارة</span>
        </button>
      </div>

      {/* Floating Notifications */}
      {successMsg && (
        <div className="fixed top-20 left-6 z-50 bg-emerald-500/10 border border-emerald-500 text-emerald-300 px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-2xl">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-20 left-6 z-50 bg-rose-500/10 border border-rose-500 text-rose-300 px-5 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 shadow-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Tabs Selection */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        <button
          onClick={() => setActiveTab("visitors")}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "visitors"
              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
              : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مراقبة وتصاريح الزوار والطلاب</span>
        </button>

        <button
          onClick={() => { setActiveTab("lessons"); setShowAddCourse(false); }}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "lessons"
              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
              : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة الفيديوهات والدروس ({courses.reduce((sum, c) => sum + c.lessons.length, 0)})</span>
        </button>

        <button
          onClick={() => setActiveTab("challenges")}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "challenges"
              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
              : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>إدارة التحديات البرمجية ({challenges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "jobs"
              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
              : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>إدارة بوابة التوظيف ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "settings"
              ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
              : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تعديل نصوص الموقع</span>
        </button>
      </div>

      {/* WORKSPACE AREA BY TAB */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
        
        {/* TAB 0: VISITORS & ACCESS CONTROL */}
        {activeTab === "visitors" && (
          <AdminVisitorsManager
            courses={courses}
            onNotify={showNotification}
          />
        )}

        {/* TAB 1: LESSONS & VIDEOS */}
        {activeTab === "lessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar selection */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400">اختر الدورة المستهدفة:</label>
                  <button
                    onClick={() => {
                      setNewCourseForm({ id: `course-${Date.now()}`, title: "", titleAr: "", description: "", descriptionAr: "", icon: "BookOpen" });
                      setShowAddCourse(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إنشاء دورة جديدة</span>
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 mb-4">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      className={`group w-full p-2 rounded-xl border transition-all flex items-center justify-between ${
                        selectedCourseId === course.id
                          ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                          : "bg-[#131b2e]/30 border-white/5 text-slate-400 hover:bg-[#131b2e]"
                      }`}
                    >
                      <button
                        onClick={() => { setSelectedCourseId(course.id); setSelectedLessonId("new_lesson"); setShowAddCourse(false); }}
                        className="flex-grow text-right text-xs truncate cursor-pointer font-semibold"
                      >
                        {course.titleAr}
                      </button>

                      {courses.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف دورة "${course.titleAr}" بالكامل مع كافة محاضراتها؟ لا يمكن التراجع!`)) {
                              const updated = courses.filter(c => c.id !== course.id);
                              onUpdateCourses(updated);
                              if (selectedCourseId === course.id) {
                                setSelectedCourseId(updated[0].id);
                                setSelectedLessonId("new_lesson");
                              }
                              showNotification("تم حذف الدورة بنجاح!");
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0 cursor-pointer opacity-50 hover:opacity-100"
                          title="حذف هذه الدورة بالكامل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400">قائمة المحاضرات الحالية:</label>
                  <button
                    onClick={() => handleSelectLesson("new_lesson")}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة درس جديد</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  <button
                    onClick={() => handleSelectLesson("new_lesson")}
                    className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      selectedLessonId === "new_lesson"
                        ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                        : "bg-[#131b2e]/50 border-transparent text-slate-300 hover:bg-[#131b2e]"
                    }`}
                  >
                    <span>+ إضافة محاضرة جديدة</span>
                  </button>

                  {currentCourse.lessons.map((lesson, idx) => (
                    <div 
                      key={lesson.id} 
                      className={`group w-full text-right p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                        selectedLessonId === lesson.id
                          ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                          : "bg-[#131b2e]/30 border-white/5 text-slate-400 hover:bg-[#131b2e]"
                      }`}
                    >
                      <button 
                        onClick={() => handleSelectLesson(lesson.id)}
                        className="flex-grow text-right truncate cursor-pointer font-semibold"
                      >
                        {idx + 1}. {lesson.titleAr}
                      </button>

                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0 cursor-pointer"
                        title="حذف المحاضرة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Editing form */}
            {showAddCourse ? (
              <div className="lg:col-span-2 space-y-5 border-t lg:border-t-0 lg:border-r border-white/5 pt-6 lg:pt-0 lg:pr-6 animate-fadeIn">
                <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2 pb-3 border-b border-white/5">
                  <Plus className="w-5 h-5" />
                  <span>إنشاء دورة تدريبية جديدة</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">معرف الدورة الفريد (ID - إنجليزي):</label>
                    <input
                      type="text"
                      value={newCourseForm.id}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, id: e.target.value })}
                      placeholder="مثال: python-course"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">أيقونة الدورة:</label>
                    <select
                      value={newCourseForm.icon}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, icon: e.target.value })}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="BookOpen">كتاب مفتوح (BookOpen)</option>
                      <option value="Code">كود برمجي (Code)</option>
                      <option value="Database">قواعد بيانات (Database)</option>
                      <option value="Terminal">ترمينال (Terminal)</option>
                      <option value="Cpu">معالج دقيق (Cpu)</option>
                      <option value="Globe">شابكة عالمية (Globe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الدورة (بالعربية):</label>
                    <input
                      type="text"
                      value={newCourseForm.titleAr}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, titleAr: e.target.value })}
                      placeholder="مثال: دورة لغة بايثون المتكاملة"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الدورة (بالإنجليزية):</label>
                    <input
                      type="text"
                      value={newCourseForm.title}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                      placeholder="Example: Python Mastery Course"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">وصف مختصر للدورة (بالعربية):</label>
                    <textarea
                      value={newCourseForm.descriptionAr}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, descriptionAr: e.target.value })}
                      placeholder="وصف شيق لتعريف الطلاب بالدورة..."
                      rows={3}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">وصف مختصر للدورة (بالإنجليزية):</label>
                    <textarea
                      value={newCourseForm.description}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                      placeholder="Brief course summary in English..."
                      rows={3}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowAddCourse(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!newCourseForm.titleAr || !newCourseForm.title) {
                        showNotification("الرجاء إدخال عنوان الدورة بالعربية والإنجليزية!", true);
                        return;
                      }
                      const generatedId = newCourseForm.id.trim() || `course-${Date.now()}`;
                      if (courses.some(c => c.id === generatedId)) {
                        showNotification("معرف الدورة مكرر بالفعل! الرجاء اختيار معرف فريد.", true);
                        return;
                      }
                      const newCourse = {
                        id: generatedId,
                        title: newCourseForm.title,
                        titleAr: newCourseForm.titleAr,
                        description: newCourseForm.description,
                        descriptionAr: newCourseForm.descriptionAr,
                        icon: newCourseForm.icon,
                        lessons: []
                      };
                      
                      const updatedCourses = [...courses, newCourse];
                      onUpdateCourses(updatedCourses);
                      setSelectedCourseId(generatedId);
                      setShowAddCourse(false);
                      showNotification("تم إنشاء الدورة الجديدة بنجاح!");
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    حفظ وإنشاء الدورة
                  </button>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-r border-white/5 pt-6 lg:pt-0 lg:pr-6">
                <h3 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                  <span>{selectedLessonId === "new_lesson" ? "إضافة محاضرة جديدة للدورة" : `تعديل المحاضرة: ${lessonForm.titleAr}`}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">معرف المحاضرة الفريد (ID - إنجليزي):</label>
                    <input
                      type="text"
                      value={lessonForm.id || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })}
                      placeholder="مثال: cs50-lesson-9"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">المدة (Duration - إنجليزي):</label>
                    <input
                      type="text"
                      value={lessonForm.duration || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="مثال: 2h 15m أو 45m"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الدرس (بالعربية):</label>
                    <input
                      type="text"
                      value={lessonForm.titleAr || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, titleAr: e.target.value })}
                      placeholder="مثال: الأسبوع 1 - لغة C الشروط والتكرار"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الدرس (بالإنجليزية):</label>
                    <input
                      type="text"
                      value={lessonForm.title || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="مثال: Week 1 - C Syntax and Loops"
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">معرّف يوتيوب (YouTube Video ID):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={lessonForm.youtubeId || ""}
                        onChange={(e) => setLessonForm({ ...lessonForm, youtubeId: e.target.value })}
                        placeholder="أدخل معرّف يوتيوب المكون من 11 رمزاً (مثال: yO7Mw3S2D0U)"
                        className="flex-grow bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono ltr-dir"
                      />
                      <a
                        href={lessonForm.youtubeId ? `https://youtube.com/watch?v=${lessonForm.youtubeId}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white"
                        title="معاينة الفيديو"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      * احرص على إدخال الرمز الموجود في رابط الفيديو بعد السلاش أو الـ v= فقط وليس الرابط بالكامل.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">وصف ملخص المحاضرة (بالعربية):</label>
                    <textarea
                      rows={2}
                      value={lessonForm.summaryAr || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, summaryAr: e.target.value })}
                      placeholder="اكتب نبذة أو ملخصاً باللغة العربية للطلاب..."
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">وصف ملخص المحاضرة (بالإنجليزية):</label>
                    <textarea
                      rows={2}
                      value={lessonForm.summary || ""}
                      onChange={(e) => setLessonForm({ ...lessonForm, summary: e.target.value })}
                      placeholder="Short summary description in English..."
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quiz section in form */}
                <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wide">بيانات الاختبار القصير الملحق بالدرس (Quiz)</h4>
                  
                  <div className="space-y-3 bg-[#131b2e]/40 p-4 border border-white/5 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">سؤال الاختبار بالعربية:</label>
                      <input
                        type="text"
                        value={lessonForm.quiz?.questionAr || ""}
                        onChange={(e) => {
                          const q = lessonForm.quiz || { question: "", questionAr: "", options: ["", "", "", ""], correctIndex: 0 };
                          setLessonForm({ ...lessonForm, quiz: { ...q, questionAr: e.target.value } });
                        }}
                        placeholder="مثال: أي معامل يستخدم في الذاكرة للوصول للعنوان؟"
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">سؤال الاختبار بالإنجليزية:</label>
                      <input
                        type="text"
                        value={lessonForm.quiz?.question || ""}
                        onChange={(e) => {
                          const q = lessonForm.quiz || { question: "", questionAr: "", options: ["", "", "", ""], correctIndex: 0 };
                          setLessonForm({ ...lessonForm, quiz: { ...q, question: e.target.value } });
                        }}
                        placeholder="Example: Which operator is used to get the memory address in C?"
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none ltr-dir text-right"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((optIdx) => (
                        <div key={optIdx}>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">الخيار {optIdx + 1}:</label>
                          <input
                            type="text"
                            value={lessonForm.quiz?.options[optIdx] || ""}
                            onChange={(e) => {
                              const q = lessonForm.quiz || { question: "", questionAr: "", options: ["", "", "", ""], correctIndex: 0 };
                              const updatedOptions = [...q.options];
                              updatedOptions[optIdx] = e.target.value;
                              setLessonForm({ ...lessonForm, quiz: { ...q, options: updatedOptions } });
                            }}
                            placeholder={`خيار الإجابة رقم ${optIdx + 1}`}
                            className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">الخيار الصحيح (الإجابة الصحيحة):</label>
                      <select
                        value={lessonForm.quiz?.correctIndex ?? 0}
                        onChange={(e) => {
                          const q = lessonForm.quiz || { question: "", questionAr: "", options: ["", "", "", ""], correctIndex: 0 };
                          setLessonForm({ ...lessonForm, quiz: { ...q, correctIndex: parseInt(e.target.value, 10) } });
                        }}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value={0}>الخيار 1</option>
                        <option value={1}>الخيار 2</option>
                        <option value={2}>الخيار 3</option>
                        <option value={3}>الخيار 4</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleSaveLesson}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>{selectedLessonId === "new_lesson" ? "إضافة الدرس وتثبيته" : "حفظ التعديلات الحالية"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SQL CHALLENGES */}
        {activeTab === "challenges" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar list */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400">تحديات الـ SQL الحالية:</label>
                <button
                  onClick={() => handleSelectChallenge("new_challenge")}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة تحدي جديد</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                <button
                  onClick={() => handleSelectChallenge("new_challenge")}
                  className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedChallengeId === "new_challenge"
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                      : "bg-[#131b2e]/50 border-transparent text-slate-300 hover:bg-[#131b2e]"
                  }`}
                >
                  <span>+ إضافة تحدي برمجي جديد</span>
                </button>

                {challenges.map((challenge, idx) => (
                  <div 
                    key={challenge.id} 
                    className={`group w-full text-right p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                      selectedChallengeId === challenge.id
                        ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                        : "bg-[#131b2e]/30 border-white/5 text-slate-400 hover:bg-[#131b2e]"
                    }`}
                  >
                    <button 
                      onClick={() => handleSelectChallenge(challenge.id)}
                      className="flex-grow text-right truncate cursor-pointer font-semibold"
                    >
                      {idx + 1}. {challenge.titleAr} ({challenge.difficulty})
                    </button>

                    <button
                      onClick={() => handleDeleteChallenge(challenge.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing form */}
            <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-r border-white/5 pt-6 lg:pt-0 lg:pr-6">
              <h3 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>{selectedChallengeId === "new_challenge" ? "إنشاء تحدي SQL جديد" : `تعديل التحدي: ${challengeForm.titleAr}`}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">معرف التحدي (ID - فريد):</label>
                  <input
                    type="text"
                    value={challengeForm.id || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, id: e.target.value })}
                    placeholder="مثال: chal-4"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">صعوبة التحدي:</label>
                  <select
                    value={challengeForm.difficulty || "سهل"}
                    onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value as any })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="سهل">سهل</option>
                    <option value="متوسط">متوسط</option>
                    <option value="صعب">صعب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان التحدي (بالعربية):</label>
                  <input
                    type="text"
                    value={challengeForm.titleAr || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, titleAr: e.target.value })}
                    placeholder="مثال: تصفية طلاب القاهرة"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان التحدي (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={challengeForm.title || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                    placeholder="Example: Cairo Students Filter"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">النقاط الممنوحة (Points Reward):</label>
                  <input
                    type="number"
                    value={challengeForm.pointsReward || 15}
                    onChange={(e) => setChallengeForm({ ...challengeForm, pointsReward: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوصف المطلوب للحل (بالعربية):</label>
                  <textarea
                    rows={2}
                    value={challengeForm.descriptionAr || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, descriptionAr: e.target.value })}
                    placeholder="اكتب تفاصيل التحدي والجدول المستهدف بالعربية..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوصف المطلوب للحل (بالإنجليزية):</label>
                  <textarea
                    rows={2}
                    value={challengeForm.description || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                    placeholder="English description/task for student..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاستعلام المبدئي في المحرر (Initial Query):</label>
                  <input
                    type="text"
                    value={challengeForm.initialQuery || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, initialQuery: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono ltr-dir text-right"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاستعلام المتوقع الصحيح للمقارنة (Expected Query):</label>
                  <input
                    type="text"
                    value={challengeForm.expectedQuery || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, expectedQuery: e.target.value })}
                    placeholder="SELECT * FROM students WHERE grade >= 90"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono ltr-dir text-right"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    * سيقوم نظام التدقيق بمقارنة مخرجات استعلام الطالب البرمجي مع مخرجات هذا الاستعلام بالكامل للتأكد من الصحة.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">تلميحة المساعدة (بالعربية):</label>
                  <input
                    type="text"
                    value={challengeForm.hintAr || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, hintAr: e.target.value })}
                    placeholder="مثال: استخدم الشرط WHERE city = 'القاهرة'"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">تلميحة المساعدة (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={challengeForm.hint || ""}
                    onChange={(e) => setChallengeForm({ ...challengeForm, hint: e.target.value })}
                    placeholder="Example: Use WHERE age < 23"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={handleSaveChallenge}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{selectedChallengeId === "new_challenge" ? "إضافة التحدي" : "حفظ تعديلات التحدي"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JOBS & CAREERS */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar list */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400">الوظائف والفرص الحالية:</label>
                <button
                  onClick={() => handleSelectJob("new_job")}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة فرصة جديدة</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                <button
                  onClick={() => handleSelectJob("new_job")}
                  className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                    selectedJobId === "new_job"
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                      : "bg-[#131b2e]/50 border-transparent text-slate-300 hover:bg-[#131b2e]"
                  }`}
                >
                  <span>+ إضافة فرصة عمل جديدة</span>
                </button>

                {jobs.map((job, idx) => (
                  <div 
                    key={job.id} 
                    className={`group w-full text-right p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                      selectedJobId === job.id
                        ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                        : "bg-[#131b2e]/30 border-white/5 text-slate-400 hover:bg-[#131b2e]"
                    }`}
                  >
                    <button 
                      onClick={() => handleSelectJob(job.id)}
                      className="flex-grow text-right truncate cursor-pointer font-semibold"
                    >
                      {idx + 1}. {job.titleAr} ({job.typeAr})
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing form */}
            <div className="lg:col-span-2 space-y-4 border-t lg:border-t-0 lg:border-r border-white/5 pt-6 lg:pt-0 lg:pr-6">
              <h3 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                <span>{selectedJobId === "new_job" ? "إدراج فرصة عمل جديدة" : `تعديل فرصة: ${jobForm.titleAr}`}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">معرف الوظيفة (ID - فريد):</label>
                  <input
                    type="text"
                    value={jobForm.id || ""}
                    onChange={(e) => setJobForm({ ...jobForm, id: e.target.value })}
                    placeholder="مثال: job-3"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الراتب المتوقع (Salary):</label>
                  <input
                    type="text"
                    value={jobForm.salary || ""}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="مثال: 12,000 - 15,000 EGP"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الوظيفة (بالعربية):</label>
                  <input
                    type="text"
                    value={jobForm.titleAr || ""}
                    onChange={(e) => setJobForm({ ...jobForm, titleAr: e.target.value })}
                    placeholder="مثال: معيد ومساعد تدريس برمجة"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الوظيفة (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={jobForm.title || ""}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="Example: Junior SQL Developer"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نوع الدوام (بالعربية):</label>
                  <input
                    type="text"
                    value={jobForm.typeAr || "دوام كامل"}
                    onChange={(e) => setJobForm({ ...jobForm, typeAr: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">نوع الدوام (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={jobForm.type || "Full-Time"}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">المقر والموقع (بالعربية):</label>
                  <input
                    type="text"
                    value={jobForm.locationAr || "القاهرة، مصر"}
                    onChange={(e) => setJobForm({ ...jobForm, locationAr: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">المقر والموقع (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={jobForm.location || "Cairo, Egypt"}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوصف العام للوظيفة (بالعربية):</label>
                  <textarea
                    rows={2}
                    value={jobForm.descriptionAr || ""}
                    onChange={(e) => setJobForm({ ...jobForm, descriptionAr: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوصف العام للوظيفة (بالإنجليزية):</label>
                  <textarea
                    rows={2}
                    value={jobForm.description || ""}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">شروط ومتطلبات الوظيفة بالعربية (سطر جديد لكل شرط):</label>
                  <textarea
                    rows={3}
                    value={jobForm.requirementsAr?.join("\n") || ""}
                    onChange={(e) => setJobForm({ ...jobForm, requirementsAr: e.target.value.split("\n") })}
                    placeholder="اكتب كل شرط في سطر جديد..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">شروط ومتطلبات الوظيفة بالإنجليزية (سطر جديد لكل شرط):</label>
                  <textarea
                    rows={3}
                    value={jobForm.requirements?.join("\n") || ""}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value.split("\n") })}
                    placeholder="Write each requirement in a new line..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={handleSaveJob}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{selectedJobId === "new_job" ? "إدراج الوظيفة" : "حفظ تعديلات الوظيفة"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL SITE SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>تعديل نصوص وإعدادات واجهة المنصة بالكامل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">القسم الأول: الـ Hero (الواجهة الرئيسية الترحيبية)</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاسم المعروض بالخط العريض:</label>
                <input
                  type="text"
                  value={settingsForm.heroTitleAr || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitleAr: e.target.value })}
                  placeholder="مثال: عبدالوهاب أحمد"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">العنوان التعريفي القصير تحت الاسم:</label>
                <input
                  type="text"
                  value={settingsForm.heroSubAr || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubAr: e.target.value })}
                  placeholder="مثال: تعلّم البرمجة ببساطة ومتعة واحترافية كاملة"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">الوصف التعريفي للـ Hero بالكامل:</label>
                <textarea
                  rows={3}
                  value={settingsForm.heroDescAr || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroDescAr: e.target.value })}
                  placeholder="نقدم لك دليلاً علمياً شاملاً مدعوماً بالتطبيقات التفاعلية..."
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">القسم الثاني: روابط التواصل الاجتماعي وقنوات المعلم</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">رابط الفيسبوك (Facebook Page):</label>
                <input
                  type="text"
                  value={settingsForm.fbUrl || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, fbUrl: e.target.value })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono ltr-dir text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">رابط الواتساب (WhatsApp Direct Link):</label>
                <input
                  type="text"
                  value={settingsForm.waUrl || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, waUrl: e.target.value })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono ltr-dir text-right"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">رابط قناة اليوتيوب (YouTube Channel):</label>
                <input
                  type="text"
                  value={settingsForm.ytUrl || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, ytUrl: e.target.value })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono ltr-dir text-right"
                />
              </div>

              <div className="sm:col-span-2 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">القسم الثالث: رسالة وهدف المنصة بالأسفل</h4>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">رسالة المعلم للطلاب (معروضة في الهوم):</label>
                <textarea
                  rows={2}
                  value={settingsForm.aboutTextAr || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutTextAr: e.target.value })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <Save className="w-4 h-4" />
                <span>حفظ جميع إعدادات ونصوص الموقع</span>
              </button>
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
