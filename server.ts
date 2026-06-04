import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API to Analyze Daily Journal with Gemini 3.5 Flash
  app.post("/api/analyze", async (req, res) => {
    try {
      const { textContent, sportType, sportDuration, sportIntensity, songTitle, songArtist, mood } = req.body;

      // Determine sport emoji helper
      const getSportEmoji = (type: string) => {
        const cleanType = (type || "").toLowerCase();
        if (cleanType.includes("lari") || cleanType.includes("run") || cleanType.includes("jogging")) return "🏃";
        if (cleanType.includes("renang") || cleanType.includes("swim")) return "🏊";
        if (cleanType.includes("sepeda") || cleanType.includes("bike") || cleanType.includes("cycling")) return "🚴";
        if (cleanType.includes("gym") || cleanType.includes("beban") || cleanType.includes("weight") || cleanType.includes("muscle")) return "🏋️";
        if (cleanType.includes("jalan") || cleanType.includes("walk")) return "🚶";
        if (cleanType.includes("yoga") || cleanType.includes("stretch")) return "🧘";
        if (cleanType.includes("bola") || cleanType.includes("soccer") || cleanType.includes("futsal")) return "⚽";
        if (cleanType.includes("tari") || cleanType.includes("dance")) return "💃";
        return "💪";
      };

      const spEmoji = getSportEmoji(sportType);
      const intensityLabel = sportIntensity === "berat" ? "berat" : sportIntensity === "ringan" ? "ringan" : "sedang";

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("PLACEholder") || apiKey.trim() === "") {
        // Return a professional data-backed simulation response
        const mockInsight = {
          healthAnalysis: `${spEmoji} ${sportType || "Latihan fisik"} ${sportDuration || 15} menit intensitas ${intensityLabel} — target kebugaran harian tercapai dengan baik.`,
          motivation: `💧 Pastikan hidrasi cukup setelah sesi latihan untuk mendukung metabolisme selular.`,
          moodDetection: `📊 Korelasi emosi stabil dengan tanda suasana hati teratur dan stimulasi audio pendukung.`,
          tipsTomorrow: `😴 Disarankan istirahat aktif atau latihan fleksibilitas intensitas ringan esok hari.`
        };
        return res.json({ 
          insight: mockInsight, 
          isSimulated: true, 
          message: "Menjalankan mode simulasi karena kunci API Gemini belum dikonfigurasi di Settings > Secrets." 
        });
      }

      // Initialize server-side Gemini client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const userPrompt = `
Berikut adalah data olahraga dan aktivitas harian pengguna:
- Jenis Olahraga: ${sportType || 'Latihan Umum'}
- Durasi: ${sportDuration || 15} menit
- Intensitas: ${sportIntensity || 'sedang'}
- Cerita Jurnal: "${textContent || 'Berolahraga rutin.'}"
- Lagu Soundtrack: "${songTitle || 'Tanpa Lagu'} oleh ${songArtist || 'Tanpa Artis'}"
- Stiker Mood: ${mood || '😊'}

Lakukan analisis parameter kebugaran di atas secara to-the-point, singkat, dingin, dan berbasis data ilmiah layaknya perangkat fitness tracker profesional dan bersertifikasi.
Sama sekali tidak mengandung kata panggilan lebay/dramatis seperti 'bestie', 'sayang', 'aku', 'kamu', atau pesan cinta bersahabat. Fokus sepenuhnya pada hasil evaluasi klinis/data harian.

Format respons WAJIB dalam skema JSON dengan properti berikut:
- healthAnalysis: Evaluasi olahraga singkat dalam 1 baris diawali emoji olahraga yang sesuai. Contoh format: "🏋️ Latihan beban 45 menit intensitas berat — menjaga kekuatan otot inti"
- motivation: Tips hidrasi/nutrisi/suplemen singkat dalam 1 baris diawali emoji tetesan air (💧) atau medis. Contoh format: "💧 Konsumsi cairan minimal 500ml pasca latihan berat untuk mencegah deplesi elektrolit"
- tipsTomorrow: Saran pemulihan/olahraga esok hari dalam 1 baris diawali emoji tidur (😴) atau jam tidur. Contoh format: "😴 Disarankan tidur berkualitas 7-8 jam dan istirahat aktif esok hari"
- moodDetection: Analisis keterkaitan kondisi emosi ringkas dalam 1 baris diawali emoji grafik (📊). Contoh format: "📊 Pemulihan mental optimal diimbangi stimulasi audio bernada rileks"
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "Kamu adalah Chuu Fitness Tracker Engine, asisten data olahraga AI profesional yang to-the-point, obyektif, akurat, dan berbasis evaluasi kebugaran ilmiah. Respons kamu selalu singkat, berbasis fakta olahraga, tanpa bumbu drama emosional, tanpa ungkapan ramah berlebih, dan tanpa kata panggilan 'bestie'.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthAnalysis: {
                type: Type.STRING,
                description: "Evaluasi olahraga klinis singkat diawali emoji olahraga."
              },
              motivation: {
                type: Type.STRING,
                description: "Rekomendasi hidrasi atau elektrolit singkat diawali emoji tumpukan air."
              },
              moodDetection: {
                type: Type.STRING,
                description: "Analisis kondisi kejiwaan singkat diawali emoji analisis statistik."
              },
              tipsTomorrow: {
                type: Type.STRING,
                description: "Rekomendasi pemulihan atau latihan esok hari diawali emoji pemulihan tidur."
              }
            },
            required: ["healthAnalysis", "motivation", "moodDetection", "tipsTomorrow"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Kosongnya respon teks dari analisis Gemini API");
      }

      const parsedInsight = JSON.parse(text.trim());
      res.json({ insight: parsedInsight, isSimulated: false });

    } catch (err: any) {
      console.error("Gemini call failed:", err);
      // Fallback response with simulated content in case of API failure
      const mockInsight = {
        healthAnalysis: "Latihan diselesaikan. Catatan tersimpan dengan aman.",
        motivation: "Jaga kecukupan hidrasi pasca latihan fisik harian.",
        moodDetection: "Stabilitas status mental terpantau terkontrol.",
        tipsTomorrow: "Patuhi jadwal pemulihan berkala demi menjaga stamina."
      };
      res.json({ 
        insight: mockInsight, 
        isSimulated: true, 
        message: "Sistem berjalan dalam mode cadangan offline." 
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ChuuDay Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
