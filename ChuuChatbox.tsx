/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, MessageCircle, Heart, User, Check, RefreshCw, Layers } from "lucide-react";
import { AIInsight } from "../types";

interface ChuuChatboxProps {
  insight?: AIInsight;
  isSimulated?: boolean;
  isAnalyzing: boolean;
  userName?: string;
  mood?: string;
}

export default function ChuuChatbox({
  insight,
  isSimulated,
  isAnalyzing,
  userName = "Pengguna",
  mood = "😊"
}: ChuuChatboxProps) {
  
  if (isAnalyzing) {
    return (
      <div id="chuu-chatbox" className="bg-cream-card rounded-3xl p-6 md:p-8 paper-shadow border border-sage-200 bg-gradient-to-tr from-sage-50/20 to-cream-card flex flex-col items-center justify-center text-center py-12 relative overflow-hidden">
        <div className="absolute top-4 left-4 text-sage-200 animate-ping">⚡</div>
        <div className="absolute bottom-8 right-8 text-sage-205 animate-bounce">🌱</div>

        <div className="relative w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mb-4 border border-sage-200 animate-pulse">
          <div className="absolute inset-0 rounded-full border-2 border-sage-500 border-t-transparent animate-spin"></div>
          <span className="text-2xl">📊</span>
        </div>
        
        <h3 className="text-base font-black text-sand-800 font-sans tracking-tight">
          Menganalisis Parameter Kebugaran...
        </h3>
        <p className="text-xs text-sand-500 max-w-xs mt-2 leading-relaxed">
          Menghitung korelasi durasi, intensitas olahraga, saran pemulihan otot, dan indeks suasana hati harian secara objektif.
        </p>

        <div className="mt-6 flex items-center gap-2 bg-sage-50 border border-sage-150 rounded-full px-4 py-1.5 text-[11px] text-sage-700 font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Gemini Pro-Fit Engine sedang mengkalkulasi...</span>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div id="chuu-chatbox" className="bg-cream-card rounded-3xl p-6 md:p-8 paper-shadow border border-sand-100 flex flex-col items-center justify-center text-center py-12">
        <div className="w-14 h-14 bg-sand-100 rounded-full border border-sand-150 flex items-center justify-center text-xl mb-4">
          📈
        </div>
        <h3 className="text-sm font-extrabold text-sand-700 font-sans">
          Chuu Fitness Tracker Engine Siap
        </h3>
        <p className="text-xs text-sand-500 max-w-sm mt-1.5 leading-relaxed">
          Isi atau sunting jurnal olahraga Anda untuk tanggal terpilih di panel kiri, kemudian klik tombol <b>Simpan & Tanya Pendapat Chuu</b> untuk memproses analisis data kebugaran harian secara to-the-point.
        </p>
      </div>
    );
  }

  return (
    <div id="chuu-chatbox" className="bg-cream-card rounded-3xl paper-shadow border border-sage-200 overflow-hidden flex flex-col cozy-transition">
      
      {/* PROFESSIONAL DASHBOARD HEADER */}
      <div className="bg-gradient-to-r from-sage-100 to-sage-50 p-4 md:px-6 flex items-center justify-between border-b border-sage-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-cream-card rounded-full border border-sage-300 flex items-center justify-center text-xl shadow-sm text-sage-600">
            📊
          </div>
          <div>
            <div className="text-xs font-extrabold text-sand-800 flex items-center gap-1">
              <span>Chuu Fitness Engine 🌸</span>
              <span className="text-[9px] font-bold bg-sage-200/65 text-sage-800 px-1.5 py-0.5 rounded">Pro-Active</span>
            </div>
            <div className="text-[9px] text-[#716e6a] font-medium font-mono">
              Sistem Analisis Terintegrasi • Aktif
            </div>
          </div>
        </div>

        <div className="text-right">
          {isSimulated ? (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              Simulasi Offline
            </span>
          ) : (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-full px-2 py-0.5">
              Live Verified
            </span>
          )}
        </div>
      </div>

      {/* DASHBOARD INSIGHT BLOCK */}
      <div className="p-5 md:p-6 bg-gradient-to-b from-[#FAF8F5] to-cream-card">
        
        <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between border-b pb-2.5 border-sand-100">
            <h4 className="text-xs font-black text-sand-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sage-600" />
              <span>Analisis Hari Ini</span>
            </h4>
            <span className="text-[9px] font-bold text-sand-400 bg-sand-100 px-2 py-0.5 rounded">
              Laporan Fisik
            </span>
          </div>
          
          <div className="space-y-3.5 text-xs text-sand-700 font-bold leading-relaxed">
            
            {/* 1. HEALTH / SPORT ACTIVITY */}
            {insight.healthAnalysis && (
              <div className="flex items-start gap-2.5">
                <span className="text-sm select-none shrink-0" role="img" aria-label="activity">
                  {/* Emoji already parsed inside Gemini or we render it flat */}
                </span>
                <div>
                  <p className="text-[13px] text-sand-800 font-semibold leading-normal">
                    {insight.healthAnalysis}
                  </p>
                </div>
              </div>
            )}

            {/* 2. HYDRATION / RECOVERY TIPS */}
            {insight.motivation && (
              <div className="flex items-start gap-2.5">
                <span className="text-sm select-none shrink-0" role="img" aria-label="hydration">
                  {/* Emoji already parsed inside Gemini */}
                </span>
                <div>
                  <p className="text-[13px] text-sand-800 font-semibold leading-normal">
                    {insight.motivation}
                  </p>
                </div>
              </div>
            )}

            {/* 3. REHAt / TOMORROW PLAN */}
            {insight.tipsTomorrow && (
              <div className="flex items-start gap-2.5">
                <span className="text-sm select-none shrink-0" role="img" aria-label="repose">
                  {/* Emoji already parsed inside Gemini */}
                </span>
                <div>
                  <p className="text-[13px] text-sand-800 font-semibold leading-normal">
                    {insight.tipsTomorrow}
                  </p>
                </div>
              </div>
            )}

            {/* 4. MENTAL / MOOD CORRELATION */}
            {insight.moodDetection && (
              <div className="pt-2.5 border-t border-dashed border-sand-100 flex items-start gap-2.5 text-xs text-sand-550 font-medium">
                <div className="w-full">
                  <p className="italic text-sand-600">
                    {insight.moodDetection}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* DASHBOARD BOTTOM SUMMARY BAR */}
      <div className="bg-sand-50/50 border-t border-sand-150 p-3.5 px-4 md:px-6 flex items-center justify-between text-[11px] text-[#86827c] font-semibold font-sans">
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rekomendasi dihitung otomatis berdasarkan input aktivitas asli.</span>
        </div>
      </div>

    </div>
  );
}
