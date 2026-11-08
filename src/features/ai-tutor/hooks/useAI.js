import { useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

const cleanHistory = (history = []) => history
  .filter((item) => typeof item?.content === 'string' && item.content.trim())
  .slice(-12)
  .map((item) => ({
    role: item.role === 'ai' ? 'assistant' : (item.role === 'assistant' ? 'assistant' : 'user'),
    content: item.content.trim().slice(0, 3000),
  }));

const invokeFunction = async (name, body) => {
  if (!isSupabaseConfigured) throw new Error('Supabase belum dikonfigurasi. Periksa environment BintangAi.');
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  if (!data) throw new Error('Server tidak mengembalikan data.');
  return data;
};

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (work) => {
    setLoading(true);
    setError(null);
    try {
      return await work();
    } catch (err) {
      setError(err?.message || 'Terjadi kendala layanan AI.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const askTutor = async (query, studentId, weakTopics = [], options = {}) => {
    const message = String(query || '').trim();
    if (!message) return { answer: 'Tuliskan pertanyaan yang ingin kamu pelajari.', success: false, error: 'Pertanyaan kosong' };
    try {
      return await withLoading(async () => {
        const data = await invokeFunction('ai-tutor', {
          task: 'tutor',
          message,
          student_id: studentId || null,
          history: cleanHistory(options.history),
          weak_topics: Array.isArray(weakTopics) ? weakTopics.slice(0, 10) : [],
        });
        return {
          answer: data.reply || 'Kak Bintang belum mendapat jawaban. Coba tanyakan dengan kalimat lain.',
          success: data.success !== false,
          detectedTopic: data.detected_topic || null,
          xpGained: data.xp_gained || 0,
          options: Array.isArray(data.options) ? data.options : [],
        };
      });
    } catch (err) {
      console.error('BintangAi Tutor:', err);
      return { answer: 'Kak Bintang sedang tidak terhubung. Silakan coba lagi sebentar.', success: false, error: err.message };
    }
  };

  const generateAIQuiz = async (config = {}) => {
    try {
      return await withLoading(async () => {
        const data = await invokeFunction('generate-quiz', config);
        return { success: true, quiz: data.quiz || data };
      });
    } catch (err) {
      console.error('BintangAi Quiz Generator:', err);
      return { success: false, message: err.message };
    }
  };

  const getWeakTopics = async (studentId) => {
    if (!studentId || !isSupabaseConfigured) return { topics: [] };
    try {
      const { data, error: queryError } = await supabase.from('profiles')
        .select('weak_topics').eq('id', studentId).maybeSingle();
      if (queryError) throw queryError;
      return { topics: Array.isArray(data?.weak_topics) ? data.weak_topics : [] };
    } catch (err) {
      console.error('Get weak topics:', err);
      return { topics: [] };
    }
  };

  const pingSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return true;
      const { error: queryError } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();
      return !queryError;
    } catch { return false; }
  }, []);

  const pingAI = useCallback(async () => {
    if (!isSupabaseConfigured) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const data = await invokeFunction('ai-tutor', { ping: true });
      return data?.success === true;
    } catch { return false; }
  }, []);

  // Compatibility API: transcription is performed by Chrome/Edge Web Speech API.
  // This method never uploads microphone audio or calls Whisper.
  const transcribeAudio = async (browserTranscript) => ({
    success: typeof browserTranscript === 'string' && Boolean(browserTranscript.trim()),
    text: typeof browserTranscript === 'string' ? browserTranscript.trim() : '',
    error: typeof browserTranscript === 'string' ? undefined : 'Transkrip harus berasal dari pengenalan suara browser.',
  });

  const getAudioGuide = async (_role, fullName) => {
    const name = String(fullName || '').trim();
    const prompt = `Buat panduan singkat untuk pengguna tunanetra di halaman dashboard BintangAi. Nama sapaan: ${name || 'pengguna'}. Jelaskan navigasi dengan keyboard Tab dan Enter, dan opsi bantuan suara browser. Maksimal 45 kata.`;
    try {
      const data = await invokeFunction('ai-tutor', { task: 'navigation', message: prompt, context: 'Panduan dashboard' });
      return data.reply;
    } catch {
      return 'Gunakan tombol Tab untuk berpindah elemen dan Enter untuk memilih. Kamu juga dapat menggunakan tombol bantuan suara browser jika tersedia.';
    }
  };

  const askNay = async (query, studentId, pageContext = '', options = {}) => {
    const message = String(query || '').trim();
    if (!message) return { answer: 'Apa yang ingin kamu lakukan?', success: false };
    try {
      const data = await withLoading(() => invokeFunction('ai-tutor', {
        task: 'navigation', message, student_id: studentId || null,
        context: String(pageContext || '').slice(0, 2500),
        history: cleanHistory(options.history),
      }));
      const reply = data.reply || '';
      const nav = reply.match(/\[NAVIGATE:([a-z-]+)\]/i);
      return { answer: reply.replace(/\[NAVIGATE:[a-z-]+\]/ig, '').trim(), navigateTo: nav?.[1] || null, success: true };
    } catch (err) {
      return { answer: 'Nay belum bisa terhubung. Silakan gunakan menu navigasi yang tersedia.', success: false, error: err.message };
    }
  };

  // Voice is recognized locally by Chrome; only the resulting text is sent to the tutor.
  const smartVoiceAssistant = async (browserTranscript, studentName, pageContext = '') => {
    const transcript = String(browserTranscript || '').trim();
    if (!transcript) return { success: false, answer: 'Suara belum terbaca. Silakan coba lagi.' };
    const response = await askNay(transcript, null, `${pageContext}. Nama pengguna: ${studentName || ''}`);
    return {
      success: response.success,
      transcript,
      answer: response.answer,
      navigateTo: response.navigateTo,
      action: response.navigateTo ? 'NAVIGATE_TO' : null,
      actionData: response.navigateTo,
    };
  };

  const generateAndSaveReport = async (studentId, teacherId) => {
    try {
      return await withLoading(async () => {
        const data = await invokeFunction('generate-report', { student_id: studentId, teacher_id: teacherId });
        return { success: data.success === true, report: data.report, content: data.content };
      });
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const askMateriAI = async (question, moduleId, options = {}) => {
    if (!String(question || '').trim()) return { answer: 'Tulis pertanyaan tentang materi ini.', success: false };
    try {
      return await withLoading(async () => {
        const data = await invokeFunction('materi-ai', {
          question: String(question).trim(), module_id: moduleId || null,
          grade_level: options.gradeLevel || null,
        });
        return { answer: data.answer, found: data.found !== false, citations: data.citations || [], success: true };
      });
    } catch (err) {
      return { answer: 'Materi belum dapat diproses. Periksa koneksi dan coba lagi.', success: false, error: err.message };
    }
  };

  return {
    askTutor, askNay, smartVoiceAssistant, askMateriAI, generateAIQuiz,
    transcribeAudio, getAudioGuide, getWeakTopics, generateAndSaveReport, pingSupabase, pingAI,
    loading, error,
  };
};
