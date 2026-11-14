import { supabase } from '../../../lib/supabase';

export const getAvailableAssignments = async (studentId) => {
  if (!studentId) return [];
  try {
    // 1. Fetch student profile details (class_code)
    const { data: student } = await supabase
      .from('profiles')
      .select('id, class_code')
      .eq('id', studentId)
      .maybeSingle();

    // 2. Fetch submitted assignment IDs for this student
    const { data: submissions } = await supabase
      .from('submissions')
      .select('assignment_id')
      .eq('student_id', studentId);

    const submittedIds = submissions?.map(s => s.assignment_id) || [];

    // 3. Fetch all raw assignments
    const { data: rawAssignments, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 4. Filter assignments available for this student and not yet submitted
    const available = (rawAssignments || []).filter(a => {
      // Exclude already submitted
      if (submittedIds.includes(a.id)) return false;

      // Available if public
      if (a.is_public === true) return true;

      // Available if targeted directly to student ID
      if (Array.isArray(a.target_students) && a.target_students.includes(studentId)) return true;

      // Available if targeted to student's class code
      if (Array.isArray(a.target_classes) && student?.class_code && a.target_classes.includes(student.class_code)) return true;

      // Available if class_code matches
      if (a.class_code && student?.class_code && a.class_code === student.class_code) return true;

      // Fallback if no target arrays specified
      if ((!a.target_students || a.target_students.length === 0) && (!a.target_classes || a.target_classes.length === 0)) return true;

      return false;
    });

    return available;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
};
