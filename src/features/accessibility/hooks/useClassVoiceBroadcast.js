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
  const recognitionRef = useRef(null);
  const channelRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const isTeacher = profile?.role === 'guru';
  const classCode = profile?.class_code;

  // 1. STUDENT LISTENER: Subscribe to Realtime Voice Broadcast for profile.class_code
  useEffect(() => {
    if (!profile?.id || !classCode || isTeacher) return;

    const channelName = `class_voice_broadcast_${classCode}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'teacher_speech' }, (event) => {
        const payload = event.payload;
        if (!payload || !payload.text) return;

        // Verify same class code
        if (payload.classCode && payload.classCode !== classCode) return;

        const teacherName = payload.teacherName || 'Guru';
        const spokenText = payload.text;

        setLatestBroadcast(spokenText);

        // A. SISWA TUNANETRA (Visual Impairment / Blind): Native Browser TTS Audio
        if (mode === 'tunanetra') {
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

        // B. SISWA TUNARUNGU & TUNAWICARA: Mata Pintar Live Subtitles / Captions
        if (mode === 'tunarungu' || mode === 'tunawicara') {
          globalCaptionBus.emit(spokenText, `Guru (${teacherName})`, 'speech');
          if (showSubtitle) {
            showSubtitle(`👨‍🏫 Guru (${teacherName}): "${spokenText}"`, 'info');
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, classCode, isTeacher, mode, showSubtitle]);

  // 2. TEACHER BROADCASTER: Capture Teacher Voice & Send Realtime Broadcast
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
        if (showSubtitle) showSubtitle(`🎙️ Siaran Suara Guru Aktif (Kelas: ${classCode})`, 'success');
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

          // Broadcast instantly to all students with same classCode
          channelRef.current?.send({
            type: 'broadcast',
            event: 'teacher_speech',
            payload: {
              teacherName: profile?.full_name?.split(' ')[0] || 'Guru',
              text: cleanText,
              classCode: classCode,
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
    classCode
  };
}
