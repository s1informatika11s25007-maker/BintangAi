import { useEffect, useRef, useCallback, useState } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

/**
 * BintangAi's accessibility navigation does not infer hand gestures with an AI model.
 * Camera preview is optional and uses only the browser MediaDevices API. The
 * on-screen controls provide reliable keyboard/touch alternatives.
 */
export function useGestureControl({ onGesture, enabled } = {}) {
  const { mode, isGestureActive } = useAccessibilityStore();
  const isActiveMode = enabled !== undefined ? enabled : (mode === 'tunawicara' || isGestureActive);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onGestureRef = useRef(onGesture);
  const resetTimerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [totalFingers, setTotalFingers] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [cameraSupported, setCameraSupported] = useState(false);

  useEffect(() => { onGestureRef.current = onGesture; }, [onGesture]);
  useEffect(() => {
    setCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia));
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser ini tidak mendukung preview kamera. Kontrol tombol tetap bisa digunakan.');
      return false;
    }
    if (streamRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      return true;
    } catch (error) {
      setCameraError(error?.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Kontrol tombol tetap tersedia.'
        : 'Preview kamera tidak dapat dimulai. Kontrol tombol tetap tersedia.');
      stopCamera();
      return false;
    }
  }, [stopCamera]);

  const triggerGesture = useCallback((count) => {
    const value = Number(count);
    if (!Number.isInteger(value) || value < 1 || value > 10) return;
    setTotalFingers(value);
    onGestureRef.current?.(value);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setTotalFingers(0), 1100);
  }, []);

  useEffect(() => {
    if (!isActiveMode) stopCamera();
  }, [isActiveMode, stopCamera]);

  useEffect(() => () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef: null,
    isActive,
    handDetected: false,
    totalFingers,
    triggerGesture,
    startCamera,
    stopCamera,
    cameraError,
    cameraSupported,
  };
}
