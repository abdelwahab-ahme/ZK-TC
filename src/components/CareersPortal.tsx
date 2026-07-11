import React, { useState, useEffect } from "react";
import { JobPosition, JobApplication } from "../types";
import { 
  Briefcase, Send, MapPin, DollarSign, Clock, FileText, 
  CheckCircle2, AlertCircle, Bookmark, ClipboardList 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CareersPortalProps {
  username: string;
  jobPositions: JobPosition[];
}

export default function CareersPortal({ username, jobPositions }: CareersPortalProps) {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  // Form states
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantSkills, setApplicantSkills] = useState("");
  const [cvSummary, setCvSummary] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const savedApps = localStorage.getItem("job_applications");
    if (savedApps) {
      setApplications(JSON.parse(savedApps));
    }
  }, []);

  const handleApplyClick = (job: JobPosition) => {
    setSelectedJob(job);
    setSuccessMsg(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);

    const newApplication: JobApplication = {
      jobId: selectedJob.id,
      jobTitle: selectedJob.titleAr,
      name: username,
      email: applicantEmail,
      phone: applicantPhone,
      skills: applicantSkills,
      cvSummary: cvSummary,
      status: "قيد المراجعة",
      appliedAt: new Date().toISOString().split("T")[0]
    };

    const updated = [newApplication, ...applications];
    setApplications(updated);
    localStorage.setItem("job_applications", JSON.stringify(updated));

    // Reset form
    setApplicantEmail("");
    setApplicantPhone("");
    setApplicantSkills("");
    setCvSummary("");
    setIsSubmitting(false);
    setSelectedJob(null);
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto rtl-dir">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <Briefcase className="w-8 h-8 text-rose-400" />
          <span>بوابة التوظيف وفرص المبرمجين</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          نصل مبرمجي المنصة وخريجي مساراتنا المتميزين بالفرص المهنية والمساعدة التعليمية لإطلاق مسيرتهم العملية بثبات
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: List of Jobs and My Applications (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 pb-2 border-b border-white/5 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span>الفرص والوظائف الفنية الشاغرة ({jobPositions.length})</span>
          </h3>

          <div className="space-y-6">
            {jobPositions.map((job) => {
              const alreadyApplied = applications.some((app) => app.jobId === job.id);
              
              return (
                <div key={job.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg glow-card">
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white mb-1">{job.titleAr}</h4>
                      <p className="text-xs text-slate-500 font-mono ltr-dir">{job.title}</p>
                    </div>
                    
                    <span className="text-xs font-bold text-rose-400 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 self-start sm:self-center">
                      {job.typeAr}
                    </span>
                  </div>

                  {/* Metadata labels */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{job.locationAr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="ltr-dir">Remote / Hybrid</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                    {job.descriptionAr}
                  </p>

                  {/* Requirements List */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">شروط ومتطلبات الوظيفة:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-medium pl-2 pr-2">
                      {job.requirementsAr.map((req, idx) => (
                        <li key={idx} className="leading-relaxed">{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Action */}
                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    {alreadyApplied ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم التقديم بالفعل</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(job)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-rose-600/10"
                      >
                        تقدم الآن للوظيفة
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Applications list */}
          {applications.length > 0 && (
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 pb-2 border-b border-white/5 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>طلبات التوظيف الخاصة بي ({applications.length})</span>
              </h3>

              <div className="space-y-3">
                {applications.map((app, idx) => (
                  <div key={idx} className="bg-[#131b2e]/60 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{app.jobTitle}</h4>
                      <p className="text-[10px] text-slate-500">تاريخ التقديم: {app.appliedAt}</p>
                    </div>

                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Apply Form Modal / Workspace (5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative"
              >
                <div className="pb-3 border-b border-white/5">
                  <h3 className="text-md font-bold text-white">استمارة التقديم</h3>
                  <p className="text-xs text-rose-400">لـ {selectedJob.titleAr}</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="applicant-name" className="block text-xs font-semibold text-slate-400 mb-1">الاسم الكامل</label>
                    <input
                      id="applicant-name"
                      type="text"
                      value={username}
                      disabled
                      className="w-full bg-[#1e293b]/50 border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-400 cursor-not-allowed text-right font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="applicant-email" className="block text-xs font-semibold text-slate-400 mb-1">البريد الإلكتروني</label>
                    <input
                      id="applicant-email"
                      type="email"
                      placeholder="مثال: code@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      required
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                    />
                  </div>

                  <div>
                    <label htmlFor="applicant-phone" className="block text-xs font-semibold text-slate-400 mb-1">رقم الهاتف أو الواتساب</label>
                    <input
                      id="applicant-phone"
                      type="tel"
                      placeholder="مثال: 01286865533"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="applicant-skills" className="block text-xs font-semibold text-slate-400 mb-1">أبرز المهارات البرمجية التي تتقنها</label>
                    <input
                      id="applicant-skills"
                      type="text"
                      placeholder="مثال: SQL, C language, Pointers, Git"
                      value={applicantSkills}
                      onChange={(e) => setApplicantSkills(e.target.value)}
                      required
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                    />
                  </div>

                  <div>
                    <label htmlFor="cv-summary" className="block text-xs font-semibold text-slate-400 mb-1">نبذة عن مسيرتك البرمجية وتطبيقاتك</label>
                    <textarea
                      id="cv-summary"
                      placeholder="اكتب خلاصة مشاريعك التي بنيتها ومشاركتك في الكورسات التدريبية باختصار..."
                      value={cvSummary}
                      onChange={(e) => setCvSummary(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="submit-job-app-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-1/2 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-lg"
                    >
                      إرسال الطلب الفني
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="w-1/2 py-2 bg-[#1e293b] hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                    >
                      إلغاء الأمر
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#0f172a]/60 border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]"
              >
                <FileText className="w-10 h-10 text-slate-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-300">لم يتم اختيار وظيفة بعد</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    تصفح الوظائف المتاحة من القائمة على اليمين وانقر على "تقدم الآن" لتعبئة بيانات السيرة الذاتية هنا
                  </p>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم إرسال طلب التقديم بنجاح! نتابع معك قريباً.</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
