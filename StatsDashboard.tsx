import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { JournalEntry } from "../types";
import { Flame, Trophy, Award, Calendar, CheckCircle2, Music2, Image as ImageIcon, Sparkles, Dumbbell } from "lucide-react";

interface StatsDashboardProps {
  entries: JournalEntry[];
  streakCount: number;
}

export default function StatsDashboard({ entries, streakCount }: StatsDashboardProps) {
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pieCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const moodCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const barChartInst = useRef<Chart | null>(null);
  const pieChartInst = useRef<Chart | null>(null);
  const moodChartInst = useRef<Chart | null>(null);

  // Helper functions for stats
  const calculateMaxStreak = (allEntries: JournalEntry[]): number => {
    const datesWithSport = new Set(
      allEntries
        .filter(e => e.sportDuration > 0)
        .map(e => e.date)
    );
    if (datesWithSport.size === 0) return 0;
    
    const sortedDates = Array.from(datesWithSport).sort();
    let maxStreak = 0;
    let currentRun = 0;
    let prevDate: Date | null = null;
    
    for (const dateStr of sortedDates) {
      const currDate = new Date(dateStr);
      if (!prevDate) {
        currentRun = 1;
      } else {
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else if (diffDays > 1) {
          if (currentRun > maxStreak) {
            maxStreak = currentRun;
          }
          currentRun = 1;
        }
      }
      prevDate = currDate;
    }
    if (currentRun > maxStreak) {
      maxStreak = currentRun;
    }
    return maxStreak;
  };

  const maxStreakVal = calculateMaxStreak(entries);
  const maxSessionDuration = entries.length > 0 ? Math.max(...entries.map(e => e.sportDuration)) : 0;
  
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const totalMinutesThisMonth = entries
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.sportDuration, 0);

  const totalMinutesAllTime = entries.reduce((sum, e) => sum + e.sportDuration, 0);

  // Last 7 days minutes total for WHO badge
  const last7DaysTotalMinutes = (): number => {
    const today = new Date();
    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split("T")[0];
    });
    return entries
      .filter(e => past7Days.includes(e.date))
      .reduce((sum, e) => sum + e.sportDuration, 0);
  };
  const weeklyMinutes = last7DaysTotalMinutes();

  // Badges Calculation
  const swimCount = entries.filter(e => {
    const type = (e.sportType || "").toLowerCase();
    return type.includes("enang") || type.includes("swim");
  }).length;

  const musicCount = entries.filter(e => e.songTitle && e.songTitle.trim() !== "").length;
  const photoCount = entries.filter(e => e.photoUrl).length;

  const badges = [
    {
      id: "langkah_pertama",
      emoji: "🌱",
      title: "Langkah Pertama",
      description: "Tulis jurnal Anda untuk pertama kalinya",
      isUnlocked: entries.length >= 1,
      progressValue: Math.min(entries.length, 1),
      progressMax: 1,
    },
    {
      id: "on_fire",
      emoji: "🔥",
      title: "On Fire!",
      description: "Mencapai streak olahraga 3 hari beruntun",
      isUnlocked: maxStreakVal >= 3,
      progressValue: Math.min(maxStreakVal, 3),
      progressMax: 3,
    },
    {
      id: "seminggu_penuh",
      emoji: "💪",
      title: "Seminggu Penuh",
      description: "Mencapai streak olahraga 7 hari beruntun",
      isUnlocked: maxStreakVal >= 7,
      progressValue: Math.min(maxStreakVal, 7),
      progressMax: 7,
    },
    {
      id: "konsisten",
      emoji: "⚡",
      title: "Konsisten",
      description: "Mencapai streak olahraga 30 hari",
      isUnlocked: maxStreakVal >= 30,
      progressValue: Math.min(maxStreakVal, 30),
      progressMax: 30,
    },
    {
      id: "aquaman",
      emoji: "🏊",
      title: "Aquaman",
      description: "Lakukan 5 sesi berenang",
      isUnlocked: swimCount >= 5,
      progressValue: Math.min(swimCount, 5),
      progressMax: 5,
    },
    {
      id: "soundtrack_life",
      emoji: "🎵",
      title: "Soundtrack Life",
      description: "Tambahkan lagu favorit di 7 jurnal harian",
      isUnlocked: musicCount >= 7,
      progressValue: Math.min(musicCount, 7),
      progressMax: 7,
    },
    {
      id: "moment_keeper",
      emoji: "📸",
      title: "Moment Keeper",
      description: "Unggah foto pribadi di 5 jurnal harian",
      isUnlocked: photoCount >= 5,
      progressValue: Math.min(photoCount, 5),
      progressMax: 5,
    },
    {
      id: "club_150",
      emoji: "🏆",
      title: "150 Menit Club",
      description: "Tembus target WHO 150 menit olahraga per minggu",
      isUnlocked: weeklyMinutes >= 150,
      progressValue: Math.min(weeklyMinutes, 150),
      progressMax: 150,
    }
  ];

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#E3DDD5" : "#5E4A3B";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";

    // 1. BAR CHART: Sport hours last 7 days
    if (barCanvasRef.current) {
      if (barChartInst.current) {
        barChartInst.current.destroy();
      }

      // Calculate last 7 days (including today)
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const entry = entries.find(e => e.date === dateStr);
        return {
          label: d.toLocaleDateString("id-ID", { weekday: "short" }),
          dateStr,
          duration: entry ? entry.sportDuration : 0
        };
      });

      barChartInst.current = new Chart(barCanvasRef.current, {
        type: "bar",
        data: {
          labels: days.map(d => d.label),
          datasets: [{
            label: "Menit Olahraga",
            data: days.map(d => d.duration),
            backgroundColor: "#71936A",
            hoverBackgroundColor: "#4F634E",
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#3A3733" : "#FCFAF7",
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isDark ? "#55514B" : "#E6D5C3",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (context) => ` ${context.parsed.y} menit`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: "Nunito", weight: "bold", size: 10 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: "Nunito", size: 10 } }
            }
          }
        }
      });
    }

    // 2. DONUT CHART: Favorite Sports Breakdown
    if (pieCanvasRef.current) {
      if (pieChartInst.current) {
        pieChartInst.current.destroy();
      }

      const sportsMap: Record<string, number> = {};
      entries.forEach(e => {
        if (e.sportDuration > 0 && e.sportType) {
          const type = e.sportType.trim();
          const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
          sportsMap[normalized] = (sportsMap[normalized] || 0) + e.sportDuration;
        }
      });

      const labels = Object.keys(sportsMap);
      const data = Object.values(sportsMap);

      if (labels.length === 0) {
        labels.push("Belum Ada Data");
        data.push(1);
      }

      const colors = ["#71936A", "#9E74CD", "#B28F6C", "#6B9FA9", "#E6A23C", "#F56C6C", "#409EFF"];

      pieChartInst.current = new Chart(pieCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors.slice(0, Math.max(1, labels.length)),
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? "#3A3733" : "#FCFAF7",
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
                font: { family: "Nunito", weight: "bold", size: 11 },
                padding: 12,
                boxWidth: 12
              }
            },
            tooltip: {
              backgroundColor: isDark ? "#3A3733" : "#FCFAF7",
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isDark ? "#55514B" : "#E6D5C3",
              borderWidth: 1,
              callbacks: {
                label: (context) => {
                  if (labels[0] === "Belum Ada Data") return " Tidak ada sesi olahraga";
                  return ` ${context.label}: ${context.parsed} menit total`;
                }
              }
            }
          },
          cutout: "60%"
        }
      });
    }

    // 3. MOOD TREND: Pie Chart
    if (moodCanvasRef.current) {
      if (moodChartInst.current) {
        moodChartInst.current.destroy();
      }

      const moodDataMap = {
        "😊": { count: 0, label: "Bahagia" },
        "😴": { count: 0, label: "Rehat" },
        "💪": { count: 0, label: "Berstamina" },
        "🌧️": { count: 0, label: "Mellow" },
        "✨": { count: 0, label: "Inspiratif" }
      };

      entries.forEach(e => {
        if (e.mood in moodDataMap) {
          moodDataMap[e.mood as keyof typeof moodDataMap].count++;
        }
      });

      const labels = Object.values(moodDataMap).map(m => m.label);
      const data = Object.values(moodDataMap).map(m => m.count);
      const emojis = Object.keys(moodDataMap);

      const colors = ["#C8DDD4", "#D4CDE8", "#C2D5BD", "#EDD9C0", "#F5EBE0"];

      moodChartInst.current = new Chart(moodCanvasRef.current, {
        type: "pie",
        data: {
          labels: labels.map((l, idx) => `${emojis[idx]} ${l}`),
          datasets: [{
            data: data,
            backgroundColor: ["#E2EBE0", "#F0E6F7", "#FFEAA7", "#E5F1F4", "#FCFAF7"],
            borderColor: isDark ? "#3A3733" : "#FCFAF7",
            borderWidth: isDark ? 2 : 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: textColor,
                font: { family: "Nunito", weight: "bold", size: 11 },
                padding: 12,
                boxWidth: 12
              }
            },
            tooltip: {
              backgroundColor: isDark ? "#3A3733" : "#FCFAF7",
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: isDark ? "#55514B" : "#E6D5C3",
              borderWidth: 1,
              callbacks: {
                label: (context) => ` Total: ${context.parsed} hari`
              }
            }
          }
        }
      });
    }

    return () => {
      if (barChartInst.current) barChartInst.current.destroy();
      if (pieChartInst.current) pieChartInst.current.destroy();
      if (moodChartInst.current) moodChartInst.current.destroy();
    };
  }, [entries]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. RECORDS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Streak Terpanjang */}
        <div className="bg-cream-card rounded-[2rem] border border-sand-100 p-5 flex items-center gap-4 paper-shadow">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-2xl flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sand-400 block uppercase tracking-wider">Rekor Streak</span>
            <span className="text-xl font-black text-sand-800 tracking-tight block">{maxStreakVal} Hari</span>
            <span className="text-[11px] text-sand-500 font-medium">Beruntun Tanpa Absen</span>
          </div>
        </div>

        {/* Latihan Terlama */}
        <div className="bg-cream-card rounded-[2rem] border border-sand-100 p-5 flex items-center gap-4 paper-shadow">
          <div className="w-12 h-12 bg-sage-50 dark:bg-sage-950/40 border border-sage-200 dark:border-sage-900 rounded-2xl flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 text-sage-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sand-400 block uppercase tracking-wider">Sesi Terlama</span>
            <span className="text-xl font-black text-sand-800 tracking-tight block">{maxSessionDuration} Menit</span>
            <span className="text-[11px] text-sand-500 font-medium">Rekor Olahraga Terpanjang</span>
          </div>
        </div>

        {/* Menit Olahraga Bulan Ini */}
        <div className="bg-cream-card rounded-[2rem] border border-sand-100 p-5 flex items-center gap-4 paper-shadow">
          <div className="w-12 h-12 bg-lilac-50 dark:bg-lilac-950/40 border border-lilac-200 dark:border-lilac-900 rounded-2xl flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-lilac-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sand-400 block uppercase tracking-wider">Menit Bulan Ini</span>
            <span className="text-xl font-black text-sand-800 tracking-tight block">{totalMinutesThisMonth} Menit</span>
            <span className="text-[11px] text-sand-500 font-medium">Olahraga Selama Mei</span>
          </div>
        </div>

        {/* Total Menit Sepanjang Waktu */}
        <div className="bg-cream-card rounded-[2rem] border border-sand-100 p-5 flex items-center gap-4 paper-shadow">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sand-400 block uppercase tracking-wider">Total Olahraga</span>
            <span className="text-xl font-black text-sand-800 tracking-tight block">{totalMinutesAllTime} Menit</span>
            <span className="text-[11px] text-sand-500 font-medium">Seluruh Catatan Riwayat</span>
          </div>
        </div>

      </div>

      {/* 2. MAIN CHARTS GRID */}
      <h3 className="text-base font-black text-sand-800 flex items-center gap-2 mt-4">
        <span>📊 Analisis Grafik Tren Kebugaran</span>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Bar Chart (Col 7) */}
        <div className="lg:col-span-7 bg-cream-card border border-sand-100 rounded-[2.5rem] p-6 paper-shadow flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-sand-800">Menit Kegiatan Olahraga</h4>
              <p className="text-[11px] text-sand-400 font-bold">Aktivitas olahraga selama 7 hari kalender terakhir</p>
            </div>
            <span className="text-xs font-bold text-sage-600 bg-sage-50 border border-sage-100 px-3 py-1.5 rounded-xl">
              {weeklyMinutes} Menit Aktif
            </span>
          </div>
          <div className="relative h-64 w-full">
            <canvas ref={barCanvasRef} />
          </div>
        </div>

        {/* Favorite Sports Donut Chart (Col 5) */}
        <div className="lg:col-span-5 bg-cream-card border border-sand-100 rounded-[2.5rem] p-6 paper-shadow flex flex-col space-y-4">
          <div>
            <h4 className="text-sm font-black text-sand-800">Olahraga Terfavorit</h4>
            <p className="text-[11px] text-sand-400 font-bold">Rasio pembagian bekal waktu olahraga harian</p>
          </div>
          <div className="relative h-64 w-full flex items-center justify-center">
            <canvas ref={pieCanvasRef} />
          </div>
        </div>

        {/* Mood Distribution Pie Chart (Col 12/Full) */}
        <div className="lg:col-span-12 bg-cream-card border border-sand-100 rounded-[2.5rem] p-6 paper-shadow flex flex-col space-y-4">
          <div>
            <h4 className="text-sm font-black text-sand-800">Kecenderungan Mood & Suasana</h4>
            <p className="text-[11px] text-sand-400 font-bold">Pencatatan emosional dan stabilitas batin harian</p>
          </div>
          <div className="relative h-64 w-full flex items-center justify-center">
            <canvas ref={moodCanvasRef} />
          </div>
        </div>

      </div>

      {/* 3. ACHIEVEMENTS / BADGES CONTAINER */}
      <div className="pt-6 border-t border-sand-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-black text-sand-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 fill-amber-100" />
              <span>Sistem Pencapaian & Lencana Pencatat</span>
            </h3>
            <p className="text-xs text-sand-400 font-medium leading-relaxed">
              Kompilasi piagam kebugaran yang terbuka secara otomatis berdasarkan pencapaian harian Anda! 🎮
            </p>
          </div>
          <span className="text-xs font-black bg-amber-50 dark:bg-amber-950/40 border border-amber-250 text-amber-600 px-3.5 py-2.5 rounded-2xl">
            🏆 {badges.filter(b => b.isUnlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-[2rem] border relative flex flex-col justify-between cozy-transition space-y-3 ${
                  badge.isUnlocked 
                    ? "bg-cream-card border-amber-200 paper-shadow hover:scale-[1.03]" 
                    : "bg-sand-50/50 dark:bg-sand-150/10 border-sand-100 opacity-60"
                }`}
              >
                {/* Status Indicator */}
                {badge.isUnlocked ? (
                  <div className="absolute top-4 right-4 text-emerald-500" title="Terbuka!">
                    <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-500" />
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 text-sand-400 text-xs font-black tracking-wider bg-sand-100 px-2 py-1 rounded" style={{ fontFamily:"monospace" }} title="Terkunci">
                    🔒 LOCK
                  </div>
                )}

                {/* Badge Emoji */}
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-3xl shadow-sm border ${
                  badge.isUnlocked 
                    ? "bg-amber-50 border-amber-200 animate-mood-bounce" 
                    : "bg-sand-100 border-sand-200 grayscale filter"
                }`}>
                  {badge.emoji}
                </div>

                {/* Badge description */}
                <div className="space-y-1 pt-1">
                  <h4 className={`text-xs font-black ${badge.isUnlocked ? "text-sand-800" : "text-sand-400"}`}>
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-sand-400 font-bold leading-normal">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-2 border-t border-dashed border-sand-100">
                  <div className="flex items-center justify-between text-[8px] font-black tracking-wider uppercase text-sand-400">
                    <span>Progres</span>
                    <span>{badge.progressValue} / {badge.progressMax}</span>
                  </div>
                  <div className="h-1.5 w-full bg-sand-100 dark:bg-sand-300 rounded-full overflow-hidden">
                    <div 
                      className={`h-full cozy-transition rounded-full ${badge.isUnlocked ? "bg-amber-500" : "bg-sand-300"}`}
                      style={{ width: `${(badge.progressValue / badge.progressMax) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
