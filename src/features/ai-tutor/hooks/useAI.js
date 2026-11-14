import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askTutor = async (query, studentId, weakTopics = [], options = {}) => {
    if (!query || query.trim() === '') {
      return {
        answer: "Apa yang ingin Adik tanyakan ke Kak Bintang? 😊",
        success: false,
        error: "Pertanyaan kosong"
      };
    }

    setLoading(true);
    setError(null);

    try {
      // Get student profile with accurate class_level & disability_type
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, class_level, disability_type')
        .eq('id', studentId)
        .maybeSingle();

      const rawName = profileData?.full_name || "Teman";
      const cleanName = rawName.replace(/^(Pak|Ibu|Bapak|Dokter|Dr\.|Prof\.)\s+/i, '').split(',')[0].trim().split(' ')[0] || "Teman";
      const nama = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

      const rawClass = profileData?.class_level || "4 SD";
      const parsedClass = parseInt(rawClass.replace(/\D/g, '') || "4", 10);
      const kelas = Math.max(1, Math.min(6, parsedClass));

      // 🎯 DYNAMIC GRADE TIER PROMPT (Kelas 1-2 vs 3-4 vs 5-6 SD)
      let gradeTierPrompt = '';
      if (kelas <= 2) {
        gradeTierPrompt = "Tingkat Kelas 1-2 SD: Gunakan kalimat sangat pendek, kata-kata sederhana, gambar/contoh konkret, instruksi 1 langkah, dan analogi benda nyata.";
      } else if (kelas === 3 || kelas === 4) {
        gradeTierPrompt = "Tingkat Kelas 3-4 SD: Gunakan kalimat sederhana, petunjuk bertahap, contoh kejadian sehari-hari, dan latihan mencocokkan.";
      } else {
        gradeTierPrompt = "Tingkat Kelas 5-6 SD: Gunakan kalimat lebih terstruktur, penalaran bertahap, contoh soal cerita, diskusi sederhana, dan analisis masalah sehari-hari.";
      }

      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";

      const formattedHistory = (options.history || [])
        .filter(h => h.content && h.content.trim() !== '')
        .map(h => ({
          role: h.role === 'ai' ? 'assistant' : (h.role || 'user'),
          content: h.content
        }));

      // Try 1: Supabase Edge Function invoke
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
          body: {
            message: query.trim(),
            student_id: studentId,
            nama: nama,
            kelas: kelas,
            grade_tier_prompt: gradeTierPrompt,
            disability_type: profileData?.disability_type || "umum",
            history: formattedHistory,
            weak_topics: Array.isArray(weakTopics) ? weakTopics : [],
          },
          headers: {
            'x-api-key': apiKey,
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
          }
        });

        if (!invokeError && data?.reply) {
          return {
            answer: data.reply,
            success: true,
            detectedTopic: data.detected_topic,
            xpGained: data.xp_gained,
            options: data.options || []
          };
        }
      } catch (edgeErr) {
        console.warn("Edge function fallback triggered:", edgeErr);
      }

      // Try 2: Direct Groq API Call Fallback (Kak Bintang Never Sleeps)
      const directApiKey = import.meta.env.VITE_GROQ_TOKEN || import.meta.env.Groq_Token;
      const systemPrompt = `Kamu adalah Kak Bintang, sahabat dan tutor pintar anak-anak SD kelas ${kelas}. Nama siswa yang sedang mengobrol denganmu adalah ${nama}.
ATURAN UTAMA:
1. SELALU panggil dan sebut nama siswa (${nama}) secara hangat dan akrab di setiap jawabanmu (contoh: "Halo ${nama}!", "Wah, pertanyaan bagus dari ${nama}!").
2. Jawablah 100% seperti teman belajar AI Agent yang hidup, ramah, penuh semangat, empati, dan menyenangkan bagi anak SD kelas 1-6.
3. Penjelasan harus sangat mudah dipahami anak SD kelas ${kelas}: ${gradeTierPrompt}
4. Gunakan Bahasa Indonesia yang ramah, santun, dengan contoh sederhana sehari-hari.
5. Berikan motivasi dan pujian kepada ${nama}.`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${directApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: systemPrompt },
            ...formattedHistory,
            { role: "user", content: query.trim() }
          ],
          temperature: 0.7
        })
      });

      const groqData = await groqRes.json();
      const fallbackReply = groqData?.choices?.[0]?.message?.content;

      if (fallbackReply) {
        if (studentId) {
          await supabase.from('student_ai_chat_history').insert([
            { student_id: studentId, role: 'user', content: query.trim(), question: query.trim() },
            { student_id: studentId, role: 'assistant', content: fallbackReply, answer: fallbackReply }
          ]);
        }
        return {
          answer: fallbackReply,
          success: true,
          detectedTopic: null,
          xpGained: 10,
          options: []
        };
      }

      // Try 3: Warm Personalized Offline Fallback
      const friendlyFallback = `Halo ${nama}! Wah, pertanyaan bagus sekali tentang "${query}". Kak Bintang sangat bangga ${nama} semangat belajar! Mari kita selesaikan pelan-pelan bersama ya! 😊`;
      return {
        answer: friendlyFallback,
        success: true
      };

    } catch (err) {
      console.error("AI Tutor Error:", err.message);
      return {
        answer: `Halo ${studentId ? 'Teman' : 'Adik'}! Kak Bintang selalu siap membantumu belajar. Mari tanyakan lagi ya! 😊`,
        success: true,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuiz = async (config) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";

      const { data, error: invokeError } = await supabase.functions.invoke('generate-quiz', {
        body: config,
        headers: {
          'x-api-key': apiKey
        }
      });

      if (invokeError) throw invokeError;

      return { success: true, quiz: data };
    } catch (err) {
      console.error("Generate AI Quiz Error:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getWeakTopics = async (studentId) => {
    if (!studentId) return { topics: [] };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('weak_topics')
        .eq('id', studentId)
        .single();

      if (error) throw error;

      return { topics: data?.weak_topics || [] };
    } catch (err) {
      console.error("Get weak topics error:", err);
      return { topics: [] };
    }
  };

  const pingSupabase = useCallback(async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch (e) {
      console.error("Ping Supabase error:", e);
      return false;
    }
  }, []);

  const pingAI = useCallback(async () => {
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.functions.invoke('ai-tutor', {
        body: { ping: true, message: "ping" },
        headers: {
          'x-api-key': apiKey,
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        }
      });

      return !error;
    } catch (e) {
      return false;
    }
  }, []);

  const transcribeAudio = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const { data, error: invokeError } = await supabase.functions.invoke('transcribe-live', {
        body: formData,
      });

      if (invokeError) throw invokeError;
      return { success: true, text: data.text };
    } catch (err) {
      console.error("Transcription Error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getAudioGuide = async (role, fullName) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: "berikan panduan navigasi lengkap",
          task: "navigation",
          context: `Sapa ${fullName} dengan hangat. Jelaskan struktur halaman dashboard ini secara terstruktur untuk tunanetra: 1. Di paling kiri ada Sidebar Menu. 2. Di tengah layar ada Status Level dan XP kamu. 3. Di kanan bawah ada tombol Mikrofon Nay yang bisa kamu aktifkan kapan saja. Maksimal 40 kata.`
        },
        headers: { 'x-api-key': 'christian' }
      });
      return data?.reply;
    } catch {
      return `Halo ${fullName}, selamat datang kembali. Kamu berada di Beranda. Gunakan tombol Tab untuk berpindah menu atau tekan Spasi untuk bertanya pada asisten Nay.`;
    }
  };

  const askNay = async (query, studentId, pageContext = "", options = {}) => {
    if (!query || query.trim() === '') return { answer: "Bintang siap membantu, apa yang ingin ditanyakan?", success: false };

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";

      const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: query,
          student_id: studentId,
          context: pageContext,
          task: "navigation"
        },
        headers: { 'x-api-key': apiKey }
      });

      if (invokeError) throw invokeError;

      const reply = data?.reply || "";
      const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);

      return {
        answer: reply.replace(/\[NAVIGATE:.*?\]/, '').trim(),
        navigateTo: navMatch ? navMatch[1] : null,
        success: true
      };
    } catch (err) {
      console.error("Nay Error:", err);
      return { answer: "Waduh, ada kendala koneksi ke Nay.", success: false };
    } finally {
      setLoading(false);
    }
  };

  const smartVoiceAssistant = async (audioBlob, studentName, pageContext = "") => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";
      const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: "Halo Kak Bintang, berikan panduan halaman ini",
          task: "navigation",
          context: pageContext,
          nama: studentName
        },
        headers: { 'x-api-key': apiKey }
      });

      if (invokeError) throw invokeError;

      const reply = data?.reply || "";
      const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);

      return {
        success: true,
        transcript: "Bantu Navigasi",
        answer: reply.replace(/\[NAVIGATE:.*?\]/, '').trim(),
        navigateTo: navMatch ? navMatch[1] : null
      };
    } catch (err) {
      console.error("Smart Voice Assistant Error:", err);
      return { success: false, answer: "Maaf, Nay sedang mengalami gangguan teknis." };
    } finally {
      setLoading(false);
    }
  };

  const askMateriAI = async (question, moduleId, options = {}) => {
    if (!question) return { answer: "Tanya apa tentang materi ini? 😊", success: false };

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";
      const { data, error: invokeError } = await supabase.functions.invoke('materi-ai', {
        body: {
          question,
          module_id: moduleId,
          grade_level: options.gradeLevel || "SD",
          model_preference: options.model || "qwen/qwen3.8-27b"
        },
        headers: { 'x-api-key': apiKey }
      });

      if (invokeError) throw invokeError;
      return {
        answer: data.answer,
        found: data.found,
        citations: data.citations,
        success: true
      };
    } catch (err) {
      console.error("Materi AI Hook Error:", err);
      return { answer: "Maaf, ada kendala saat mengakses materi. Coba lagi ya!", success: false };
    } finally {
      setLoading(false);
    }
  };

  const generateAndSaveReport = async (studentId) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";
      const { data, error: invokeError } = await supabase.functions.invoke('generate-report', {
        body: { student_id: studentId },
        headers: { 'x-api-key': apiKey }
      });

      if (invokeError) throw invokeError;
      return { success: true, report: data.report, content: data.content };
    } catch (err) {
      console.error("Generate Report Error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    askTutor,
    askNay,
    smartVoiceAssistant,
    askMateriAI,
    generateAIQuiz,
    generateAndSaveReport,
    transcribeAudio,
    getAudioGuide,
    getWeakTopics,
    pingSupabase,
    pingAI,
    loading,
    error
  };
};
