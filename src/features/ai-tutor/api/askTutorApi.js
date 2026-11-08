import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

let userSelectedLanguage = null;
let userDialectLevel = 'ringan';
let languageConfirmed = false;

export const resetTutorMemory = () => {
  userSelectedLanguage = null;
  userDialectLevel = 'ringan';
  languageConfirmed = false;
};

export const loadUserPreferences = async (userId) => {
  if (!isSupabaseConfigured || !userId) return { language: 'auto', dialect_level: 'ringan', analogi_lokal: true };
  const { data, error } = await supabase.from('profiles')
    .select('preferred_language, dialect_level, use_local_analogies')
    .eq('id', userId).maybeSingle();
  if (error || !data) return { language: 'auto', dialect_level: 'ringan', analogi_lokal: true };
  const prefs = {
    language: data.preferred_language || 'auto',
    dialect_level: data.dialect_level || 'ringan',
    analogi_lokal: data.use_local_analogies !== false,
  };
  if (prefs.language !== 'auto') userSelectedLanguage = prefs.language;
  userDialectLevel = prefs.dialect_level;
  return prefs;
};

export const saveUserPreferences = async (userId, preferences = {}) => {
  if (!isSupabaseConfigured || !userId) return false;
  const allowedDialects = ['ringan', 'sedang', 'penuh'];
  const dialect = allowedDialects.includes(preferences.dialect_level) ? preferences.dialect_level : 'ringan';
  const { error } = await supabase.from('profiles').update({
    preferred_language: preferences.language === 'auto' ? null : String(preferences.language || '').slice(0, 40),
    dialect_level: dialect,
    use_local_analogies: preferences.analogi_lokal !== false,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) return false;
  userSelectedLanguage = preferences.language === 'auto' ? null : preferences.language;
  userDialectLevel = dialect;
  languageConfirmed = true;
  return true;
};

export const askTutorApi = async (query, studentId, chatHistory = [], manualPrefs = {}) => {
  const message = String(query || '').trim();
  if (!message) throw new Error('Pertanyaan belum diisi.');
  if (!isSupabaseConfigured) throw new Error('Supabase BintangAi belum dikonfigurasi.');

  const translateMatch = message.match(/terjemahkan (ke|dalam) (bahasa )?(batak|jawa|sunda|karo|indonesia|inggris)/i);
  if (translateMatch) {
    const lang = translateMatch[3]?.toLowerCase();
    userSelectedLanguage = lang === 'inggris' ? 'english' : lang;
    await saveUserPreferences(studentId, { language: userSelectedLanguage, dialect_level: userDialectLevel, analogi_lokal: true });
  }
  const dialectMatch = message.match(/dialek (ringan|sedang|penuh)/i);
  if (dialectMatch) {
    userDialectLevel = dialectMatch[1].toLowerCase();
    await saveUserPreferences(studentId, { language: userSelectedLanguage || 'auto', dialect_level: userDialectLevel, analogi_lokal: true });
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, class_level')
    .eq('id', studentId).maybeSingle();
  const { data, error } = await supabase.functions.invoke('ai-tutor', { body: {
    task: 'tutor', message, student_id: studentId || null,
    history: Array.isArray(chatHistory) ? chatHistory.slice(-10) : [],
    language: manualPrefs.language || userSelectedLanguage || 'auto',
    dialect_level: manualPrefs.dialect_level || userDialectLevel,
    language_confirmed: languageConfirmed,
    student_name: profile?.full_name || null,
    class_level: profile?.class_level || null,
  } });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Tutor belum dapat menjawab.');
  if (data.language_used && data.language_used !== 'auto' && !userSelectedLanguage) userSelectedLanguage = data.language_used;
  if (data.dialect_level_used) userDialectLevel = data.dialect_level_used;
  const reply = data.reply || '';
  return {
    response: reply,
    answer: reply,
    newHistory: [...chatHistory, { role: 'user', content: message }, { role: 'assistant', content: reply }],
    languageUsed: data.language_used || manualPrefs.language || userSelectedLanguage || 'auto',
    dialectUsed: data.dialect_level_used || userDialectLevel,
  };
};

export const askTutorSmart = askTutorApi;
