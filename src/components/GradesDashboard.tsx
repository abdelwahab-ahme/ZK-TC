import { Course, SqlChallenge } from "../types";
import { 
  BarChart2, Award, BookOpen, CheckCircle2, 
  Database, Milestone, Code, ShieldCheck, HelpCircle 
} from "lucide-react";

interface GradesDashboardProps {
  username: string;
  avatar: string;
  points: number;
  completedLessons: string[];
  completedNodes: string[];
  solvedProblems: string[];
  courses: Course[];
  sqlChallenges: SqlChallenge[];
}

export default function GradesDashboard({
  username,
  avatar,
  points,
  completedLessons,
  completedNodes,
  solvedProblems,
  courses,
  sqlChallenges
}: GradesDashboardProps) {
  
  // Calculations
  const totalLessonsCount = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);
  const completedLessonsCount = completedLessons.length;
  const lessonsProgressPercent = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  const totalChallengesCount = sqlChallenges.length;
  const solvedChallengesCount = solvedProblems.length;
  const challengesProgressPercent = totalChallengesCount > 0 
    ? Math.round((solvedChallengesCount / totalChallengesCount) * 100) 
    : 0;

  // Calculate learning level badge
  const getBadge = (pts: number) => {
    if (pts >= 150) return { name: "خبير متكامل (Full-Stack Expert)", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" };
    if (pts >= 100) return { name: "مطور واعد (Advanced Developer)", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
    if (pts >= 70) return { name: "مبرمج مبتدئ (Junior Coder)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    return { name: "طالب جديد (New Student)", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
  };

  const activeBadge = getBadge(points);

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto rtl-dir">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <BarChart2 className="w-8 h-8 text-emerald-500" />
          <span>لوحة الدرجات والتقدم العلمي الخاص بك</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          تتبع مستواك العلمي الفعلي، والنقاط التي قمت بتجميعها بإتمام المحاضرات واجتياز الكويزات وحل مشكلات الكود
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Profile Card & Badges (4 cols) */}
        <div className="md:col-span-4 bg-[#0f172a] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-indigo-500/30 text-4xl shadow-inner relative">
            <span>{avatar}</span>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-[#0f172a] text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{username}</h3>
            <p className="text-xs text-slate-400 mt-1">طالب مسجل في منصة Zakora-TC</p>
          </div>

          {/* Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-black border uppercase tracking-wide ${activeBadge.color}`}>
            {activeBadge.name}
          </div>

          <div className="w-full border-t border-white/5 pt-5 flex items-center justify-around gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-black text-amber-500">{points}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">إجمالي النقاط</p>
            </div>
            
            <div className="w-px h-8 bg-white/5" />
            
            <div className="space-y-1">
              <p className="text-2xl font-black text-emerald-500">{solvedChallengesCount}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">مشكلات محلولة</p>
            </div>
          </div>
        </div>

        {/* Detailed Progress Bars & checklists (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Progress Bars block */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 pb-2.5 border-b border-white/5 uppercase tracking-wide">مؤشرات التقدم العام</h3>
            
            {/* Lessons Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>الدروس والمحاضرات المقروءة</span>
                </span>
                <span className="text-indigo-400 font-mono">{completedLessonsCount} / {totalLessonsCount} ({lessonsProgressPercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${lessonsProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Challenges Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>تحديات حل المشكلات (SQL)</span>
                </span>
                <span className="text-emerald-400 font-mono">{solvedChallengesCount} / {totalChallengesCount} ({challengesProgressPercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${challengesProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Activities completed lists */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 pb-2.5 border-b border-white/5 uppercase tracking-wide">المسارات والإنجازات الحالية</h3>
            
            <div className="space-y-3.5">
              {/* Dynamic courses checklists */}
              {courses.map(course => {
                const totalCourseLessons = course.lessons?.length || 0;
                const completedCourseLessons = course.lessons?.filter(l => completedLessons.includes(l.id)).length || 0;
                return (
                  <div key={course.id} className="flex items-start gap-3 p-3 bg-[#131b2e]/40 rounded-xl border border-white/5 justify-between">
                    <div className="flex gap-2.5">
                      <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{course.titleAr}</h4>
                        <p className="text-[10px] text-slate-400">
                          قمت بقراءة وإتمام {completedCourseLessons} من أصل {totalCourseLessons} محاضرات تدريبية مخصصة لهذه الدورة.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Challenges checklist status */}
              <div className="flex items-start gap-3 p-3 bg-[#131b2e]/40 rounded-xl border border-white/5 justify-between">
                <div className="flex gap-2.5">
                  <Code className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">حل المسائل البرمجية (SQL Problem Solving)</h4>
                    <p className="text-[10px] text-slate-400">
                      تمكنت من صياغة وحل {solvedChallengesCount} تحديات بنجاح، مما يثبت إتقانك لأوامر التصفية والفرز.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
