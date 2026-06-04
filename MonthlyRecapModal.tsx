import React, { useState } from "react";
import html2canvas from "html2canvas";
import { X, Download, Flame, Trophy, Award, Sparkles, LogIn, Music2, Image as ImageIcon, Heart } from "lucide-react";
import { JournalEntry } from "../types";

interface MonthlyRecapModalProps {
  entries: JournalEntry[];
  streakCount: number;
  onClose: () => void;
}

export default function MonthlyRecapModal({ entries, streakCount, onClose }: MonthlyRecapModalProps) {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Determine which month has the most data or default to previous/current month
  // Since real time is 2026-05-31 and we have seeds in May, let's select "Mei 2026" as target month
  const today = new Date();
  const currentMonthValue = today.toISOString().substring(0, 7); // "2026-05"
  
  // Group entries by month to find the most active logged month
  const monthsWithData: Record<string, number> = {};
  entries.forEach(e => {
    const m = e.date.substring(0, 7);
    monthsWithData[m] = (monthsWithData[m] || 0) + 1;
  });

  // Default to May 2026 (current month) if no entries, otherwise use current Month
  const targetMonthStr = currentMonthValue; // "2026-05"
  const monthEntries = entries.filter(e => e.date.startsWith(targetMonthStr));

  // Determine readable Month Name in Indonesian
  const indonesianMonths = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
  };
  const [yearPart, monthPart] = targetMonthStr.split("-");
  const readableMonth = `${indonesianMonths[monthPart as keyof typeof indonesianMonths] || "Mei"} ${yearPart}`;

  // 1. Total Menit Olahraga Bulan Ini
  const totalMinutes = monthEntries.reduce((sum, e) => sum + e.sportDuration, 0);

  // 2. Olahraga Terfavorit
  const sportsMap: Record<string, number> = {};
  monthEntries.forEach(e => {
    if (e.sportDuration > 0 && e.sportType) {
      const type = e.sportType.trim();
      const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      sportsMap[normalized] = (sportsMap[normalized] || 0) + e.sportDuration;
    }
  });
  let favoriteSport = "Tidak Ada";
  let maxSportDur = 0;
  Object.entries(sportsMap).forEach(([sport, dur]) => {
    if (dur > maxSportDur) {
      maxSportDur = dur;
      favoriteSport = sport;
    }
  });

  // 3. Hari Paling Aktif (day of week with highest logged duration)
  const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayMinutes = Array(7).fill(0);
  monthEntries.forEach(e => {
    if (e.sportDuration > 0) {
      const d = new Date(e.date);
      const dayIdx = d.getDay();
      dayMinutes[dayIdx] += e.sportDuration;
    }
  });
  let maxDayIdx = 0;
  let maxDayMin = 0;
  dayMinutes.forEach((min, idx) => {
    if (min > maxDayMin) {
      maxDayMin = min;
      maxDayIdx = idx;
    }
  });
  const mostActiveDay = maxDayMin > 0 ? daysOfWeek[maxDayIdx] : "Minggu";

  // 4. Mood Terbanyak
  const moodCounts: Record<string, number> = {};
  monthEntries.forEach(e => {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  let dominantMood = "😊";
  let maxMoodCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxMoodCount) {
      maxMoodCount = count;
      dominantMood = mood;
    }
  });
  const moodNameMap = {
    "😊": "Bahagia",
    "😴": "Rehat",
    "💪": "Berstamina",
    "🌧️": "Mellow",
    "✨": "Inspiratif"
  };
  const dominantMoodName = moodNameMap[dominantMood as keyof typeof moodNameMap] || "Bahagia";

  // 5. Streak Terpanjang Bulan Ini
  const calculateMonthMaxStreak = (monthList: JournalEntry[]): number => {
    const datesWithSport = new Set(monthList.filter(e => e.sportDuration > 0).map(e => e.date));
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
  const monthMaxStreak = calculateMonthMaxStreak(monthEntries);

  // 6. Badges earned this month (current active badges)
  const swimCount = entries.filter(e => {
    const type = (e.sportType || "").toLowerCase();
    return type.includes("enang") || type.includes("swim");
  }).length;
  const musicCount = entries.filter(e => e.songTitle && e.songTitle.trim() !== "").length;
  const photoCount = entries.filter(e => e.photoUrl).length;

  const earnedBadges = [
    { emoji: "🌱", title: "Langkah Pertama", isUnlocked: entries.length >= 1 },
    { emoji: "🔥", title: "On Fire!", isUnlocked: monthMaxStreak >= 3 },
    { emoji: "💪", title: "Seminggu Penuh", isUnlocked: monthMaxStreak >= 7 },
    { emoji: "🏊", title: "Aquaman", isUnlocked: swimCount >= 5 },
    { emoji: "🎵", title: "Soundtrack Life", isUnlocked: musicCount >= 7 },
    { emoji: "📸", title: "Moment Keeper", isUnlocked: photoCount >= 5 },
  ].filter(b => b.isUnlocked);

  const handleDownloadRecap = async () => {
    const targetElement = document.getElementById("recap-captured-card");
    if (!targetElement) return;

    setIsCapturing(true);
    setDownloadSuccess(false);

    const originalGetComputedStyle = window.getComputedStyle;

    const oklchToRgb = (l: number, c: number, h: number, a: number = 1): string => {
      const hRad = (h * Math.PI) / 180;
      const LVal = l;
      const aLab = c * Math.cos(hRad);
      const bLab = c * Math.sin(hRad);
      
      const l_ = LVal + 0.3963377774 * aLab + 0.2158037573 * bLab;
      const m_ = LVal - 0.1055613458 * aLab - 0.0638541728 * bLab;
      const s_ = LVal - 0.0894841775 * aLab - 1.2914855480 * bLab;
      
      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;
      
      const r_linear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g_linear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_linear = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;
      
      const rStyle = r_linear <= 0.0031308 ? 12.92 * r_linear : 1.055 * Math.pow(r_linear, 1 / 2.4) - 0.055;
      const gStyle = g_linear <= 0.0031308 ? 12.92 * g_linear : 1.055 * Math.pow(g_linear, 1 / 2.4) - 0.055;
      const bStyle = b_linear <= 0.0031308 ? 12.92 * b_linear : 1.055 * Math.pow(b_linear, 1 / 2.4) - 0.055;
      
      const r = Math.min(255, Math.max(0, Math.round(rStyle * 255)));
      const g = Math.min(255, Math.max(0, Math.round(gStyle * 255)));
      const b = Math.min(255, Math.max(0, Math.round(bStyle * 255)));
      
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const convertOklchStringToRgbForCapture = (colorStr: any): any => {
      if (!colorStr || typeof colorStr !== "string") return colorStr;
      const match = colorStr.match(/okl[ch|ab]+\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+(?:deg|rad|turn)?)(?:\s*\/\s*([0-9.]+%?))?\s*\)/i);
      if (match) {
        const lVal = match[1];
        const cVal = parseFloat(match[2]);
        const hVal = match[3];
        const aVal = match[4];
        const l = lVal.endsWith('%') ? parseFloat(lVal) / 100 : parseFloat(lVal);
        const h = hVal.endsWith('deg') ? parseFloat(hVal) : parseFloat(hVal);
        const a = aVal ? (aVal.endsWith('%') ? parseFloat(aVal) / 100 : parseFloat(aVal)) : 1;
        return oklchToRgb(l, cVal, h, a);
      }
      if (colorStr.includes("oklch") || colorStr.includes("oklab")) {
        return "rgba(247, 245, 240, 1)";
      }
      return colorStr;
    };

    window.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle(el, pseudoElt);
      return new Proxy(style, {
        get(target: any, prop: string | symbol) {
          if (prop === "getPropertyValue") {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              return convertOklchStringToRgbForCapture(val);
            };
          }
          const val = target[prop];
          if (typeof prop === "string" && typeof val === "string") {
            if (prop === "color" || prop === "backgroundColor" || prop === "borderColor" || prop.startsWith("border")) {
              return convertOklchStringToRgbForCapture(val);
            }
          }
          if (typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
            return convertOklchStringToRgbForCapture(val);
          }
          if (typeof val === "function") {
            return val.bind(target);
          }
          return val;
        }
      }) as unknown as CSSStyleDeclaration;
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(targetElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FCFAF7",
        scale: 2,
        logging: false
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Gagal membuat blob gambar");

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ChuuDay_Recap_${readableMonth.replace(" ", "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
    } catch (err) {
      console.error("Gagal mendownload monthly recap:", err);
      alert("Gagal mengunduh kartu ringkasan. Silakan dicoba lagi.");
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] dark:bg-sand-50 rounded-[3rem] max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl border border-[#EDD9C0] relative animate-fade-in-up">
        
        {/* Modal Close */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-sand-100 hover:bg-sand-200 text-sand-500 cozy-transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <span className="text-3xl">🏆</span>
          <h2 className="text-xl font-black text-sand-800 tracking-tight">Evaluasi Kebugaran Bulan Lalu</h2>
          <p className="text-xs text-sand-400 font-bold">Ringkasan aktivitas ChuuDay berdesain polaroid cantik untuk dibagikan.</p>
        </div>

        {/* CARD DESIGN PORTRAIT FOR SHARE - POLAROID LOOK */}
        <div className="flex justify-center shrink-0">
          <div 
            id="recap-captured-card"
            className="w-[360px] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between space-y-6 shadow-xl"
            style={{
              fontFamily: "'Nunito', sans-serif",
              background: "linear-gradient(135deg, #FFEBE0 0%, #E2EBE0 50%, #FAF0F5 100%)",
              border: "1px solid #EDD9C0"
            }}
          >
            {/* Soft decorative elements */}
            <div className="absolute top-3 right-3 text-2xl select-none opacity-30">✨</div>
            <div className="absolute bottom-3 left-3 text-2xl select-none opacity-20">🌱</div>

            {/* BRANDING HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-sand-200/50">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">📊</span>
                <div>
                  <span className="font-extrabold text-[15px] tracking-tight block text-sand-750">
                    ChuuDay
                  </span>
                  <span className="text-[8px] font-bold tracking-wider uppercase block text-sand-500">
                    Monthly Health Recap
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/60 text-sand-600 border border-sand-200/50">
                Mei Celebration 🏅
              </span>
            </div>

            {/* BIG TITLE */}
            <div className="text-center py-2 space-y-1">
              <span className="text-[10px] font-extrabold block uppercase tracking-widest text-sand-400">
                LAPORAN BULANAN
              </span>
              <h3 className="text-2xl font-black text-sand-800 tracking-tight leading-none uppercase">
                {readableMonth}
              </h3>
            </div>

            {/* STATS MATRIX BENTO STYLE */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Total Minutes CARD */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-sand-100 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sand-400">TOTAL OLAHRAGA</span>
                <span className="text-2xl font-black text-sage-600 my-0.5">{totalMinutes}</span>
                <span className="text-[9px] font-bold text-sand-500">Menit Total</span>
              </div>

              {/* Fav Sport CARD */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-sand-100 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sand-400">FAVORIT BULAN INI</span>
                <span className="text-base font-black text-lilac-600 my-1 truncate max-w-full leading-tight">{favoriteSport}</span>
                <span className="text-[9px] font-bold text-sand-500">Sesi Pilihan</span>
              </div>

              {/* Most Active Day */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-sand-100 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sand-400">HARI TERAKTIF</span>
                <span className="text-lg font-black text-sky-600 my-0.5">{mostActiveDay}</span>
                <span className="text-[9px] font-bold text-sand-500">Intensitas Tertinggi</span>
              </div>

              {/* Most Common Mood */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-sand-100 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sand-400">MOOD UTAMA</span>
                <span className="text-2xl my-0.5">{dominantMood}</span>
                <span className="text-[9px] font-bold text-sand-500">{dominantMoodName}</span>
              </div>

            </div>

            {/* STREAK FLAG & BADGES BOX */}
            <div className="space-y-2">
              <div className="p-3 bg-white/60 rounded-2xl border border-sand-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-sand-400 block">STREAK OLAHRAGA TERPANJANG:</span>
                  <span className="text-xs font-black text-sand-700">{monthMaxStreak} Hari Beruntun!</span>
                </div>
              </div>

              {/* Earned Badges lists */}
              <div className="p-3 bg-white/60 rounded-2xl border border-sand-100 space-y-1.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-sand-500 block">LENCANA YANG DIRAIH:</span>
                <div className="flex flex-wrap gap-1.5">
                  {earnedBadges.length > 0 ? (
                    earnedBadges.map((badge, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] font-extrabold px-2 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"
                        title={badge.title}
                      >
                        <span>{badge.emoji}</span>
                        <span className="max-w-[70px] truncate">{badge.title}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] italic font-semibold text-sand-400">Belum ada lencana diraih</span>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-center pt-3 border-t border-dashed border-sand-200/50">
              <span className="text-[8px] font-black uppercase tracking-widest text-sand-400 block">
                CHUUYDAY TRACKER • MEMORI PERJALANAN INDAH • 2026
              </span>
            </div>

          </div>
        </div>

        {/* BUTTONS ROW */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadRecap}
            disabled={isCapturing}
            className="flex-1 py-4 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 text-white font-black text-xs rounded-2x border border-sage-700 hover:shadow-md cursor-pointer block uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl"
          >
            {isCapturing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sedang Memproses PNG...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <span>Berhasil Diunduh! 📂</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Unduh Kartu Recap (PNG)</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-4 px-6 bg-sand-100 hover:bg-sand-200 text-sand-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl text-center cursor-pointer cozy-transition border border-sand-200"
          >
            Kembali ke Beranda
          </button>
        </div>

      </div>
    </div>
  );
}
