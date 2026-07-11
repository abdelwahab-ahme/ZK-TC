import { Info, ShieldCheck, Target, Heart, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

export default function AboutUs() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto rtl-dir space-y-12">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <Info className="w-8 h-8 text-indigo-500" />
          <span>من نحن - Zakora-TC</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          تعرف على رؤيتنا وهدفنا في تبسيط علوم الحاسب وقواعد البيانات وتطوير الويب في العالم العربي
        </p>
      </div>

      {/* Intro Box */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-1">رسالة رئيسية من الأستاذ عبدالوهاب أحمد</h3>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-semibold">
          هدفنا هو أن نقوم بتأسيسك في البرمجة من خلال وضع خطة سهلة ومبسطة تجعلك تتقدم بثبات نحو النجاح. 
          نحن هنا لدعمك خطوة بخطوة، حتى تصل إلى مستوى احترافي يفتح لك آفاقاً واسعة في المستقبل وتصميم الحلول التقنية المتميزة.
        </p>
      </div>

      {/* Key Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white">رؤيتنا التعليمية</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            نسعى لخلق جيل متمكن من المبرمجين العرب القادرين على صياغة الحلول البرمجية المتكاملة، وليس مجرد حفظ الأكواد وصياغة الجمل البرمجية الجاهزة. التأسيس السليم هو سلاحك للتفوق.
          </p>
        </div>

        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white">الجودة والثقة الفنية</h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            نقدم لك دورات معتمدة دولياً ومبسطة بالكامل بالعامية المصرية الراقية، مع دعم فني متواصل وحل مشكلات حية داخل المنصة لضمان الفهم العملي 100% دون تشتت.
          </p>
        </div>
      </div>

      {/* Tutor Profile Block */}
      <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-indigo-500/30 text-5xl flex items-center justify-center shadow-inner shrink-0">
          👨‍💻
        </div>
        
        <div className="space-y-3 text-center sm:text-right">
          <div>
            <h4 className="text-lg font-bold text-white">المهندس عبدالوهاب أحمد</h4>
            <p className="text-xs text-indigo-400 font-semibold">مدرس علوم الحاسب ومطور واجهات متكامل</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
            خبرة أكثر من 6 سنوات في البرمجة وتصميم النظم وقواعد البيانات. قمت بتدريس دورة CS50 ومسارات الويب لمئات الطلاب في الوطن العربي ومساعدتهم في الالتحاق بالوظائف الشاغرة بمختلف الشركات.
          </p>
        </div>
      </div>

    </div>
  );
}
