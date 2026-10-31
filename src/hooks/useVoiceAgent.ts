import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceApi, type VoiceTurnResponse } from '../api/voiceApi';

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type VoiceTransport = 'websocket' | 'http' | 'disconnected';

export interface VoiceTranscriptItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isInterrupted?: boolean;
  timings?: VoiceTurnResponse['timings_ms'];
}

export interface UseVoiceAgentOptions {
  language?: string;
  autoInitOnMount?: boolean;
  welcomeMessage?: string;
  preferWebSocket?: boolean;
  onTurnComplete?: (transcript: string, reply: string) => void;
  chatbotId?: string;
}

// ---------------------------------------------------------------------------
// Audio Helper: Downsample Float32 mic buffer to 16kHz Mono Int16 PCM
// ---------------------------------------------------------------------------
function downsampleTo16k(input: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === 16000) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const output = new Int16Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const originalIdx = i * ratio;
    const leftIdx = Math.floor(originalIdx);
    const rightIdx = Math.min(leftIdx + 1, input.length - 1);
    const weight = originalIdx - leftIdx;
    const sample = input[leftIdx] * (1 - weight) + input[rightIdx] * weight;
    const s = Math.max(-1, Math.min(1, sample));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

// ---------------------------------------------------------------------------
// PCM Audio Streaming Player (for 24kHz PCM from WebSocket)
// ---------------------------------------------------------------------------
class PcmStreamPlayer {
  private ctx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private sampleRate: number = 24000;
  private activeSources: AudioBufferSourceNode[] = [];
  private trailingPcmByte: number | null = null;

  init(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.nextStartTime = this.ctx.currentTime;
  }

  playChunk(pcm16Buffer: ArrayBuffer, onLevel?: (lvl: number) => void) {
    if (!this.ctx) this.init();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // A streamed PCM frame may end between the two bytes of an int16 sample.
    // Carry that byte forward so a single odd-sized network chunk cannot stop
    // playback with a RangeError.
    const incoming = new Uint8Array(pcm16Buffer);
    const aligned = new Uint8Array(incoming.length + (this.trailingPcmByte === null ? 0 : 1));
    let offset = 0;
    if (this.trailingPcmByte !== null) {
      aligned[0] = this.trailingPcmByte;
      offset = 1;
      this.trailingPcmByte = null;
    }
    aligned.set(incoming, offset);
    if (aligned.length % 2 === 1) {
      this.trailingPcmByte = aligned[aligned.length - 1];
    }
    const usableLength = aligned.length - (aligned.length % 2);
    if (usableLength === 0) return;
    const int16 = new Int16Array(aligned.buffer, aligned.byteOffset, usableLength / 2);
    if (int16.length === 0) return;

    const float32 = new Float32Array(int16.length);
    let sum = 0;
    for (let i = 0; i < int16.length; i++) {
      const v = int16[i] / 32768;
      float32[i] = v;
      sum += Math.abs(v);
    }

    if (onLevel) {
      const avg = (sum / int16.length) * 100;
      onLevel(Math.min(100, Math.round(avg * 2.8)));
    }

    const buffer = ctx.createBuffer(1, float32.length, this.sampleRate);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startTime = Math.max(now, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;

    this.activeSources.push(source);
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
    };
  }

  isPlaying(): boolean {
    return this.activeSources.length > 0;
  }

  stop() {
    for (const s of this.activeSources) {
      try {
        s.stop();
      } catch {}
    }
    this.activeSources = [];
    this.trailingPcmByte = null;
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    }
  }

  close() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const useVoiceAgent = (options: UseVoiceAgentOptions = {}) => {
  const {
    language = 'en',
    autoInitOnMount = true,
    welcomeMessage = 'Hello! How can I help you today?',
    preferWebSocket = true,
    chatbotId,
    onTurnComplete,
  } = options;

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transport, setTransport] = useState<VoiceTransport>(preferWebSocket ? 'disconnected' : 'http');

  const autoInitDoneRef = useRef<boolean>(false);
  const isComponentMounted = useRef<boolean>(true);
  const isMutedRef = useRef<boolean>(isMuted);

  // WebSocket & Web Audio streaming refs
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const pcmPlayerRef = useRef<PcmStreamPlayer>(new PcmStreamPlayer());
  const animFrameRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastAssistantTextRef = useRef<string>('');
  const currentTurnAudioChunksRef = useRef<number>(0);
  const audioFallbackTimeoutRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const voiceStateRef = useRef<VoiceState>(voiceState);
  const assistantSpeakingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    voiceStateRef.current = voiceState;
    isSpeakingRef.current = voiceState === 'speaking';
    if (voiceState === 'speaking') {
      assistantSpeakingStartTimeRef.current = Date.now();
    }
  }, [voiceState]);

  // HTTP recording fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      cleanupAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupAllAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    if (micAudioCtxRef.current && micAudioCtxRef.current.state !== 'closed') {
      micAudioCtxRef.current.close().catch(() => {});
      micAudioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.stop();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioLevel(0);
  }, []);

  // ---------------------------------------------------------------------------
  // Fallback speech synthesis
  // ---------------------------------------------------------------------------
  const fallbackSpeechSynthesis = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window) || isMutedRef.current) {
        if (isComponentMounted.current) setVoiceState('idle');
        return;
      }
      window.speechSynthesis.cancel();
      assistantSpeakingStartTimeRef.current = Date.now();
      if (isComponentMounted.current) setVoiceState('speaking');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';

      let step = 0;
      const wave = () => {
        step += 0.2;
        if (isComponentMounted.current) setAudioLevel(Math.round(40 + Math.sin(step) * 20));
        animFrameRef.current = requestAnimationFrame(wave);
      };
      animFrameRef.current = requestAnimationFrame(wave);

      utterance.onend = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (isComponentMounted.current) {
          setAudioLevel(0);
          setVoiceState('listening');
        }
      };

      utterance.onerror = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (isComponentMounted.current) {
          setAudioLevel(0);
          setVoiceState('listening');
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedLanguage]
  );

  // Play audio reply (base64 WAV or fallback)
  const playAudioReply = useCallback(
    (audioBase64: string | null, textFallback: string) => {
      if (isMutedRef.current) {
        if (isComponentMounted.current) setVoiceState('idle');
        return;
      }

      if (isComponentMounted.current) setVoiceState('speaking');

      let step = 0;
      const simulateSpeakingLevels = () => {
        step += 0.2;
        const simulated = Math.round(35 + Math.sin(step) * 25 + Math.cos(step * 2.3) * 15);
        if (isComponentMounted.current) setAudioLevel(Math.max(10, Math.min(95, simulated)));
        animFrameRef.current = requestAnimationFrame(simulateSpeakingLevels);
      };

      if (audioBase64) {
        try {
          const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
          currentAudioRef.current = audio;

          animFrameRef.current = requestAnimationFrame(simulateSpeakingLevels);

          audio.onended = () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            currentAudioRef.current = null;
            if (isComponentMounted.current) {
              setAudioLevel(0);
              setVoiceState('idle');
            }
          };

          audio.onerror = () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            currentAudioRef.current = null;
            fallbackSpeechSynthesis(textFallback);
          };

          audio.play().catch(() => {
            fallbackSpeechSynthesis(textFallback);
          });
          return;
        } catch {
          fallbackSpeechSynthesis(textFallback);
          return;
        }
      }

      fallbackSpeechSynthesis(textFallback);
    },
    [fallbackSpeechSynthesis]
  );

  // ---------------------------------------------------------------------------
  // Interrupt / Barge-in
  // ---------------------------------------------------------------------------
  const interrupt = useCallback(() => {
    if (audioFallbackTimeoutRef.current) {
      clearTimeout(audioFallbackTimeoutRef.current);
      audioFallbackTimeoutRef.current = null;
    }
    pcmPlayerRef.current.stop();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
    setVoiceState('idle');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
      } catch {}
    }
  }, []);

  // ---------------------------------------------------------------------------
  // WebSocket Connection & Real-Time PCM Mic Streaming (Pure WebSocket)
  // ---------------------------------------------------------------------------
  const connectWebSocket = useCallback(
    (existingSid?: string | null) => {
      setErrorMessage(null);
      setVoiceState('connecting');
      setTransport('disconnected');
      const wsUrl = voiceApi.getWsUrl(existingSid, chatbotId);
      console.info('[Voice WS] Connecting', wsUrl);
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.error('[Voice WS] Could not create socket', detail);
        setErrorMessage(`Could not open voice WebSocket: ${detail}`);
        setVoiceState('error');
        return;
      }
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;
      let receivedAudioChunks = 0;
      let receivedAudioBytes = 0;

      ws.onopen = () => {
        if (!isComponentMounted.current) return;
        console.info('[Voice WS] Connected; requesting welcome audio');
        setTransport('websocket');
        setVoiceState('idle');
        pcmPlayerRef.current.init(24000);

        // 1. Send language configuration
        ws.send(JSON.stringify({ type: 'config', language: selectedLanguage }));

        // 2. Request initial welcome greeting directly over the WebSocket
        ws.send(JSON.stringify({ type: 'greeting', text: welcomeMessage }));

        // 3. Start streaming mic audio to WebSocket. The welcome is played
        // from the server's binary PCM frames, with text fallback on turn_end.
        startStreamingMicToWs(ws);
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;

        // Binary frame = 24kHz PCM chunk from server TTS (welcome or reply)
        if (event.data instanceof ArrayBuffer) {
          currentTurnAudioChunksRef.current += 1;
          if (audioFallbackTimeoutRef.current) {
            clearTimeout(audioFallbackTimeoutRef.current);
            audioFallbackTimeoutRef.current = null;
          }
          // If browser speech synthesis was playing, stop it in favor of real server audio
          if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }

          receivedAudioChunks += 1;
          receivedAudioBytes += event.data.byteLength;
          if (receivedAudioChunks === 1 || receivedAudioChunks % 25 === 0) {
            console.info('[Voice WS] Received server audio chunk', {
              chunks: receivedAudioChunks,
              chunkBytes: event.data.byteLength,
              totalBytes: receivedAudioBytes,
            });
          }
          if (isMutedRef.current) return;
          setVoiceState('speaking');
          try {
            pcmPlayerRef.current.playChunk(event.data, (level) => {
              if (isComponentMounted.current) setAudioLevel(level);
            });
          } catch (error) {
            console.error('[Voice WS] Could not play server audio chunk', error);
            if (lastAssistantTextRef.current) {
              fallbackSpeechSynthesis(lastAssistantTextRef.current);
            }
          }
          return;
        }

        // Text frame = JSON protocol event
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_created') {
            console.info('[Voice WS] Session ready', msg.session_id);
          } else if (msg.type === 'error') {
            console.error('[Voice WS] Server error', msg);
          }
          switch (msg.type) {
            case 'session_created':
              if (msg.session_id) {
                setSessionId(msg.session_id);
              }
              break;

            case 'audio_config':
              pcmPlayerRef.current.init(msg.output_sample_rate || 24000);
              break;

            case 'speech_start':
              // Do NOT stop playback on speech_start! Only transition UI if assistant is not speaking.
              if (
                !isSpeakingRef.current &&
                !pcmPlayerRef.current.isPlaying() &&
                !(typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking)
              ) {
                setVoiceState('listening');
              }
              break;

            case 'interrupt':
              console.info('[Voice WS] Dual-layer confirmed barge-in; stopping assistant playback');
              interrupt();
              setVoiceState('listening');
              break;

            case 'transcript':
              if (msg.role === 'user') {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setTranscripts((prev) => [
                  ...prev,
                  {
                    id: `ws-user-${Date.now()}`,
                    role: 'user',
                    text: msg.text,
                    timestamp: 'Just now',
                  },
                ]);
                setVoiceState('processing');
              } else if (msg.role === 'assistant') {
                lastAssistantTextRef.current = msg.text;
                currentTurnAudioChunksRef.current = 0;

                setTranscripts((prev) => [
                  ...prev,
                  {
                    id: `ws-bot-${Date.now()}`,
                    role: 'assistant',
                    text: msg.text,
                    timestamp: 'Just now',
                    isInterrupted: msg.interrupted,
                  },
                ]);
                if (onTurnComplete) {
                  onTurnComplete('', msg.text);
                }

                // If server binary audio doesn't arrive within 250ms, play via speech synthesis
                if (audioFallbackTimeoutRef.current) {
                  clearTimeout(audioFallbackTimeoutRef.current);
                }
                audioFallbackTimeoutRef.current = setTimeout(() => {
                  if (currentTurnAudioChunksRef.current === 0 && isComponentMounted.current && !isMutedRef.current) {
                    console.info('[Voice WS] Speaking assistant reply via speech synthesis');
                    fallbackSpeechSynthesis(msg.text);
                  }
                }, 250);
              }
              break;

            case 'audio_start':
              if (audioFallbackTimeoutRef.current) {
                clearTimeout(audioFallbackTimeoutRef.current);
                audioFallbackTimeoutRef.current = null;
              }
              setVoiceState('speaking');
              pcmPlayerRef.current.init(msg.sample_rate || 24000);
              break;

            case 'turn_end':
              if (currentTurnAudioChunksRef.current === 0 && lastAssistantTextRef.current) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window && !window.speechSynthesis.speaking && !isMutedRef.current) {
                  console.info('[Voice WS] turn_end: speaking reply via speech synthesis');
                  fallbackSpeechSynthesis(lastAssistantTextRef.current);
                }
              } else if (isComponentMounted.current) {
                setTimeout(() => {
                  if (
                    isComponentMounted.current &&
                    voiceState !== 'listening' &&
                    !(typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking)
                  ) {
                    setVoiceState('idle');
                    setAudioLevel(0);
                  }
                }, 400);
              }
              break;

            case 'tts_fallback':
              if (msg.text || lastAssistantTextRef.current) {
                console.info('[Voice WS] Server TTS fallback: speaking via client speech synthesis');
                fallbackSpeechSynthesis(msg.text || lastAssistantTextRef.current);
              }
              break;

            case 'error':
              if ((msg.code === 'tts_failed' || msg.code === 'tts_no_audio') && lastAssistantTextRef.current) {
                console.info('[Voice WS] Server TTS reported error/no_audio, speaking via speech synthesis');
                fallbackSpeechSynthesis(lastAssistantTextRef.current);
              } else if (msg.code === 'no_speech_detected') {
                setVoiceState('idle');
              } else {
                const detail = msg.message || msg.code || 'unknown_error';
                setErrorMessage(`Voice agent error: ${detail}`);
                setVoiceState('error');
              }
              break;
          }
        } catch (e) {
          console.warn('Failed to parse WS text message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('[Voice WS] Connection error', e);
        if (isComponentMounted.current) {
          setTransport('disconnected');
          setErrorMessage('Could not connect to the live voice server. Check the backend address and WebSocket route.');
          setVoiceState('error');
        }
      };

      ws.onclose = (event) => {
        console.info('[Voice WS] Closed', { code: event.code, reason: event.reason });
        wsRef.current = null;
        if (isComponentMounted.current) {
          setTransport('disconnected');
          setErrorMessage(`Voice WebSocket closed (${event.code})${event.reason ? `: ${event.reason}` : '.'}`);
          setVoiceState('error');
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage, welcomeMessage, interrupt, onTurnComplete, chatbotId]
  );

  // ---------------------------------------------------------------------------
  // Continuous 16kHz PCM streaming from browser mic to WebSocket
  // ---------------------------------------------------------------------------
  const startStreamingMicToWs = async (ws: WebSocket) => {
    try {
      let sentAudioChunks = 0;
      let sentAudioBytes = 0;
      let stream = streamRef.current;
      if (!stream || !stream.active || !stream.getAudioTracks().some((t) => t.readyState === 'live')) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      micAudioCtxRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch (e) {
          console.warn('[Voice WS] audioCtx.resume() note:', e);
        }
      }

      const source = audioCtx.createMediaStreamSource(stream);
      // ScriptProcessor buffers 4096 samples
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isComponentMounted.current || ws.readyState !== WebSocket.OPEN) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Measure audio level for visualizer
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += Math.abs(inputChannelData[i]);
        }
        const avg = sum / inputChannelData.length;
        const normalized = Math.min(100, Math.round(avg * 400));
        if (isComponentMounted.current) {
          setAudioLevel(normalized);
        }

        // If user muted, don't send frames
        if (isMutedRef.current) return;

        const isAssistantSpeaking =
          isSpeakingRef.current ||
          pcmPlayerRef.current.isPlaying() ||
          (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking);

        // Echo protection while assistant is speaking:
        if (isAssistantSpeaking) {
          const elapsed = Date.now() - assistantSpeakingStartTimeRef.current;
          // 1. Initial 1.2s grace period: suppress speaker acoustic bleed from the first word
          if (elapsed < 1200) {
            return;
          }
          // 2. Discard low-energy speaker echo (require intentional user volume to barge in)
          if (avg < 0.025) {
            return;
          }
        }

        // Downsample input rate to 16,000 Hz Mono signed 16-bit PCM
        const pcm16 = downsampleTo16k(inputChannelData, audioCtx.sampleRate);
        try {
          ws.send(pcm16.buffer as ArrayBuffer);
          sentAudioChunks += 1;
          sentAudioBytes += pcm16.byteLength;
          if (sentAudioChunks === 1 || sentAudioChunks % 25 === 0) {
            console.info('[Voice WS] Sent microphone audio chunk', {
              chunks: sentAudioChunks,
              chunkBytes: pcm16.byteLength,
              totalBytes: sentAudioBytes,
              sampleRate: 16000,
            });
          }
        } catch (error) {
          console.error('[Voice WS] Failed to send microphone audio chunk', error);
        }
      };

      source.connect(processor);
      // Connect to destination via a 0-gain mute node to keep ScriptProcessor running without mic feedback
      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0;
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);
    } catch (err: any) {
      console.warn('Could not start continuous mic stream:', err);
      if (isComponentMounted.current) {
        setErrorMessage(err?.message || 'Could not start microphone audio streaming.');
        setVoiceState('error');
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Auto-init on mount: request permission → directly open WebSocket
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!autoInitOnMount || autoInitDoneRef.current) return;
    autoInitDoneRef.current = true;

    let cancelled = false;

    const init = async () => {
      // Step 1: Prompt mic permission and keep stream alive
      try {
        const permStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = permStream;
      } catch (err: any) {
        if (!isComponentMounted.current || cancelled) return;
        const denied =
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError' ||
          err.name === 'NotFoundError';
        setErrorMessage(
          denied
            ? 'Microphone access denied. Please allow microphone permissions and refresh.'
            : `Microphone unavailable: ${err.message}`
        );
        setVoiceState('error');
        return;
      }

      if (!isComponentMounted.current || cancelled) return;

      // Step 2: Directly open the WebSocket connection (session is created server-side via WS)
      if (preferWebSocket) {
        connectWebSocket();
      } else {
        // Fallback for HTTP mode
        setVoiceState('connecting');
        try {
          const session = await voiceApi.createSession(selectedLanguage);
          if (!isComponentMounted.current || cancelled) return;
          setSessionId(session.session_id);
          setVoiceState('idle');
          setTranscripts([
            {
              id: 'welcome-voice',
              role: 'assistant',
              text: welcomeMessage,
              timestamp: 'Just now',
            },
          ]);
          try {
            const result = await voiceApi.speak(session.session_id, welcomeMessage);
            if (result.audio_b64) playAudioReply(result.audio_b64, welcomeMessage);
            else fallbackSpeechSynthesis(welcomeMessage);
          } catch {
            fallbackSpeechSynthesis(welcomeMessage);
          }
        } catch (err: any) {
          if (!isComponentMounted.current || cancelled) return;
          setErrorMessage(err.message || 'Could not connect to voice service.');
          setVoiceState('error');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      autoInitDoneRef.current = false;
      // React StrictMode runs setup → cleanup → setup in development. Reset
      // this guard so the second setup still opens the WebSocket.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // HTTP Turn Mode Fallback (Manual push-to-talk recording if WS is inactive)
  // ---------------------------------------------------------------------------
  const startListeningHttp = useCallback(async () => {
    if (voiceState === 'speaking') interrupt();
    setErrorMessage(null);

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const s = await voiceApi.createSession(selectedLanguage);
      activeSessionId = s.session_id;
      setSessionId(activeSessionId);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordStartTimeRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const durationMs = Date.now() - recordStartTimeRef.current;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (audioChunksRef.current.length === 0 || durationMs < 300) {
          setVoiceState('idle');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 200) {
          setVoiceState('idle');
          return;
        }

        setVoiceState('processing');

        try {
          const result = await voiceApi.sendTurn(audioBlob, activeSessionId!, selectedLanguage, durationMs);
          if (!isComponentMounted.current) return;

          const userText = result.transcript || '(Unspoken audio)';
          const assistantReply = result.reply || "I didn't receive a response.";

          setTranscripts((prev) => [
            ...prev,
            { id: `http-user-${Date.now()}`, role: 'user', text: userText, timestamp: 'Just now' },
            { id: `http-bot-${Date.now()}`, role: 'assistant', text: assistantReply, timestamp: 'Just now' },
          ]);

          if (onTurnComplete) onTurnComplete(userText, assistantReply);
          playAudioReply(result.audio_b64, assistantReply);
        } catch (err: any) {
          if (isComponentMounted.current) {
            setErrorMessage(err.message || 'Failed to process voice turn.');
            setVoiceState('error');
          }
        }
      };

      recorder.start(100);
      setVoiceState('listening');
    } catch (err: any) {
      if (isComponentMounted.current) {
        setErrorMessage(err.message || 'Could not access microphone.');
        setVoiceState('error');
      }
    }
  }, [voiceState, sessionId, selectedLanguage, interrupt, playAudioReply, onTurnComplete]);

  const stopListeningHttp = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Main action button handler
  const startListening = useCallback(() => {
    if (preferWebSocket) {
      try {
        // Resume AudioContext synchronously from the user's gesture, so the
        // browser can play later binary PCM frames under autoplay policies.
        pcmPlayerRef.current.init();
        if (micAudioCtxRef.current && micAudioCtxRef.current.state === 'suspended') {
          micAudioCtxRef.current.resume().catch(() => {});
        }
        console.info('[Voice WS] Audio output and mic unlocked by user gesture');
      } catch (error) {
        console.error('[Voice WS] Audio output could not be unlocked', error);
      }
      isMutedRef.current = false;
      setIsMuted(false);
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Attempt automatic reconnection
        setErrorMessage(null);
        connectWebSocket(sessionId);
        return;
      }
      if (!scriptNodeRef.current) {
        startStreamingMicToWs(wsRef.current);
      }
      // In WebSocket mode, streaming is automatic via server VAD!
      // Tapping unmutes / interrupts
      if (voiceState === 'speaking') {
        interrupt();
      } else {
        setVoiceState('listening');
      }
    } else {
      startListeningHttp();
    }
  }, [preferWebSocket, wsRef, sessionId, connectWebSocket, voiceState, interrupt, startListeningHttp]);

  const stopListening = useCallback(() => {
    if (transport !== 'http') {
      setIsMuted(true);
      setVoiceState('idle');
    } else {
      stopListeningHttp();
    }
  }, [transport, stopListeningHttp]);

  const resetSession = useCallback(async () => {
    cleanupAllAudio();
    if (!preferWebSocket && sessionId) {
      try {
        await voiceApi.endSession(sessionId);
      } catch {}
    }
    autoInitDoneRef.current = false;
    setSessionId(null);
    setTranscripts([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: welcomeMessage,
        timestamp: 'Just now',
      },
    ]);
    setErrorMessage(null);
    if (preferWebSocket) {
      connectWebSocket();
    } else {
      setVoiceState('idle');
    }
  }, [sessionId, welcomeMessage, cleanupAllAudio, preferWebSocket, connectWebSocket]);

  return {
    voiceState,
    sessionId,
    transcripts,
    errorMessage,
    audioLevel,
    isMuted,
    transport,
    selectedLanguage,
    setSelectedLanguage,
    setIsMuted,
    startListening,
    stopListening,
    interrupt,
    resetSession,
  };
};

export default useVoiceAgent;
