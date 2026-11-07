import { supabase } from '../../../lib/supabase';

export const submitResultApi = async (assignmentId, studentId, score, resultsDetail = [], correctCount = 0, incorrectCount = 0) => {
  const { data, error } = await supabase.from('submissions').insert({
    assignment_id: assignmentId,
    student_id: studentId,
    status: 'submitted',
    total_score: score,
    results_detail: resultsDetail,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    submitted_at: new Date().toISOString(),
  });

  if (error) throw error;
  return data;
};
