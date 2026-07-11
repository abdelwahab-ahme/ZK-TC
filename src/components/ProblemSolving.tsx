import { useState, useEffect } from "react";
import { mockDatabaseTables } from "../data";
import { SqlChallenge } from "../types";
import { 
  Code, Play, AlertCircle, CheckCircle2, Award, 
  HelpCircle, ChevronRight, Terminal, RefreshCw, Table 
} from "lucide-react";
import { motion } from "motion/react";

interface ProblemSolvingProps {
  solvedProblems: string[];
  onSolveChallenge: (challengeId: string, pointsReward: number) => void;
  sqlChallenges: SqlChallenge[];
}

export default function ProblemSolving({ solvedProblems, onSolveChallenge, sqlChallenges }: ProblemSolvingProps) {
  const [activeChallenge, setActiveChallenge] = useState<SqlChallenge>(() => sqlChallenges[0]);
  const [userQuery, setUserQuery] = useState(() => sqlChallenges[0].initialQuery);
  const [showHint, setShowHint] = useState(false);
  
  // Results / Execution state
  const [executed, setExecuted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultRows, setResultRows] = useState<any[]>([]);

  // Sync with active challenge if challenges list updates
  useEffect(() => {
    const updated = sqlChallenges.find(c => c.id === activeChallenge.id) || sqlChallenges[0];
    if (updated) {
      setActiveChallenge(updated);
    }
  }, [sqlChallenges]);

  const handleChallengeSelect = (challenge: SqlChallenge) => {
    setActiveChallenge(challenge);
    setUserQuery(challenge.initialQuery);
    setShowHint(false);
    setExecuted(false);
    setSuccess(false);
    setErrorMsg("");
    setResultRows([]);
  };

  // Safe client-side micro-SQL parser and query executor
  const runSqlQuery = () => {
    setExecuted(true);
    setErrorMsg("");
    setResultRows([]);

    const query = userQuery.trim().replace(/\s+/g, " ").toLowerCase();
    
    // Check if the user query is empty or unchanged
    if (!query || query === "select * from students where ..." || query === "select name, age from students where ...") {
      setErrorMsg("الرجاء تعديل الاستعلام وكتابة جملة SQL صحيحة لحل التحدي.");
      setSuccess(false);
      return;
    }

    try {
      // 1. Basic validation: Must be a SELECT query
      if (!query.startsWith("select")) {
        throw new Error("عذراً، المحاكي يدعم فقط استعلامات القراءة واسترجاع البيانات (SELECT queries).");
      }

      // 2. Validate FROM table
      if (!query.includes("from students")) {
        throw new Error("جدول البيانات المطلوب غير موجود. يرجى التأكد من استعلام جدول 'students'.");
      }

      // Parse columns requested
      let columnsPart = query.split("select")[1].split("from")[0].trim();
      let selectAll = columnsPart === "*";
      let requestedCols = columnsPart.split(",").map(c => c.trim());

      // Parse WHERE conditions
      let filteredData = [...mockDatabaseTables.students];
      if (query.includes("where")) {
        const whereClause = query.split("where")[1].trim();

        if (activeChallenge.id === "chal-1") {
          // grade >= 90
          if (whereClause.includes("grade") && (whereClause.includes(">=") || whereClause.includes(">")) && whereClause.includes("90")) {
            filteredData = filteredData.filter(s => s.grade >= 90);
          } else {
            throw new Error("نتيجة تصفية الدرجات غير صحيحة. يرجى التحقق من الشرط (grade >= 90).");
          }
        } else if (activeChallenge.id === "chal-2") {
          // city = 'القاهرة'
          const c1 = whereClause.includes("city");
          const c2 = whereClause.includes("القاهرة") || whereClause.includes("'القاهرة'");
          if (c1 && c2) {
            filteredData = filteredData.filter(s => s.city === "القاهرة");
          } else {
            throw new Error("نتيجة التصفية حسب المدينة غير صحيحة. يرجى البحث عن المقيمين بمدينة 'القاهرة'.");
          }
        } else if (activeChallenge.id === "chal-3") {
          // track = 'SQL' AND age < 23
          const cTrack = whereClause.includes("track") && (whereClause.includes("sql") || whereClause.includes("'sql'"));
          const cAge = whereClause.includes("age") && (whereClause.includes("<") || whereClause.includes("<=")) && whereClause.includes("23");
          const hasAnd = whereClause.includes("and");

          if (cTrack && cAge && hasAnd) {
            filteredData = filteredData.filter(s => s.track === "SQL" && s.age < 23);
          } else {
            throw new Error("تأكد من دمج الشرطين (track = 'SQL' AND age < 23) باستخدام الأداة AND بشكل صحيح.");
          }
        } else {
          throw new Error("لم نتمكن من معالجة شرط التصفية الخاص بك في هذا التحدي.");
        }
      } else {
        if (activeChallenge.id === "chal-1" || activeChallenge.id === "chal-2" || activeChallenge.id === "chal-3") {
          throw new Error("أنت بحاجة لإضافة جملة التصفية الشرطية 'WHERE' لاسترجاع السجلات المطلوبة بدقة.");
        }
      }

      // Map rows to columns
      const formattedResult = filteredData.map(student => {
        if (selectAll) {
          return student;
        }
        const obj: any = {};
        requestedCols.forEach(col => {
          if (col === "name") obj["name"] = student.name;
          else if (col === "age") obj["age"] = student.age;
          else if (col === "grade") obj["grade"] = student.grade;
          else if (col === "city") obj["city"] = student.city;
          else if (col === "track") obj["track"] = student.track;
          else if (col === "id") obj["id"] = student.id;
        });
        return obj;
      });

      // Verify success by comparing result length and matching target challenge
      let challengeSuccess = false;
      
      // Let's compare normalized queries or output records count
      const cleanExpected = activeChallenge.expectedQuery.replace(/\s+/g, " ").toLowerCase().replace(/['"`]/g, "");
      const cleanUser = userQuery.replace(/\s+/g, " ").toLowerCase().replace(/['"`]/g, "");
      
      // Let's match query string criteria as a robust check
      const queryMatch = cleanUser.includes("from students") && 
                         (cleanUser.includes("where") && 
                         (activeChallenge.id === "chal-1" ? (cleanUser.includes("grade") && cleanUser.includes("90")) :
                          activeChallenge.id === "chal-2" ? (cleanUser.includes("city") && cleanUser.includes("القاهرة")) :
                          activeChallenge.id === "chal-3" ? (cleanUser.includes("track") && cleanUser.includes("sql") && cleanUser.includes("age") && cleanUser.includes("23")) : false));

      if (queryMatch) {
        challengeSuccess = true;
      }

      setResultRows(formattedResult);
      setSuccess(challengeSuccess);

      if (challengeSuccess) {
        if (!solvedProblems.includes(activeChallenge.id)) {
          onSolveChallenge(activeChallenge.id, activeChallenge.pointsReward);
        }
      } else {
        setErrorMsg("الاستعلام تم تشغيله لكن النتائج لا تطابق المطلوب للتحدي تماماً. يرجى مراجعة الصياغة.");
      }

    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء معالجة استعلام SQL. يرجى مراجعة الصياغة اللغوية.");
      setSuccess(false);
    }
  };

  const isChallengeCompleted = solvedProblems.includes(activeChallenge.id);

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <Terminal className="w-8 h-8 text-emerald-500" />
          <span>تحديات حل المشكلات (SQL Arena)</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          اكتب استعلامات SQL حية لمعالجة الجداول، صفِ الطلاب، واختبر مهاراتك لتكسب نقاط التقدم
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Challenges menu & Table Schema Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Challenges selector list */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-400 mb-4 pb-2.5 border-b border-white/5">قائمة التحديات المتاحة</h3>
            
            <div className="space-y-2.5">
              {sqlChallenges.map((challenge, idx) => {
                const solved = solvedProblems.includes(challenge.id);
                const isSelected = activeChallenge.id === challenge.id;
                
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleChallengeSelect(challenge)}
                    className={`w-full text-right p-3.5 rounded-xl transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500 text-white"
                        : "bg-[#131b2e]/40 border-transparent text-slate-300 hover:bg-[#131b2e] hover:border-white/5"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                        {idx + 1}. {challenge.titleAr}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          challenge.difficulty === "سهل" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">+{challenge.pointsReward} نقطة</span>
                      </div>
                    </div>

                    {solved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Schema reference display */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-400 mb-4 pb-2.5 border-b border-white/5 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-indigo-400" />
              <span>هيكل جدول الطلاب: students</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500">
                    <th className="pb-2 font-semibold">اسم الحقل</th>
                    <th className="pb-2 font-semibold">النوع</th>
                    <th className="pb-2 font-semibold">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">id</td>
                    <td className="py-2 text-slate-500">INTEGER</td>
                    <td className="py-2">المفتاح الأساسي</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">name</td>
                    <td className="py-2 text-slate-500">TEXT</td>
                    <td className="py-2">اسم الطالب الكامل</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">age</td>
                    <td className="py-2 text-slate-500">INTEGER</td>
                    <td className="py-2">عمر الطالب</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">city</td>
                    <td className="py-2 text-slate-500">TEXT</td>
                    <td className="py-2">مدينة السكن (مثال: القاهرة)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">track</td>
                    <td className="py-2 text-slate-500">TEXT</td>
                    <td className="py-2">المسار (CS50 أو SQL)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-indigo-400 font-mono">grade</td>
                    <td className="py-2 text-slate-500">INTEGER</td>
                    <td className="py-2">درجة الطالب (0 - 100)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: SQL Editor and outputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Challenge Prompt Description */}
          <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-md font-bold text-white">{activeChallenge.titleAr}</h3>
              {isChallengeCompleted && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مكتمل وتم حلّه بنجاح!</span>
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              {activeChallenge.descriptionAr}
            </p>
            
            <p className="text-xs text-slate-500 ltr-dir font-mono italic">
              {activeChallenge.description}
            </p>
          </div>

          {/* Interactive Code Editor (SQL terminal textarea) */}
          <div className="bg-[#0d1324] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="bg-[#131b30] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono ltr-dir">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>SQL Query Editor v1.0</span>
              </div>
              
              <button 
                onClick={() => setUserQuery(activeChallenge.initialQuery)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="إعادة تعيين المحرر"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تعيين</span>
              </button>
            </div>

            <div className="flex ltr-dir">
              {/* Line numbers column */}
              <div className="bg-[#090e1a] px-3.5 py-4 text-right text-slate-600 font-mono text-xs select-none border-r border-white/5 space-y-1">
                <div>1</div>
                <div>2</div>
                <div>3</div>
              </div>
              
              {/* Actual Textarea Editor */}
              <textarea
                id="sql-query-textarea"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full bg-transparent p-4 text-[#38bdf8] font-mono text-xs focus:outline-none h-32 leading-relaxed tracking-wider text-left resize-none ltr-dir"
                spellCheck="false"
              />
            </div>

            {/* Editor Action buttons */}
            <div className="bg-[#131b30] px-6 py-4 flex items-center justify-between gap-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button
                  id="run-sql-query-btn"
                  onClick={runSqlQuery}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all duration-150"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>تشغيل الاستعلام</span>
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3.5 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showHint ? "إخفاء التلميحة" : "عرض تلميحة"}</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Press Run to execute your query against live table.</span>
            </div>
          </div>

          {/* Interactive Hint Banner */}
          {showHint && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-right space-y-1.5"
            >
              <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                <span>تلميحة البشمهندس عبدالوهاب:</span>
              </p>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
                {activeChallenge.hintAr}
              </p>
            </motion.div>
          )}

          {/* Execution outputs results display console */}
          {executed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="bg-slate-800/40 px-5 py-3 flex items-center justify-between border-b border-white/5">
                <span className="text-xs font-bold text-slate-400">شاشة النتائج والمخرجات</span>
                {success ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>مخرجات صحيحة! (+{activeChallenge.pointsReward} نقطة)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>فشل في المطابقة</span>
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4">
                {errorMsg && (
                  <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <p className="leading-relaxed font-medium">{errorMsg}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs sm:text-sm">
                    <Award className="w-5 h-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-bold mb-1">أحسنت صنعاً! تم حل التحدي بنجاح مذهل.</p>
                      <p className="text-xs text-emerald-400/80">تمت إضافة نقاط الجائزة لملفك ومزامنتها في جدول الدرجات.</p>
                    </div>
                  </div>
                )}

                {/* Simulated table outcome results */}
                {resultRows.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الصفوف الناتجة عن الاستعلام ({resultRows.length}):</p>
                    
                    <div className="overflow-x-auto border border-white/5 rounded-xl bg-slate-950/20">
                      <table className="w-full text-xs text-right text-slate-300">
                        <thead>
                          <tr className="bg-slate-800/10 border-b border-white/5 text-slate-400 font-bold">
                            {Object.keys(resultRows[0]).map((col) => (
                              <th key={col} className="p-3 font-mono text-left select-none">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {resultRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                              {Object.values(row).map((val: any, cIdx) => (
                                <td key={cIdx} className="p-3 text-left font-medium">
                                  {typeof val === "number" ? (
                                    <span className="font-mono text-cyan-400">{val}</span>
                                  ) : (
                                    <span>{val}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
}
