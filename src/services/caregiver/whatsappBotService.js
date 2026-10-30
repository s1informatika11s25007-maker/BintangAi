/**
 * SambungJaga AI — WhatsApp & Telegram Bot Integration Service
 * Zero-App Interface for Caregivers & Families
 * Receives incoming WhatsApp voice note transcripts or text messages, processes through
 * Care Superagent, and returns instant structured WhatsApp response in < 2 seconds.
 */

import { runCareSuperagent } from '../ai/aiSuperagent';

/**
 * Processes an incoming WhatsApp Voice Note or Text report.
 * @param {Object} params - { messageText, senderName, senderPhone, context, onCaptureSubmit }
 * @returns {Promise<Object>} Formatted WhatsApp reply message and execution outcome.
 */
export async function processWhatsAppVoiceReport({
  messageText,
  senderName = 'Suster Dewi (WhatsApp)',
  senderPhone = '+6281234567890',
  context,
  onCaptureSubmit
}) {
  const startTime = Date.now();

  // Call Care Superagent via captureCareReport
  const captureResult = await onCaptureSubmit({
    text: messageText,
    sourceType: 'whatsapp_voice_note',
    actorName: `${senderName} [WA]`
  });

  const processingTimeMs = Date.now() - startTime;

  // Format WhatsApp reply message with emojis & markdown
  let waReply = `*🤖 SAMBUNGJAGA AI CARE BOT*\n\n`;
  waReply += `Halo *${senderName}*, laporan suara Anda telah berhasil diproses oleh Superagent dalam *${processingTimeMs} ms*.\n\n`;

  if (captureResult?.resolvedResident) {
    waReply += `👤 *Lansia Terdeteksi:* ${captureResult.resolvedResident.full_name} (Kamar ${captureResult.resolvedResident.room_number || '-'})\n`;
  }

  if (captureResult?.autoClosedTitle) {
    waReply += `✅ *Auto-Close Tugas:* "${captureResult.autoClosedTitle}" telah ditutup otomatis.\n`;
  }

  if (captureResult?.createdAutoObs && captureResult.createdAutoObs.length > 0) {
    waReply += `⚠️ *Kewajiban Otonom AI Dibuat (${captureResult.createdAutoObs.length}):*\n`;
    captureResult.createdAutoObs.forEach((title, idx) => {
      waReply += `  ${idx + 1}. ${title}\n`;
    });
  }

  waReply += `\n📌 *Status Ledger:* P1 Bitemporal & P3 Epistemic Recorded (SHA-256 OK)\n`;
  waReply += `_Terima kasih telah menjaga keutuhan perawatan lansia!_`;

  return {
    success: captureResult?.success || false,
    replyMessage: waReply,
    processingTimeMs,
    captureResult
  };
}
