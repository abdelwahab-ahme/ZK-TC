import { BookOpen, Map, Code, HelpCircle, MessageSquare, Briefcase } from "lucide-react";
import { motion } from "motion/react";

interface HomeGridProps {
  onCardClick: (view: string) => void;
}

export default function HomeGrid({ onCardClick }: HomeGridProps) {
  const cards = [
    {
      id: "learn",
      title: "مركز التعلم",
      subtitle: "تعلم",
      description: "نقدم لك محاضرات متميزة ودورات منظمة لمساعدتك دائماً على تحقيق التفوق والنجاح.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-400",
      bgColor: "hover:border-blue-500/30"
    },
    {
      id: "roadmap",
      title: "خريطة التعلم",
      subtitle: "خريطة تعلم",
      description: "مسار تعليمي تفاعلي خطوة بخطوة للوصول إلى الاحترافية في البرمجة وتطوير الويب.",
      icon: Map,
      color: "from-purple-500 to-indigo-600",
      iconColor: "text-purple-400",
      bgColor: "hover:border-purple-500/30"
    },
    {
      id: "problem-solving",
      title: "حل المشكلات",
      subtitle: "حل المشكلات",
      description: "مجموعة من الأسئلة والتحديات البرمجية لاختبار مهاراتك وتثبيت معلوماتك العملية.",
      icon: Code,
      color: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-400",
      bgColor: "hover:border-emerald-500/30"
    },
    {
      id: "inquiries",
      title: "ساحة الاستفسارات",
      subtitle: "الاستفسارات",
      description: "اطرح أسئلتك البرمجية وتلقى إجابات وحلول وافية من المهندس عبدالوهاب وزملائك.",
      icon: HelpCircle,
      color: "from-cyan-500 to-blue-600",
      iconColor: "text-cyan-400",
      bgColor: "hover:border-cyan-500/30"
    },
    {
      id: "reviews",
      title: "آراء الطلاب",
      subtitle: "الاراء",
      description: "نستعرض آراء وقصص نجاح طلابنا الملهمة لتكون حافزاً ومصدر ثقة لك في رحلتك.",
      icon: MessageSquare,
      color: "from-amber-500 to-orange-600",
      iconColor: "text-amber-400",
      bgColor: "hover:border-amber-500/30"
    },
    {
      id: "careers",
      title: "بوابة التوظيف",
      subtitle: "التوظيف",
      description: "مجموعة من الفرص والوظائف البرمجية المتاحة لتطلق مسيرتك المهنية بثقة.",
      icon: Briefcase,
      color: "from-rose-500 to-red-600",
      iconColor: "text-rose-400",
      bgColor: "hover:border-rose-500/30"
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">اختر مسارك اليوم</h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          انقر فوق أي من الأقسام التفاعلية بالأسفل لبدء التعلّم أو الاستعلام أو حل المشكلات التقنية
        </p>
      </div>

      {/* Cards Grid */}
      <div id="home-modules-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {cards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => onCardClick(card.id)}
              className={`glow-card bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 cursor-pointer group flex flex-col justify-between transition-all duration-300 ${card.bgColor}`}
            >
              <div>
                {/* Header visual */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-slate-800/40 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 px-2.5 py-1 rounded-full bg-slate-800/30 border border-white/5">
                    {card.subtitle}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  {card.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Action Prompt */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-end text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>تصفح القسم الآن &larr;</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
