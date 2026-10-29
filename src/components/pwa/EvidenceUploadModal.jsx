import React, { useState } from 'react';
import { Camera, QrCode, UserCheck, ShieldCheck, AlertCircle, X, Sparkles, Check } from 'lucide-react';
import { EVIDENCE_GRADE, EVIDENCE_GRADE_LABELS } from '../../types/architecture';

export default function EvidenceUploadModal({ isOpen, onClose, obligation, onSubmitEvidence, currentUser }) {
  const [selectedGrade, setSelectedGrade] = useState(obligation?.required_evidence_grade || EVIDENCE_GRADE.E1);
  const [photoSim, setPhotoSim] = useState(true);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrVerifiedData, setOcrVerifiedData] = useState(null);
  const [secondPersonName, setSecondPersonName] = useState('Perawat Budi Santoso');
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !obligation) return null;

  const handleMultimodalOcrScan = () => {
    setIsOcrScanning(true);
    setFeedback(null);

    setTimeout(() => {
      setIsOcrScanning(false);
      setOcrVerifiedData({
        vitalReadout: '120/80 mmHg (Normal) / Suhu 36.8°C',
        facelessCropStatus: 'Faceless Privacy Crop PDP: OK (Wajah Diblur/Dipotong Otonom)',
        ocrConfidence: '99.4%'
      });
      setSelectedGrade(EVIDENCE_GRADE.E1);
      setPhotoSim(true);
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const payload = {
      photo_hash: photoSim ? `sha256-faceless-vision-crop-${Date.now()}` : null,
      qr_code: `QR-BED-LOCATION-${obligation.resident_id}`,
      ocr_readout: ocrVerifiedData?.vitalReadout || null,
      second_person_name: selectedGrade === EVIDENCE_GRADE.E2 ? secondPersonName : null,
      timestamp: new Date().toISOString()
    };

    const res = await onSubmitEvidence({
      obligationId: obligation.id,
      evidenceGrade: selectedGrade,
      payload,
      actorName: currentUser?.name || currentUser?.full_name || 'Caregiver'
    });

    if (!res.success) {
      setFeedback({ type: 'error', text: res.error, requiresHumanApproval: res.requiresHumanApproval });
    } else {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-slate-900"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">P2 Evidence-Grade Verifier</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold border border-amber-300">
              Wajib Min: {obligation.required_evidence_grade}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-900">{obligation.title}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{obligation.resident_name}</p>
        </div>

        {/* Multimodal Camera OCR Scan Button */}
        <button
          type="button"
          onClick={handleMultimodalOcrScan}
          disabled={isOcrScanning}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition"
        >
          {isOcrScanning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-emerald-100" />
              <span>Scanning Vision OCR Kamera & Auto Faceless Crop...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>📸 Scan Multimodal Vision AI Kamera (Auto-Verify E1)</span>
            </>
          )}
        </button>

        {ocrVerifiedData && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center text-emerald-700">
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Hasil Vision AI OCR Kamera (&lt; 2 detik):
            </p>
            <p className="font-mono text-[11px] font-semibold">{ocrVerifiedData.vitalReadout}</p>
            <p className="text-[10px] text-emerald-700 font-medium">{ocrVerifiedData.facelessCropStatus}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Tingkat Bukti yang Diunggah</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(EVIDENCE_GRADE).map((gradeKey) => {
                const info = EVIDENCE_GRADE_LABELS[gradeKey];
                const isSelected = selectedGrade === gradeKey;
                return (
                  <button
                    key={gradeKey}
                    type="button"
                    onClick={() => setSelectedGrade(gradeKey)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{info.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{info.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedGrade === EVIDENCE_GRADE.E1 || selectedGrade === EVIDENCE_GRADE.E2) && (
            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> Faceless Privacy Auto-Crop (UU PDP)
                </span>
                <input
                  type="checkbox"
                  checked={photoSim}
                  onChange={(e) => setPhotoSim(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-sky-600"
                />
              </div>

              <div className="flex items-center text-xs text-slate-600 font-medium">
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Auto QR-Code Scan Lokasi Pasien: OK
              </div>

              {selectedGrade === EVIDENCE_GRADE.E2 && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-purple-600" /> Nama Verifikator Orang Kedua (Dual Signoff)
                  </label>
                  <input
                    type="text"
                    value={secondPersonName}
                    onChange={(e) => setSecondPersonName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium"
                  />
                </div>
              )}
            </div>
          )}

          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 border font-medium ${
              feedback.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">{feedback.text}</p>
                {feedback.requiresHumanApproval && (
                  <p className="text-[11px] text-rose-700 mt-1 font-semibold">
                    Silakan teruskan ke Supervisor untuk persetujuan A3 Human Review.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20"
            >
              Verifikasi & Tutup Misi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
