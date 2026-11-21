import { BASE_URL } from '../utils/apiClient';

export interface VoiceSessionCreated {
  session_id: string;
  language: string | null;
  expires_in_hours: number;
}

export interface VoiceSessionMeta {
  session_id: string;
  language: string | null;
  created_at: string;
  expires_at: string;
  turns: number;
}

export interface VoiceTurnResponse {
  session_id: string;
  transcript: string;
  reply: string;
  audio_b64: string | null;
  audio_mime_type?: string | null;
  timings_ms?: {
    stt: number;
    llm: number;
    tts: number;
  };
  status?: string;
  reason?: string;
  message?: string;
}

export const voiceApi = {
  createSession: async (language: string = 'en'): Promise<VoiceSessionCreated> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/api/v1/voice/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ language }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Failed to initialize voice session');
    }
    return res.json();
  },

  sendTurn: async (
    audioBlob: Blob,
    sessionId: string,
    language?: string,
    durationMs?: number
  ): Promise<VoiceTurnResponse> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    const mime = audioBlob.type || 'audio/webm';
    const ext = mime.includes('wav') ? 'wav' : mime.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', audioBlob, `turn-recording.${ext}`);
    formData.append('session_id', sessionId);
    if (language) {
      formData.append('language', language);
    }
    if (durationMs !== undefined && durationMs > 0) {
      formData.append('duration_ms', String(Math.round(durationMs)));
    }

    const res = await fetch(`${BASE_URL}/api/v1/voice/turn`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Voice turn request failed');
    }
    return res.json();
  },

  getSession: async (sessionId: string): Promise<VoiceSessionMeta> => {
    const res = await fetch(`${BASE_URL}/api/v1/voice/session/${sessionId}`);
    if (!res.ok) {
      throw new Error('Voice session not found');
    }
    return res.json();
  },

  endSession: async (sessionId: string): Promise<{ status: string; session_id: string }> => {
    const res = await fetch(`${BASE_URL}/api/v1/voice/session/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to end voice session');
    }
    return res.json();
  },

  /**
   * Request a TTS-only synthesis for welcome/greeting messages.
   * Returns { audio_b64, mime } or { fallback: true, text } if TTS is unavailable.
   */
  speak: async (
    sessionId: string,
    text: string
  ): Promise<{ session_id: string; audio_b64: string | null; mime: string | null; fallback?: boolean; text?: string }> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/v1/voice/speak`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: sessionId, text }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'TTS speak request failed');
    }
    return res.json();
  },

  /**
   * Build the WebSocket URL for live real-time bidirectional voice streaming.
   * If sessionId is omitted, the WebSocket creates an anonymous guest session automatically.
   */
  getWsUrl: (sessionId?: string | null, chatbotId?: string | null): string => {
    let wsHost = 'localhost:8000';
    let isSecure = false;
    try {
      const base = (typeof window !== 'undefined' && BASE_URL.startsWith('/'))
        ? `${window.location.origin}${BASE_URL}`
        : BASE_URL;
      const parsed = new URL(base);
      isSecure = parsed.protocol === 'https:';
      wsHost = parsed.host;
    } catch {
      isSecure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : BASE_URL.startsWith('https://');
      wsHost = (typeof window !== 'undefined' && window.location.host)
        ? window.location.host
        : (BASE_URL.replace(/^https?:\/\//, '').split('/')[0] || 'localhost:8000');
    }

    const params = new URLSearchParams();
    params.set('engine', 'pipecat');
    if (sessionId) params.set('session_id', sessionId);
    if (chatbotId) params.set('chatbot_id', chatbotId);
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : '';
    return `${isSecure ? 'wss' : 'ws'}://${wsHost}/ws/voice${query}`;
  },
};

export default voiceApi;

