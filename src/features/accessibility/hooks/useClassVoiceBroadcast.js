import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { globalCaptionBus } from '@/features/accessibility/components/MataPintarGlobalCaption';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';

export function useClassVoiceBroadcast() {
  const { profile } = useAuthStore();
  const { mode } = useAccessibilityStore();
  const { showSubtitle } = useSubtitle();

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [latestBroadcast, setLatestBroadcast] = useState('');
  const [activeTeacherMessage, setActiveTeacherMessage] = useState(null);
  const [studentReplies, setStudentReplies] = useState([]);
  const [targetStudentIds, setTargetStudentIds] = useState('all'); // 'all' or Array of IDs

  const recognitionRef = useRef(null);
  const channelRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const targetStudentIdsRef = useRef('all');

  useEffect(() => {
    targetStudentIdsRef.current = targetStudentIds;
  }, [targetStudentIds]);

  const isTeacher = profile?.role === 'guru';
  const isStudent = profile?.role === 'siswa';
  const classCode = profile?.class_code;

  // Replay teacher voice for Siswa Tunanetra
  const replayTeacherVoice = useCallback(() => {
    if (!activeTeacherMessage?.text) return;
    try {
      if (synthRef.current) synthRef.current.cancel();
      const utt = new SpeechSynthesisUtterance(`Guru ${activeTeacherMessage.teacherName || 'Guru'} berkata: ${activeTeacherMessage.text}`);
      utt.lang = 'id-ID';
      utt.rate = 1.0;
      utt.volume = 1.0;

      const voices = synthRef.current?.getVoices() || [];
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || (v.name && v.name.toLowerCase().includes('indonesia')));
      if (idVoice) utt.voice = idVoice;

      synthRef.current?.speak(utt);
    } catch (e) {
      console.error('Replay speech error:', e);
    }
  }, [activeTeacherMessage]);

  // Dismiss teacher message manually (Manual Close)
  const dismissTeacherMessage = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setActiveTeacherMessage(null);
  }, []);

  // Send Student Reply to Teacher via Supabase Realtime
  const sendStudentReply = useCallback((replyText) => {
    if (!profile?.id || !classCode || !replyText?.trim()) return;

    const cleanReply = replyText.trim();
    const payload = {
      studentId: profile.id,
      studentName: profile.full_name || 'Siswa',
      role: mode || profile.disability_type || 'umum',
      text: cleanReply,
      classCode: classCode,
      timestamp: new Date().toISOString()
    };

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'student_reply',
        payload
      });
    }

    if (showSubtitle) {
      showSubtitle(`🚀 Balasan terkirim ke Guru: "${cleanReply}"`, 'success');
    }
  }, [profile, classCode, mode, showSubtitle]);

  // 1. REALTIME SUBSCRIBER: Handles Both Teacher Speech & Student Replies
  useEffect(() => {
    if (!profile?.id || !classCode) return;

    const channelName = `class_voice_broadcast_${classCode}`;
    const channel = supabase.channel(channelName);

    // Listener for Teacher Speech Broadcast (Received by Targeted Students)
    channel.on('broadcast', { event: 'teacher_speech' }, (event) => {
      const payload = event.payload;
      if (!payload || !payload.text) return;
      if (payload.classCode && payload.classCode !== classCode) return;

      // 🎯 CHECK IF CURRENT STUDENT IS IN TARGET SELECTION
      const targets = payload.targetStudentIds;
      const isTargeted = targets === 'all' || (Array.isArray(targets) && targets.includes(profile.id));

      if (!isTargeted) return; // Ignore if student was not selected

      const teacherName = payload.teacherName || 'Guru';
      const spokenText = payload.text;

      setLatestBroadcast(spokenText);

      // Save persistent teacher message card until student manually closes
      const msgObj = {
        id: Date.now(),
        teacherName,
        text: spokenText,
        timestamp: payload.timestamp || new Date().toISOString()
      };
      setActiveTeacherMessage(msgObj);

      // A. SISWA TUNANETRA: Native SpeechSynthesis Audio
      if (mode === 'tunanetra' || profile.disability_type === 'tunanetra') {
        try {
          if (synthRef.current) synthRef.current.cancel();
          const utt = new SpeechSynthesisUtterance(`Guru ${teacherName} berkata: ${spokenText}`);
          utt.lang = 'id-ID';
          utt.rate = 1.0;
          utt.volume = 1.0;

          const voices = synthRef.current?.getVoices() || [];
          const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || (v.name && v.name.toLowerCase().includes('indonesia')));
          if (idVoice) utt.voice = idVoice;

          synthRef.current?.speak(utt);
        } catch (e) {
          console.error('Speech synthesis broadcast error:', e);
        }
      }

      // B. SISWA TUNARUNGU & TUNAWICARA: Subtitles / Captions
      if (mode === 'tunarungu' || mode === 'tunawicara' || profile.disability_type === 'tunarungu' || profile.disability_type === 'tunawicara') {
        globalCaptionBus.emit(spokenText, `Guru (${teacherName})`, 'speech');
        if (showSubtitle) {
          showSubtitle(`👨‍🏫 Guru (${teacherName}): "${spokenText}"`, 'info');
        }
      }
    });

    // Listener for Student Replies (Received by Teacher)
    if (isTeacher) {
      channel.on('broadcast', { event: 'student_reply' }, (event) => {
        const payload = event.payload;
        if (!payload || !payload.text) return;

        setStudentReplies(prev => [
          {
            id: Date.now() + Math.random(),
            studentId: payload.studentId,
            studentName: payload.studentName,
            role: payload.role,
            text: payload.text,
            timestamp: payload.timestamp || new Date().toISOString()
          },
          ...prev.slice(0, 49) // Keep last 50 student replies
        ]);

        if (showSubtitle) {
          const roleIcon = payload.role === 'tunanetra' ? '👁️' : payload.role === 'tunarungu' ? '🧏' : '🖐️';
          showSubtitle(`${roleIcon} Balasan dari ${payload.studentName}: "${payload.text}"`, 'success');
        }
      });
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, classCode, isTeacher, mode, showSubtitle]);

  // 2. TEACHER BROADCASTER: Capture Teacher Voice & Send Realtime Broadcast to Selected Targets
  const startBroadcasting = useCallback(() => {
    if (!isTeacher || !classCode) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (showSubtitle) showSubtitle('Browser Anda tidak mendukung pengenalan suara', 'error');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const channelName = `class_voice_broadcast_${classCode}`;
      if (!channelRef.current) {
        channelRef.current = supabase.channel(channelName).subscribe();
      }

      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsBroadcasting(true);
        const targetDesc = targetStudentIdsRef.current === 'all'
          ? 'Semua Siswa'
          : `${targetStudentIdsRef.current.length} Siswa Terpilih`;
        if (showSubtitle) showSubtitle(`🎙️ Siaran Suara Guru Aktif (Target: ${targetDesc})`, 'success');
      };

      recognition.onresult = (event) => {
        let currentFinal = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          }
        }

        if (currentFinal.trim()) {
          const cleanText = currentFinal.trim();
          setLatestBroadcast(cleanText);

          // Broadcast instantly to selected targets with same classCode
          channelRef.current?.send({
            type: 'broadcast',
            event: 'teacher_speech',
            payload: {
              teacherName: profile?.full_name?.split(' ')[0] || 'Guru',
              text: cleanText,
              classCode: classCode,
              targetStudentIds: targetStudentIdsRef.current,
              timestamp: new Date().toISOString()
            }
          });
        }
      };

      recognition.onerror = () => {
        setIsBroadcasting(false);
      };

      recognition.onend = () => {
        if (isBroadcasting) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsBroadcasting(false);
    }
  }, [isTeacher, classCode, isBroadcasting, profile?.full_name, showSubtitle]);

  const stopBroadcasting = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsBroadcasting(false);
    if (showSubtitle) showSubtitle('🎙️ Siaran Suara Guru Dihentikan', 'info');
  }, [showSubtitle]);

  const toggleBroadcasting = useCallback(() => {
    if (isBroadcasting) stopBroadcasting();
    else startBroadcasting();
  }, [isBroadcasting, startBroadcasting, stopBroadcasting]);

  return {
    isBroadcasting,
    latestBroadcast,
    startBroadcasting,
    stopBroadcasting,
    toggleBroadcasting,
    activeTeacherMessage,
    replayTeacherVoice,
    dismissTeacherMessage,
    sendStudentReply,
    studentReplies,
    targetStudentIds,
    setTargetStudentIds,
    classCode
  };
}
