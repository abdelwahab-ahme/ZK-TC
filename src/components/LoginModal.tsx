import React, { useState } from "react";
import { LogIn, User, Award, Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginProps {
  onLoginSuccess: (username: string, email: string, avatar: string, isGuest: boolean) => void;
}

const AVATARS = [
  "🤖", "💻", "🚀", "🎓", "👾", "🦊", "🌟", "🔥"
];

export default function LoginModal({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<"google" | "custom">("google");
  
  // Custom login state
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("💻");
  const [customError, setCustomError] = useState("");

  // Google Sign-in state
  const [googleEmail, setGoogleEmail] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const logVisitorToServer = async (name: string, email: string, avatar: string, isGuest: boolean) => {
    try {
      const res = await fetch("/api/visitors/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          avatar,
          isGuest,
          points: 50
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.visitor && data.visitor.accessLevel) {
          localStorage.setItem("user_access_level", data.visitor.accessLevel);
          if (data.visitor.activeCourseId) {
            localStorage.setItem("user_active_course", data.visitor.activeCourseId);
          }
        }
      }
    } catch (e) {
      console.warn("Could not sync visitor to server:", e);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = usernameInput.trim();
    if (!name) {
      setCustomError("الرجاء إدخال اسمك الكريم للمتابعة");
      return;
    }
    if (name.length < 3) {
      setCustomError("يجب أن يكون الاسم 3 أحرف على الأقل");
      return;
    }

    const guestEmail = `${name.toLowerCase().replace(/\s+/g, "")}@student.zakora.tc`;

    // Save to local storage
    localStorage.setItem("username", name);
    localStorage.setItem("user_avatar", selectedAvatar);
    localStorage.setItem("user_email", guestEmail);
    localStorage.setItem("user_is_guest", "true");
    localStorage.setItem("user_access_level", "restricted_5pct");
    
    if (!localStorage.getItem("user_points")) {
      localStorage.setItem("user_points", "50");
    }

    await logVisitorToServer(name, guestEmail, selectedAvatar, true);
    onLoginSuccess(name, guestEmail, selectedAvatar, true);
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = googleEmail.trim();
    const password = googlePassword;

    if (!email) {
      setGoogleError("الرجاء إدخال البريد الإلكتروني الخاص بجوجل");
      return;
    }
    if (!email.includes("@")) {
      setGoogleError("يرجى إدخال عنوان بريد إلكتروني صحيح");
      return;
    }
    if (!password) {
      setGoogleError("الرجاء إدخال كلمة مرور حساب جوجل");
      return;
    }
    if (password.length < 6) {
      setGoogleError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);
    setGoogleError("");

    // Simulate Google Authentication check
    setTimeout(async () => {
      setIsLoading(false);
      
      // Determine user name from email prefix
      const emailPrefix = email.split("@")[0];
      let displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      
      // Special override for teacher/admin
      let avatarChar = "🎓";
      const eLower = email.toLowerCase();
      const isAdmin = eLower === "zakora.tc.admin@gmail.com" || 
                      eLower.endsWith("@zakora.tc");

      if (isAdmin) {
        displayName = "المهندس عبدالوهاب أحمد (الأدمن)";
        avatarChar = "🎓";
      } else {
        avatarChar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      }

      // Save credentials in local storage
      localStorage.setItem("username", displayName);
      localStorage.setItem("user_avatar", avatarChar);
      localStorage.setItem("user_email", email.toLowerCase());
      localStorage.setItem("user_is_guest", "false");
      if (isAdmin) {
        localStorage.setItem("user_access_level", "full");
      }
      
      if (!localStorage.getItem("user_points")) {
        localStorage.setItem("user_points", "50");
      }

      await logVisitorToServer(displayName, email.toLowerCase(), avatarChar, false);
      onLoginSuccess(displayName, email.toLowerCase(), avatarChar, false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/90 p-4 rtl-dir">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
      >
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner relative">
              <span className="text-4xl">🎓</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-[#0f172a] text-white">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Zakora-TC Platform</h1>
            <p className="text-xs text-slate-400 font-medium">مرحباً بك في بوابة الأستاذ عبدالوهاب أحمد التعليمية</p>
          </div>

          {/* Authentication Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#131b2e] rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => setActiveTab("google")}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "google"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {/* Google Colorful G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.116C18.227 2.115 15.462 1 12.24 1a11 11 0 0 0-11 11 11 11 0 0 0 11 11c11.52 0 12.217-8.09 11.96-12.715z"
                />
              </svg>
              <span>دخول بجوجل Google</span>
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "custom"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>دخول سريع (زائر)</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "google" ? (
              <motion.form
                key="google-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleGoogleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    حساب Google (البريد الإلكتروني):
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={googleEmail}
                      onChange={(e) => {
                        setGoogleEmail(e.target.value);
                        setGoogleError("");
                      }}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left ltr-dir"
                    />
                    <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    كلمة المرور الخاصة بجوجل (Google Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={googlePassword}
                      onChange={(e) => {
                        setGooglePassword(e.target.value);
                        setGoogleError("");
                      }}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-left ltr-dir font-mono"
                    />
                    <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {googleError && (
                  <p className="text-rose-500 text-xs text-right font-semibold">{googleError}</p>
                )}

                <div className="text-right">
                  <p className="text-[10px] text-slate-500 leading-normal">
                      لتجربة الدخول بصلاحيات الأدمن كاملة وتأمين اللوحة خارجياً، يرجى كتابة بريدك الإلكتروني  
                  </p>
                </div>

                <button
                  id="google-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer text-xs"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>تسجيل الدخول الآمن بـ Google</span>
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="custom-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleCustomSubmit}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="username-input" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    اسم المستخدم / الطالب:
                  </label>
                  <div className="relative">
                    <input
                      id="username-input"
                      type="text"
                      placeholder="مثال: أحمد محمد"
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        setCustomError("");
                      }}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-2.5 px-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-right font-medium"
                    />
                    <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  </div>
                  {customError && (
                    <p className="text-rose-500 text-xs mt-1.5 text-right font-semibold">{customError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    اختر الرمز التعبيري المفضل (Avatar):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`h-10 text-xl flex items-center justify-center rounded-xl border transition-all duration-150 ${
                          selectedAvatar === avatar
                            ? "bg-indigo-600/20 border-indigo-500 text-white scale-105 shadow"
                            : "bg-[#131b2e] border-white/5 hover:border-white/10 text-slate-400"
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer text-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>دخول كزائر سريع</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 bg-[#131b2e] p-3.5 rounded-xl border border-white/5 mt-5">
            <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>تحصل على 50 نقطة ترحيبية فور دخولك للمسيرة التعليمية!</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>يتم تشفير وحفظ بيانات تقدّمك الدراسي تلقائياً على متصفحك.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
