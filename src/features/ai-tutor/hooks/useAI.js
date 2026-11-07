// hooks/useAI.js

import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askTutor = async (query, studentId, weakTopics = [], options = {}) => {
    // Validasi input
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
      // Get student profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, class_level, disability_type')
        .eq('id', studentId)
        .single();

      if (profileError) {
        console.warn("Profile fetch error:", profileError);
      }

      const nama = profileData?.full_name?.split(' ')[0] || "Teman";
      const kelas = parseInt(profileData?.class_level || "4", 10);

      // Ambil API Key dari environment, gunakan fallback 'christian' agar tetap terhubung
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";

      // Filter history agar valid dan tidak kosong
      const formattedHistory = (options.history || [])
        .filter(h => h.content && h.content.trim() !== '')
        .map(h => ({
          role: h.role === 'ai' ? 'assistant' : (h.role || 'user'),
          content: h.content
        }));

      const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: query.trim(),
          student_id: studentId,
          nama: nama,
          kelas: kelas,
          disability_type: profileData?.disability_type || "umum",
          history: formattedHistory,
          weak_topics: Array.isArray(weakTopics) ? weakTopics : [],
        },
        headers: {
          'x-api-key': apiKey
        }
      });

      if (invokeError) {
        console.error("Invoke error:", invokeError);
        throw invokeError;
      }

      if (!data) {
        throw new Error("No response data from AI function");
      }

      return {
        answer: data.reply || "Maaf, Kak Bintang lagi bingung. 😊",
        success: data.success !== false,
        detectedTopic: data.detected_topic,
        xpGained: data.xp_gained,
        options: data.options || []
      };

    } catch (err) {
      console.error("AI Tutor Error:", err.message);
      return {
        answer: "Waduh, Kak BintangAi lagi istirahat sebentar. Coba tanya lagi ya! 😊",
        success: false,
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

      const { error } = await supabase.functions.invoke('ai-tutor', {
        body: { ping: true, message: "ping" },
        headers: { 'x-api-key': apiKey }
      });

      return !error;
    } catch (e) {
      console.error("Ping AI error:", e);
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
          system_prompt: `Kamu adalah Kak Bintang, asisten navigasi pintar. Sapa ${fullName} dengan hangat.
          Jelaskan struktur halaman dashboard ini secara terstruktur untuk tunanetra:
          1. Di paling kiri ada Sidebar Menu: Beranda, Tanya AI, QuizKu, Materi, dan Profil.
          2. Di tengah layar ada Status Level dan XP kamu.
          3. Di kanan bawah ada tombol Mikrofon 'Nay' yang bisa kamu aktifkan kapan saja dengan menekan SPASI untuk membantumu bernavigasi atau bertanya apa saja.
          Gunakan bahasa yang sangat jelas, sopan, dan instruktif. Maksimal 40 kata.`,
          model: "llama-3.1-8b-instant" // Model sangat cepat & akurat untuk instruksi
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
          system_prompt: `Kamu adalah Nay, asisten navigasi & belajar pintar untuk siswa tunanetra.
          Tugasmu:
          1. Jawab pertanyaan tentang isi halaman.
          2. Jika pengguna ingin pindah fitur (contoh: "buka quiz", "ke materi", "ke profil"), balas dengan format: [NAVIGATE:target] diikuti jawabanmu.
             Target yang tersedia: dashboard, playground, tasks, modules, profile.
          3. Gunakan bahasa ramah, singkat (max 30 kata), dan sangat jelas.
          Konteks Halaman: ${pageContext}`,
          model: "llama-3.1-8b-instant" // Model akurat & cepat
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
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');
      formData.append('studentName', studentName);
      formData.append('context', pageContext);

      const { data, error: invokeError } = await supabase.functions.invoke('smart-voice-assistant', {
        body: formData,
      });

      if (invokeError) throw invokeError;

      return {
        success: true,
        transcript: data.transcript,
        answer: data.reply,
        navigateTo: data.navigateTo,
        action: data.action,
        actionData: data.actionData
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
          model_preference: options.model || "llama-3.3-70b-versatile"
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

  return {
    askTutor,
    askNay,
    smartVoiceAssistant,
    askMateriAI,
    generateAIQuiz,
    transcribeAudio,
    getAudioGuide,
    getWeakTopics,
    pingSupabase,
    pingAI,
    loading,
    error
  };
};
