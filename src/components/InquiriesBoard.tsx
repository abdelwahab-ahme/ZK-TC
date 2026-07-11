import React, { useState, useEffect } from "react";
import { mockInquiries } from "../data";
import { Inquiry } from "../types";
import { 
  HelpCircle, Send, MessageCircle, User, Calendar, 
  CheckCircle2, Sparkles, MessageSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InquiriesBoardProps {
  username: string;
}

export default function InquiriesBoard({ username }: InquiriesBoardProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    // Load from localStorage or set initial seed
    const savedInq = localStorage.getItem("platform_inquiries");
    if (savedInq) {
      setInquiries(JSON.parse(savedInq));
    } else {
      setInquiries(mockInquiries);
      localStorage.setItem("platform_inquiries", JSON.stringify(mockInquiries));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const content = newContent.trim();

    if (!title || !content) return;

    setIsSubmitting(true);

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      title,
      author: username,
      content,
      timestamp: "الآن",
      replies: []
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    localStorage.setItem("platform_inquiries", JSON.stringify(updated));

    // Clear inputs
    setNewTitle("");
    setNewContent("");
    setIsSubmitting(false);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 4000);

    // Simulate Tutor automatic reply after 5 seconds to provide absolute professionalism!
    setTimeout(() => {
      const autoReplyText = `أهلاً بك يا ${username}! سؤالك ممتاز جداً وفي غاية الأهمية. سأقوم بمراجعة هذا الموضوع وكتابة رد مفصل لك أو مناقشته مباشرة في بث المحاضرة القادمة. استمر في السعي والتعلم يا بطل! 🚀`;
      
      const replyObj = {
        id: `rep-${Date.now()}`,
        author: "المهندس عبدالوهاب أحمد",
        content: autoReplyText,
        timestamp: "منذ دقيقة",
        isTutor: true
      };

      newInquiry.replies.push(replyObj);

      // Trigger update
      const currentSaved = localStorage.getItem("platform_inquiries");
      if (currentSaved) {
        const parsed: Inquiry[] = JSON.parse(currentSaved);
        const itemIdx = parsed.findIndex(i => i.id === newInquiry.id);
        if (itemIdx !== -1) {
          parsed[itemIdx].replies = [replyObj];
          setInquiries(parsed);
          localStorage.setItem("platform_inquiries", JSON.stringify(parsed));
        }
      }
    }, 5000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto rtl-dir">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8 text-cyan-400" />
          <span>ساحة الاستفسارات والنقاش الفني</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          اطرح استفساراتك حول الكود أو الأخطاء التي تظهر لك، وسيرد عليك المهندس عبدالوهاب أحمد أو أحد الطلاب المميزين فوراً
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Ask a Question Form (1 col) */}
        <div className="lg:col-span-1 bg-[#0f172a] border border-white/5 rounded-2xl p-6 h-fit space-y-6">
          <div>
            <h3 className="text-md font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>اطرح سؤالاً جديداً</span>
            </h3>
            <p className="text-xs text-slate-400">اطرح سؤالك بوضوح وتفصيل للحصول على أفضل إجابة برمجية</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inquiry-title" className="block text-xs font-semibold text-slate-400 mb-1.5">عنوان الاستفسار</label>
              <input
                id="inquiry-title"
                type="text"
                placeholder="مثال: مشكلة في مصفوفات لغة C"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
              />
            </div>

            <div>
              <label htmlFor="inquiry-content" className="block text-xs font-semibold text-slate-400 mb-1.5">تفاصيل المشكلة والأكواد</label>
              <textarea
                id="inquiry-content"
                placeholder="اكتب تفاصيل الكود أو الخطأ البرمجي هنا بالتفصيل..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={5}
                className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right resize-none"
              />
            </div>

            <button
              id="submit-inquiry-btn"
              type="submit"
              disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                newTitle.trim() && newContent.trim()
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border-white/5"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>نشر الاستفسار</span>
            </button>
          </form>

          <AnimatePresence>
            {submittedSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم نشر سؤالك بنجاح! جاري مراجعته والرد عليه.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: List of Inquiries (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 pb-2 border-b border-white/5 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>الاستفسارات والأسئلة الأخيرة ({inquiries.length})</span>
          </h3>

          {inquiries.length === 0 ? (
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center text-slate-500">
              <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p>لا توجد استفسارات منشورة حالياً، كن أول من يسأل!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
                  {/* Inquiry Header */}
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">{inq.title}</h4>
                      <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1 text-indigo-400">
                          <User className="w-3.5 h-3.5" />
                          <span>{inq.author}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{inq.timestamp}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      سؤال
                    </div>
                  </div>

                  {/* Inquiry Content */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                    {inq.content}
                  </p>

                  {/* Replies space */}
                  {inq.replies.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الإجابات والردود الحالية:</p>
                      
                      {inq.replies.map((reply) => (
                        <div 
                          key={reply.id} 
                          className={`p-4 rounded-xl border relative overflow-hidden ${
                            reply.isTutor 
                              ? "bg-indigo-600/5 border-indigo-500/20" 
                              : "bg-[#131b2e] border-white/5"
                          }`}
                        >
                          {reply.isTutor && (
                            <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg">
                              المدرس
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-4 mb-2.5">
                            <span className={`text-xs font-bold ${reply.isTutor ? "text-indigo-300" : "text-slate-300"}`}>
                              {reply.author}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono ltr-dir">{reply.timestamp}</span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
