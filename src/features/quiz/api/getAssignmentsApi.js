import { supabase } from '../../../lib/supabase';

export const getAvailableAssignments = async (studentId) => {
  try {
    const { data: submissions } = await supabase
      .from('submissions')
      .select('assignment_id')
      .eq('student_id', studentId);

    const submittedIds = submissions?.map(s => s.assignment_id) || [];

    let query = supabase.from('assignments').select('*, modules(title)');

    if (submittedIds.length > 0) {
      query = query.not('id', 'in', `(${submittedIds.join(',')})`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};
