import { supabase } from '../../../lib/supabase';

// Memory per session
let userSelectedLanguage = null;
let userDialectLevel = 'ringan';
let languageConfirmed = false;

/**
 * Reset memory
 */
export const resetTutorMemory = () => {
  userSelectedLanguage = null;
  userDialectLevel = 'ringan';
  languageConfirmed = false;
};

/**
 * Load preferences dari database
 */
export const loadUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_language, dialect_level, use_local_analogies')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const prefs = {
      language: data?.preferred_language || 'auto',
      dialect_level: data?.dialect_level || 'ringan',
      analogi_lokal: data?.use_local_analogies !== false,
    };

    // Update memory
    if (prefs.language !== 'auto') userSelectedLanguage = prefs.language;
    userDialectLevel = prefs.dialect_level;

    return prefs;
  } catch {
    return { language: 'auto', dialect_level: 'ringan', analogi_lokal: true };
  }
};

/**
 * Save preferences ke database
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_language: preferences.language === 'auto' ? null : preferences.language,
        dialect_level: preferences.dialect_level,
        use_local_analogies: preferences.analogi_lokal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    if (preferences.language !== 'auto') userSelectedLanguage = preferences.language;
    userDialectLevel = preferences.dialect_level;
    languageConfirmed = true;

    return true;
  } catch (err) {
    console.error('Gagal menyimpan preferensi:', err);
    return false;
  }
};

/**
 * Chat dengan Kak BintangAi - SMART with Dialect Level
 */
export const askTutorApi = async (
  query,
  studentId,
  chatHistory = [],
  manualPrefs = {}
) => {

  // Cek user request ganti bahasa
  const translateMatch = query.match(/terjemahkan (ke|dalam) (bahasa )?(batak|jawa|sunda|karo|indonesia|inggris)/i);
  let requestedLanguage = null;

  if (translateMatch) {
    const langMap = {
      'batak': 'batak', 'jawa': 'jawa', 'sunda': 'sunda',
      'karo': 'karo', 'indonesia': 'indonesia', 'inggris': 'english'
    };
    requestedLanguage = langMap[translateMatch[3]?.toLowerCase()];
    if (requestedLanguage) {
      userSelectedLanguage = requestedLanguage;
      languageConfirmed = true;
      await saveUserPreferences(studentId, {
        language: requestedLanguage,
        dialect_level: userDialectLevel,
        analogi_lokal: true
      });
    }
  }

  // Cek user request ganti tingkat dialek
  const dialectMatch = query.match(/dialek (ringan|sedang|penuh)/i);
  if (dialectMatch) {
    const newLevel = dialectMatch[1].toLowerCase();
    if (['ringan', 'sedang', 'penuh'].includes(newLevel)) {
      userDialectLevel = newLevel;
      await saveUserPreferences(studentId, {
        language: userSelectedLanguage || 'auto',
        dialect_level: newLevel,
        analogi_lokal: true
      });
    }
  }

  // Tentukan bahasa
  let languageToUse = manualPrefs?.language || userSelectedLanguage || 'auto';
  const isFirstMessage = chatHistory.length === 0;

  if (isFirstMessage && !languageConfirmed && languageToUse === 'auto') {
    // Biarkan backend auto-detect
  }

  const finalDialectLevel = manualPrefs?.dialect_level || userDialectLevel;

  const apiKey = import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', studentId)
    .single();

  const nama = profileData?.full_name?.split(' ')[0] || "Teman";

  const { data, error } = await supabase.functions.invoke('ai-tutor', {
    body: {
      message: query,
      student_id: studentId,
      nama: nama,
      kelas: 4,
      language: languageToUse,
      dialect_level: finalDialectLevel,
      is_first_message: isFirstMessage && !languageConfirmed,
      language_confirmed: languageConfirmed,
    },
    headers: { 'x-api-key': apiKey || 'christian' }
  });

  if (error) throw error;

  // Update memory
  if (data.language_used && data.language_used !== 'auto' && !userSelectedLanguage) {
    userSelectedLanguage = data.language_used;
    languageConfirmed = true;
  }
  if (data.dialect_level_used) {
    userDialectLevel = data.dialect_level_used;
  }

  const newHistory = [
    ...chatHistory,
    { role: 'user', content: query },
    { role: 'assistant', content: data.reply }
  ];

  return {
    response: data.reply,
    newHistory,
    languageUsed: data.language_used || languageToUse,
    dialectUsed: data.dialect_level_used || finalDialectLevel
  };
};

// Alias for compatibility if needed
export const askTutorSmart = askTutorApi;
