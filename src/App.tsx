import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HomeGrid from "./components/HomeGrid";
import LoginModal from "./components/LoginModal";
import LearningCenter from "./components/LearningCenter";
import LearningRoadmap from "./components/LearningRoadmap";
import ProblemSolving from "./components/ProblemSolving";
import InquiriesBoard from "./components/InquiriesBoard";
import ReviewsWall from "./components/ReviewsWall";
import CareersPortal from "./components/CareersPortal";
import GradesDashboard from "./components/GradesDashboard";
import AboutUs from "./components/AboutUs";
import AdminPanel from "./components/AdminPanel";

import { cs50Course, sqlCourse, sqlChallenges, jobPositions } from "./data";

import { 
  Music, Volume2, VolumeX, Mail, Phone, MapPin, 
  Sparkles, CheckCircle2, ChevronLeft, Lock, ShieldAlert,
  LogIn, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>("💻");
  const [userPoints, setUserPoints] = useState<number>(50);
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem("user_is_guest") === "true");
  const [userAccessLevel, setUserAccessLevel] = useState<"full" | "restricted_5pct" | "blocked">(() => {
    return (localStorage.getItem("user_access_level") as any) || "restricted_5pct";
  });
  const [activeCourseId, setActiveCourseId] = useState<string | null>(() => {
    return localStorage.getItem("user_active_course") || null;
  });

  const [currentView, setCurrentView] = useState<string>("home");
  const [showGuestLockModal, setShowGuestLockModal] = useState<boolean>(false);
  const [showLoginModalForGoogle, setShowLoginModalForGoogle] = useState<boolean>(false);

  // Core learning progress states
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);

  // Search filter query state
  const [searchQuery, setSearchQuery] = useState("");

  // Music/Synth state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Dynamic Content States
  const [coursesState, setCoursesState] = useState<any[]>(() => {
    const saved = localStorage.getItem("platform_courses_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading courses:", e);
      }
    }
    return [cs50Course, sqlCourse];
  });

  const [challengesState, setChallengesState] = useState(() => {
    const saved = localStorage.getItem("sql_challenges_list");
    return saved ? JSON.parse(saved) : sqlChallenges;
  });

  const [jobsState, setJobsState] = useState(() => {
    const saved = localStorage.getItem("jobs_list");
    return saved ? JSON.parse(saved) : jobPositions;
  });

  const [siteSettingsState, setSiteSettingsState] = useState(() => {
    const saved = localStorage.getItem("site_settings");
    return saved ? JSON.parse(saved) : {
      heroTitleAr: "عبدالوهاب أحمد",
      heroSubAr: "تعلّم البرمجة ببساطة ومتعة واحترافية كاملة",
      heroDescAr: "نقدم لك دليلاً علمياً شاملاً مدعوماً بالتطبيقات التفاعلية، لمساعدتك في فهم لغات البرمجة وتصميم قواعد البيانات واجتياز كبرى الدورات التدريبية كـ CS50 بنجاح تام وبأبسط أسلوب ممكن.",
      fbUrl: "https://www.facebook.com/share/1ChnEuKfZo/",
      waUrl: "https://wa.me/201286865533",
      ytUrl: "https://youtube.com/@abdelwahabhagag-ml2pg?si=MfUqWFofqvOKDZX_",
      aboutTextAr: "نحن منصة متخصصة في تبسيط علوم الحاسوب وتطوير النظم والويب، وتقديم حلول تقنية متكاملة ومتابعة دورية لمساعدة الطلاب في اجتياز مساراتهم بثقة تامة."
    };
  });

  // State update handlers
  const handleUpdateCourses = (updated: any[]) => {
    setCoursesState(updated);
    localStorage.setItem("platform_courses_v2", JSON.stringify(updated));
  };

  const handleUpdateChallenges = (updated: any) => {
    setChallengesState(updated);
    localStorage.setItem("sql_challenges_list", JSON.stringify(updated));
  };

  const handleUpdateJobs = (updated: any) => {
    setJobsState(updated);
    localStorage.setItem("jobs_list", JSON.stringify(updated));
  };

  const handleUpdateSiteSettings = (updated: any) => {
    setSiteSettingsState(updated);
    localStorage.setItem("site_settings", JSON.stringify(updated));
  };

  // Sync access level from server for this user email
  const syncUserAccessFromServer = async (email: string) => {
    try {
      const res = await fetch("/api/visitors");
      if (res.ok) {
        const list = await res.json();
        const found = list.find((v: any) => v.email.toLowerCase() === email.toLowerCase());
        if (found) {
          setUserAccessLevel(found.accessLevel || "restricted_5pct");
          localStorage.setItem("user_access_level", found.accessLevel || "restricted_5pct");
          if (found.activeCourseId) {
            setActiveCourseId(found.activeCourseId);
            localStorage.setItem("user_active_course", found.activeCourseId);
          }
        }
      }
    } catch (e) {
      console.warn("Could not sync access level from server:", e);
    }
  };

  // Load state from local storage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("username");
    if (savedUser) {
      setUsername(savedUser);
      setAvatar(localStorage.getItem("user_avatar") || "💻");
      const email = localStorage.getItem("user_email") || "student@zakora.tc";
      setUserEmail(email);
      const isG = localStorage.getItem("user_is_guest") === "true";
      setIsGuest(isG);
      
      const pts = localStorage.getItem("user_points");
      setUserPoints(pts ? parseInt(pts, 10) : 50);

      const cl = localStorage.getItem("completed_lessons");
      if (cl) setCompletedLessons(JSON.parse(cl));

      const cn = localStorage.getItem("completed_roadmap");
      if (cn) setCompletedNodes(JSON.parse(cn));

      const sp = localStorage.getItem("solved_problems");
      if (sp) setSolvedProblems(JSON.parse(sp));

      const ac = localStorage.getItem("user_active_course");
      if (ac) setActiveCourseId(ac);

      // Sync with server
      syncUserAccessFromServer(email);
    }
  }, []);

  // Safe Web Audio Synthesizer to play soft ambient background sound
  const toggleBackgroundMusic = () => {
    if (isPlayingMusic) {
      if (oscillator) {
        try {
          oscillator.stop();
        } catch (e) {}
        setOscillator(null);
      }
      setIsPlayingMusic(false);
    } else {
      try {
        const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) setAudioContext(ctx);

        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        
        setOscillator(osc);
        setGainNode(gain);
        setIsPlayingMusic(true);
      } catch (err) {
        console.warn("Web Audio API not fully supported or blocked by user gesture:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillator) {
        try {
          oscillator.stop();
        } catch (e) {}
      }
    };
  }, [oscillator]);

  // Handle successful login
  const handleLoginSuccess = (name: string, email: string, avatarChar: string, guestMode: boolean) => {
    setUsername(name);
    setUserEmail(email);
    setAvatar(avatarChar);
    setIsGuest(guestMode);
    setShowLoginModalForGoogle(false);
    
    const eLower = email.toLowerCase();
    const isAdmin = eLower.includes("abdelwahab") || 
                    eLower.includes("hagag") ||
                    eLower === "zakora.tc.admin@gmail.com" || 
                    eLower.includes("admin") ||
                    eLower.endsWith("@zakora.tc");

    const access = isAdmin ? "full" : "restricted_5pct";
    setUserAccessLevel(access);
    localStorage.setItem("user_access_level", access);

    setUserPoints(50);
    setCompletedLessons([]);
    setCompletedNodes([]);
    setSolvedProblems([]);
    setCurrentView("home");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("user_avatar");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_is_guest");
    localStorage.removeItem("user_access_level");
    localStorage.removeItem("user_active_course");
    localStorage.removeItem("user_points");
    localStorage.removeItem("completed_lessons");
    localStorage.removeItem("completed_roadmap");
    localStorage.removeItem("solved_problems");
    localStorage.removeItem("admin_unlocked");
    
    if (oscillator) {
      try {
        oscillator.stop();
      } catch (e) {}
      setOscillator(null);
    }
    setIsPlayingMusic(false);

    setUsername(null);
    setUserEmail(null);
    setIsGuest(false);
    setCurrentView("home");
  };

  // State update helpers
  const handleAddPoints = (points: number) => {
    const newPts = userPoints + points;
    setUserPoints(newPts);
    localStorage.setItem("user_points", newPts.toString());
  };

  const handleSetActiveCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    localStorage.setItem("user_active_course", courseId);
    if (userEmail) {
      fetch("/api/visitors/update-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, activeCourseId: courseId })
      }).catch(e => console.warn(e));
    }
  };

  const handleToggleLesson = (lessonId: string, pointsChange: number) => {
    let updated: string[];
    if (completedLessons.includes(lessonId)) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
    }
    setCompletedLessons(updated);
    localStorage.setItem("completed_lessons", JSON.stringify(updated));
    handleAddPoints(pointsChange);
  };

  const handleToggleNode = (nodeId: string, pointsChange: number) => {
    let updated: string[];
    if (completedNodes.includes(nodeId)) {
      updated = completedNodes.filter(id => id !== nodeId);
    } else {
      updated = [...completedNodes, nodeId];
    }
    setCompletedNodes(updated);
    localStorage.setItem("completed_roadmap", JSON.stringify(updated));
    handleAddPoints(pointsChange);
  };

  const handleSolveChallenge = (challengeId: string, pointsReward: number) => {
    if (solvedProblems.includes(challengeId)) return;
    const updated = [...solvedProblems, challengeId];
    setSolvedProblems(updated);
    localStorage.setItem("solved_problems", JSON.stringify(updated));
    handleAddPoints(pointsReward);
  };

  // Navigates and auto-scrolls to top with GUEST PROTECTION RULE
  const handleNavigate = (view: string) => {
    // Guest Restriction Check: Guests can only access "home"
    if (isGuest && view !== "home" && view !== "about") {
      setShowGuestLockModal(true);
      return;
    }
    setCurrentView(view);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      if (isGuest) {
        setShowGuestLockModal(true);
      } else {
        setCurrentView("learn");
      }
    }
  };

  // If user is not logged in, intercept and show the login page
  if (!username || showLoginModalForGoogle) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Render correct main view depending on the routing state
  const renderMainView = () => {
    switch (currentView) {
      case "home":
        return (
          <div className="space-y-2">
            <Hero siteSettings={siteSettingsState} />
            <HomeGrid onCardClick={handleNavigate} />
            
            {/* الرسالة والهدف الممنوح للطالب */}
            <div className="max-w-4xl mx-auto px-4 py-10">
              <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-10 space-y-4 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-xl sm:text-2xl font-black text-white">رسالتنا إليك</h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-semibold">
                  {siteSettingsState?.aboutTextAr || "هدفنا هو أن نقوم بتأسيسك في البرمجة من خلال وضع خطة سهلة ومبسطة تجعلك تتقدم بثبات نحو النجاح."}
                </p>
              </div>
            </div>
          </div>
        );
      case "cs50":
        return (
          <LearningCenter 
            completedLessons={completedLessons}
            onToggleLesson={handleToggleLesson}
            onAddPoints={handleAddPoints}
            initialCourseId="cs50"
            courses={coursesState}
            userEmail={userEmail || ""}
            accessLevel={userAccessLevel}
            activeCourseId={activeCourseId}
            onSetActiveCourse={handleSetActiveCourse}
          />
        );
      case "sql-course":
        return (
          <LearningCenter 
            completedLessons={completedLessons}
            onToggleLesson={handleToggleLesson}
            onAddPoints={handleAddPoints}
            initialCourseId="sql"
            courses={coursesState}
            userEmail={userEmail || ""}
            accessLevel={userAccessLevel}
            activeCourseId={activeCourseId}
            onSetActiveCourse={handleSetActiveCourse}
          />
        );
      case "learn":
        return (
          <LearningCenter 
            completedLessons={completedLessons}
            onToggleLesson={handleToggleLesson}
            onAddPoints={handleAddPoints}
            courses={coursesState}
            userEmail={userEmail || ""}
            accessLevel={userAccessLevel}
            activeCourseId={activeCourseId}
            onSetActiveCourse={handleSetActiveCourse}
          />
        );
      case "roadmap":
        return (
          <LearningRoadmap 
            completedNodes={completedNodes}
            onToggleNode={handleToggleNode}
          />
        );
      case "problem-solving":
        return (
          <ProblemSolving 
            solvedProblems={solvedProblems}
            onSolveChallenge={handleSolveChallenge}
            sqlChallenges={challengesState}
          />
        );
      case "inquiries":
        return <InquiriesBoard username={username} />;
      case "reviews":
        return <ReviewsWall username={username} />;
      case "careers":
        return <CareersPortal username={username} jobPositions={jobsState} />;
      case "grades":
        return (
          <GradesDashboard 
            username={username}
            avatar={avatar}
            points={userPoints}
            completedLessons={completedLessons}
            completedNodes={completedNodes}
            solvedProblems={solvedProblems}
            courses={coursesState}
            sqlChallenges={challengesState}
          />
        );
      case "admin":
        return (
          <AdminPanel 
            courses={coursesState}
            challenges={challengesState}
            jobs={jobsState}
            siteSettings={siteSettingsState}
            onUpdateCourses={handleUpdateCourses}
            onUpdateChallenges={handleUpdateChallenges}
            onUpdateJobs={handleUpdateJobs}
            onUpdateSiteSettings={handleUpdateSiteSettings}
            userEmail={userEmail || ""}
          />
        );
      case "about":
        return <AboutUs />;
      default:
        return <div className="p-20 text-center text-slate-400">View not found</div>;
    }
  };

  return (
    <div id="zakora-app-root" className="min-h-screen flex flex-col justify-between bg-[#060a13] text-slate-200 selection:bg-indigo-500/30 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Visual background meshes */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Navigation Bar */}
        <Navbar 
          username={username}
          avatar={avatar}
          userPoints={userPoints}
          onNavigate={handleNavigate}
          currentView={currentView}
          onLogout={handleLogout}
          onSearch={handleSearch}
        />

        {/* Guest Notification Banner on Top if user is Guest */}
        {isGuest && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 rtl-dir font-medium flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              أنت تتصفح الآن بصيغة <span className="font-bold text-white">زائر (تصفح الصفحة الرئيسية فقط)</span>. لمشاهدة الكورسات وحل التحديات،{" "}
              <button 
                onClick={() => setShowLoginModalForGoogle(true)} 
                className="underline font-bold text-amber-200 hover:text-white cursor-pointer"
              >
                سجّل الدخول بحساب Google
              </button>
            </span>
          </div>
        )}

        {/* Back to Home Navigation Button (Only shown when not on home) */}
        {currentView !== "home" && (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 rtl-dir">
            <button 
              onClick={() => handleNavigate("home")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-white bg-[#0f172a] border border-white/5 hover:border-white/10 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة للرئيسية</span>
            </button>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderMainView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Ambient Study Music Synth Control */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            id="ambient-synth-btn"
            onClick={toggleBackgroundMusic}
            className={`flex items-center gap-2 p-3 sm:p-3.5 rounded-full border shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isPlayingMusic 
                ? "bg-emerald-600 border-emerald-500 text-white active-pulse" 
                : "bg-[#0f172a] border-white/10 text-slate-400 hover:text-white"
            }`}
            title={isPlayingMusic ? "إيقاف الموسيقى الهادئة للدراسة" : "تشغيل موسيقى هادئة للدراسة"}
          >
            {isPlayingMusic ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs font-bold font-sans">
              {isPlayingMusic ? "صوت الاستذكار مفعّل" : "تشغيل موسيقى للمذاكرة 🎵"}
            </span>
          </button>
        </div>

        {/* Main Footer Block */}
        <footer id="main-footer" className="bg-[#03060c] border-t border-white/5 py-12 px-6 relative z-10 rtl-dir mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-right">
            
            {/* Section 1: About Platform */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <span>من نحن</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                نحن منصة متخصصة في تبسيط علوم الحاسوب وتطوير النظم والويب، وتقديم حلول تقنية متكاملة ومتابعة دورية لمساعدة الطلاب في اجتياز مساراتهم بثقة تامة.
              </p>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                <span>تواصل معنا</span>
              </h3>
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
                <p className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <a href="mailto:abdelwahabhagag3@gmail.com" className="hover:text-white transition-colors">abdelwahabhagag3@gmail.com</a>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <a href="tel:+201286865533" className="hover:text-white transition-colors font-mono ltr-dir">+201286865533</a>
                </p>
                <p className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>الهرم الأول، القاهرة، جمهورية مصر العربية</span>
                </p>
              </div>
            </div>

            {/* Section 3: Value statement */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <span>معلومات عن المنصة</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
                هدفنا الرئيسي هو تقديم أفضل الخدمات والحلول التقنية الميسرة لعملائنا وطلابنا، لمساعدتهم على التفوق الدائم والنجاح في بناء غدهم الرقمي.
              </p>
            </div>

          </div>

          {/* Bottom Copyright bar */}
          <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
            <p>&copy; 2026 جميع الحقوق محفوظة لـ Zakora-TC | المهندس عبدالوهاب أحمد</p>
            <div className="flex gap-4">
              <button onClick={() => handleNavigate("about")} className="hover:text-slate-300">الشروط والأحكام</button>
              <span className="text-slate-700">|</span>
              <button onClick={() => handleNavigate("about")} className="hover:text-slate-300">سياسة الخصوصية</button>
            </div>
          </div>
        </footer>

      </div>

      {/* GUEST ACCESS RESTRICTION MODAL */}
      <AnimatePresence>
        {showGuestLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 rtl-dir">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">حساب زائر (مقيّد بالرئيسية فقط)</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  عزيزي الزائر، محتوى الكورسات والمحاضرات والتحديات التفاعلية والشهادات مخصص للطلاب المسجلين بحساب <span className="text-indigo-400 font-bold">Google</span> رسمي.
                </p>
              </div>

              <div className="p-4 bg-[#131b2e] border border-white/5 rounded-2xl text-right text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>حفظ تقدمك الدراسي وشهاداتك تلقائياً</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>متابعة شخصية من الأستاذ عبدالوهاب</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowGuestLockModal(false);
                    setShowLoginModalForGoogle(true);
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول بحساب Google الآن</span>
                </button>
                <button
                  onClick={() => setShowGuestLockModal(false)}
                  className="w-full py-2.5 bg-[#131b2e] hover:bg-[#1a253f] text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  البقاء في الصفحة الرئيسية
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
