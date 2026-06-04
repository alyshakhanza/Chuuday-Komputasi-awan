/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Smile, Music, Dumbbell, Clock, Activity, Image as ImageIcon, 
  Trash2, Sparkles, Send, RefreshCw, X, FileText, Share2
} from "lucide-react";
import { JournalEntry } from "../types";

// Extractor function for YouTube video IDs
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface JournalFormProps {
  selectedDate: string; // YYYY-MM-DD
  existingEntry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onDelete: (date: string) => void;
  isAnalyzing: boolean;
  onShareClick?: () => void;
}

export default function JournalForm({
  selectedDate,
  existingEntry,
  onSave,
  onDelete,
  isAnalyzing,
  onShareClick
}: JournalFormProps) {
  // Setup fields with default states
  const [textContent, setTextContent] = useState("");
  const [sportType, setSportType] = useState("");
  const [sportDuration, setSportDuration] = useState<number>(30);
  const [sportIntensity, setSportIntensity] = useState<'ringan' | 'sedang' | 'berat'>("sedang");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [mood, setMood] = useState<'😊' | '😴' | '💪' | '🌧️' | '✨'>("😊");

  const [fileName, setFileName] = useState("");

  // Common popular sports for fast click presets
  const sportPresets = [
    "Jalan Kaki", "Lari Sore", "Yoga", "Angkat Beban", 
    "Bersepeda", "Berenang", "Senam Cardio", "Zumba"
  ];

  // Sync state if existing entry changes (e.g. clicking on a logged day in calendar)
  useEffect(() => {
    if (existingEntry) {
      setTextContent(existingEntry.textContent || "");
      setSportType(existingEntry.sportType || "");
      setSportDuration(existingEntry.sportDuration || 0);
      setSportIntensity(existingEntry.sportIntensity || "sedang");
      setSongTitle(existingEntry.songTitle || "");
      setSongArtist(existingEntry.songArtist || "");
      setYoutubeUrl(existingEntry.youtubeUrl || "");
      setPhotoUrl(existingEntry.photoUrl);
      setMood(existingEntry.mood || "😊");
      setFileName(existingEntry.photoUrl ? "Foto Jurnal" : "");
    } else {
      // Clear or set default
      setTextContent("");
      setSportType("");
      setSportDuration(30);
      setSportIntensity("sedang");
      setSongTitle("");
      setSongArtist("");
      setYoutubeUrl("");
      setPhotoUrl(undefined);
      setMood("😊");
      setFileName("");
    }
  }, [existingEntry, selectedDate]);

  // Handle Photo upload converting to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    setFileName("");
  };

  // Keep track of Youtube ID auto detections to surprise besties nicely
  const handleYoutubeUrlChange = (val: string) => {
    setYoutubeUrl(val);
    const id = getYouTubeId(val);
    if (id) {
      const knownSongs: Record<string, { title: string; artist: string }> = {
        "kYJ_f_u1CRI": { title: "Rayuan Perempuan Gila", artist: "Nadin Amizah" },
        "Aptv3zPFFyQ": { title: "Hati-Hati di Jalan", artist: "Tulus" },
        "R_SgW_AWe_Y": { title: "Satu Bulan", artist: "Bernadya" },
        "mD8A6r5S3s0": { title: "Untungnya, Hidup Harus Tetap Berjalan", artist: "Bernadya" },
        "Kz6E1XfFExU": { title: "Dari Planet Lain", artist: "Sal Priadi" },
        "dQw4w9WgXcQ": { title: "Never Gonna Give You Up", artist: "Rick Astley" },
      };
      
      if (knownSongs[id]) {
        setSongTitle(knownSongs[id].title);
        setSongArtist(knownSongs[id].artist);
      } else {
        if (!songTitle) setSongTitle("Lagu Pilihan Hari Ini");
        if (!songArtist) setSongArtist("Artis Pilihan");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEntry: JournalEntry = {
      id: selectedDate,
      date: selectedDate,
      textContent,
      sportType,
      sportDuration,
      sportIntensity,
      songTitle,
      songArtist,
      youtubeUrl,
      photoUrl,
      mood,
      aiInsight: existingEntry?.aiInsight, // Preserve previous insight if editing and not analyses yet
      createdAt: existingEntry ? existingEntry.createdAt : new Date().toISOString()
    };
    onSave(cleanEntry);
  };

  // Human friendly displayed date
  const displayDateStr = new Date(selectedDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div id="journal-input-card" className="bg-cream-card rounded-3xl p-6 md:p-8 paper-shadow border border-sand-100 flex flex-col cozy-transition">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-sand-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold text-sage-600 bg-sage-50 px-3 py-1 rounded-full border border-sage-100">
            {existingEntry ? "Edit Jurnal" : "Tulis Baru"}
          </span>
          <h2 className="text-xl font-extrabold text-sand-700 font-sans tracking-tight mt-1.5">
            {displayDateStr}
          </h2>
        </div>
        
        {existingEntry && (
          <button
            type="button"
            onClick={() => onDelete(selectedDate)}
            className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-100 cozy-transition cursor-pointer"
            title="Hapus Jurnal Hari Ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Hapus Jurnal</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. MOOD STICKER */}
        <div>
          <label className="text-xs font-bold text-sand-500 uppercase tracking-widest block mb-2.5">
            1. Pilih Mood / Suasana Hati
          </label>
          <div className="flex justify-between sm:justify-start gap-3">
            {(['😊', '😴', '💪', '🌧️', '✨'] as const).map((m) => {
              const labels = {
                '😊': 'Happy',
                '😴': 'Lemes',
                '💪': 'Fit',
                '🌧️': 'Mellow',
                '✨': 'Sihir'
              };
              const isSelected = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`
                    flex flex-col items-center gap-1.5 flex-1 sm:flex-initial py-3 px-3.5 rounded-2xl cozy-transition border cursor-pointer text-center relative
                    ${isSelected 
                      ? "bg-lilac-100 border-lilac-400 text-lilac-700 font-extrabold scale-105 shadow-sm animate-mood-bounce" 
                      : "bg-sand-50/50 border-sand-100 text-sand-500 hover:bg-sand-100/50 hover:border-sand-200"
                    }
                  `}
                >
                  <span className="text-3xl leading-none">{m}</span>
                  <span className="text-[10px] font-semibold">{labels[m]}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-lilac-500 flex items-center justify-center text-[8px] text-white">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. TEXT STORY */}
        <div>
          <label className="text-xs font-bold text-sand-500 uppercase tracking-widest block mb-2" htmlFor="story-input">
            2. Cerita Catatan Hari Ini
          </label>
          <div className="relative">
            <textarea
              id="story-input"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={4}
              placeholder="Bagaimana hari Anda berjalan? Catat aktivitas fisik, tantangan kebugaran, kemajuan harian, atau pemikiran kebugaran Anda di sini..."
              className="w-full bg-sand-50/40 hover:bg-sand-50/70 focus:bg-cream-card rounded-2xl p-4 text-sm text-sand-700 placeholder-sand-400 border border-sand-100 focus:border-lilac-300 focus:outline-none focus:ring-4 focus:ring-lilac-50 cozy-transition resize-none"
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[11px] text-sand-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Catatan Jurnal Pribadi Anda Tetap Aman & Privat</span>
            </div>
          </div>
        </div>

        {/* 3. SPORT TYPE + DURATION + INTENSITY (GRID) */}
        <div className="bg-sand-50/40 border border-sand-100 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sand-600 uppercase tracking-widest">
            <Dumbbell className="w-4 h-4 text-sage-500" />
            <span>3. Aktivitas Olahraga Hari Ini</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sport Type Dropdown / Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-sand-500 block" htmlFor="sport-type-input">
                Jenis Olahraga
              </label>
              <input
                id="sport-type-input"
                type="text"
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                placeholder="misal: Lari Sore, Gym, Yoga, Berenang"
                className="w-full bg-cream-card rounded-xl p-3 text-sm text-sand-700 border border-sand-200 focus:border-sage-300 focus:outline-none cozy-transition"
              />
              
              {/* Presets Grid */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sportPresets.slice(0, 6).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSportType(preset)}
                    className="text-[10px] font-bold text-sage-700 bg-sage-50 hover:bg-sage-100 border border-sage-200/50 rounded-full px-2.5 py-1 cozy-transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Sport Duration and Intensity */}
            <div className="space-y-4">
              {/* Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-sand-500">
                  <label htmlFor="duration-input">Durasi Latihan</label>
                  <span className="text-sage-600 font-extrabold bg-sage-100 px-2 py-0.5 rounded-lg border border-sage-200/50">
                    {sportDuration} menit
                  </span>
                </div>
                <input
                  id="duration-input"
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={sportDuration}
                  onChange={(e) => setSportDuration(Number(e.target.value))}
                  className="w-full accent-sage-500 h-2 bg-sand-200 rounded-lg cursor-pointer focus:outline-none"
                />
              </div>

              {/* Intensity Picker */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-sand-500 block">
                  Intensitas Latihan
                </span>
                <div className="flex gap-2">
                  {(['ringan', 'sedang', 'berat'] as const).map((intensity) => {
                    const activeColorClass = {
                      ringan: "bg-sky-50 border-sky-300 text-sky-700 focus:ring-sky-50",
                      sedang: "bg-sage-50 border-sage-300 text-sage-700 focus:ring-sage-50",
                      berat: "bg-orange-50 border-orange-300 text-orange-700 focus:ring-orange-50"
                    }[intensity];

                    const isSelected = sportIntensity === intensity;

                    return (
                      <button
                        key={intensity}
                        type="button"
                        onClick={() => setSportIntensity(intensity)}
                        className={`
                          flex-1 py-1.5 px-3 border rounded-xl text-xs font-bold uppercase tracking-wider cozy-transition cursor-pointer text-center
                          ${isSelected 
                            ? activeColorClass 
                            : "bg-cream-card border-sand-200 text-sand-500 hover:bg-sand-50"
                          }
                        `}
                      >
                        {intensity}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 4. MUSIC/SONG OF THE DAY WITH YOUTUBE LINK */}
        <div className="bg-sand-50/40 border border-sand-100 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sand-600 uppercase tracking-widest">
            <Music className="w-4 h-4 text-lilac-500 animate-pulse" />
            <span>4. Soundtrack Harimu (Link YouTube)</span>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-sand-500" htmlFor="youtube-url">
                Tautan Video / Lagu YouTube
              </label>
              <input
                id="youtube-url"
                type="text"
                value={youtubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                placeholder="misal: https://www.youtube.com/watch?v=Aptv3zPFFyQ atau https://youtu.be/..."
                className="w-full bg-cream-card rounded-xl p-3 text-sm text-sand-700 border border-sand-200 focus:border-lilac-300 focus:outline-none cozy-transition"
              />
            </div>

            {/* Collapsible details for human labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sand-400" htmlFor="song-title">Judul Lagu</label>
                <input
                  id="song-title"
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Terisi otomatis atau isi manual jika perlu"
                  className="w-full bg-cream-card/60 focus:bg-cream-card rounded-xl p-2.5 text-xs text-sand-700 border border-sand-200 focus:border-lilac-300 focus:outline-none cozy-transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sand-400" htmlFor="song-artist">Nama Artis / Musisi</label>
                <input
                  id="song-artist"
                  type="text"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  placeholder="Terisi otomatis atau isi manual jika perlu"
                  className="w-full bg-cream-card/60 focus:bg-cream-card rounded-xl p-2.5 text-xs text-sand-700 border border-sand-200 focus:border-lilac-300 focus:outline-none cozy-transition"
                />
              </div>
            </div>

            {/* Embedded Interactive YouTube Player */}
            {getYouTubeId(youtubeUrl) && (
              <div className="space-y-1.5 pt-2 border-t border-sand-100">
                <span className="text-[10px] font-bold text-sand-400 block mb-1">Pratinjau Pemutar YouTube:</span>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-sand-200 shadow-inner bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeId(youtubeUrl)}`}
                    title="ChuuDay YouTube player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. PHOTO UPLOAD (SIMULATED OR DATA BASE64) */}
        <div className="border border-dashed border-sand-300 rounded-3xl p-5 bg-sand-50/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-sand-100 rounded-2xl flex items-center justify-center text-sand-500">
                <ImageIcon className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-sand-600 block">5. Unggah Foto Aktivitas</span>
                <span className="text-[10px] text-sand-400 block font-medium">Tambahkan dokumentasi visual aktivitas kebugaran harian Anda.</span>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="photo-upload-input"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <label
                htmlFor="photo-upload-input"
                className="bg-cream-card hover:bg-sand-50 text-sand-600 text-xs font-bold border border-sand-200 rounded-xl px-4 py-2.5 cozy-transition cursor-pointer block text-center"
              >
                Pilih Berkas Foto
              </label>
            </div>
          </div>

          {/* Photo Preview inside form */}
          {photoUrl && (
            <div className="mt-4 bg-sand-50 p-2.5 rounded-2xl border border-sand-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <img 
                  src={photoUrl} 
                  alt="Preview" 
                  className="w-12 h-12 object-cover rounded-xl border border-sand-200"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-extrabold text-sand-700 block truncate max-w-[200px]" title={fileName}>
                    {fileName || "Berhasil Diunggah"}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold block">Siap disimpan!</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1.5 hover:bg-sand-200/50 text-rose-500 rounded-lg cozy-transition cursor-pointer"
                title="Hapus foto"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON WITH AI ANALYSIS ENGINE */}
        <div className="pt-4 border-t border-sand-100 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isAnalyzing}
            className={`
              flex-1 py-4 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg cozy-transition cursor-pointer
              ${isAnalyzing 
                ? "bg-sand-400 text-sand-100 cursor-not-allowed" 
                : "bg-sage-600 hover:bg-sage-700"
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Sedang memproses analisis jurnal olahraga...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse fill-yellow-200" />
                <span>{existingEntry ? "Perbarui Jurnal & Rekomendasi" : "Simpan Jurnal & Evaluasi Kesehatan"}</span>
              </>
            )}
          </button>

          {existingEntry && onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className="py-4 px-6 bg-lilac-500 hover:bg-lilac-600 text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow hover:shadow-md cozy-transition cursor-pointer"
              title="Bagikan ChuuDay Card hari ini!"
            >
              <Share2 className="w-4.5 h-4.5" />
              <span>Bagikan Hari Ini 🌸</span>
            </button>
          )}
        </div>

      </form>

      {/* Warm Sand #EDD9C0 AI INSIGHT CARD */}
      {isAnalyzing && (
        <div className="bg-[#EDD9C0] text-[#2C1F16] rounded-3xl p-5 md:p-6 border border-[#D3BEA2] space-y-4 shadow-sm animate-pulse mt-6 text-center py-8">
          <div className="w-10 h-10 bg-[#FAF8F5]/50 rounded-full flex items-center justify-center mx-auto mb-3 animate-spin border-2 border-[#2C1F16] border-t-transparent"></div>
          <h3 className="text-xs font-black uppercase tracking-wider">Menganalisis Jurnal Kebugaran Hari Ini...</h3>
          <p className="text-xs font-semibold text-[#5B473A] max-w-xs mx-auto">Gemini Engine sedang mengkalkulasi korelasi aktivitas olahraga dan status pemulihan harian secara objektif...</p>
        </div>
      )}

      {!isAnalyzing && existingEntry?.aiInsight && (
        <div className="bg-[#EDD9C0] text-[#2C1F16] rounded-3xl p-5 md:p-6 border border-[#D3BEA2] space-y-4 shadow-sm animate-fade-in-up mt-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 border-b border-[#D3BEA2] pb-3">
            <Sparkles className="w-4.5 h-4.5 text-amber-900 fill-amber-800/20" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#2C1F16] tracking-wider">Analisis Hari Ini</h3>
          </div>
          <ul className="space-y-3.5 text-xs md:text-sm font-bold leading-relaxed">
            {existingEntry.aiInsight.healthAnalysis && (
              <li className="flex items-start gap-2.5">
                <span className="leading-snug">{existingEntry.aiInsight.healthAnalysis}</span>
              </li>
            )}
            {existingEntry.aiInsight.motivation && (
              <li className="flex items-start gap-2.5">
                <span className="leading-snug">{existingEntry.aiInsight.motivation}</span>
              </li>
            )}
            {existingEntry.aiInsight.tipsTomorrow && (
              <li className="flex items-start gap-2.5">
                <span className="leading-snug">{existingEntry.aiInsight.tipsTomorrow}</span>
              </li>
            )}
            {existingEntry.aiInsight.moodDetection && (
              <li className="flex items-start gap-2.5">
                <span className="leading-snug">{existingEntry.aiInsight.moodDetection}</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
