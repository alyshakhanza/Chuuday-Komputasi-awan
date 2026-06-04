/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X, Download, Sparkles, Music2, Flame, Heart, RefreshCw } from "lucide-react";
import { JournalEntry } from "../types";

interface ShareCardModalProps {
  entry: JournalEntry;
  streakCount: number;
  onClose: () => void;
  onBackToHome?: () => void;
}

export default function ShareCardModal({
  entry,
  streakCount,
  onClose,
  onBackToHome
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Human clean date formats
  const displayDateStr = new Date(entry.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Pick lovely pastel background based on mood
  const getCardTheme = (m: string) => {
    switch (m) {
      case "😊": return { bg: "#F4FAF2", border: "#C8DDD4", accentBg: "#E2EBE0", text: "#3E4E3D" };
      case "😴": return { bg: "#F5FAFC", border: "#C9DDE8", accentBg: "#E5F1F4", text: "#2E484F" };
      case "💪": return { bg: "#FCFAF7", border: "#EDD9C0", accentBg: "#F5EBE0", text: "#5E4A3B" };
      case "✨": return { bg: "#FAF6FC", border: "#D4CDE8", accentBg: "#F0E6F7", text: "#553D66" };
      default: return { bg: "#FCFAF7", border: "#EDD9C0", accentBg: "#F5EBE0", text: "#5E4A3B" };
    }
  };

  const theme = getCardTheme(entry.mood);

  // Get a single short 1-sentence motivation quote from Chuu's insights
  const getShortChuuQuote = () => {
    if (entry.aiInsight && entry.aiInsight.motivation) {
      // Clean or truncate to first sentence if too long to look beautiful on a card
      const sentences = entry.aiInsight.motivation.split(/[.!?]+/);
      const firstSentence = sentences[0].trim();
      return firstSentence ? `${firstSentence}.` : entry.aiInsight.motivation;
    }
    return `Optimalkan pemulihan dengan hidrasi seimbang dan istirahat teratur demi menjaga vitalitas harian.`;
  };

  const handeDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    setDownloadSuccess(false);

    // Backup original getComputedStyle
    const originalGetComputedStyle = window.getComputedStyle;

    // Mathematical standard OKLCH to RGB conversion
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
      
      // Match oklch(L C H / A) or oklch(L C H)
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
        return "rgba(247, 245, 240, 1)"; // Return delightful #F7F5F0 base
      }
      return colorStr;
    };

    // Proxy getComputedStyle to filter oklch colors before html2canvas sees them
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
      // Slight delay to ensure layout is settled and assets are loaded
      await new Promise((resolve) => setTimeout(resolve, 350));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher export quality
        backgroundColor: "#FCFAF7", // Warm sand base
        logging: false
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ChuuDay-Card-${entry.date}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal mendownload kartu ChuuDay:", err);
      alert("Gagal mengunduh kartu gambar. Silakan dicoba sesaat lagi.");
    } finally {
      // Restore original getComputedStyle without fail
      window.getComputedStyle = originalGetComputedStyle;
      setIsCapturing(false);
    }
  };

  return (
    <div id="share-modal-overlay" className="fixed inset-0 bg-sand-700/60 backdrop-blur-sm z-[9999] overflow-y-auto p-4 md:p-6 flex justify-center items-start md:items-center py-8">
      {/* Container Card */}
      <div className="my-auto bg-cream-card rounded-3xl w-full max-w-lg overflow-hidden paper-shadow-lg border border-sand-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header bar controls */}
        <div className="p-4 bg-sand-100/70 border-b border-sand-100 flex items-center justify-between">
          <span className="text-xs font-black text-sand-500 uppercase tracking-widest flex items-center gap-1.5 text-sand-500">
            <Sparkles className="w-4 h-4 text-lilac-500 animate-pulse fill-lilac-200" />
            <span>ChuuDay Card Generator</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-sand-200 text-sand-500 rounded-full cozy-transition cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable preview and action buttons */}
        <div className="p-6 space-y-6 flex flex-col items-center">
          
          <p className="text-xs text-sand-500 text-center font-medium max-w-sm">
            Ini pratinjau kartu ChuuDay Card Anda. Catatan harian pribadi tetap sepenuhnya privat — yang ditampilkan hanya statistik aktivitas kebugaran Anda! 📊
          </p>
          {/* THE CARD DESIGN - CAPTURED PIECE */}
          <div className="bg-[#FCFAF7] p-4 rounded-3xl border border-[#F5EBE0] shadow-inner w-full flex justify-center overflow-x-hidden">
            <div 
              ref={cardRef} 
              id="chuuday-captured-card"
              className="w-[340px] rounded-2xl flex flex-col justify-between relative overflow-hidden"
              style={{ 
                fontFamily: "'Nunito', sans-serif",
                backgroundColor: "#F7F5F0",
                borderColor: "#EDD9C0",
                borderWidth: "2px",
                borderStyle: "solid",
                color: "#5E4A3B"
              }}
            >
              
              {/* TOP HEADER BLOCK (PHOTO OR GRADIENT) */}
              <div 
                className="relative w-full h-[200px] overflow-hidden"
                style={{
                  borderBottom: "1px solid #EDD9C0"
                }}
              >
                {entry.photoUrl ? (
                  <>
                    <img 
                      src={entry.photoUrl} 
                      alt="ChuuDay Day Photo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      className="absolute inset-0" 
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }} 
                    />
                  </>
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{
                      background: "linear-gradient(135deg, #C8DDD4, #D4CDE8)"
                    }}
                  />
                )}

                {/* Overlaid Title & Date info */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                      <span className="text-xl">📊</span>
                      <div>
                        <span className="font-extrabold text-[15px] tracking-tight block text-white">
                          ChuuDay
                        </span>
                        <span className="text-[8px] font-bold tracking-wider uppercase block text-white/95">
                          Daily Physical Tracker
                        </span>
                      </div>
                    </div>
                    <div>
                      <span 
                        className="text-[9px] font-bold px-2.5 py-1 rounded-full"
                        style={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.25)", 
                          color: "#FFFFFF", 
                          border: "1px solid rgba(255, 255, 255, 0.35)",
                          backdropFilter: "blur(2px)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                        }}
                      >
                        Fitness Tracker
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                    <p className="text-sm font-black text-white">
                      {displayDateStr}
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM CONTENT AREA */}
              <div className="p-5 flex flex-col space-y-4 relative">
                
                {/* Botanical Watermark in lower left */}
                <div className="absolute bottom-2 left-2 text-xl select-none" style={{ opacity: 0.3 }}>🌸</div>

                {/* MOOD & ACTIVITY GRID */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Mood Sticker */}
                  <div className="p-3 rounded-xl flex flex-col items-center justify-center text-center" style={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold mb-1" style={{ color: "#7A614C" }}>
                      Mood Suasana
                    </span>
                    <span className="text-4xl leading-none my-1">
                      {entry.mood}
                    </span>
                    <span className="text-[10px] font-extrabold" style={{ color: theme.text }}>
                      {entry.mood === "😊" ? "Bahagia" : entry.mood === "😴" ? "Rehat" : entry.mood === "💪" ? "Berstamina" : entry.mood === "🌧️" ? "Mellow" : "Sihir/Inspiratif"}
                    </span>
                  </div>

                  {/* Exercise Stats */}
                  <div className="p-3 rounded-xl flex flex-col items-center justify-center text-center" style={{ backgroundColor: "#FCFAF7", border: "1px solid #EDD9C0" }}>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold mb-1" style={{ color: "#7A614C" }}>
                      Durasi Olahraga
                    </span>
                    <span className="text-2xl font-black my-0.5 leading-none" style={{ color: "#3E4E3D" }}>
                      {entry.sportDuration} <span className="text-[10px] font-semibold" style={{ color: "#7A614C" }}>menit</span>
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded mt-1 truncate max-w-full" style={{ backgroundColor: "#E2EBE0", color: "#3E4E3D" }}>
                      {entry.sportType || "Tidak Ada"}
                    </span>
                  </div>
                </div>

                {/* STREAK FLAG & SOUNDTRACK SECTION */}
                <div className="space-y-2.5">
                  {/* Active Streak */}
                  {streakCount > 0 && (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ backgroundColor: "#FCFAF7", border: "1px solid #EDD9C0" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5EBE0" }}>
                        <Flame className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest block" style={{ color: "#7A614C" }}>Streak Olahraga:</span>
                        <span className="text-xs font-black" style={{ color: "#3E4E3D" }}>{streakCount} Hari Beruntun!</span>
                      </div>
                    </div>
                  )}

                  {/* Music Soundtrack Box */}
                  {entry.songTitle ? (
                    <div className="p-2.5 rounded-xl flex items-center gap-2.5 border" style={{ backgroundColor: "#FAF6FC", borderColor: "#D4CDE8" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0E6F7", color: "#6A4D80" }}>
                        <Music2 className="w-4.5 h-4.5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[8px] font-bold uppercase tracking-widest block" style={{ color: "#6A4D80" }}>Lagu Hari Ini:</span>
                        <span className="text-xs font-extrabold block truncate leading-snug" style={{ color: "#3E4E3D" }}>{entry.songTitle}</span>
                        <span className="text-[9px] block truncate leading-none mt-0.5" style={{ color: "#6A4D80" }}>{entry.songArtist || "Artis Pilihan"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl flex items-center gap-2.5 border" style={{ backgroundColor: "#FCFAF7", borderColor: "#EDD9C0" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E2EBE0", color: "#3E4E3D" }}>
                        <Music2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest block" style={{ color: "#7A614C" }}>Soundtrack:</span>
                        <span className="text-xs italic block font-medium" style={{ color: "#7A614C" }}>Bersenandung rileks</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER POLAROID LOOK */}
                <div className="text-center pt-3 border-t border-dashed" style={{ borderTopColor: "#EDD9C0" }}>
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "#7A614C" }}>
                    Kalkulasi Data Terverifikasi • ChuuDay Tracker • 2026
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handeDownloadImage}
              disabled={isCapturing}
              className={`
                w-full py-3.5 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow cozy-transition cursor-pointer
                ${isCapturing 
                  ? "bg-sand-400 cursor-not-allowed" 
                  : "bg-sage-600 hover:bg-sage-700"
                }
              `}
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Meracik Kartu Gambar Gambar...</span>
                </>
              ) : (
                <>
                  <Download className="w-4.5 h-4.5" />
                  <span>Unduh Kartu (PNG)</span>
                </>
              )}
            </button>

            {downloadSuccess && (
              <div className="text-center text-xs font-bold text-emerald-500 animate-bounce">
                🎉 Kartu ChuuDay berhasil diunduh! Silakan bagikan ke WhatsApp atau Instagram!
              </div>
            )}

            <button
              onClick={onBackToHome || onClose}
              className="w-full py-3 rounded-2xl text-xs font-extrabold text-sand-600 bg-sand-50 hover:bg-sand-100 border border-sand-200 cozy-transition cursor-pointer text-center"
            >
              Kembali ke Beranda
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
