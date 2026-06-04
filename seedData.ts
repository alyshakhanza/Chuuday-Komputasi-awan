/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JournalEntry } from "./types";

// Generate dates relative to today
const getDateAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const SEED_JOURNALS: JournalEntry[] = [
  {
    id: getDateAgo(4),
    date: getDateAgo(4),
    textContent: "Hari ini lumayan sibuk di kantor, tapi disempetin lari sore di sekitar komplek biar gak stress. Pas lari dengerin lagu santai, rasanya bebas banget dari kerjaan.",
    sportType: "Lari Sore",
    sportDuration: 30,
    sportIntensity: "sedang",
    songTitle: "Hati-Hati di Jalan",
    songArtist: "Tulus",
    youtubeUrl: "https://www.youtube.com/watch?v=Aptv3zPFFyQ",
    mood: "😊",
    photoUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=60",
    aiInsight: {
      healthAnalysis: "Latihan kardio intensitas sedang selama 30 menit berguna bagi pembakaran energi dan kelancaran aliran darah harian.",
      motivation: "Keseimbangan aktivitas fisik di tengah kesibukan membantu pemulihan kebugaran tubuh secara berkelanjutan.",
      moodDetection: "Aktivitas fisik sedang membantu menyeimbangkan kondisi psikologis pasca bekerja.",
      tipsTomorrow: "Direkomendasikan untuk melakukan peregangan fleksibilitas pada hari berikutnya guna melunakkan otot sendi kaki."
    },
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: getDateAgo(3),
    date: getDateAgo(3),
    textContent: "Aduh badan agak pegel-pegel abis lari kemarin. Jadi hari ini aku cuma yoga santai aja di kamar sambil nyalain lilin aromaterapi. Tenang banget rasanya.",
    sportType: "Yoga",
    sportDuration: 25,
    sportIntensity: "ringan",
    songTitle: "Bertaut",
    songArtist: "Nadin Amizah",
    youtubeUrl: "https://www.youtube.com/watch?v=kYJ_f_u1CRI",
    mood: "✨",
    photoUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60",
    aiInsight: {
      healthAnalysis: "Latihan peregangan sendi (yoga) selama 25 menit merangsang pemanjangan serabut otot dan peningkatan kelenturan tubuh.",
      motivation: "Pengaturan intensitas latihan secara bijak sesuai kondisi fisik mendukung regenerasi otot pasca latihan dinamis.",
      moodDetection: "Suasana teduh mendukung pemulihan sirkulasi darah serta relaksasi denyut nadi harian.",
      tipsTomorrow: "Dapat dilanjutkan dengan gerakan latihan kekuatan beban tubuh ringan seperti plank atau squat."
    },
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: getDateAgo(2),
    date: getDateAgo(2),
    textContent: "Hari ini semangat membara! Aku nyobain latihan angkat beban (dumbell) di rumah bareng instruktur YouTube. Keringetan parah, otot tangan sampai gemeteran pas akhir.",
    sportType: "Angkat Beban",
    sportDuration: 40,
    sportIntensity: "berat",
    songTitle: "Savage",
    songArtist: "aespa",
    youtubeUrl: "https://www.youtube.com/watch?v=WPdWvnAAurY",
    mood: "💪",
    photoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60",
    aiInsight: {
      healthAnalysis: "Latihan beban kekuatan 40 menit memicu mikro-trauma serabut otot yang krusial bagi metabolisme anaerobik.",
      motivation: "Rasa getar pada otot menandakan tercapainya ambang stimulasi kapasitas kontraktil serat otot.",
      moodDetection: "Fokus tinggi selama latihan kekuatan berkorelasi positif dengan motivasi mental.",
      tipsTomorrow: "Penting dilakukan pemulihan pasif berupa tidur berkualitas harian dan konsumsi cairan netral yang mumpuni."
    },
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: getDateAgo(1),
    date: getDateAgo(1),
    textContent: "Hari ini bangun kesiangan dan agak lemes karena kurang tidur semalam. Jadinya cuma jalan santai sore di taman sambil cari jus buah segar kesukaan aku.",
    sportType: "Jalan Kaki",
    sportDuration: 20,
    sportIntensity: "ringan",
    songTitle: "Untungnya, Hidup Harus Tetap Berjalan",
    songArtist: "Bernadya",
    youtubeUrl: "https://www.youtube.com/watch?v=mD8A6r5S3s0",
    mood: "😴",
    photoUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop&q=60",
    aiInsight: {
      healthAnalysis: "Aktivitas jalan santai 20 menit merupakan intensitas pemulihan aktif yang baik di kala tubuh kekurangan waktu istirahat.",
      motivation: "Tetap beraktivitas ringan di sela kelelahan merangsang aliran getah bening dan imunitas tubuh.",
      moodDetection: "Perasaan letih akibat kurang tidur diimbangi dengan asupan nutrisi buah segar terpantau kondusif.",
      tipsTomorrow: "Prioritaskan durasi tidur 7-8 jam sebelum kembali memulai latihan dengan intensitas yang lebih tinggi."
    },
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];
