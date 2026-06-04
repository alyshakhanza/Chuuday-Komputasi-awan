/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Calendar as CalendarIcon, Award } from "lucide-react";
import { JournalEntry } from "../types";

interface CalendarViewProps {
  entries: JournalEntry[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  streakCount: number;
}

export default function CalendarView({
  entries,
  selectedDate,
  onSelectDate,
  streakCount
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Correcting index to start calendar on Monday (optional, but standard in many places, 
  // let's do Sunday start as standard JS Grid to make it absolute-proof and simple)
  // Sunday = 0, Monday = 1 ... Saturday = 6
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const calendarCells = [...blanks, ...daysArray];

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Check if a date string has an entry
  const getEntryForDate = (dateStr: string) => {
    return entries.find((e) => e.date === dateStr);
  };

  const formatDateString = (dYear: number, dMonth: number, day: number) => {
    return `${dYear}-${String(dMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div id="calendar-card" className="bg-cream-card rounded-3xl p-6 paper-shadow border border-sand-100 flex flex-col h-full cozy-transition">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-sand-500" />
          <h2 className="text-xl font-extrabold text-sand-700 font-sans tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-sand-50 p-1 rounded-xl border border-sand-100">
          <button
            onClick={handlePrevMonth}
            className="p-1 px-2 hover:bg-sand-100 text-sand-600 rounded-lg cozy-transition cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 px-2 hover:bg-sand-100 text-sand-600 rounded-lg cozy-transition cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-sand-500 mb-2">
        <div>Min</div>
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div>Sab</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center grow">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="aspect-square"></div>;
          }

          const cellDateStr = formatDateString(year, month, day);
          const entry = getEntryForDate(cellDateStr);
          const isSelected = selectedDate === cellDateStr;
          const isToday = todayStr === cellDateStr;

          return (
            <button
              key={`day-${day}`}
              id={`day-cell-${cellDateStr}`}
              onClick={() => onSelectDate(cellDateStr)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-2xl relative cursor-pointer cozy-transition p-1 text-sm font-medium group
                ${isSelected 
                  ? "bg-sage-50 text-sage-700 border-2 border-[#C8DDD4] scale-[1.03] shadow-sm" 
                  : entry 
                    ? "bg-sage-50 text-sage-700 border border-sage-200 hover:bg-sage-100" 
                    : isToday 
                      ? "bg-lilac-50 text-lilac-700 border border-lilac-200 font-bold hover:bg-lilac-100" 
                      : "text-sand-600 hover:bg-sand-100/70"
                }
              `}
            >
              {/* Day Number */}
              <span className={`text-xs ${isToday && !isSelected ? "underline decoration-2 underline-offset-4" : ""}`}>
                {day}
              </span>

              {/* Mood Sticker Display */}
              {entry ? (
                <span className="text-lg leading-none mt-1 animate-bounce duration-1000 group-hover:scale-125 cozy-transition" title={`Mood: ${entry.mood}`}>
                  {entry.mood}
                </span>
              ) : (
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isToday ? "bg-lilac-500" : "bg-transparent"}`}></div>
              )}

              {/* Workout Indicator Dot for sports */}
              {entry && entry.sportDuration > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 animate-pulse" title={`${entry.sportType} (${entry.sportDuration}m)`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Streak Info Under Calendar */}
      <div className="mt-6 pt-4 border-t border-sand-100 flex items-center justify-between bg-gradient-to-r from-sand-50 to-cream-card p-3.5 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
            <Flame className={`w-5 h-5 ${streakCount > 0 ? "fill-orange-500 text-orange-500 animate-pulse" : "text-orange-400"}`} />
          </div>
          <div>
            <div className="text-xs text-sand-500 font-medium">Streak Olahraga</div>
            <div className="text-sm font-extrabold text-sand-700 font-sans">
              {streakCount} Hari Beruntun!
            </div>
          </div>
        </div>
        
        {streakCount >= 3 ? (
          <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-100/50">
            <Award className="w-3.5 h-3.5" />
            <span>On Fire! 🔥</span>
          </div>
        ) : (
          <div className="text-xs text-sand-400 bg-sand-100/50 px-2.5 py-1.5 rounded-full border border-sand-100">
            Yuk semangat fit! Check-in!
          </div>
        )}
      </div>
    </div>
  );
}
