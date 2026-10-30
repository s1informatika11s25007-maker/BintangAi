import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CaregiverCaptureModal from '../../src/components/caregiver/CaregiverCaptureModal';

describe('CaregiverCaptureModal Component Tests', () => {
  const mockResidents = [
    { id: 'res-101', full_name: 'Ibu Hj. Aminah (78 th)', room_number: 'Kamar 102 — Dahlia' }
  ];

  it('renders modal when isOpen is true', () => {
    render(
      <CaregiverCaptureModal
        isOpen={true}
        onClose={vi.fn()}
        residents={mockResidents}
        onCaptureSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Zero-Friction Voice Capture')).toBeInTheDocument();
  });

  it('handles report submission and displays success feedback', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      success: true,
      message: 'Laporan berhasil diproses oleh Care Superagent'
    });

    render(
      <CaregiverCaptureModal
        isOpen={true}
        onClose={vi.fn()}
        residents={mockResidents}
        onCaptureSubmit={mockSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/Contoh: Tadi Wisma Melati/i);
    fireEvent.change(textarea, { target: { value: 'Tensinya 120/80 normal.' } });

    const submitBtn = screen.getByRole('button', { name: /Proses AI Superagent/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(screen.getByText(/Laporan berhasil diproses/i)).toBeInTheDocument();
    });
  });

  it('displays prompt injection security warning for dangerous input', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      success: false,
      error: 'Peringatan Keamanan: Terdeteksi percobaan Prompt Injection. Laporan ditolak.'
    });

    render(
      <CaregiverCaptureModal
        isOpen={true}
        onClose={vi.fn()}
        residents={mockResidents}
        onCaptureSubmit={mockSubmit}
      />
    );

    const presetBtn = screen.getByRole('button', { name: /Auto-Task/i });
    fireEvent.click(presetBtn);

    const submitBtn = screen.getByRole('button', { name: /Proses AI Superagent/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
      expect(screen.getByText(/Peringatan Keamanan/i)).toBeInTheDocument();
    });
  });
});
