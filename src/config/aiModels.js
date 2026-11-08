// Single frontend allow-list. The server validates this list independently.
export const AI_MODELS = Object.freeze({
  tutor: 'qwen/qwen3.8-27b',
  promptGuard: 'meta-llama/llama-prompt-guard-2-22m',
  fallback: 'openai/gpt-oss-120b',
  safeguard: 'openai/gpt-oss-safeguard-20b',
  whisperLargeV3: 'whisper-large-v3', // documentation only; never invoked
  whisperLargeV3Turbo: 'whisper-large-v3-turbo', // documentation only; never invoked
});

export const CHAT_MODEL_IDS = Object.freeze([AI_MODELS.tutor, AI_MODELS.promptGuard, AI_MODELS.fallback, AI_MODELS.safeguard]);
export const TRANSCRIPTION_MODE = 'browser-web-speech-api';
export const CAMERA_MODE = 'browser-get-user-media-no-vision-model';
