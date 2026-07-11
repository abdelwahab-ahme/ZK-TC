import React, { useState, useEffect } from "react";
import { mockReviews } from "../data";
import { Review } from "../types";
import { 
  Star, MessageCircle, PenTool, CheckCircle2, 
  MessageSquare, Sparkles, Heart 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReviewsWallProps {
  username: string;
}

export default function ReviewsWall({ username }: ReviewsWallProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const savedReviews = localStorage.getItem("platform_reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(mockReviews);
      localStorage.setItem("platform_reviews", JSON.stringify(mockReviews));
    }
  }, []);

  const handleRatingSelect = (rating: number) => {
    setNewRating(rating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = newContent.trim();
    if (!content) return;

    setIsSubmitting(true);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: username,
      rating: newRating,
      content,
      timestamp: new Date().toISOString().split("T")[0]
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem("platform_reviews", JSON.stringify(updated));

    setNewContent("");
    setNewRating(5);
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto rtl-dir">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <MessageSquare className="w-8 h-8 text-amber-500" />
          <span>آراء وتقييمات الطلاب والزملاء</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          نستمع لآراء طلابنا بشغف لتطوير المنصة باستمرار وتوفير أفضل تجربة دراسة لكافة المستويات البرمجية
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">متوسط التقييم العام</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-black text-white">{avgRating}</span>
            <span className="text-xl text-slate-500">/ 5.0</span>
          </div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-4 h-4 fill-current ${
                  s <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-slate-700"
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center flex flex-col justify-center space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي التقييمات المسجلة</p>
          <p className="text-4xl font-black text-indigo-400">{reviews.length}</p>
          <p className="text-xs text-slate-500">تقييم معتمد من مستخدمي المنصة</p>
        </div>

        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center flex flex-col justify-center space-y-1.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">نسبة رضاء الطلاب</p>
          <p className="text-4xl font-black text-emerald-400">100%</p>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>بناءً على التفاعل الفني والدعم المستمر</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Write a Review (4 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-white/5 rounded-2xl p-6 h-fit space-y-6">
          <div>
            <h3 className="text-md font-bold text-white mb-1.5 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-amber-500" />
              <span>شاركنا تجربتك في المنصة</span>
            </h3>
            <p className="text-xs text-slate-400">رأيك يسعدنا ويوجه الطلاب الجدد لاتخاذ قرار التعلم الأمثل</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">تقييمك بالنجوم:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingSelect(star)}
                    className="p-1 focus:outline-none hover:scale-110 transition-transform"
                    title={`${star} نجوم`}
                  >
                    <Star 
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        star <= newRating 
                          ? "text-amber-400 fill-current" 
                          : "text-slate-700 hover:text-slate-500"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-content" className="block text-xs font-semibold text-slate-400 mb-2">رأيك الصادق في الشرح والمنصة</label>
              <textarea
                id="review-content"
                placeholder="اكتب تفاصيل رأيك في دورات الأستاذ عبد الوهاب هنا بكل أمانة..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={4}
                className="w-full bg-[#131b2e] border border-white/5 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right resize-none"
              />
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                newContent.trim()
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border-white/5"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال رأيي وتقييمي</span>
            </button>
          </form>

          <AnimatePresence>
            {submitSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم نشر مراجعتك بنجاح! ممتنون لثقتك ودعمك.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Wall of reviews (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-sm font-bold text-slate-400 pb-2 border-b border-white/5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>ماذا يقول مبرمجو المنصة الجدد؟</span>
          </h3>

          <div className="grid grid-cols-1 gap-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-[#0f172a] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg glow-card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-300">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{rev.author}</h4>
                      <p className="text-[10px] text-slate-500 font-mono ltr-dir">{rev.timestamp}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 fill-current ${
                          star <= rev.rating ? "text-amber-400" : "text-slate-700"
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                  "{rev.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
