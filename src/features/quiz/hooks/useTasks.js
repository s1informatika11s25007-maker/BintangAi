import { useState, useEffect } from 'react';
import { getAvailableAssignments } from '../api/getAssignmentsApi';

/**
 * Hook untuk mengambil daftar tugas/quiz siswa.
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
    fetchTasks();
  }, [studentId]);

  return { tasks, loading, fetchTasks };
};
