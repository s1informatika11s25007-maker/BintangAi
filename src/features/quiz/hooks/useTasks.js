import { useState, useEffect } from 'react';
import { getAvailableAssignments } from '../api/getAssignmentsApi';
import { supabase } from '../../../lib/supabase';

/**
 * Hook untuk mengambil daftar tugas/quiz siswa secara Real-time.
 * @param {string} studentId - ID Siswa dari auth store.
 * @returns {Object} { tasks, loading, fetchTasks }
 */
export const useTasks = (studentId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const data = await getAvailableAssignments(studentId);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let channel;
    if (studentId) {
      fetchTasks();

      const channelName = `student_tasks_${studentId}_${Date.now()}`;
      channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assignments' },
          () => {
            fetchTasks();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'submissions', filter: `student_id=eq.${studentId}` },
          () => {
            fetchTasks();
          }
        )
        .subscribe();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [studentId]);

  return { tasks, loading, fetchTasks };
};
