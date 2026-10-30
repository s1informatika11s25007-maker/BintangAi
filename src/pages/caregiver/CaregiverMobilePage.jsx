import React, { useState } from 'react';
import { Mic, Camera, ShieldCheck, Wifi, WifiOff, Send, MessageSquare, Sparkles } from 'lucide-react';
import CaregiverCaptureModal from '../../components/caregiver/CaregiverCaptureModal';
import EvidenceUploadModal from '../../components/caregiver/EvidenceUploadModal';
import VisionCameraModal from '../../components/caregiver/VisionCameraModal';
import FloatingVoiceMic from '../../components/common/FloatingVoiceMic';
import { processWhatsAppVoiceReport } from '../../services/caregiver/whatsappBotService';
import { OBLIGATION_STATUS, EVIDENCE_GRADE_LABELS } from '../../types/core/architecture';

export default function CaregiverMobilePage({
  residents = [],
  obligations = [],
  onCaptureSubmit,
  onSubmitEvidence,
  onOpenTraceModal,
  isOffline,
  offlineQueue = [],
  currentUser
}) {
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isVisionCameraOpen, setIsVisionCameraOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState(null);

  const [waText, setWaText] = useState('');
  const [waReply, setWaReply] = useState(null);
  const [isWaProcessing, setIsWaProcessing] = useState(false);

  const openEvidenceModal = (ob) => {
    setSelectedObligation(ob);
    setIsEvidenceModalOpen(true);
  };

  const openVisionCamera = (ob) => {
    setSelectedObligation(ob);
    setIsVisionCameraOpen(true);
  };

  const handleSimulateWhatsAppMessage = async () => {
    if (!waText.trim()) return;
    setIsWaProcessing(true);
    setWaReply(null);

    const res = await processWhatsAppVoiceReport({
      messageText: waText,
      senderName: currentUser?.name || currentUser?.full_name || 'Suster Dewi',
      context: { residents, activeObligations: obligations },
      onCaptureSubmit
    });

    setWaReply(res.replyMessage);
    setIsWaProcessing(false);
    setWaText('');
  };

  const activeObs = obligations.filter(o => o.status !== OBLIGATION_STATUS.VERIFIED_CLOSED);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* PWA Mobile Header Action Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-teal-600/30">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Care Capture Agent (PWA Mobile)</h3>
            <p className="text-xs text-slate-500 font-medium">Laporan Suara (STT) &bull; Vision Camera OCR &bull; P5 Offline Ledger</p>
          </div>
        </div>

        <button
          onClick={() => setIsCaptureModalOpen(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-600/30 flex items-center space-x-2"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>Rekam Suara / Teks Laporan</span>
        </button>
      </div>

      {/* WhatsApp / Telegram Zero-App Interface Simulator */}
      <div className="bg-emerald-950/90 text-emerald-100 border border-emerald-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-xs sm:text-sm text-white">Simulasi WhatsApp & Telegram Care Bot (&lt; 2 Detik Respon)</h4>
          </div>
          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono">Zero-App Access</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={waText}
            onChange={(e) => setWaText(e.target.value)}
            placeholder="Ketik pesan WA: 'Oma Aminah tensinya 130/80 normal jam 11 siang'"
            className="flex-1 bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            onClick={handleSimulateWhatsAppMessage}
            disabled={isWaProcessing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim WA</span>
          </button>
        </div>

        {waReply && (
          <div className="p-3 bg-emerald-900/80 border border-emerald-700 rounded-xl text-xs whitespace-pre-wrap font-mono text-emerald-200 animate-slide-up">
            {waReply}
          </div>
        )}
      </div>

      {/* Active Care Obligations List for Caregiver */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Misi & Kewajiban Perawatan Aktif ({activeObs.length})</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {activeObs.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Semua Tugas Perawatan Telah Selesai!</p>
              <p className="text-xs text-slate-500">Zero Care Debt. Seluruh bukti E1-E3 terverifikasi sah.</p>
            </div>
          ) : (
            activeObs.map((ob) => (
              <div key={ob.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold border border-sky-300">
                      Standard: {ob.required_evidence_grade || 'E1'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{ob.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{ob.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-medium">Lansia: {ob.resident_name || 'Ibu Aminah'}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openVisionCamera(ob)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan Vision AI</span>
                    </button>
                    <button
                      onClick={() => openEvidenceModal(ob)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Unggah Bukti</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CaregiverCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        residents={residents}
        onCaptureSubmit={onCaptureSubmit}
        currentUser={currentUser}
      />

      <EvidenceUploadModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        obligation={selectedObligation}
        onSubmitEvidence={onSubmitEvidence}
        currentUser={currentUser}
      />

      <VisionCameraModal
        isOpen={isVisionCameraOpen}
        onClose={() => setIsVisionCameraOpen(false)}
        obligation={selectedObligation}
        onSubmitEvidence={onSubmitEvidence}
        currentUser={currentUser}
      />

      <FloatingVoiceMic onOpenCaptureModal={() => setIsCaptureModalOpen(true)} />
    </div>
  );
}
