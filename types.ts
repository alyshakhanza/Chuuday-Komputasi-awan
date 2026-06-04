/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AIInsight {
  healthAnalysis: string;
  motivation: string;
  moodDetection: string;
  tipsTomorrow: string;
  rawText?: string;
}

export interface JournalEntry {
  id: string; // matches date string "YYYY-MM-DD"
  date: string; // "YYYY-MM-DD"
  textContent: string;
  sportType: string; // e.g., "Lari", "Yoga", "Angkat Beban", dsb.
  sportDuration: number; // in minutes
  sportIntensity: 'ringan' | 'sedang' | 'berat';
  songTitle: string;
  songArtist: string;
  youtubeUrl?: string;
  photoUrl?: string; // base64 representation or custom illustration URL
  mood: '😊' | '😴' | '💪' | '🌧️' | '✨';
  aiInsight?: AIInsight;
  createdAt: string; // ISO string
}

export interface SeedData {
  entries: JournalEntry[];
}
