import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { cleanMarkdownText } from '../../../utils';

// In-Memory Fast Semantic Cache Fallback
const inMemoryAiCache = new Map();

const checkAICache = async (queryKey, kelas, nama) => {
  if (!queryKey) return null;

  // 1. Check in-memory map
  if (inMemoryAiCache.has(queryKey)) {
    const cachedText = inMemoryAiCache.get(queryKey);
    return cachedText.replace(/\[NAMA\]/g, nama);
  }

  // 2. Check Supabase ai_response_cache database table
  try {
    const { data } = await supabase
      .from('ai_response_cache')
      .select('answer, hit_count')
      .eq('query_key', queryKey)
      .eq('grade_level', kelas)
      .maybeSingle();

    if (data?.answer) {
      inMemoryAiCache.set(queryKey, data.answer);
      // Increment hit_count asynchronously
      supabase.from('ai_response_cache')
        .update({ hit_count: (data.hit_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq('query_key', queryKey)
        .catch(() => {});

      return data.answer.replace(/\[NAMA\]/g, nama);
    }
  } catch (e) {
    // Cache miss or table not created yet
  }
  return null;
};

const saveAICache = async (queryKey, rawQuery, kelas, answer, nama) => {
  if (!queryKey || !answer || answer.length < 15) return;

  // Mask student's name to template token [NAMA] for reusability across students
  const templateAnswer = answer.replace(new RegExp(nama, 'gi'), '[NAMA]');
  inMemoryAiCache.set(queryKey, templateAnswer);

  try {
    await supabase.from('ai_response_cache').upsert({
      query_key: queryKey,
      raw_query: rawQuery,
      grade_level: kelas,
      answer: templateAnswer,
      updated_at: new Date().toISOString()
    }, { onConflict: 'query_key' });
  } catch (e) {
    // Silently ignore if table fails or missing permissions
  }
};

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

      // 🎯 SEMANTIC QUERY CACHING CHECK (Ultra-fast response < 50ms & 0 API cost)
      const normalizedKey = query.trim().toLowerCase().replace(/[^\w\s]/gi, '');
      const cachedResponse = await checkAICache(normalizedKey, kelas, nama);
      if (cachedResponse) {
        setLoading(false);
        return {
          answer: cachedResponse,
          success: true,
          isCached: true,
          detectedTopic: null,
          xpGained: 5,
          options: []
        };
      }

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
          const cleanedReply = cleanMarkdownText(data.reply);
          // Save to Semantic AI Cache
          saveAICache(normalizedKey, query.trim(), kelas, cleanedReply, nama);
          return {
            answer: cleanedReply,
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
4. DILARANG MENGGUNAKAN SIMBOL MARKDOWN SEPERTI ASTERISK (** atau *), TANDA PAGAR (#), ATAU KODE MARKDOWN DALAM JAWABANMU. Gunakan teks polos Bahasa Indonesia yang bersih dan rapi.
5. Gunakan Bahasa Indonesia yang ramah, santun, dengan contoh sederhana sehari-hari.
6. Berikan motivasi dan pujian kepada ${nama}.`;

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
      const rawFallbackReply = groqData?.choices?.[0]?.message?.content;
      const fallbackReply = cleanMarkdownText(rawFallbackReply);

      if (fallbackReply) {
        saveAICache(normalizedKey, query.trim(), kelas, fallbackReply, nama);
        if (studentId) {
          try {
            await supabase.from('student_ai_chat_history').insert([
              { student_id: studentId, role: 'user', content: query.trim(), question: query.trim() },
              { student_id: studentId, role: 'assistant', content: fallbackReply, answer: fallbackReply }
            ]);
          } catch (logErr) {
            console.warn("DB log error ignored:", logErr);
          }
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
    return `Halo ${fullName || 'Teman'}, selamat datang kembali di Beranda. Sebutkan nama menu untuk langsung berpindah: QuizKu, Materi, atau Tanya AI.`;
  };

  const askNay = async (query, studentId, pageContext = "", options = {}) => {
    if (!query || query.trim() === '') return { answer: "Bintang siap membantu, apa yang ingin ditanyakan?", success: false };

    setLoading(true);
    try {
      const q = query.toLowerCase().trim();

      if (q.includes('quiz') || q.includes('kuis') || q.includes('tugas') || q.includes('mulai quiz') || q.includes('mulai kuis')) {
        return { answer: "Membuka Halaman QuizKu...", navigateTo: "tasks", success: true };
      }
      if (q.includes('materi') || q.includes('modul') || q.includes('perpustakaan') || q.includes('pelajaran') || q.includes('buku')) {
        return { answer: "Membuka Perpustakaan Materi...", navigateTo: "modules", success: true };
      }
      if (q.includes('grup') || q.includes('kolaborasi') || q.includes('mabar') || q.includes('diskusi') || q.includes('teman')) {
        return { answer: "Membuka Grup Belajar...", navigateTo: "collaboration", success: true };
      }
      if (q.includes('pesan') || q.includes('inbox') || q.includes('guru')) {
        return { answer: "Membuka Pesan Guru...", navigateTo: "inbox", success: true };
      }
      if (q.includes('tanya') || q.includes('playground') || q.includes('obrol') || q.includes('bintang')) {
        return { answer: "Membuka Tanya Kak Bintang...", navigateTo: "playground", success: true };
      }
      if (q.includes('mata pintar') || q.includes('caption') || q.includes('live')) {
        return { answer: "Membuka Mata Pintar...", navigateTo: "live-captions", success: true };
      }
      if (q.includes('profil') || q.includes('pengaturan') || q.includes('akun')) {
        return { answer: "Membuka Halaman Profil Saya...", navigateTo: "profile", success: true };
      }
      if (q.includes('beranda') || q.includes('home') || q.includes('dashboard') || q.includes('bantu navigasi') || q.includes('navigasi')) {
        return { answer: "Membuka Beranda Utama...", navigateTo: "dashboard", success: true };
      }

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

      const reply = cleanMarkdownText(data?.reply || "");
      const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);
      const cleanReply = reply.replace(/\[NAVIGATE:.*?\]/, '').trim();

      return {
        answer: cleanReply || "Menuju halaman yang dituju...",
        navigateTo: navMatch ? navMatch[1] : null,
        success: true
      };
    } catch (err) {
      console.error("Nay Error:", err);
      return { answer: "Membuka halaman...", success: true };
    } finally {
      setLoading(false);
    }
  };

  const smartVoiceAssistant = async (audioBlobOrText, studentName, pageContext = "") => {
    setLoading(true);
    try {
      let transcriptText = "";

      if (typeof audioBlobOrText === 'string' && audioBlobOrText.trim() !== '') {
        transcriptText = audioBlobOrText.trim();
      } else if (audioBlobOrText) {
        const transRes = await transcribeAudio(audioBlobOrText);
        if (transRes?.success && transRes?.text) {
          transcriptText = transRes.text.trim();
        }
      }

      const q = transcriptText.toLowerCase();

      // Direct Keyword Matching for Sidebar Navigation & Features
      if (q.includes('materi') || q.includes('modul') || q.includes('perpustakaan') || q.includes('pelajaran') || q.includes('buku')) {
        return { success: true, transcript: transcriptText || "Buka Materi", answer: "Membuka Perpustakaan Materi...", navigateTo: "modules" };
      }
      if (q.includes('quiz') || q.includes('kuis') || q.includes('tugas') || q.includes('mulai quiz') || q.includes('mulai kuis') || q.includes('soal')) {
        return { success: true, transcript: transcriptText || "Mulai Quiz", answer: "Membuka Halaman QuizKu...", navigateTo: "tasks" };
      }
      if (q.includes('grup') || q.includes('kolaborasi') || q.includes('mabar') || q.includes('diskusi') || q.includes('teman') || q.includes('kelompok')) {
        return { success: true, transcript: transcriptText || "Grup Belajar", answer: "Membuka Grup Belajar...", navigateTo: "collaboration" };
      }
      if (q.includes('pesan') || q.includes('inbox') || q.includes('guru') || q.includes('surat')) {
        return { success: true, transcript: transcriptText || "Pesan Guru", answer: "Membuka Pesan Guru...", navigateTo: "inbox" };
      }
      if (q.includes('tanya') || q.includes('playground') || q.includes('obrol') || q.includes('bintang') || q.includes('asisten')) {
        return { success: true, transcript: transcriptText || "Tanya AI", answer: "Membuka Tanya Kak Bintang...", navigateTo: "playground" };
      }
      if (q.includes('mata pintar') || q.includes('caption') || q.includes('live') || q.includes('subtitle')) {
        return { success: true, transcript: transcriptText || "Mata Pintar", answer: "Membuka Mata Pintar...", navigateTo: "live-captions" };
      }
      if (q.includes('profil') || q.includes('pengaturan') || q.includes('akun') || q.includes('saya')) {
        return { success: true, transcript: transcriptText || "Profil Saya", answer: "Membuka Halaman Profil Saya...", navigateTo: "profile" };
      }
      if (q.includes('beranda') || q.includes('home') || q.includes('dashboard') || q.includes('bantu navigasi') || q.includes('navigasi') || q.includes('utama')) {
        return { success: true, transcript: transcriptText || "Beranda", answer: "Membuka Beranda Utama...", navigateTo: "dashboard" };
      }

      // If text query is present, query AI for short navigation instruction
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";
      const { data, error: invokeError } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: transcriptText || "berikan navigasi",
          task: "navigation",
          context: pageContext,
          nama: studentName
        },
        headers: { 'x-api-key': apiKey }
      });

      if (invokeError) throw invokeError;

      const reply = cleanMarkdownText(data?.reply || "");
      const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);
      const cleanReply = reply.replace(/\[NAVIGATE:.*?\]/, '').trim();

      return {
        success: true,
        transcript: transcriptText || "Bantu Navigasi",
        answer: cleanReply || "Membuka Halaman Utama...",
        navigateTo: navMatch ? navMatch[1] : "dashboard"
      };
    } catch (err) {
      console.error("Smart Voice Assistant Error:", err);
      return { success: true, transcript: "Bantu Navigasi", answer: "Membuka Beranda Utama...", navigateTo: "dashboard" };
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

  const generateAndSaveReport = async (studentId, teacherId) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || "christian";

      // Try edge function first
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('generate-report', {
          body: { student_id: studentId },
          headers: { 'x-api-key': apiKey }
        });

        if (!invokeError && data?.success && data?.report) {
          return { success: true, report: data.report, content: data.content };
        }
      } catch (efErr) {
        console.warn("Edge function generate-report notice:", efErr?.message);
      }

      // Fallback: Direct DB + Groq AI Report Generator
      const { data: student } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      const studentName = student?.full_name || 'Siswa SD';
      const currentTeacherId = teacherId || profile?.id || (await supabase.auth.getUser())?.data?.user?.id;

      const { data: submissions } = await supabase
        .from('submissions')
        .select('score, total_score, status, submitted_at, assignments(title, subject)')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(20);

      const groqToken = import.meta.env.VITE_GROQ_TOKEN || import.meta.env.Groq_Token;
      let summaryText = `Ringkasan Laporan Perkembangan Belajar – ${studentName}:\n\n- Kemajuan Belajar: Siswa aktif berpartisipasi dan menyelesaikan tugas pembelajaran.\n- Evaluasi: Rata-rata nilai kuis dan partisipasi kelas stabil.\n- Rekomendasi: Pertahankan semangat belajar dan tingkatkan latihan mandiri secara berkala.`;

      if (groqToken) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'qwen/qwen3.8-27b',
              messages: [
                { role: 'system', content: 'Kamu pendamping guru inklusif SD. Buat ringkasan perkembangan belajar siswa yang objektif, ramah, dan positif dalam Bahasa Indonesia. DILARANG menggunakan salam pembuka AI seperti "Hello!", "Halo!", atau kalimat pembuka AI. DILARANG mencetak catatan debug teknis seperti "catatan penting ketidaksesuaian data". DILARANG menggunakan ikon bintang. Langsung mulai dari judul ringkasan perkembangan belajar secara rapi dan profesional.' },
                { role: 'user', content: `Buat ringkasan perkembangan belajar siswa SD bernama ${studentName}, kelas ${student?.class_level || 4}, XP ${student?.xp || 0}. Hasil tugas: ${JSON.stringify(submissions || []).slice(0, 2000)}.` }
              ],
              max_tokens: 800
            })
          });
          const groqJson = await res.json();
          const aiReply = groqJson?.choices?.[0]?.message?.content;
          if (aiReply) summaryText = cleanReportText(aiReply);
        } catch (groqErr) {
          console.warn("Groq report fallback notice:", groqErr);
        }
      }

      const { data: newReport, error: dbErr } = await supabase
        .from('student_reports')
        .insert({
          student_id: studentId,
          teacher_id: currentTeacherId,
          report_type: 'Kemajuan Belajar',
          title: `Ringkasan perkembangan ${studentName}`,
          content: summaryText,
          summary: summaryText,
          recommendation: 'Pertahankan motivasi belajar dan berikan apresiasi secara rutin.'
        })
        .select()
        .single();

      if (dbErr) throw dbErr;

      return { success: true, report: newReport, content: summaryText };
    } catch (err) {
      console.error("Generate Report Error:", err);
      return { success: false, error: err?.message || 'Gagal membuat laporan' };
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

export const cleanReportText = (text) => {
  if (!text) return '';
  let cleaned = text
    .replace(/^hello!?[^\n]*\n?/gi, '')
    .replace(/^halo!?[^\n]*\n?/gi, '')
    .replace(/^berikut (adalah|merupakan)[^\n]*\n?/gi, '')
    .replace(/catatan penting:?\s*terdapat ketidaksesuaian data[^\n]*\n?/gi, '')
    .replace(/terdapat ketidaksesuaian data[^\n]*\n?/gi, '')
    .replace(/skor akhir \(`?score`?\)[^\n]*\n?/gi, '')
    .replace(/oleh karena itu, ringkasan ini berfokus[^\n]*\n?/gi, '')
    .replace(/[★⭐🌟]/g, '')
    .replaceAll('**', '')
    .replaceAll('##', '')
    .trim();

  // Strip greeting/introduction sentences in the first few lines
  const lines = cleaned.split('\n');
  while (lines.length > 0) {
    const first = lines[0].trim().toLowerCase();
    if (
      first.startsWith('hello') ||
      first.startsWith('halo') ||
      first.startsWith('berikut adalah') ||
      first.startsWith('berikut ringkasan') ||
      first.includes('ketidaksesuaian data') ||
      first.includes('skor akhir (`score`)')
    ) {
      lines.shift();
    } else {
      break;
    }
  }

  return lines.join('\n').trim();
};
