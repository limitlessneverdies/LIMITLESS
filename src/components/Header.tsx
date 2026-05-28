import { useEffect, useState } from 'react';
import { BookOpen, Trophy, ShieldAlert, Sparkles, Calculator, GraduationCap, ShieldCheck, LogOut, Clock, Sun, Moon } from 'lucide-react';
import { getMistakeLogs, getCurrentUser } from '../utils/storage';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Header({ currentView, setCurrentView }: HeaderProps) {
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [countdownStr, setCountdownStr] = useState<string>("");
  const [theme, setTheme] = useState<string>('dark');
  const [registeredCount, setRegisteredCount] = useState<number>(1);
  const [activeCount, setActiveCount] = useState<number>(1);

  useEffect(() => {
    // Determine initially saved theme
    const savedTheme = localStorage.getItem('limitless_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Update session info
    const refreshUser = () => {
      setUser(getCurrentUser());
    };
    refreshUser();

    // Mistake badge refresh
    const updateCount = () => {
      setMistakeCount(getMistakeLogs().length);
    };
    updateCount();
    
    // Check countdown
    const updateCountdown = () => {
      const examDate = new Date('2026-06-01T02:45:00Z').getTime();
      const now = new Date().getTime();
      const diff = examDate - now;
      if (diff <= 0) {
        setCountdownStr("Exam Active/Ended");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownStr(`${days}d ${hours}h ${minutes}m`);
    };
    updateCountdown();

    const updateStats = () => {
      const activeUser = getCurrentUser();
      const emailParam = activeUser?.email ? `&email=${encodeURIComponent(activeUser.email)}` : '';
      const nameParam = activeUser?.name ? `&name=${encodeURIComponent(activeUser.name)}` : '';
      
      fetch(`/api/stats?nocache=${Date.now()}${emailParam}${nameParam}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setRegisteredCount(data.registeredCount || 1);
            setActiveCount(data.activeCount || 1);
          }
        })
        .catch(() => {});
    };
    updateStats();
    
    const interval = setInterval(() => {
      updateCount();
      updateCountdown();
      updateStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('limitless_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('limitless_curr_user');
    window.location.reload();
  };

  const navTabs = [
    { key: "sets", label: "Questions Practice", icon: <BookOpen className="w-4 h-4" />, numPrefix: "01" },
    { key: "simulate", label: "Exam Simulator", icon: <Trophy className="w-4 h-4" />, numPrefix: "02" },
    { key: "tricks", label: "GK & Formulas", icon: <Sparkles className="w-4 h-4" />, numPrefix: "03" },
    { key: "helper", label: "By-Hand Calculator", icon: <Calculator className="w-4 h-4" />, numPrefix: "04" },
    { key: "mistakes", label: "My Mistakes Book", icon: <ShieldAlert className="w-4 h-4" />, badge: mistakeCount, numPrefix: "05" },
    { key: "leaderboard", label: "Leaderboard Stands", icon: <Trophy className="w-4 h-4 text-gold-brand" />, numPrefix: "06" }
  ];

  // If the active user has admin credentials, append dedicated panel tab
  if (user?.isAdmin) {
    navTabs.push({
      key: "admin",
      label: "Portal Manager (Admin)",
      icon: <ShieldCheck className="w-4 h-4 text-red-405" />,
      numPrefix: "07"
    });
  }

  return (
    <header className="bg-dark-sidebar border-b border-dark-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Logo Brand Title with "Mahanagar Prep" */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("sets")}>
            <div className="p-2 bg-dark-card border border-dark-border text-gold-brand rounded-xl shadow-md">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold font-serif italic text-gold-brand tracking-tight leading-none block uppercase">
                Mahanagar Prep
              </span>
              <span className="text-[9px] text-text-muted tracking-[0.2em] font-semibold block uppercase mt-0.5">
                MET Entrance Desk
              </span>
            </div>
          </div>

          {/* Desktop Nav menu */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {navTabs.map((t) => {
              const isActive = currentView === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setCurrentView(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                    isActive 
                      ? "bg-dark-hover text-gold-brand border-gold-brand/40 shadow-sm font-bold" 
                      : "bg-transparent text-text-muted border-transparent hover:text-text-bright hover:bg-dark-card"
                  }`}
                >
                  <span className="font-mono text-[9px] text-gold-brand opacity-50">{t.numPrefix}</span>
                  {t.icon}
                  <span>{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 text-[8px] font-black rounded-full ${isActive ? "bg-gold-brand text-black" : "bg-red-950 text-red-400 border border-red-900/40"}`}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Info & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 text-text-muted hover:text-gold-brand bg-dark-card border border-dark-border hover:border-gold-brand/40 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center w-8 h-8"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-brand" /> : <Moon className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Live exam timer in top bar */}
            {countdownStr && (
              <div className="hidden sm:flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-xl text-[10px] text-text-muted font-mono">
                <Clock className="w-3.5 h-3.5 text-gold-brand animate-pulse shrink-0" />
                <span>Timer: <strong className="text-gold-brand">{countdownStr}</strong></span>
              </div>
            )}

            {/* Live scholars & Registration counter */}
            <div className="hidden md:flex items-center gap-3 bg-dark-card border border-dark-border px-3.5 py-1.5 rounded-xl text-[10px] text-text-muted font-mono whitespace-nowrap">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Candidate: <strong className="text-emerald-400 font-bold">{activeCount}</strong></span>
              </span>
              <span className="h-3.5 w-px bg-dark-border"></span>
              <span>Registered Users: <strong className="text-gold-brand font-bold">{registeredCount}</strong></span>
            </div>

            {/* User Profile display card */}
            {user && (
              <div className="bg-dark-card border border-dark-border pl-3 pr-2 py-1.5 rounded-xl flex items-center gap-2.5 shadow-sm text-xs select-none">
                <div className="text-right hidden md:block">
                  <span className="block font-bold text-text-bright leading-none capitalize">{user.name}</span>
                  <span className="text-[9px] text-text-muted tracking-tight font-mono">{user.email}</span>
                </div>
                <div className="w-7 h-7 bg-gold-brand/10 border border-gold-brand/30 text-gold-brand text-xs font-black rounded-full flex items-center justify-center uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out of Portal"
                  className="p-1 text-text-muted hover:text-red-400 border border-transparent hover:border-dark-border hover:bg-dark-hover rounded-lg transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Nav Menu Scrollable Area */}
        <div id="mobile-navigation" className="xl:hidden flex gap-2 overflow-x-auto pb-3 pt-1 border-t border-dark-border/40 scrollbar-none">
          {navTabs.map((t) => {
            const isActive = currentView === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setCurrentView(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer border ${isActive ? "bg-dark-hover text-gold-brand border-gold-brand/45 shadow" : "bg-dark-card text-text-muted border-dark-border"}`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black ${isActive ? "bg-gold-brand text-black" : "bg-red-900 text-red-400"}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
