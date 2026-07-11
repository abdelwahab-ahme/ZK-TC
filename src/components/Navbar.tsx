import React, { useState } from "react";
import { 
  Menu, X, ChevronDown, Award, LogOut, Search, BookOpen, 
  Code, Info, Database, BarChart2, Settings 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  username: string;
  avatar: string;
  userPoints: number;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export default function Navbar({
  username,
  avatar,
  userPoints,
  onNavigate,
  currentView,
  onLogout,
  onSearch
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tracksOpen, setTracksOpen] = useState(false);
  const [solvingOpen, setSolvingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const navigateTo = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
    setTracksOpen(false);
    setSolvingOpen(false);
    setProfileOpen(false);
  };

  return (
    <header id="navbar-header" className="sticky top-0 z-40 bg-[#070b16]/95 border-b border-white/10 backdrop-blur-md px-4 sm:px-6 py-3 rtl-dir">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Hamburger */}
        <div className="flex items-center gap-3">
          <button 
            id="hamburger-btn"
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white hover:text-indigo-400 p-1.5 focus:outline-none transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2.5 text-xl font-bold bg-gradient-to-l from-indigo-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity text-right cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-600/30">
              ZT
            </div>
            <span>Zakora-TC</span>
          </button>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => navigateTo("home")}
            className={`font-semibold text-sm transition-colors cursor-pointer ${
              currentView === "home" ? "text-indigo-400" : "text-slate-300 hover:text-white"
            }`}
          >
            الرئيسية
          </button>

          {/* Tracks Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setTracksOpen(!tracksOpen);
                setSolvingOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-1 font-semibold text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>المسارات</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${tracksOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {tracksOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2.5 w-52 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl py-1.5 z-50 text-right"
                >
                  <button 
                    onClick={() => navigateTo("cs50")}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>دورة CS50 لعلوم الحاسب</span>
                  </button>
                  <button 
                    onClick={() => navigateTo("sql-course")}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-white transition-colors"
                  >
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>دورة SQL وقواعد البيانات</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Problem Solving Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setSolvingOpen(!solvingOpen);
                setTracksOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-1 font-semibold text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>حل المشكلات</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${solvingOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {solvingOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2.5 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl py-1.5 z-50 text-right"
                >
                  <button 
                    onClick={() => navigateTo("problem-solving")}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-white transition-colors"
                  >
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>تحديات SQL وقواعد البيانات</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => navigateTo("about")}
            className={`font-semibold text-sm transition-colors cursor-pointer ${
              currentView === "about" ? "text-indigo-400" : "text-slate-300 hover:text-white"
            }`}
          >
            حول المنصة
          </button>
        </nav>

        {/* Search & User Profile */}
        <div className="flex items-center gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
            <input 
              id="desktop-search-input"
              type="text" 
              placeholder="ابحث عن دورة أو درس..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#131b2e] border border-white/10 rounded-full py-1.5 pr-9 pl-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 focus:w-60 transition-all duration-300"
            />
            <button type="submit" className="absolute right-3 top-2 text-slate-400 hover:text-white">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Points Indicator */}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>{userPoints} نقطة</span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              id="profile-dropdown-btn"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setTracksOpen(false);
                setSolvingOpen(false);
              }}
              className="flex items-center gap-2 hover:bg-white/5 py-1.5 px-2.5 rounded-xl transition-colors text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-lg">
                {avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">مرحباً،</p>
                <p className="text-sm font-semibold text-white max-w-[100px] truncate">{username}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div 
                  id="profile-dropdown-menu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2.5 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl py-1.5 z-50 text-right"
                >
                  <button 
                    onClick={() => navigateTo("grades")}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-white transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-emerald-400" />
                    <span>لوحة الدرجات</span>
                  </button>
                  <button 
                    onClick={() => navigateTo("admin")}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/10 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>لوحة الإدارة</span>
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-start gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#0a0f1d] border-t border-white/10 mt-2.5 rounded-xl"
          >
            <div className="px-2 pt-3 pb-4 space-y-2 text-right">
              {/* Search box for mobile */}
              <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-3 px-2">
                <input 
                  id="mobile-search-input"
                  type="text" 
                  placeholder="ابحث..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#131b2e] border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                />
                <button type="submit" className="absolute right-5 top-2.5 text-slate-400 hover:text-white">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <button 
                onClick={() => navigateTo("home")}
                className="w-full text-right px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg block"
              >
                الرئيسية
              </button>

              <div className="border-t border-white/5 my-1" />
              <p className="px-4 py-1 text-xs text-slate-500 font-bold">المسارات التعليمية</p>
              
              <button 
                onClick={() => navigateTo("cs50")}
                className="w-full text-right px-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg block"
              >
                دورة CS50 لعلوم الحاسب
              </button>
              
              <button 
                onClick={() => navigateTo("sql-course")}
                className="w-full text-right px-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg block"
              >
                دورة SQL وقواعد البيانات
              </button>

              <div className="border-t border-white/5 my-1" />
              <p className="px-4 py-1 text-xs text-slate-500 font-bold">حل المشكلات</p>
              
              <button 
                onClick={() => navigateTo("problem-solving")}
                className="w-full text-right px-6 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg block"
              >
                تحديات SQL وقواعد البيانات
              </button>

              <div className="border-t border-white/5 my-1" />
              
              <button 
                onClick={() => navigateTo("admin")}
                className="w-full text-right px-4 py-2.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-lg block"
              >
                لوحة الإدارة 🛠️
              </button>

              <div className="border-t border-white/5 my-1" />
              
              <button 
                onClick={() => navigateTo("about")}
                className="w-full text-right px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg block"
              >
                حول المنصة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
