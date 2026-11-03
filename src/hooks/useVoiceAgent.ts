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
  private gainNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private sampleRate: number = 24000;
  private activeSources: AudioBufferSourceNode[] = [];
  private trailingPcmByte: number | null = null;
  // Reported to the server so it knows when the speaker is really silent; the
  // server uses this to ignore the agent's own (buffered) voice.
  onPlaybackStart: (() => void) | null = null;
  onPlaybackEnd: (() => void) | null = null;
  private playingNotified = false;
  private currentPlaybackRms = 0;

  init(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.nextStartTime = this.ctx.currentTime;
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
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
    let sumSquares = 0;
    for (let i = 0; i < int16.length; i++) {
      const v = int16[i] / 32768;
      float32[i] = v;
      sum += Math.abs(v);
      sumSquares += v * v;
    }
    const chunkRms = Math.sqrt(sumSquares / int16.length);
    this.currentPlaybackRms = Math.max(chunkRms, this.currentPlaybackRms * 0.8);

    if (onLevel) {
      const avg = (sum / int16.length) * 100;
      onLevel(Math.min(100, Math.round(avg * 2.8)));
    }

    const buffer = ctx.createBuffer(1, float32.length, this.sampleRate);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode || ctx.destination);

    const now = ctx.currentTime;
    // Seamless timeline queue scheduling: starts immediately if timeline is in the past,
    // otherwise schedules precisely at nextStartTime with zero gaps between chunks.
    const startTime = Math.max(now, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;

    this.activeSources.push(source);
    if (!this.playingNotified) {
      this.playingNotified = true;
      this.onPlaybackStart?.();
    }
    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) this.activeSources.splice(idx, 1);
      if (this.activeSources.length === 0) {
        this.currentPlaybackRms = 0;
        if (this.playingNotified) {
          this.playingNotified = false;
          this.onPlaybackEnd?.();
        }
      }
    };
  }

  isPlaying(): boolean {
    return this.activeSources.length > 0;
  }

  getPlaybackRms(): number {
    return this.isPlaying() ? this.currentPlaybackRms : 0;
  }

  stop() {
    const wasPlaying = this.playingNotified;
    this.playingNotified = false;
    this.currentPlaybackRms = 0;
    for (const s of this.activeSources) {
      try {
        s.stop();
      } catch {}
    }
    this.activeSources = [];
    this.trailingPcmByte = null;
    this.nextStartTime = 0;
    this.setVolume(1.0);
    if (wasPlaying) this.onPlaybackEnd?.();
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
  const currentAssistantMsgIdRef = useRef<string | null>(null);
  const currentTurnIdRef = useRef<string | null>(null);
  const audioFallbackTimeoutRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const voiceStateRef = useRef<VoiceState>(voiceState);
  const assistantSpeakingStartTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const intentionalCloseRef = useRef<boolean>(false);
  const connectWsRef = useRef<((sid?: string | null) => void) | null>(null);
  const greetedRef = useRef<boolean>(false);
  const stableConnectionTimeoutRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<any>(null);

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
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      cleanupAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupAllAudio = useCallback(() => {
    if (stableConnectionTimeoutRef.current) {
      clearTimeout(stableConnectionTimeoutRef.current);
      stableConnectionTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
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
      intentionalCloseRef.current = true;
      greetedRef.current = false;
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
    currentAssistantMsgIdRef.current = null;
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

    // ---- NEW: tell the server the speaker is active ----
    const report = (state: 'start' | 'end') => {
      const socket = wsRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'playback', state }));
      }
    };
    report('start');
    // ---------------------------------------------------

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
      report('end');                                   // <-- NEW
      if (isComponentMounted.current) {
        currentAssistantMsgIdRef.current = null;
        setAudioLevel(0);
        setVoiceState('idle');
      }
    };

    utterance.onerror = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      report('end');                                   // <-- NEW
      if (isComponentMounted.current) {
        currentAssistantMsgIdRef.current = null;
        setAudioLevel(0);
        setVoiceState('idle');
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
              currentAssistantMsgIdRef.current = null;
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
  const stopLocalPlayback = useCallback(() => {
    if (audioFallbackTimeoutRef.current) {
      clearTimeout(audioFallbackTimeoutRef.current);
      audioFallbackTimeoutRef.current = null;
    }
    pcmPlayerRef.current.stop();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    currentAssistantMsgIdRef.current = null;
    setAudioLevel(0);
  }, []);

  const interrupt = useCallback(() => {
    stopLocalPlayback();
    setVoiceState('idle');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'interrupt',
          turn_id: currentTurnIdRef.current || undefined,
        }));
      } catch {}
    }
  }, [stopLocalPlayback]);

  // ---------------------------------------------------------------------------
  // WebSocket Connection & Real-Time PCM Mic Streaming (Pure WebSocket)
  // ---------------------------------------------------------------------------
  const connectWebSocket = useCallback(
    (existingSid?: string | null) => {
      intentionalCloseRef.current = false;

      // If already connected or actively connecting, do not tear down and reconnect
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.info('[Voice WS] Socket is already open or connecting; ignoring redundant connect request');
        return;
      }

      setErrorMessage(null);
      setVoiceState('connecting');
      setTransport('disconnected');
      const wsUrl = voiceApi.getWsUrl(existingSid, chatbotId);
      console.info('[Voice WS] Connecting', wsUrl);

      // A previous socket (retry, reconnect, restart) must never stay open:
      // two live sockets would each play the reply, sounding like repeats.
      const previous = wsRef.current;
      if (previous) {
        previous.onopen = null;
        previous.onmessage = null;
        previous.onclose = null;
        previous.onerror = null;
        try { previous.close(1000); } catch { /* already closed */ }
        wsRef.current = null;
      }

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

      // Tell the server when the speaker is actually silent. Playback lags the
      // network by hundreds of milliseconds, so without this the server would
      // treat its own buffered voice as the user talking.
      const reportPlayback = (state: 'start' | 'end') => {
        const socket = wsRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'playback', state }));
        }
      };
      pcmPlayerRef.current.onPlaybackStart = () => reportPlayback('start');
      pcmPlayerRef.current.onPlaybackEnd = () => reportPlayback('end');

      ws.onopen = () => {
        if (!isComponentMounted.current) return;
        console.info('[Voice WS] Connected; requesting welcome audio');
        setErrorMessage(null);
        setTransport('websocket');
        setVoiceState('idle');
        pcmPlayerRef.current.init(24000);

        // 1. Send language configuration
        ws.send(JSON.stringify({ type: 'config', language: selectedLanguage }));

        // 2. Request initial welcome greeting directly over the WebSocket. A
        // reconnect must not replay the greeting.
        if (!greetedRef.current) {
          greetedRef.current = true;
          ws.send(JSON.stringify({ type: 'greeting', text: welcomeMessage }));
        }

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
          if (voiceStateRef.current !== 'speaking') {
            assistantSpeakingStartTimeRef.current = Date.now();
          }
          // State is announced by the backend ("speaking"); the client only
          // knows its own playback pipeline for mute/scheduling purposes.
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
                sessionIdRef.current = msg.session_id;
              }
              // Only reset reconnect attempts after the socket has remained stable for at least 3 seconds
              if (stableConnectionTimeoutRef.current) {
                clearTimeout(stableConnectionTimeoutRef.current);
              }
              stableConnectionTimeoutRef.current = window.setTimeout(() => {
                reconnectAttemptsRef.current = 0;
              }, 3000);
              break;

            case 'audio_config':
              pcmPlayerRef.current.init(msg.output_sample_rate || 24000);
              break;

            case 'duck_audio':
              pcmPlayerRef.current.setVolume(0.65);
              break;

            case 'unduck_audio':
              pcmPlayerRef.current.setVolume(1.0);
              break;

            case 'state': {
              // Backend is the single source of truth for agent state.
              if (typeof msg.state === 'string') {
                const next: VoiceState | null =
                  msg.state === 'thinking' || msg.state === 'processing' ? 'processing'
                    : msg.state === 'idle' ||
                      msg.state === 'listening' ||
                      msg.state === 'speaking'
                      ? msg.state
                      : null;
                if (next && next !== voiceStateRef.current) {
                  console.info('[Voice WS] State ->', next);
                  setVoiceState(next);
                }
              }
              break;
            }

            case 'speech_start':
              // Visual hint only; the authoritative "listening" state comes
              // from the server's state event.
              break;

            case 'interrupt':
              console.info('[Voice WS] Server confirmed barge-in; stopping local playback');
              stopLocalPlayback();
              break;

            case 'status':
              if (msg.message) {
                const currentId = currentAssistantMsgIdRef.current;
                if (!currentId) {
                  const newId = `ws-status-${Date.now()}`;
                  currentAssistantMsgIdRef.current = newId;
                  setTranscripts((prev) => [
                    ...prev,
                    {
                      id: newId,
                      role: 'assistant',
                      text: msg.message,
                      timestamp: 'Just now',
                    },
                  ]);
                } else {
                  setTranscripts((prev) =>
                    prev.map((item) =>
                      item.id === currentId ? { ...item, text: msg.message } : item
                    )
                  );
                }
              }
              break;

            case 'transcript':
              if (msg.role === 'user') {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                currentAssistantMsgIdRef.current = null;
                setTranscripts((prev) => [
                  ...prev,
                  {
                    id: `ws-user-${Date.now()}`,
                    role: 'user',
                    text: msg.text,
                    timestamp: 'Just now',
                  },
                ]);
              } else if (msg.role === 'assistant') {
                lastAssistantTextRef.current = msg.text;
                currentTurnAudioChunksRef.current = 0;

                const currentId = currentAssistantMsgIdRef.current;
                if (!currentId) {
                  const newId = `ws-bot-${Date.now()}`;
                  currentAssistantMsgIdRef.current = newId;
                  setTranscripts((prev) => [
                    ...prev,
                    {
                      id: newId,
                      role: 'assistant',
                      text: msg.text,
                      timestamp: 'Just now',
                      isInterrupted: msg.interrupted,
                    },
                  ]);
                } else {
                  setTranscripts((prev) =>
                    prev.map((item) =>
                      item.id === currentId
                        ? {
                            ...item,
                            text: msg.text,
                            isInterrupted: msg.interrupted ?? item.isInterrupted,
                          }
                        : item
                    )
                  );
                }

                if (onTurnComplete && !msg.partial) {
                  onTurnComplete('', msg.text);
                }

                if (!msg.partial) {
                  currentAssistantMsgIdRef.current = null;
                }
              }
              break;

            case 'end_call': {
              console.info('[Voice WS] Server ended call:', msg.reason);
              intentionalCloseRef.current = true;
              stopLocalPlayback();
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
                try { wsRef.current.close(1000, 'call_ended'); } catch {}
                wsRef.current = null;
              }
              setVoiceState('idle');
              setTransport('disconnected');
              setErrorMessage(null);
              setAudioLevel(0);
              const endNotice =
                msg.reason === 'inactivity'
                  ? '— Call disconnected due to inactivity —'
                  : '— Call ended —';
              setTranscripts((prev) => [
                ...prev,
                {
                  id: `call-ended-${Date.now()}`,
                  role: 'assistant',
                  text: endNotice,
                  timestamp: 'Just now',
                },
              ]);
              break;
            }

            case 'audio_start':
              pcmPlayerRef.current.init(msg.sample_rate || 24000);
              if (msg.turn_id) currentTurnIdRef.current = msg.turn_id;
              break;

            case 'turn_end':
              currentAssistantMsgIdRef.current = null;
              currentTurnIdRef.current = null;
              if (isComponentMounted.current) setAudioLevel(0);
              break;

            case 'tts_fallback':
              if (msg.text && !isMutedRef.current) {
                console.info('[Voice WS] Server TTS fallback: speaking via client speech synthesis');
                fallbackSpeechSynthesis(msg.text);
              }
              break;

            case 'error':
              if (
                (msg.code === 'tts_failed' || msg.code === 'tts_no_audio' || msg.code === 'greeting_tts_failed') &&
                lastAssistantTextRef.current
              ) {
                console.info('[Voice WS] Server TTS reported fallback trigger, speaking via speech synthesis');
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
          setErrorMessage('Could not connect to live voice server. Please check backend address and port.');
          setVoiceState('error');
        }
      };

      ws.onclose = (event) => {
        console.info('[Voice WS] Closed', { code: event.code, reason: event.reason });
        wsRef.current = null;
        if (stableConnectionTimeoutRef.current) {
          clearTimeout(stableConnectionTimeoutRef.current);
          stableConnectionTimeoutRef.current = null;
        }
        if (!isComponentMounted.current) return;
        setTransport('disconnected');

        // Expired guest session: start a fresh one instead of failing.
        if (event.code === 4408 && reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current += 1;
          console.info('[Voice WS] Session expired; opening a new guest session');
          setSessionId(null);
          sessionIdRef.current = null;
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isComponentMounted.current && !intentionalCloseRef.current) {
              connectWsRef.current?.(null);
            }
          }, 800);
          return;
        }

        // Normal closure (1000) or intentional hangup: do not show error
        if (event.code === 1000 || intentionalCloseRef.current) {
          setVoiceState('idle');
          setErrorMessage(null);
          return;
        }

        // Fatal non-retryable server error codes:
        // 1000 = normal, 1001 = going away, 1011 = server fatal exception (DB/Internal), 1013 = config missing
        const MAX_RETRIES = 3;
        const retryable = !intentionalCloseRef.current && ![1000, 1001, 1011, 1013].includes(event.code);
        if (retryable && reconnectAttemptsRef.current < MAX_RETRIES) {
          reconnectAttemptsRef.current += 1;
          const attempt = reconnectAttemptsRef.current;
          const delay = Math.round(1000 * Math.pow(1.5, attempt - 1));
          console.info(`[Voice WS] Reconnecting in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
          setVoiceState('connecting');
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isComponentMounted.current && !intentionalCloseRef.current) {
              connectWsRef.current?.(sessionIdRef.current);
            }
          }, delay);
          return;
        }

        const msgDetail =
          event.code === 1011
            ? 'Voice server encountered an internal error. Please check server logs and try again.'
            : event.code === 1013
            ? 'Voice agent configuration is missing or incomplete.'
            : `Voice WebSocket disconnected (${event.code})${event.reason ? `: ${event.reason}` : '. Check if backend is running.'}`;
        setErrorMessage(msgDetail);
        setVoiceState('error');
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLanguage, welcomeMessage, interrupt, stopLocalPlayback, onTurnComplete, chatbotId]
  );

  useEffect(() => {
    connectWsRef.current = connectWebSocket;
  }, [connectWebSocket]);

  // ---------------------------------------------------------------------------
  // Continuous 16kHz PCM streaming from browser mic to WebSocket
  // ---------------------------------------------------------------------------
  const startStreamingMicToWs = async (ws: WebSocket) => {
    try {
      let sentAudioChunks = 0;
      let sentAudioBytes = 0;
      // A reconnect reuses the microphone stream but must not keep the previous
      // processor (and its AudioContext) alive.
      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
        scriptNodeRef.current = null;
      }
      if (micAudioCtxRef.current && micAudioCtxRef.current.state !== 'closed') {
        micAudioCtxRef.current.close().catch(() => {});
        micAudioCtxRef.current = null;
      }
      let stream = streamRef.current;
      if (!stream || !stream.active || !stream.getAudioTracks().some((t) => t.readyState === 'live')) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Chrome-specific stronger AEC
            // @ts-ignore
            googEchoCancellation: true,
            // @ts-ignore
            googExperimentalEchoCancellation: true,
            // @ts-ignore
            googAutoGainControl: true,
            // @ts-ignore
            googNoiseSuppression: true,
            // @ts-ignore
            googHighpassFilter: true,
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

        // Measure audio level for the visualizer
        let sumSquares = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          const sample = inputChannelData[i];
          sumSquares += sample * sample;
        }
        const micRms = Math.sqrt(sumSquares / inputChannelData.length);
        const normalized = Math.min(100, Math.round(micRms * 380));
        if (isComponentMounted.current) {
          setAudioLevel(normalized);
        }

        // If user muted, don't send frames
        if (isMutedRef.current) return;

        // Downsample input rate to 16,000 Hz Mono signed 16-bit PCM
        const pcm16 = downsampleTo16k(inputChannelData, audioCtx.sampleRate);
        const pcmBuffer = pcm16.buffer as ArrayBuffer;

        // Stream microphone audio during playback too; server-side VAD uses
        // microphone levels and transcript echo filtering to detect barge-in.
        try {
          ws.send(pcmBuffer);
          sentAudioChunks += 1;
          sentAudioBytes += pcmBuffer.byteLength;
          if (sentAudioChunks === 1 || sentAudioChunks % 25 === 0) {
            console.info('[Voice WS] Sent microphone audio chunk', {
              chunks: sentAudioChunks,
              chunkBytes: pcmBuffer.byteLength,
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
            // Chrome-specific stronger AEC
            // @ts-ignore
            googEchoCancellation: true,
            // @ts-ignore
            googExperimentalEchoCancellation: true,
            // @ts-ignore
            googAutoGainControl: true,
            // @ts-ignore
            googNoiseSuppression: true,
            // @ts-ignore
            googHighpassFilter: true,
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
          // Chrome-specific stronger AEC
          // @ts-ignore
          googEchoCancellation: true,
          // @ts-ignore
          googExperimentalEchoCancellation: true,
          // @ts-ignore
          googAutoGainControl: true,
          // @ts-ignore
          googNoiseSuppression: true,
          // @ts-ignore
          googHighpassFilter: true,
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

  const endCall = useCallback(() => {
    intentionalCloseRef.current = true;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'end_call' }));
      } catch {}
    }
    cleanupAllAudio();
    setVoiceState('idle');
    setTransport('disconnected');
    setErrorMessage(null);
    setAudioLevel(0);
    setTranscripts((prev) => [
      ...prev,
      {
        id: `call-ended-${Date.now()}`,
        role: 'assistant',
        text: '— Call ended —',
        timestamp: 'Just now',
      },
    ]);
  }, [cleanupAllAudio]);

  const resetSession = useCallback(async () => {
    cleanupAllAudio();
    if (!preferWebSocket && sessionId) {
      try {
        await voiceApi.endSession(sessionId);
      } catch {}
    }
    autoInitDoneRef.current = false;
    greetedRef.current = false;
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
    endCall,
  };
};

export default useVoiceAgent;
