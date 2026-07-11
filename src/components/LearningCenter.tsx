import { useState, useEffect } from "react";
import { Course, Lesson } from "../types";
import { 
  Play, CheckCircle2, ChevronRight, HelpCircle, 
  Award, RefreshCw, Layers, ExternalLink 
} from "lucide-react";
import { motion } from "motion/react";

interface LearningCenterProps {
  completedLessons: string[];
  onToggleLesson: (lessonId: string, pointsChange: number) => void;
  onAddPoints: (points: number) => void;
  initialCourseId?: string;
  courses: Course[];
}

export default function LearningCenter({
  completedLessons,
  onToggleLesson,
  onAddPoints,
  initialCourseId,
  courses
}: LearningCenterProps) {
  // Safe initial course selection
  const getInitialCourse = (): Course => {
    if (initialCourseId) {
      const found = courses.find(c => c.id === initialCourseId);
      if (found) return found;
    }
    return courses[0] || { id: "empty", title: "", titleAr: "دورة فارغة", description: "", descriptionAr: "", icon: "BookOpen", lessons: [] };
  };

  const [activeCourse, setActiveCourse] = useState<Course>(getInitialCourse);
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(() => {
    const course = getInitialCourse();
    return course.lessons?.[0] || { id: "no_lesson", title: "No Lessons", titleAr: "لا توجد محاضرات بعد", duration: "0", summary: "", summaryAr: "" };
  });

  // Sync state if course data updates from Admin Panel
  useEffect(() => {
    const updatedCourse = courses.find(c => c.id === activeCourse.id) || courses[0];
    if (updatedCourse) {
      setActiveCourse(updatedCourse);
      
      // Keep selected lesson or select first one if not found or invalid
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

  const handleCourseChange = (course: Course) => {
    setActiveCourse(course);
    setSelectedLesson(course.lessons[0]);
    resetQuiz();
  };

  const handleLessonChange = (lesson: Lesson) => {
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
    onToggleLesson(selectedLesson.id, pointsReward);
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">مركز المحاضرات والتعلم</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          تصفح الدروس والأسابيع، تابع الفيديوهات والشروحات واجتز الاختبار القصير لكل درس لتحصيل النقاط
        </p>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => handleCourseChange(course)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              activeCourse.id === course.id
                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10"
                : "bg-[#0f172a] border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {course.titleAr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Lessons menu */}
        <div className="lg:col-span-1 bg-[#0f172a] border border-white/5 rounded-2xl p-5 h-fit">
          <h3 className="text-md font-bold text-slate-200 mb-4 pb-3 border-b border-white/5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>فهرس الدروس ({activeCourse.lessons.length})</span>
          </h3>
          
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {activeCourse.lessons.map((lesson) => {
              const lessonDone = completedLessons.includes(lesson.id);
              const isSelected = selectedLesson.id === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonChange(lesson)}
                  className={`w-full text-right p-3.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 border ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-white shadow-sm"
                      : "bg-[#131b2e]/40 border-transparent text-slate-300 hover:bg-[#131b2e] hover:border-white/5"
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-sm font-bold leading-snug ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                      {lesson.titleAr}
                    </p>
                    <p className="text-xs text-slate-500 font-mono ltr-dir">{lesson.duration}</p>
                  </div>
                  
                  {lessonDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right columns: Main lesson workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Player Display */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {selectedLesson.youtubeId ? (
              <div className="aspect-video w-full relative bg-black">
                <iframe
                  id={`youtube-iframe-${selectedLesson.id}`}
                  src={`https://www.youtube.com/embed/${selectedLesson.youtubeId}`}
                  title={selectedLesson.titleAr}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-indigo-950/20 flex flex-col items-center justify-center p-8 text-center gap-3">
                <Play className="w-12 h-12 text-indigo-400" />
                <p className="text-slate-300 font-bold">لم يتم إدراج فيديو لهذا الأسبوع بعد</p>
              </div>
            )}
            
            {/* Lesson details bar */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedLesson.titleAr}</h3>
                  <p className="text-xs text-slate-500 ltr-dir">{selectedLesson.title}</p>
                </div>
                
                <button
                  id="complete-lesson-btn"
                  onClick={handleCompleteToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                      : "bg-[#1e293b] border-white/10 text-slate-300 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCompleted ? "مكتمل (تمت الإضافة)" : "تحديد كمقروء ومكتمل"}</span>
                </button>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">ملخص المحتوى</h4>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
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
                <h3 className="text-md font-bold text-white">اختبر فهمك للدرس (+15 نقطة)</h3>
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
                        className={`text-right p-4 rounded-xl border text-sm transition-all duration-150 flex items-center justify-between gap-4 font-medium ${
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
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                {quizSubmitted ? (
                  <div className="flex items-center gap-2">
                    {quizSuccess ? (
                      <p className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>إجابة صحيحة وممتازة! أحسنت.</span>
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <p className="text-rose-400 text-sm font-semibold">إجابة خاطئة، حاول مرة أخرى!</p>
                        <button
                          onClick={resetQuiz}
                          className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 underline"
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

                <span className="text-xs text-slate-500">سؤال تفاعلي واحد لتأكيد استيعابك للمعلومات</span>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
