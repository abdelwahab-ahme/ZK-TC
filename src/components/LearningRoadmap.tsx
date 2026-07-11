import { useState } from "react";
import { 
  Milestone, CheckCircle2, ChevronRight, Award, 
  BookOpen, Terminal, Code, Database, Server, Compass 
} from "lucide-react";
import { motion } from "motion/react";

interface RoadmapNode {
  id: string;
  title: string;
  titleAr: string;
  category: "Foundations" | "Frontend" | "Backend" | "Databases";
  categoryAr: "تأسيس" | "واجهات" | "خلفيات" | "قواعد بيانات";
  skills: string[];
  description: string;
  descriptionAr: string;
  tutorTip: string;
  tutorTipAr: string;
}

interface LearningRoadmapProps {
  completedNodes: string[];
  onToggleNode: (nodeId: string, pointsChange: number) => void;
}

const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: "node-cs",
    title: "Computer Science Foundations",
    titleAr: "تأسيس علوم الحاسب",
    category: "Foundations",
    categoryAr: "تأسيس",
    skills: ["Binary", "Algorithms & Big O", "Compilers", "Memory Management"],
    description: "Learn how the computer works under the hood. Binary logic, data structures, and computer architecture.",
    descriptionAr: "فهم كيف يعمل الحاسب من الداخل، خوارزميات الترتيب والبحث، والتعرف على الذاكرة العشوائية وكيفية تمثيل البيانات الثنائية.",
    tutorTip: "CS50 Weeks 0 to 5 are your absolute golden gateway here. Don't skip pointers!",
    tutorTipAr: "الأسابيع الأولى من دورة CS50 لغاية أسبوع هياكل البيانات هي بوابتك الذهبية هنا. لا تتجاوز المؤشرات (Pointers)!"
  },
  {
    id: "node-html",
    title: "Web Basics (HTML & CSS)",
    titleAr: "أساسيات الويب وبناء الهيكل",
    category: "Foundations",
    categoryAr: "تأسيس",
    skills: ["HTML5 semantic tags", "CSS Grid & Flexbox", "Responsive Layouts"],
    description: "The core markup and styling languages of the web. Learn to structure layouts and style them nicely.",
    descriptionAr: "تعلم الهيكل البرمجي لصفحات الإنترنت ولغة التنسيق CSS، وبناء تصميمات متجاوبة مع جميع الشاشات والموبايل.",
    tutorTip: "Focus on CSS Flexbox and Grid. They will save you hundreds of hours.",
    tutorTipAr: "ركز على فهم Flexbox و Grid جيداً لأنهم أساس أي تصميم متجاوب حديث."
  },
  {
    id: "node-js",
    title: "JavaScript Programming",
    titleAr: "برمجة الويب بلغة JavaScript",
    category: "Frontend",
    categoryAr: "واجهات",
    skills: ["ES6+ Syntax", "DOM Manipulation", "Async/Await & Fetch API"],
    description: "Bring interactivity to your pages. Learn variables, conditional logic, loops, array methods, and fetching dynamic data.",
    descriptionAr: "لغة البرمجة التي تبث الروح والحيوية في صفحات الويب. تعلم المتغيرات، الدوال، والتعامل مع طلبات الـ API الخارجية.",
    tutorTip: "Practice by writing small apps like a calculator, then study promises & fetch.",
    tutorTipAr: "طبق كتابة الأكواد بنفسك بصناعة تطبيقات صغيرة مثل آلة حاسبة، ثم تعمق في كيفية طلب البيانات الحية."
  },
  {
    id: "node-react",
    title: "Modern React & Tailwind CSS",
    titleAr: "إطار العمل React والتصميم الذكي",
    category: "Frontend",
    categoryAr: "واجهات",
    skills: ["Components", "Hooks (useState, useEffect)", "Tailwind utilities"],
    description: "Learn component-based architecture for rich user experiences and write responsive CSS faster than ever.",
    descriptionAr: "تعلم بناء تطبيقات ويب احترافية باستخدام React المطور من فيسبوك وتنسيقه فائق السرعة عبر مكتبة Tailwind CSS.",
    tutorTip: "Make components small, reusable, and keep state management simple and clean.",
    tutorTipAr: "اجعل مكونات البرمجة (Components) صغيرة وقابلة لإعادة الاستخدام، وتجنب تعقيد الحالات العامة."
  },
  {
    id: "node-sql",
    title: "SQL & Relational Databases",
    titleAr: "قواعد البيانات العلاقتية ولغة SQL",
    category: "Databases",
    categoryAr: "قواعد بيانات",
    skills: ["Relational Schemas", "SELECT, JOINs, WHERE", "Database normalization"],
    description: "Learn database structures, query syntax, relations, joins, and optimizing table columns.",
    descriptionAr: "تعلم كيفية تصميم جداول مترابطة وتخزين البيانات وحمايتها، وكتابة استعلامات سريعة لاسترداد وتحديث البيانات.",
    tutorTip: "Inner and Left Joins are crucial. Solve as many challenges as you can in our sandbox!",
    tutorTipAr: "ربط الجداول (INNER and LEFT JOINs) أساسي جداً. قم بحل جميع تحديات التصفية المتاحة في موقعنا!"
  },
  {
    id: "node-backend",
    title: "Backend Development (Node.js/Express)",
    titleAr: "تطوير سيرفرات خلفية وتطبيقات الويب",
    category: "Backend",
    categoryAr: "خلفيات",
    skills: ["RESTful API design", "Routing & Middlewares", "JWT Authentication"],
    description: "Write backend servers, database drivers, authorization workflows, and deploy systems.",
    descriptionAr: "تعلم كيفية كتابة وبناء خوادم الويب (Web Servers)، وبناء بوابات حماية البيانات وتسجيل مستخدمين جدد بشكل احترافي.",
    tutorTip: "Understand HTTP status codes and middleware logic before connecting databases.",
    tutorTipAr: "افهم جيداً أكواد الـ HTTP وطريقة سير الطلبات (Middleware) قبل الشروع في ربط السيرفر بقواعد البيانات."
  }
];

export default function LearningRoadmap({ completedNodes, onToggleNode }: LearningRoadmapProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode>(ROADMAP_NODES[0]);

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node);
  };

  const isNodeDone = (nodeId: string) => completedNodes.includes(nodeId);

  const handleToggle = () => {
    const pointsChange = isNodeDone(selectedNode.id) ? -15 : 15;
    onToggleNode(selectedNode.id, pointsChange);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Foundations": return <Terminal className="w-5 h-5 text-purple-400" />;
      case "Frontend": return <Code className="w-5 h-5 text-blue-400" />;
      case "Databases": return <Database className="w-5 h-5 text-cyan-400" />;
      case "Backend": return <Server className="w-5 h-5 text-rose-400" />;
      default: return <Compass className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-7xl mx-auto rtl-dir">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
          <Milestone className="w-8 h-8 text-indigo-500" />
          <span>خريطة تعلم مبرمج الويب المتكامل</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          انقر فوق محطات التعلم التفاعلية لمعرفة ماذا تدرس، نصائح البشمهندس عبدالوهاب، ومارك المحطة كمكتملة (+15 نقطة)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vertical Roadmap Roadmap steps (4 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-white/5 rounded-2xl p-6 relative">
          <div className="absolute right-9 top-10 bottom-10 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500 z-0 opacity-40 hidden sm:block" />
          
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span>مسار رحلتك التقنية</span>
          </h3>

          <div className="space-y-6 relative z-10">
            {ROADMAP_NODES.map((node) => {
              const done = isNodeDone(node.id);
              const selected = selectedNode.id === node.id;
              
              return (
                <div 
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${
                    selected 
                      ? "bg-indigo-600/10 border-indigo-500/30 scale-[1.02]" 
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  {/* Indicator bullet */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                    done 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                      : selected
                      ? "bg-indigo-600/20 border-indigo-400 text-indigo-400 active-pulse"
                      : "bg-slate-800 border-white/10 text-slate-500"
                  }`}>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold font-mono">{node.titleAr.charAt(0)}</span>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="space-y-1">
                    <p className={`text-sm font-bold ${selected ? "text-indigo-300" : "text-slate-200"}`}>
                      {node.titleAr}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-800 border border-white/5">
                        {node.categoryAr}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 ltr-dir">{node.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Details Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative min-h-[420px]">
          
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-white/10 flex items-center justify-center">
                  {getCategoryIcon(selectedNode.category)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedNode.titleAr}</h3>
                  <p className="text-xs text-slate-500 font-mono ltr-dir">{selectedNode.title}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                {selectedNode.categoryAr}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">التعريف بالمحطة</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {selectedNode.descriptionAr}
              </p>
            </div>

            {/* Skills checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">المهارات المكتسبة</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedNode.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#131b2e] border border-white/5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Tip / Advice */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Compass className="w-4 h-4" />
                <span>نصيحة المهندس عبدالوهاب أحمد للتعلم:</span>
              </h4>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
                {selectedNode.tutorTipAr}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="roadmap-complete-btn"
              onClick={handleToggle}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border cursor-pointer ${
                isNodeDone(selectedNode.id)
                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border-transparent"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isNodeDone(selectedNode.id) ? "محطة مكتملة (تمت الإضافة)" : "تحديد هذه المحطة كمكتملة (+15 نقطة)"}</span>
            </button>

            <span className="text-[10px] text-slate-500 text-center sm:text-right">يتم حفظ ومزامنة مسار تعلمك تلقائياً على المتصفح الخاص بك</span>
          </div>

        </div>

      </div>

    </div>
  );
}
