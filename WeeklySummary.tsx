/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Clock, Smile, Sparkles, TrendingUp, Heart, Trophy } from "lucide-react";
import { JournalEntry } from "../types";

interface WeeklySummaryProps {
  entries: JournalEntry[];
  streakCount: number;
}

export default function WeeklySummary({ entries, streakCount }: WeeklySummaryProps) {
  // Calculate statistics for the last 7 days or all entries
  // To make it feel super alive, we analyze the current set of filtered entries.
  
  // Total exercise minutes
  const totalMinutes = entries.reduce((acc, curr) => acc + (curr.sportDuration || 0), 0);

  // Top Mood Calculation
  const moodCounts = entries.reduce((acc, curr) => {
    if (curr.mood) {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  let topMood = "Belum Ada";
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topMood = mood;
    }
  });

  // Mood descriptions for cozy vibes
  const moodLabels: Record<string, { label: string; bg: string; text: string }> = {
    "😊": { label: "Happy / Tenang", bg: "bg-sage-50", text: "text-sage-600" },
    "😴": { label: "Lelah / Butuh Rehat", bg: "bg-sky-50", text: "text-sky-600" },
    "💪": { label: "Semangat Membara", bg: "bg-sand-100", text: "text-sand-600" },
    "🌧️": { label: "Mellow / Kurang Berstamina", bg: "bg-purple-50", text: "text-purple-600" },
    "✨": { label: "Penuh Inspirasi", bg: "bg-lilac-50", text: "text-lilac-600" },
  };

  const getMoodDetail = (m: string) => {
    return moodLabels[m] || { label: "Netral", bg: "bg-sand-50", text: "text-sand-500" };
  };

  const activeDaysCount = entries.filter(e => e.sportDuration > 0).length;

  // Let's draw a beautiful progress bar showing active progress compared to a healthy 150 min/week goal!
  const progressTarget = 150; // WHO recommended 150 mins per week
  const progressPercentage = Math.min(Math.round((totalMinutes / progressTarget) * 100), 100);

  // Take last 7 days of dates to render a custom cute mini-bar-chart
  const getPastNDays = (n: number) => {
    const list = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  };

  const last7Days = getPastNDays(7);
  const chartData = last7Days.map(dateStr => {
    const entry = entries.find(e => e.date === dateStr);
    const dayName = new Date(dateStr).toLocaleDateString("id-ID", { weekday: "short" });
    return {
      date: dateStr,
      dayLabel: dayName,
      duration: entry ? entry.sportDuration : 0,
      mood: entry ? entry.mood : null,
      sportType: entry ? entry.sportType : ""
    };
  });

  return (
    <div id="weekly-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Exercise Clock Card */}
      <div id="exercise-summary-card" className="bg-cream-card rounded-3xl p-6 paper-shadow border border-sand-100 flex flex-col justify-center cozy-transition hover:translate-y-[-2px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sand-500 uppercase tracking-widest block mb-1">Total Olahraga</span>
            <h3 className="text-3xl font-black text-sand-700 tracking-tight font-sans">
              {totalMinutes} <span className="text-base font-semibold text-sand-500">menit</span>
            </h3>
          </div>
          
          {/* Progress Ring in Sage Mist */}
          <div className="flex flex-col items-center justify-center relative select-none shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="40"
                cy="40"
                r="30"
                className="stroke-sand-100/70"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Active Ring */}
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="#C8DDD4"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 - (progressPercentage / 100) * (2 * Math.PI * 30)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-black text-sand-700">{progressPercentage}%</span>
              <span className="text-[8px] font-bold text-sand-400 tracking-wider font-mono">{totalMinutes}/{progressTarget}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Mood Card */}
      <div className="bg-cream-card rounded-3xl p-6 paper-shadow border border-sand-100 flex flex-col justify-center cozy-transition hover:translate-y-[-2px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-sand-500 uppercase tracking-widest block mb-1">Mood Terbanyak</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl">{topMood}</span>
              <div>
                <div className="text-base font-extrabold text-sand-700 font-sans">
                  {getMoodDetail(topMood).label}
                </div>
                <div className="text-xs text-sand-400 font-medium font-mono">
                  Terpilih {maxCount} kali minggu ini
                </div>
              </div>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-lilac-50 border border-lilac-200 flex items-center justify-center text-lilac-600">
            <Smile className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* 3. Workout Days Bar Chart / Activity summary */}
      <div className="bg-cream-card rounded-3xl p-6 paper-shadow border border-sand-100 flex flex-col justify-between cozy-transition hover:translate-y-[-2px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-sand-500 uppercase tracking-widest block mb-1">Aktif Latihan</span>
            <h3 className="text-xl font-extrabold text-sand-700 tracking-tight font-sans">
              {activeDaysCount} <span className="text-sm font-semibold text-sand-500">dari 7 hari terakhir</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Mini Custom Interactive Chart */}
        <div className="flex items-end justify-between gap-1 bg-sand-50/50 p-2.5 rounded-2xl border border-sand-100">
          {chartData.map((data, index) => {
            // Find max height
            const maxHeight = 48; // px
            const height = data.duration > 0 ? Math.min(Math.round((data.duration / 60) * maxHeight), maxHeight) : 3;
            return (
              <div key={index} className="flex flex-col items-center flex-1 group relative">
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-sand-700 text-cream-background text-[10px] py-1 px-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-350 whitespace-nowrap z-10 font-sans shadow-md">
                  {data.duration > 0 ? `${data.sportType}: ${data.duration}m` : "Tidak ada latihan"}
                </div>

                {/* The Bar */}
                <div className="w-full bg-sand-200 rounded-full h-12 flex items-end overflow-hidden">
                  <div 
                    className={`w-full rounded-full transition-all duration-500 ${
                      data.duration > 0 
                        ? "bg-sage-500 hover:bg-sage-600" 
                        : "bg-sand-200/50"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                </div>

                {/* Label Day or Mood */}
                <span className="text-[10px] text-sand-500 mt-1 font-semibold">
                  {data.mood ? data.mood : data.dayLabel.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
