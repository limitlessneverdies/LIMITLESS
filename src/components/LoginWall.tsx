import { useState, useEffect, FormEvent } from 'react';
import { Sparkles, Key, GraduationCap, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginWallProps {
  onLoginSuccess: (user: { name: string; email: string; school: string; isAdmin: boolean }) => void;
}

export default function LoginWall({ onLoginSuccess }: LoginWallProps) {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string>("");
  const [adminPass, setAdminPass] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Simulated Google Auth Selection Popup
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  
  // Custom user student details
  const [studentName, setStudentName] = useState<string>("");
  const [studentSchool, setStudentSchool] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateCountdown = () => {
      // June 1, 2026 08:30:00 Nepal Standard Time = June 1, 2026 02:45:00 UTC
      const examDate = new Date('2026-06-01T02:45:00Z').getTime();
      const now = new Date().getTime();
      const difference = examDate - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminSignIn = (e: FormEvent) => {
    e.preventDefault();
    if (adminUser === "BISHOWDEEP" && adminPass === "Bishowdeep@10") {
      onLoginSuccess({
        name: "Bishowdeep (Admin)",
        email: "limitlessneverdies369@gmail.com",
        school: "MET Kathmandu (Founder)",
        isAdmin: true
      });
    } else {
      setErrorMsg("Incorrect admin credentials. Double check username and password!");
    }
  };

  // Listen for success message from popup (after Google callback on server completes)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const loggedUser = event.data.user;
        onLoginSuccess(loggedUser);
        setIsGoogleModalOpen(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  const handleRealGoogleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentSchool) {
      alert("Please fill in your Pre-Entrance School / Hometown first!");
      return;
    }

    try {
      const schoolParam = encodeURIComponent(studentSchool);
      const originParam = encodeURIComponent(window.location.origin);
      
      const response = await fetch(`/api/auth/google/url?school=${schoolParam}&origin=${originParam}`);
      if (!response.ok) {
        throw new Error("Failed to configure Google Auth URL parameters");
      }
      const { url } = await response.json();

      // Open OAuth in popup directly
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        alert("Popup was blocked! Please allow popups for Project Limitless to sign in with Google.");
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      alert("Error initiating Google authentication. Make sure backend servers are running and OAUTH_CLIENT_ID is active in Secrets!");
    }
  };

  const handleGoogleSignInComplete = (e: FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentSchool) {
      alert("Please fill in candidate credentials!");
      return;
    }
    const email = studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    onLoginSuccess({
      name: studentName,
      email: email,
      school: studentSchool,
      isAdmin: false
    });
  };

  const setGooglePreset = (name: string, school: string, email: string) => {
    setStudentName(name);
    setStudentSchool(school);
    setStudentEmail(email);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-bright flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 select-none pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <span className="w-16 h-16 bg-dark-sidebar border border-dark-border text-gold-brand rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <GraduationCap className="w-9 h-9" />
          </span>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif italic text-gold-brand uppercase tracking-tight">
              Project Limitless
            </h1>
            <p className="text-[10px] sm:text-xs text-text-muted tracking-[0.25em] font-semibold uppercase">
              The Next-Gen Mahanagar Entrance Test (MET) Portal
            </p>
          </div>
        </div>

        {/* Real Entrance Exam countdown */}
        <div className="bg-dark-sidebar border border-gold-brand/35 rounded-2xl p-6 shadow-xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-brand/10 border border-gold-brand/20 text-gold-brand text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 bg-gold-brand rounded-full animate-pulse" />
            Exam Countdown Timetable
          </div>
          
          <h2 className="text-sm font-serif italic text-text-bright leading-relaxed max-w-md mx-auto">
            The Mahanagar Entrance Test (MET) takes place on <strong>June 1, 2026 / Jestha 17</strong>!
          </h2>

          {timeLeft ? (
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto pt-2 font-mono text-center">
              <div className="bg-dark-card border border-dark-border py-2.5 rounded-xl">
                <span className="block text-xl font-bold text-gold-brand leading-none">{timeLeft.days}</span>
                <span className="text-[9px] text-text-muted uppercase tracking-wider mt-1 block">Days</span>
              </div>
              <div className="bg-dark-card border border-dark-border py-2.5 rounded-xl">
                <span className="block text-xl font-bold text-gold-brand leading-none">{timeLeft.hours}</span>
                <span className="text-[9px] text-text-muted uppercase tracking-wider mt-1 block">Hours</span>
              </div>
              <div className="bg-dark-card border border-dark-border py-2.5 rounded-xl">
                <span className="block text-xl font-bold text-gold-brand leading-none">{timeLeft.minutes}</span>
                <span className="text-[9px] text-text-muted uppercase tracking-wider mt-1 block">Mins</span>
              </div>
              <div className="bg-dark-card border border-dark-border py-2.5 rounded-xl">
                <span className="block text-xl font-bold text-gold-brand leading-none">{timeLeft.seconds}</span>
                <span className="text-[9px] text-text-muted uppercase tracking-wider mt-1 block">Secs</span>
              </div>
            </div>
          ) : (
            <p className="text-yellow-500 font-mono text-xs font-bold pt-1 animate-pulse uppercase tracking-wider">
              ⚠️ Mahanagar Entrance Test (MET) is Live or Finished!
            </p>
          )}
        </div>

        {/* Login Selection Widget */}
        <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {!isAdminMode ? (
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <h3 className="font-serif italic text-gold-brand text-lg">Candidate Sign In</h3>
                <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto font-sans">
                  Sign in to individualize your mistakes history log book and participate on the scoreboard.
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Simulated Google Button */}
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full py-4.5 bg-dark-card hover:bg-dark-hover border border-dark-border text-text-bright font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-3.5 hover:border-gold-brand"
                >
                  {/* Google SVG G Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign In with Google
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminMode(true)}
                    className="text-text-muted hover:text-gold-brand transition-colors font-mono uppercase tracking-wider text-[10px] font-bold cursor-pointer"
                  >
                    🔐 Unlock Admin Controller Area
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Admin Credentials Box
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <h3 className="font-serif italic text-gold-brand text-lg">Admin Controller Sign In</h3>
                <p className="text-xs text-text-muted font-sans">
                  Enter credentials configured for Admin controls.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/20 border border-red-900/35 text-red-400 text-xs rounded-lg text-center font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAdminSignIn} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-text-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">Admin Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter admin name"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border pl-4 pr-4 py-3 rounded-xl text-text-bright focus:outline-none focus:border-gold-brand font-mono"
                  />
                </div>

                <div>
                  <label className="block text-text-muted font-bold mb-1.5 uppercase tracking-wider text-[10px]">Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border pl-4 pr-4 py-3 rounded-xl text-text-bright focus:outline-none focus:border-gold-brand font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gold-brand hover:opacity-90 text-black font-black uppercase text-xs rounded-xl tracking-wider cursor-pointer shadow-lg shadow-gold-brand/10"
                >
                  Verify Developer Credentials
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminMode(false);
                      setErrorMsg("");
                    }}
                    className="text-text-muted hover:text-text-bright transition-colors font-semibold py-1 cursor-pointer"
                  >
                    ← Back to Candidate Portal
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* OVERLAY: Google Authentication Screen Simulator */}
      <AnimatePresence>
        {isGoogleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoogleModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Google dialog box matches real branding */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e1e21] border border-zinc-800 rounded-2xl w-full max-w-md p-6 sm:p-8 relative z-10 text-left space-y-5"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-white font-sans text-sm font-semibold">Sign in with Google</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs font-mono font-bold"
                >
                  Close
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-serif">Setup Google Account Entrance Card</h4>
                <p className="text-xs text-zinc-400 mt-1">Please provide your School/Hometown below to customize your credentials on the Global MET Leaderboard, then authenticate with your Google identity.</p>
              </div>

              <div className="space-y-4 text-xs font-sans text-white">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Pre-Entrance School Name / Hometown (Required for Google Login)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu, Nepal or Budhanilkantha School"
                    value={studentSchool}
                    onChange={(e) => setStudentSchool(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 text-white px-3 py-2.5 rounded-xl placeholder:text-zinc-650 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRealGoogleSignIn}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.285 1.15 15.535 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.93 0 11.53-4.875 11.53-11.715 0-.795-.085-1.4-.185-2H12.24z"/>
                    </svg>
                    Authenticate & Sign In with Google
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Or: Quick Developer Bypass</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <form onSubmit={handleGoogleSignInComplete} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Candidate Name (Mock Profile)</label>
                    <input
                      type="text"
                      placeholder="e.g. Preksha Rai"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-805 text-white px-3 py-2 rounded-xl placeholder:text-zinc-650 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Candidate Email (Mock Profile)</label>
                    <input
                      type="email"
                      placeholder="e.g. preksha@gmail.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-805 text-white px-3 py-2 rounded-xl placeholder:text-zinc-650 focus:border-zinc-700 focus:outline-none"
                    />
                  </div>

                  {/* Prebuilt presets to test quickly */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-[9px] uppercase font-bold text-zinc-500">Bypass Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGooglePreset("Preksha Rai", "Mahanagar Academy", "preksha@gmail.com")}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-[9px] transition-all cursor-pointer"
                      >
                        Preksha Rai
                      </button>
                      <button
                        type="button"
                        onClick={() => setGooglePreset("Bipul Thapa", "Little Angels School", "bipul@gmail.com")}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded text-[9px] transition-all cursor-pointer"
                      >
                        Bipul Thapa
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-zinc-700"
                  >
                    Bypass using Mock Profile
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
