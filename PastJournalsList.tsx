/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Calendar, Dumbbell, Music, ChevronRight, Music2 } from "lucide-react";
import { JournalEntry } from "../types";

interface PastJournalsListProps {
  entries: JournalEntry[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function PastJournalsList({
  entries,
  selectedDate,
  onSelectDate
}: PastJournalsListProps) {
  
  // Sort entries by date descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const formatItemDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "berat": return "text-orange-600 bg-orange-50 border-orange-100";
      case "sedang": return "text-sage-700 bg-sage-50 border-sage-100";
      default: return "text-sky-600 bg-sky-50 border-sky-100";
    }
  };

  return (
    <div id="past-journals-card" className="bg-cream-card rounded-3xl p-6 paper-shadow border border-sand-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 border-b border-sand-50 pb-3">
        <BookOpen className="w-5 h-5 text-sand-500" />
        <h2 className="text-lg font-extrabold text-sand-700 font-sans tracking-tight">
          Riwayat Jurnal Kamu
        </h2>
        <span className="text-xs font-bold bg-sand-100 text-sand-600 rounded-full px-2 py-0.5 ml-auto">
          {sortedEntries.length} Hari
        </span>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="grow flex flex-col items-center justify-center py-10 text-center text-sand-400">
          <span className="text-3xl mb-2">📒</span>
          <p className="text-xs font-semibold">Belum ada jurnal tersimpan.</p>
          <p className="text-[10px] text-sand-400 mt-1">Buat jurnal pertamamu di sebelah kiri!</p>
        </div>
      ) : (
        <div className="grow overflow-y-auto space-y-3 max-h-[360px] pr-1">
          {sortedEntries.map((entry) => {
            const isSelected = selectedDate === entry.date;
            return (
              <button
                key={entry.date}
                id={`history-item-${entry.date}`}
                onClick={() => onSelectDate(entry.date)}
                className={`
                  w-full text-left p-3.5 rounded-2xl border cozy-transition flex items-center justify-between gap-3 cursor-pointer
                  ${isSelected
                    ? "bg-sage-50 border-2 border-[#C8DDD4] shadow-sm"
                    : "bg-sand-50/30 border-sand-100/70 hover:bg-sand-50/80 hover:border-sand-200"
                  }
                `}
              >
                <div className="flex items-start gap-3 overflow-hidden">
                  {/* Left Column: Mood big bubble */}
                  <div className="w-11 h-11 bg-cream-card rounded-xl border border-sand-150 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    {entry.mood}
                  </div>

                  {/* Mid Column: Journal details */}
                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-sand-700 font-sans">
                        {formatItemDate(entry.date)}
                      </span>
                      {entry.sportDuration > 0 && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getIntensityColor(entry.sportIntensity)}`}>
                          {entry.sportIntensity}
                        </span>
                      )}
                    </div>

                    {/* Summary of workout */}
                    <div className="flex items-center gap-1 text-[11px] text-sand-500 font-medium truncate">
                      {entry.sportDuration > 0 ? (
                        <>
                          <Dumbbell className="w-3 h-3 text-sage-500 shrink-0" />
                          <span className="truncate">{entry.sportType} ({entry.sportDuration}m)</span>
                        </>
                      ) : (
                        <span className="italic">Tidak olahraga</span>
                      )}
                    </div>

                    {/* Brief story snippet */}
                    <p className="text-[10px] text-sand-400 font-medium truncate max-w-[200px] leading-relaxed">
                      {entry.textContent || "Tidak ada rincian cerita tulisan."}
                    </p>

                    {/* Sound track if any */}
                    {entry.songTitle && (
                      <div className="flex items-center gap-1 text-[9px] text-lilac-600 font-bold truncate">
                        <Music2 className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{entry.songTitle} - {entry.songArtist}</span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-sage-600 translate-x-1" : "text-sand-400"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
