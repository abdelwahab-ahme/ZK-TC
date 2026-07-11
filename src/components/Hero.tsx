import { Facebook, Youtube, MessageCircle, Terminal, Cpu, Layers } from "lucide-react";
import { motion } from "motion/react";

export default function Hero({ siteSettings }: { siteSettings: any }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#070b16] to-[#0a0f1d] py-16 px-6 border-b border-white/5 rtl-dir">
      {/* Absolute background visual lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-12 relative z-10">
        
        {/* Interactive Simulated Video/GIF Visual component */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] aspect-video bg-[#0d1527] border-2 border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/50 relative group"
          >
            {/* Top terminal bar */}
            <div className="bg-[#131b2e] px-4 py-2 flex items-center justify-between border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider ltr-dir">zakora_compiler.sh</span>
            </div>

            {/* Terminal coding screen with animations */}
            <div className="p-5 font-mono text-xs text-left ltr-dir h-[210px] flex flex-col justify-between select-none">
              <div className="space-y-2">
                <p className="text-emerald-400 font-bold">$ run zakora_intro.py</p>
                <motion.p 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
                  className="text-slate-300 overflow-hidden whitespace-nowrap border-r-2 border-indigo-500 pr-1"
                >
                  import tutor_profile as abdelwahab
                </motion.p>
                <p className="text-[#38bdf8]">abdelwahab.skills = ["CS50", "SQL", "Teaching", "Web"]</p>
                <p className="text-[#a855f7]">abdelwahab.mission = "Learn programming simply 🚀"</p>
                <p className="text-indigo-400">print(abdelwahab.get_welcome_message())</p>
              </div>

              {/* Output block */}
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-indigo-950/40 border border-indigo-500/20 p-3 rounded-lg text-indigo-300 font-semibold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Hello, World! Welcome to Zakora-TC</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full active-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Glowing bottom line */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />
          </motion.div>
        </div>

        {/* Text Presentation and Socials */}
        <div className="w-full lg:w-1/2 text-center lg:text-right space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>مستقبلك المهني يبدأ من هنا</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              أهلاً بك، أنا <br className="hidden sm:inline" />
              <span className="bg-gradient-to-l from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {siteSettings?.heroTitleAr || "عبدالوهاب أحمد"}
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 font-medium">
              {siteSettings?.heroSubAr || "تعلّم البرمجة ببساطة ومتعة واحترافية كاملة"}
            </p>
          </motion.div>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            {siteSettings?.heroDescAr || "نقدم لك دليلاً علمياً شاملاً مدعوماً بالتطبيقات التفاعلية، لمساعدتك في فهم لغات البرمجة وتصميم قواعد البيانات واجتياز كبرى الدورات التدريبية كـ CS50 بنجاح تام وبأبسط أسلوب ممكن."}
          </p>

          {/* Social Links Icons */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-3">
            <a 
              href={siteSettings?.fbUrl || "https://www.facebook.com/share/1ChnEuKfZo/"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-[#1877f2]/20"
              title="فيسبوك"
            >
              <Facebook className="w-5 h-5" />
            </a>
            
            <a 
              href={siteSettings?.waUrl || "https://wa.me/201286865533"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-[#25d366]/10 border border-[#25d366]/20 flex items-center justify-center text-[#25d366] hover:bg-[#25d366] hover:text-white hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-[#25d366]/20"
              title="واتساب"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            
            <a 
              href={siteSettings?.ytUrl || "https://youtube.com/@abdelwahabhagag-ml2pg?si=MfUqWFofqvOKDZX_"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000] hover:bg-[#ff0000] hover:text-white hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-[#ff0000]/20"
              title="يوتيوب"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
