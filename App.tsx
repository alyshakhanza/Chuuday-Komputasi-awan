/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Heart, RefreshCw, Calendar as CalendarIcon, 
  Flame, HeartHandshake, HelpCircle, BookOpen, User, Info, Music2, Sun, Moon
} from "lucide-react";
import { JournalEntry, AIInsight } from "./types";
import { SEED_JOURNALS } from "./seedData";
import CalendarView from "./components/CalendarView";
import WeeklySummary from "./components/WeeklySummary";
import JournalForm from "./components/JournalForm";
import ChuuChatbox from "./components/ChuuChatbox";
import PastJournalsList from "./components/PastJournalsList";
import ShareCardModal from "./components/ShareCardModal";
import StatsDashboard from "./components/StatsDashboard";
import BadgeCelebrationModal from "./components/BadgeCelebrationModal";
import MonthlyRecapModal from "./components/MonthlyRecapModal";

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'warning' | 'error', text: string } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Onboarding username state
  const [username, setUsername] = useState<string>("");
  const [onboardingNameInput, setOnboardingNameInput] = useState<string>("");

  // Dark / Light Mode state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Active view tab for mobile responsiveness
  const [mobileActiveTab, setMobileActiveTab] = useState<'tulis' | 'riwayat'>('tulis');

  // Main navigation tabs state
  const [activeTab, setActiveTab] = useState<'jurnal' | 'statistik'>('jurnal');

  // Monthly Recap modal state
  const [isRecapOpen, setIsRecapOpen] = useState<boolean>(false);

  // New badge celebration popup state
  const [celebratingBadge, setCelebratingBadge] = useState<any | null>(null);

  // Initialize selected date, username, and theme on load
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setSelectedDate(todayStr);

    // Load username from localStorage
    const storedUsername = localStorage.getItem("chuuday_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Load theme from localStorage
    const storedTheme = localStorage.getItem("chuuday_theme") as 'light' | 'dark' | null;
    const initialTheme = storedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load from LocalStorage
    const stored = localStorage.getItem("chuuday_journals");
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Gagal membaca riwayat localStorage, memulihkan seed data.");
        setEntries(SEED_JOURNALS);
        localStorage.setItem("chuuday_journals", JSON.stringify(SEED_JOURNALS));
      }
    } else {
      // First-time load: pre-populate with cute seed data!
      setEntries(SEED_JOURNALS);
      localStorage.setItem("chuuday_journals", JSON.stringify(SEED_JOURNALS));
      setAlertInfo({
        type: 'success',
        text: "Selamat datang di ChuuDay! Jurnal olahraga contoh telah disediakan di kalender Anda."
      });
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem("chuuday_theme", nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const saveEntriesToStorage = (updatedList: JournalEntry[]) => {
    setEntries(updatedList);
    localStorage.setItem("chuuday_journals", JSON.stringify(updatedList));
  };

  // 1. Calculate Exercise Streak
  const calculateSportStreak = (allEntries: JournalEntry[]): number => {
    const datesWithSport = new Set(
      allEntries
        .filter(e => e.sportDuration > 0)
        .map(e => e.date)
    );
    
    if (datesWithSport.size === 0) return 0;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check start boundary
    if (datesWithSport.has(todayStr)) {
      // start checking from today
    } else if (datesWithSport.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      return 0; // broken streak
    }
    
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (datesWithSport.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streakCount = calculateSportStreak(entries);

  // Automatically check unlocked badges and trigger celebration modals
  useEffect(() => {
    if (entries.length === 0) return;

    const calculateMaxStreak = (allEntries: JournalEntry[]): number => {
      const datesWithSport = new Set(allEntries.filter(e => e.sportDuration > 0).map(e => e.date));
      if (datesWithSport.size === 0) return 0;
      const sortedDates = Array.from(datesWithSport).sort();
      let maxStr = 0, currRun = 0;
      let prev: Date | null = null;
      for (const dateStr of sortedDates) {
        const curr = new Date(dateStr);
        if (!prev) {
          currRun = 1;
        } else {
          const diff = Math.abs(curr.getTime() - prev.getTime());
          if (Math.ceil(diff / (1000 * 60 * 60 * 24)) === 1) {
            currRun++;
          } else if (Math.ceil(diff / (1000 * 60 * 60 * 24)) > 1) {
            if (currRun > maxStr) maxStr = currRun;
            currRun = 1;
          }
        }
        prev = curr;
      }
      return currRun > maxStr ? currRun : maxStr;
    };

    const maxStreakVal = calculateMaxStreak(entries);
    const swimCount = entries.filter(e => {
      const type = (e.sportType || "").toLowerCase();
      return type.includes("enang") || type.includes("swim");
    }).length;
    const musicCount = entries.filter(e => e.songTitle && e.songTitle.trim() !== "").length;
    const photoCount = entries.filter(e => e.photoUrl).length;

    const weeklyMinutes = entries
      .filter(e => {
        const today = new Date();
        const past7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - i);
          return d.toISOString().split("T")[0];
        });
        return past7Days.includes(e.date);
      })
      .reduce((sum, e) => sum + e.sportDuration, 0);

    const badgeStatus = [
      { id: "langkah_pertama", emoji: "🌱", title: "Langkah Pertama", description: "Tulis jurnal Anda untuk pertama kalinya", unlocked: entries.length >= 1 },
      { id: "on_fire", emoji: "🔥", title: "On Fire!", description: "Mencapai streak olahraga 3 hari beruntun", unlocked: maxStreakVal >= 3 },
      { id: "seminggu_penuh", emoji: "💪", title: "Seminggu Penuh", description: "Mencapai streak olahraga 7 hari beruntun", unlocked: maxStreakVal >= 7 },
      { id: "konsisten", emoji: "⚡", title: "Konsisten", description: "Mencapai streak olahraga 30 hari", unlocked: maxStreakVal >= 30 },
      { id: "aquaman", emoji: "🏊", title: "Aquaman", description: "Lakukan 5 sesi berenang", unlocked: swimCount >= 5 },
      { id: "soundtrack_life", emoji: "🎵", title: "Soundtrack Life", description: "Tambahkan lagu favorit di 7 jurnal harian", unlocked: musicCount >= 7 },
      { id: "moment_keeper", emoji: "📸", title: "Moment Keeper", description: "Unggah foto pribadi di 5 jurnal harian", unlocked: photoCount >= 5 },
      { id: "club_150", emoji: "🏆", title: "150 Menit Club", description: "Tembus target WHO 150 menit olahraga per minggu", unlocked: weeklyMinutes >= 150 }
    ];

    const currentUnlockedIds = badgeStatus.filter(b => b.unlocked).map(b => b.id);
    const celebratedStr = localStorage.getItem("chuuday_celebrated_badges");

    if (!celebratedStr) {
      // Initialize with currently unlocked badges so they don't spam popups on initial load
      localStorage.setItem("chuuday_celebrated_badges", JSON.stringify(currentUnlockedIds));
      return;
    }

    try {
      const celebratedIds: string[] = JSON.parse(celebratedStr);
      const newlyUnlocked = badgeStatus.find(b => b.unlocked && !celebratedIds.includes(b.id));

      if (newlyUnlocked) {
        setCelebratingBadge(newlyUnlocked);
        const nextCelebrated = [...celebratedIds, newlyUnlocked.id];
        localStorage.setItem("chuuday_celebrated_badges", JSON.stringify(nextCelebrated));
      }
    } catch (err) {
      console.error("Gagal memproses lencana baru:", err);
    }
  }, [entries]);

  // 2. FIND ENTRY FOR THE CURRENTLY SELECTED DATE
  const currentEntry = entries.find(e => e.date === selectedDate);

  // 3. SECURELY SAVE OR UPDATE A JOURNAL ENTRY & TRIGGERS GEMINI API
  const handleSaveJournal = async (entry: JournalEntry) => {
    setIsAnalyzing(true);
    setAlertInfo(null);

    try {
      // Call secure server proxy API route inside same app runtime
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          textContent: entry.textContent,
          sportType: entry.sportType,
          sportDuration: entry.sportDuration,
          sportIntensity: entry.sportIntensity,
          songTitle: entry.songTitle,
          songArtist: entry.songArtist,
          mood: entry.mood
        })
      });

      if (!response.ok) {
        throw new Error(`Server API returned status: ${response.status}`);
      }

      const resData = await response.json();
      
      const enrichedEntry: JournalEntry = {
        ...entry,
        aiInsight: resData.insight
      };

      // Filter out existing and append new
      const filtered = entries.filter(e => e.date !== selectedDate);
      const updatedList = [...filtered, enrichedEntry];
      saveEntriesToStorage(updatedList);

      if (resData.isSimulated) {
        setAlertInfo({
          type: 'warning',
          text: `Berhasil menyimpan jurnal! Hasil evaluasi dihitung menggunakan sistem cadangan luring.`
        });
      } else {
        setAlertInfo({
          type: 'success',
          text: `Catatan jurnal berhasil disimpan dan dianalisis.`
        });
      }

    } catch (err: any) {
      console.error("Gagal memanggil Gemini API:", err);
      
      // Keep user's journal safe even if backend API is temporarily offline
      const fallbackInsight: AIInsight = {
        healthAnalysis: "Olahraga diselesaikan dengan baik.",
        motivation: "Optimalkan pemulihan dengan hidrasi seimbang.",
        moodDetection: "Stabilitas tingkat emosi terpantau baik.",
        tipsTomorrow: "Disarankan untuk melakukan pemulihan aktif esok hari."
      };

      const enrichedEntry: JournalEntry = {
        ...entry,
        aiInsight: fallbackInsight
      };

      const filtered = entries.filter(e => e.date !== selectedDate);
      const updatedList = [...filtered, enrichedEntry];
      saveEntriesToStorage(updatedList);

      setAlertInfo({
        type: 'warning',
        text: "Jurnal berhasil disimpan menggunakan cadangan analisis sistem luring."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. DELETE A JOURNAL ENTRY
  const handleDeleteJournal = (dateToDelete: string) => {
    const updatedList = entries.filter(e => e.date !== dateToDelete);
    saveEntriesToStorage(updatedList);
    
    // Automatically reset active date to today's date to refresh the page state
    const todayStr = new Date().toISOString().split("T")[0];
    setSelectedDate(todayStr);

    setAlertInfo({
      type: 'success',
      text: "Jurnal harian berhasil dihapus."
    });
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-sand-50 pb-16 flex items-center justify-center p-4 text-sand-700 font-sans">
        <div className="bg-cream-card rounded-[2.5rem] max-w-sm w-full p-8 border border-sand-100 paper-shadow text-center space-y-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-sage-50 rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-sage-200 mx-auto animate-mood-bounce">
            ✍️
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-sand-800 tracking-tight">Selamat Datang</h1>
            <p className="text-xs text-sand-500 font-medium leading-relaxed">
              Silakan masukkan nama Anda untuk memulai catatan aktivitas kebugaran Anda.
            </p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = onboardingNameInput.trim();
              if (trimmed) {
                localStorage.setItem("chuuday_username", trimmed);
                setUsername(trimmed);
              }
            }}
            className="space-y-4"
          >
            <input
              type="text"
              required
              maxLength={20}
              placeholder="Nama Anda..."
              value={onboardingNameInput}
              onChange={(e) => setOnboardingNameInput(e.target.value)}
              className="w-full bg-sand-50 hover:bg-sand-100/50 focus:bg-white rounded-2xl p-4 text-center text-sm font-extrabold text-sand-700 border border-sand-200 focus:border-sage-300 focus:outline-none focus:ring-4 focus:ring-sage-50/50 cozy-transition"
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-xs font-black text-white bg-sage-600 hover:bg-sage-700 active:scale-95 hover:scale-103 transition-transform duration-150 shadow-md cursor-pointer block text-center uppercase tracking-wider"
            >
              Mulai Jurnal Hari Ini
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-16 flex flex-col text-sand-700">
      
      {/* MINIMALIST MAIN HEADER WITH GRADIENT AND GREETINGS */}
      <header className="bg-gradient-to-b from-sand-100/60 to-sand-50 border-b border-sand-100 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-sans font-black text-3.5xl text-sand-800 tracking-tight flex items-center gap-2">
              <span>ChuuDay</span>
            </h1>
            <p className="text-sm text-sand-500 font-medium">
              Hai, {username}!
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Today's Date */}
            <div className="text-xs sm:text-sm font-bold text-sand-600 bg-sand-100 border border-sand-200 px-4 py-2.5 rounded-2xl shadow-sm">
              📅 {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>

            {/* Streak Flag */}
            {streakCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-sage-100/60 border border-sage-200 px-3.5 py-2.5 text-xs text-sage-800 font-bold rounded-2xl shadow-sm">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{streakCount} Hari Streak! 🤸🏻‍♂️</span>
              </div>
            )}

            {/* "Tulis Jurnal Hari Ini" Button with scale zoom motion */}
            <button
              onClick={() => {
                const todayStr = new Date().toISOString().split("T")[0];
                setSelectedDate(todayStr);
                setMobileActiveTab('tulis');
                setTimeout(() => {
                  const formEl = document.getElementById("journal-input-card");
                  if (formEl) {
                    formEl.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }}
              className="py-2.5 px-5 bg-sage-600 hover:bg-sage-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl border border-sage-700 hover:shadow-md hover:scale-[1.03] active:scale-97 transition-transform duration-200 cozy-transition cursor-pointer"
            >
              ✍️ Tulis Jurnal Hari Ini
            </button>

            {/* Dark/Light Mode Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-sand-100 hover:bg-sand-200 text-sand-600 rounded-2xl border border-sand-200 hover:scale-105 active:scale-95 cozy-transition cursor-pointer shadow-sm flex items-center justify-center h-10 w-10 shrink-0"
              title="Ganti Tema Warna"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-sand-600 fill-sand-300" />
              ) : (
                <Sun className="w-5 h-5 text-amber-300 fill-amber-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* COZY TAB-BASED NAVIGATION */}
      <nav className="bg-sand-50/50 dark:bg-sand-150/10 border-b border-sand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between">
          <div className="flex gap-2 py-3">
            <button
              onClick={() => setActiveTab('jurnal')}
              className={`px-4 py-2 text-xs font-black rounded-xl cozy-transition cursor-pointer ${
                activeTab === 'jurnal'
                  ? "bg-sage-600 text-white shadow-sm"
                  : "bg-sand-100/60 dark:bg-sand-200/40 text-sand-500 hover:bg-sand-200"
              }`}
            >
              📝 Jurnal Harian
            </button>
            <button
              onClick={() => setActiveTab('statistik')}
              className={`px-4 py-2 text-xs font-black rounded-xl cozy-transition cursor-pointer ${
                activeTab === 'statistik'
                  ? "bg-sage-600 text-white shadow-sm"
                  : "bg-sand-100/60 dark:bg-sand-200/40 text-sand-500 hover:bg-sand-200"
              }`}
            >
              📊 Statistik & Lencana
            </button>
          </div>

          <button
            onClick={() => setIsRecapOpen(true)}
            className="my-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 border border-amber-600 hover:shadow-sm text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer cozy-transition shadow-sm"
          >
            🏆 Lihat Recap Bulan Ini
          </button>
        </div>
      </nav>

      {/* PRIMARY CONTAINER with animation load */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 grow animate-fade-in-up">

        {/* HEALTH WEEKLY SUMMARY STATISTICS */}
        {activeTab === 'jurnal' && (
          <WeeklySummary entries={entries} streakCount={streakCount} />
        )}

        {/* SYSTEM ALERT MESSAGES */}
        {alertInfo && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed transition-all duration-300 ${
            alertInfo.type === 'success' 
              ? 'bg-sage-50 border-sage-200 text-sage-700 animate-in fade-in zoom-in duration-300' 
              : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}>
            {alertInfo.type === 'success' ? (
              <div className="w-5 h-5 shrink-0 rounded-full bg-sage-100 flex items-center justify-center border border-sage-300 animate-mood-bounce">
                <svg className="w-3.5 h-3.5 text-sage-600 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <Info className="w-5 h-5 shrink-0 text-orange-500" />
            )}
            <div className="grow">
              <span className="font-extrabold block mb-0.5">
                {alertInfo.type === 'success' ? 'Berhasil:' : 'Peringatan Sistem:'}
              </span>
              <p className="font-medium">{alertInfo.text}</p>
            </div>
            <button 
              onClick={() => setAlertInfo(null)}
              className="text-sand-400 hover:text-sand-600 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'jurnal' ? (
          <>
            {/* RESPONSIVE MOBILE TABS BAR */}
            <div className="md:hidden flex bg-sand-100 p-1.5 rounded-2xl border border-sand-200">
              <button
                onClick={() => setMobileActiveTab('tulis')}
                className={`flex-1 py-3 text-xs font-extrabold rounded-xl cozy-transition cursor-pointer ${
                  mobileActiveTab === 'tulis' 
                    ? "bg-cream-card text-sand-750 shadow-sm font-black" 
                    : "text-sand-500 hover:text-sand-650"
                }`}
              >
                ✏️ Tulis Jurnal
              </button>
              <button
                onClick={() => setMobileActiveTab('riwayat')}
                className={`flex-1 py-3 text-xs font-extrabold rounded-xl cozy-transition cursor-pointer ${
                  mobileActiveTab === 'riwayat' 
                    ? "bg-cream-card text-sand-750 shadow-sm font-black" 
                    : "text-sand-500 hover:text-sand-650"
                }`}
              >
                📅 Kalender & Riwayat Jurnal
              </button>
            </div>

            {/* MAIN COMPOSITION GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
              
              {/* COLUMN 1: JOURNAL WRITING FORM (8 cols on desktop) */}
              <div className={`lg:col-span-8 space-y-6 ${mobileActiveTab === 'tulis' ? 'block' : 'hidden md:block'}`}>
                <JournalForm 
                  selectedDate={selectedDate}
                  existingEntry={currentEntry}
                  onSave={handleSaveJournal}
                  onDelete={handleDeleteJournal}
                  isAnalyzing={isAnalyzing}
                  onShareClick={() => setIsShareOpen(true)}
                />
              </div>

              {/* COLUMN 2: CALENDAR & CHRONOLOGICAL HISTORY (4 cols on desktop) */}
              <div className={`lg:col-span-4 space-y-6 ${mobileActiveTab === 'riwayat' ? 'block' : 'hidden md:block'}`}>
                <CalendarView 
                  entries={entries}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    // On mobile, auto-toggle to form tab when selecting dates so they can quickly write/view it!
                    if (window.innerWidth < 768) {
                      setMobileActiveTab('tulis');
                    }
                  }}
                  streakCount={streakCount}
                />
                
                <PastJournalsList 
                  entries={entries}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    // On mobile, auto-toggle to form tab
                    if (window.innerWidth < 768) {
                      setMobileActiveTab('tulis');
                    }
                  }}
                />
              </div>

            </div>
          </>
        ) : (
          <StatsDashboard 
            entries={entries} 
            streakCount={streakCount} 
          />
        )}

      </main>

      {/* FOOTER COZY BRAND INFO */}
      <footer className="mt-auto pt-6 text-center text-xs text-sand-400 font-medium">
        <p>© 2026 ChuuDay. Harimu, harimu sendiri.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-sand-300">
          <span>Keamanan Data Pribadi Terjamin di Browser LocalStorage</span>
        </p>
      </footer>

      {isShareOpen && currentEntry && (
        <ShareCardModal
          entry={currentEntry}
          streakCount={streakCount}
          onClose={() => setIsShareOpen(false)}
          onBackToHome={() => {
            setIsShareOpen(false);
            const todayStr = new Date().toISOString().split("T")[0];
            setSelectedDate(todayStr);
            setMobileActiveTab('tulis');
            setTimeout(() => {
              const formEl = document.getElementById("journal-input-card");
              if (formEl) {
                formEl.scrollIntoView({ behavior: "smooth" });
              }
            }, 100);
          }}
        />
      )}

      {/* Monthly Recap Modal component */}
      {isRecapOpen && (
        <MonthlyRecapModal 
          entries={entries}
          streakCount={streakCount}
          onClose={() => setIsRecapOpen(false)}
        />
      )}

      {/* New Badge Unlocked Celebration Overlay */}
      {celebratingBadge && (
        <BadgeCelebrationModal 
          badge={celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
        />
      )}

    </div>
  );
}
