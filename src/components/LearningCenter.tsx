import React, { useState, useEffect } from "react";
import { Course, Lesson } from "../types";
import { 
  Play, CheckCircle2, ChevronRight, HelpCircle, 
  Award, RefreshCw, Layers, Lock, ShieldCheck, 
  AlertTriangle, ArrowLeft, Send, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LearningCenterProps {
  completedLessons: string[];
  onToggleLesson: (lessonId: string, pointsChange: number) => void;
  onAddPoints: (points: number) => void;
  initialCourseId?: string;
  courses: Course[];
  userEmail?: string;
  accessLevel?: "full" | "restricted_5pct" | "blocked";
  activeCourseId?: string | null;
  onSetActiveCourse?: (courseId: string) => void;
}

export default function LearningCenter({
  completedLessons,
  onToggleLesson,
  onAddPoints,
  initialCourseId,
  courses,
  userEmail = "",
  accessLevel = "restricted_5pct",
  activeCourseId,
  onSetActiveCourse
}: LearningCenterProps) {
  // Teacher / Super Admin check
  const eLower = userEmail.toLowerCase();
  const isTeacherAdmin = eLower.includes("abdelwahab") || 
                         eLower.includes("hagag") ||
                         eLower === "zakora.tc.admin@gmail.com" || 
                         eLower.includes("admin") ||
                         eLower.endsWith("@zakora.tc");

  const hasFullAccess = isTeacherAdmin || accessLevel === "full";

  // Safe initial course selection
  const getInitialCourse = (): Course => {
    if (initialCourseId) {
      const found = courses.find(c => c.id === initialCourseId);
      if (found) return found;
    }
    if (activeCourseId) {
      const activeFound = courses.find(c => c.id === activeCourseId);
      if (activeFound) return activeFound;
    }
    return courses[0] || { id: "empty", title: "", titleAr: "دورة فارغة", description: "", descriptionAr: "", icon: "BookOpen", lessons: [] };
  };

  const [activeCourse, setActiveCourse] = useState<Course>(getInitialCourse);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => {
    const course = getInitialCourse();
    return course.lessons?.[0] || { id: "no_lesson", title: "No Lessons", titleAr: "لا توجد محاضرات بعد", duration: "0", summary: "", summaryAr: "" };
  });

  // Access request state
  const [requestSent, setRequestSent] = useState(false);
  const [requestNotes, setRequestNotes] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Sync state if course data updates from Admin Panel
  useEffect(() => {
    const updatedCourse = courses.find(c => c.id === activeCourse.id) || courses[0];
    if (updatedCourse) {
      setActiveCourse(updatedCourse);
      
      const updatedLesson = updatedCourse.lessons?.find(l => l.id === selectedLesson.id) || updatedCourse.lessons?.[0];
      if (updatedLesson) {
        setSelectedLesson(updatedLesson);
      } else {
        setSelectedLesson({ id: "no_lesson", title: "No Lessons", titleAr: "لا توجد محاضرات بعد", duration: "0", summary: "", summaryAr: "" });
      }
    }
  }, [courses, activeCourse.id]);

  // Quiz states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // Helper: check completion percentage of any course
  const getCourseProgress = (course: Course) => {
    if (!course.lessons || course.lessons.length === 0) return { completed: 0, total: 0, percent: 100, isFinished: true };
    const completedCount = course.lessons.filter(l => completedLessons.includes(l.id)).length;
    const total = course.lessons.length;
    const percent = Math.round((completedCount / total) * 100);
    return { completed: completedCount, total, percent, isFinished: completedCount === total };
  };

  // Check 5% limitation:
  // For accounts with 5% restriction, only first 5% of lessons (e.g. 1st lesson) are viewable
  const allowedLessons5Pct = Math.max(1, Math.ceil((activeCourse.lessons?.length || 1) * 0.05));
  
  const currentLessonIndex = activeCourse.lessons.findIndex(l => l.id === selectedLesson.id);
  const isLessonRestricted5Pct = !hasFullAccess && (currentLessonIndex >= allowedLessons5Pct);

  // Check Sequential Lesson Lock:
  // Lesson at index i is unlocked if index == 0 OR previous lesson is completed in completedLessons
  const isLessonSequentiallyLocked = !isTeacherAdmin && currentLessonIndex > 0 && (function() {
    const prevLesson = activeCourse.lessons[currentLessonIndex - 1];
    return !completedLessons.includes(prevLesson.id);
  })();

  const prevLessonObj = currentLessonIndex > 0 ? activeCourse.lessons[currentLessonIndex - 1] : null;

  const handleCourseChange = (course: Course) => {
    if (onSetActiveCourse) {
      onSetActiveCourse(course.id);
    }
    setActiveCourse(course);
    setSelectedLesson(course.lessons[0]);
    resetQuiz();
  };

  const handleLessonChange = (lesson: Lesson, index: number) => {
    setSelectedLesson(lesson);
    resetQuiz();
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizSuccess(false);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || !selectedLesson.quiz) return;
    
    setQuizSubmitted(true);
    const isCorrect = selectedOption === selectedLesson.quiz.correctIndex;
    setQuizSuccess(isCorrect);
    
    if (isCorrect) {
      // Award 15 points for correct answer if not completed before
      const lessonKey = `quiz-${selectedLesson.id}`;
      const alreadyAnswered = localStorage.getItem(lessonKey);
      if (!alreadyAnswered) {
        localStorage.setItem(lessonKey, "true");
        onAddPoints(15);
      }
    }
  };

  const isCompleted = completedLessons.includes(selectedLesson.id);

  const handleCompleteToggle = () => {
    const pointsReward = isCompleted ? -10 : 10;
    
    // If starting a course for the first time, enroll the student
    if (!activeCourseId && onSetActiveCourse) {
      onSetActiveCourse(activeCourse.id);
    }

    onToggleLesson(selectedLesson.id, pointsReward);
  };

  const handleSendAccessRequest = async () => {
    setRequestSent(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `طلب ترخيص المحتوى الكامل للدورة: ${activeCourse.titleAr}`,
          author: userEmail || "طالب الأكاديمية",
          content: `طلب إذن ترقية من 5% إلى 100% للمشاهدة والمتابعة الكاملة. ملاحظات الطالب: ${requestNotes || "أرجو منحي صلاحية إكمال باقي الدورة."}`
        })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>منصة تعليمية مشفرة ومحمية | مشغل الفيديو الآمن</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">مركز المحاضرات والتعلم</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          شاهد المحاضرات بالترتيب الأكاديمي، واجتز الاختبار القصير لفتح الدروس التالية وحصد النقاط
        </p>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {courses.map(course => {
          const prog = getCourseProgress(course);
          const isSelected = activeCourse.id === course.id;
          
          return (
            <button
              key={course.id}
              onClick={() => handleCourseChange(course)}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-2.5 cursor-pointer ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10 scale-105"
                  : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>{course.titleAr}</span>
              {prog.isFinished ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] rounded-full">
                  مكتمل 100% ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] rounded-full">
                  {prog.percent}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Access Level Status Indicator Banner */}
      {hasFullAccess ? (
        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>حالة تصريح حسابك: صلاحية كاملة (100%) - يمكنك حضور ومشاهدة جميع المحاضرات واجتياز الاختبارات</span>
          </div>
          <span className="bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono shrink-0">
            100% مصرح
          </span>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2 font-bold">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>حالة تصريح حسابك: عينة 5% (المحاضرة التمهيدية فقط) - تحتاج إلى تصريح 100% من المشرف لمتابعة باقي الدروس</span>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>طلب فتح 100%</span>
          </button>
        </div>
      )}

      {/* NORMAL LEARNING CENTER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Lessons menu with sequential & 5% badges */}
        <div className="lg:col-span-1 bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit space-y-4 shadow-xl">
          <div className="pb-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>فهرس الدروس ({activeCourse.lessons.length})</span>
            </h3>
            {!hasFullAccess && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                عينة 5% مصرحة
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {activeCourse.lessons.map((lesson, idx) => {
              const lessonDone = completedLessons.includes(lesson.id);
              const isSelected = selectedLesson.id === lesson.id;
              
              // 5% restricted lock
              const is5PctLocked = !hasFullAccess && (idx >= allowedLessons5Pct);

              // Sequential lock: idx > 0 and previous lesson not done
              const prevDone = idx === 0 || completedLessons.includes(activeCourse.lessons[idx - 1].id);
              const isSequentialLocked = !isTeacherAdmin && !prevDone && !is5PctLocked;

              const isLocked = is5PctLocked || isSequentialLocked;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonChange(lesson, idx)}
                  className={`w-full text-right p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 border cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-white shadow-sm"
                      : isLocked
                      ? "bg-[#131b2e]/20 border-transparent text-slate-500 hover:bg-[#131b2e]/40"
                      : "bg-[#131b2e]/40 border-transparent text-slate-300 hover:bg-[#131b2e] hover:border-white/5"
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{idx + 1}
                      </span>
                      <p className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                        isSelected ? "text-indigo-300" : isLocked ? "text-slate-500" : "text-slate-200"
                      }`}>
                        {lesson.titleAr}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono ltr-dir">{lesson.duration}</p>
                  </div>
                  
                  {lessonDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : is5PctLocked ? (
                    <div className="p-1 rounded bg-amber-500/10 text-amber-400 shrink-0" title="يتطلب تصريح 100% من المشرف">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : isSequentialLocked ? (
                    <div className="p-1 rounded bg-slate-800/80 text-slate-400 shrink-0" title="يجب إكمال المحاضرة السابقة أولاً">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Access request button if restricted */}
          {!hasFullAccess && (
            <div className="pt-3 border-t border-white/5">
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>طلب فتح باقي الكورس (100%)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right columns: Main lesson workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CHECK 1: 5% CONTENT RESTRICTION SCREEN */}
          {isLessonRestricted5Pct ? (
            <div className="bg-[#0f172a] border-2 border-indigo-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                  محتوى مقفل - عينة الـ 5%
                </span>
                <h3 className="text-xl font-bold text-white">يتطلب هذا الدرس تصريحاً من المشرف العام</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  بموجب سياسة الأكاديمية، حسابك حالياً مصرح بنسبة 5% فقط (المحاضرة التمهيدية الأولى). لإكمال باقي الكورس ومشاهدة هذا الدرس، يرجى طلب تصريح من المشرف العام <span className="text-indigo-400 font-bold">المهندس عبدالوهاب أحمد</span> لتفعيل الصلاحية الكاملة (100%) لحسابك.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>طلب فتح الكورس بالكامل (100%) من الأدمن</span>
                </button>
              </div>
            </div>
          ) : 

          /* CHECK 2: SEQUENTIAL LESSON LOCK SCREEN */
          isLessonSequentiallyLocked ? (
            <div className="bg-[#0f172a] border border-amber-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">المحاضرة مقفلة بالترتيب الأكاديمي</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  يجب عليك أولاً إكمال واجتياز المحاضرة السابقة: <span className="text-indigo-400 font-bold">"{prevLessonObj?.titleAr}"</span> لفتح هذه المحاضرة.
                </p>
              </div>
              {prevLessonObj && (
                <button
                  onClick={() => {
                    setSelectedLesson(prevLessonObj);
                    resetQuiz();
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>الذهاب إلى {prevLessonObj.titleAr}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (

            /* UNLOCKED & ACCESSIBLE LESSON VIEW */
            <>
              {/* Video Player Display with Anti-Redirect Protection */}
              <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-xl relative select-none" onContextMenu={(e) => e.preventDefault()}>
                
                {/* Security Header Bar */}
                <div className="bg-[#0a0f1d] px-4 py-2 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مشغل الفيديو الأكاديمي المحمي (ممنوع التحميل أو مغادرة المنصة)</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Zakora-TC Player
                  </span>
                </div>

                {selectedLesson.youtubeId ? (
                  <div className="aspect-video w-full relative bg-black overflow-hidden group">
                    {/* YouTube Embedded Iframe with strict restrictions */}
                    <iframe
                      id={`youtube-iframe-${selectedLesson.id}`}
                      src={`https://www.youtube.com/embed/${selectedLesson.youtubeId}?modestbranding=1&rel=0&iv_load_policy=3&disablekb=0&playsinline=1&controls=1&showinfo=0`}
                      title={selectedLesson.titleAr}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    
                    {/* Anti-Click Shield on Top Bar: Blocks clicks to YouTube logo / channel link / title */}
                    <div 
                      className="absolute top-0 inset-x-0 h-12 z-20 pointer-events-auto cursor-default bg-transparent"
                      title="محمي من الروابط الخارجية"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-indigo-950/20 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <Play className="w-12 h-12 text-indigo-400" />
                    <p className="text-slate-300 font-bold text-sm">لم يتم إدراج فيديو لهذه المحاضرة بعد</p>
                  </div>
                )}
                
                {/* Lesson details bar */}
                <div className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{selectedLesson.titleAr}</h3>
                      <p className="text-xs text-slate-500 ltr-dir">{selectedLesson.title}</p>
                    </div>
                    
                    <button
                      id="complete-lesson-btn"
                      onClick={handleCompleteToggle}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                          : "bg-[#1e293b] border-white/10 text-slate-300 hover:text-white hover:border-indigo-500/50"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isCompleted ? "مكتمل (تمت الإضافة) ✓" : "تحديد كمكتمل لفتح الدرس القادم"}</span>
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">ملخص المحتوى العلمي</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {selectedLesson.summaryAr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lesson Quiz Component */}
              {selectedLesson.quiz && (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm sm:text-md font-bold text-white">اختبر فهمك للمحاضرة (+15 نقطة)</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed">
                      {selectedLesson.quiz.questionAr}
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      {selectedLesson.quiz.options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const showCorrect = quizSubmitted && idx === selectedLesson.quiz!.correctIndex;
                        const showIncorrect = quizSubmitted && isSelected && !quizSuccess;

                        return (
                          <button
                            key={idx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedOption(idx)}
                            className={`text-right p-4 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between gap-4 font-medium cursor-pointer ${
                              showCorrect
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                                : showIncorrect
                                ? "bg-rose-500/10 border-rose-500 text-rose-300"
                                : isSelected
                                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                                : "bg-[#131b2e] border-white/5 hover:border-white/10 text-slate-300"
                            }`}
                          >
                            <span>{option}</span>
                            {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit quiz action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                    {quizSubmitted ? (
                      <div className="flex items-center gap-2">
                        {quizSuccess ? (
                          <p className="text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>إجابة صحيحة وممتازة! أحسنت، تم منحك 15 نقطة.</span>
                          </p>
                        ) : (
                          <div className="flex items-center gap-3">
                            <p className="text-rose-400 text-xs sm:text-sm font-semibold">إجابة خاطئة، حاول مرة أخرى!</p>
                            <button
                              onClick={resetQuiz}
                              className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>إعادة المحاولة</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        id="submit-quiz-btn"
                        onClick={handleQuizSubmit}
                        disabled={selectedOption === null}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedOption !== null
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                            : "bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed"
                        }`}
                      >
                        إرسال الإجابة
                      </button>
                    )}

                    <span className="text-[11px] text-slate-500">سؤال تفاعلي لتأكيد استيعابك للمحاضرة</span>
                  </div>
                </div>
              )}
            </>
            )}

          </div>

        </div>

      {/* REQUEST 100% ACCESS MODAL */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 rtl-dir">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] border border-indigo-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>طلب فتح كامل محتوى الدورة (100%)</span>
                </h3>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {requestSent ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-bold text-base">تم إرسال طلبك بنجاح!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    تم تسجيل طلبك لدى الأستاذ عبدالوهاب أحمد. سيتم مراجعة حسابك وتفعيل الصلاحية الكاملة في أقرب وقت.
                  </p>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setRequestSent(false);
                    }}
                    className="px-6 py-2 bg-[#1e293b] text-white rounded-xl text-xs font-bold hover:bg-[#28384f]"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    طلب إذن الوصول الكامل لكورس <span className="text-indigo-400 font-bold">"{activeCourse.titleAr}"</span> لصالح البريد: <span className="text-white font-mono font-semibold">{userEmail}</span>.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      ملاحظة أو رسالة للأستاذ عبدالوهاب (اختياري):
                    </label>
                    <textarea
                      rows={3}
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      placeholder="أرغب في إكمال هذا الكورس لتعلم علوم الحاسوب وتطبيقات الويب..."
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSendAccessRequest}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                    >
                      إرسال الطلب الآن
                    </button>
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="px-4 py-3 bg-[#1e293b] text-slate-300 font-bold rounded-xl text-xs hover:bg-[#28384f]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
