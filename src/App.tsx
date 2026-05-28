import { useState, useEffect } from 'react';
import Header from './components/Header';
import PracticeView from './components/PracticeView';
import SimulatorView from './components/SimulatorView';
import MathTricks from './components/MathTricks';
import MathAssistant from './components/MathAssistant';
import MistakesView from './components/MistakesView';
import LeaderboardView from './components/LeaderboardView';
import AdminDashboard from './components/AdminDashboard';
import LoginWall from './components/LoginWall';
import { getCurrentUser, setCurrentUser as syncCurrentUser } from './utils/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<string>("sets");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Apply theme of preference on load
    const savedTheme = localStorage.getItem('limitless_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Check if user is logged in
    setCurrentUser(getCurrentUser());
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userObj: any) => {
    syncCurrentUser(userObj);
    setCurrentUser(userObj);
    setCurrentView("sets");
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "sets":
        return <PracticeView />;
      case "simulate":
        return <SimulatorView />;
      case "tricks":
        return <MathTricks />;
      case "helper":
        return <MathAssistant />;
      case "mistakes":
        return <MistakesView />;
      case "leaderboard":
        return <LeaderboardView />;
      case "admin":
        // Fallback protection if non-admin tries to gain access
        return currentUser?.isAdmin ? <AdminDashboard /> : <PracticeView />;
      default:
        return <PracticeView />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-bg min-h-screen text-text-bright flex items-center justify-center font-serif italic text-lg text-gold-brand">
        Loading Project Limitless Portal...
      </div>
    );
  }

  // If not logged in, mount the elegant LoginWall
  if (!currentUser) {
    return <LoginWall onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-dark-bg text-text-bright min-h-screen transition-colors duration-200 selection:bg-gold-brand/20 font-sans">
      {/* Navigation and Brand Header */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Study Desk Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div id="content-views-wrapper" className="transition-all duration-300">
          {renderActiveView()}
        </div>
      </main>

      {/* Brand Footer requested explicitly with love by Limitless */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-dark-border text-center text-xs text-text-muted font-medium space-y-2">
        <p className="tracking-wide">Mahanagar Entrance Test (MET) Practice & Preparation Platform.</p>
        <p className="text-gold-brand font-semibold text-[13px] hover:scale-105 transition-transform duration-200 inline-block font-serif italic">
          With Love by Limitless ❤️
        </p>
      </footer>
    </div>
  );
}
