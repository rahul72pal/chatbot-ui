/**
 * YourChatbot Embeddable Widget Script with Integrated Voice Agent
 * Lightweight vanilla JS widget for embedding text chat & AI voice agent on any website.
 */
(function () {
  'use strict';

  if (window.YourChatbotWidgetInitialized) return;
  window.YourChatbotWidgetInitialized = true;

  // ---------------------------------------------------------------------------
  // 1. Script & Environment Configuration
  // ---------------------------------------------------------------------------
  function getScriptConfig() {
    var scripts = document.getElementsByTagName('script');
    var currentScript = document.currentScript;

    if (!currentScript) {
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].getAttribute('data-chatbot-id') || scripts[i].getAttribute('data-bot-id')) {
          currentScript = scripts[i];
          break;
        }
      }
      if (!currentScript) currentScript = scripts[scripts.length - 1];
    }

    var botId = currentScript ? (currentScript.getAttribute('data-chatbot-id') || currentScript.getAttribute('data-bot-id')) : 'test-bot';
    if (!botId) botId = 'test-bot';

    var apiBase = 'http://localhost:8000';
    if (currentScript && currentScript.src && currentScript.src.indexOf('http') === 0) {
      try {
        var urlObj = new URL(currentScript.src);
        apiBase = urlObj.origin;
      } catch (e) {}
    }

    return {
      botId: botId,
      apiBase: apiBase,
      defaults: {
        name: 'Support Assistant',
        welcome_message: 'Hi! How can I help you today?',
        theme_color: '#4f46e5',
        avatar_icon: 'support',
        position: 'right',
        bubble_style: 'rounded',
        open_automatically: false,
        pop_after_seconds: 3,
        show_welcome_tooltip: true
      }
    };
  }

  // ---------------------------------------------------------------------------
  // 2. SVG Icon Templates
  // ---------------------------------------------------------------------------
  var Icons = {
    avatar: function (type) {
      if (type === 'faq') {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      }
      if (type === 'sales') {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
      }
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
    },
    message: function () {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    },
    mic: function () {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
    },
    square: function () {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
    },
    close: function () {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    },
    refresh: function () {
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
    },
    send: function () {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Markdown Formatting Engine
  // ---------------------------------------------------------------------------
  function renderMarkdown(text) {
    if (!text) return '';
    var html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.*$)/gim, '<h3 style="font-weight:700;font-size:14px;margin:8px 0 4px 0;color:#0f172a;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-weight:700;font-size:15px;margin:10px 0 4px 0;color:#0f172a;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-weight:700;font-size:16px;margin:12px 0 6px 0;color:#0f172a;">$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:#0f172a;">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong style="font-weight:700;color:#0f172a;">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(15,23,42,0.06);padding:2px 5px;border-radius:4px;font-family:monospace;font-size:12px;color:#334155;">$1</code>');
    html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<div style="margin-left:14px;position:relative;padding-left:10px;margin-bottom:3px;"><span style="position:absolute;left:0;">•</span>$1</div>');
    html = html.replace(/\n\n/g, '<div style="margin-bottom:8px;"></div>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  // ---------------------------------------------------------------------------
  // 4. UI Builders
  // ---------------------------------------------------------------------------
  function buildTooltipHtml(config) {
    if (!config.show_welcome_tooltip) return '';
    var posLeft = config.position === 'left';
    return '<div id="ycb-tooltip" style="position: absolute; bottom: 76px; ' + (posLeft ? 'left: 0;' : 'right: 0;') + ' background: #091121; color: #F3F6FF; padding: 10px 14px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); font-size: 13px; font-weight: 500; white-space: nowrap; border: 1px solid #1C2C4B; pointer-events: none; opacity: 1; transition: opacity 0.2s;">' +
      config.welcome_message +
      '<div style="position: absolute; bottom: -6px; ' + (posLeft ? 'left: 20px;' : 'right: 20px;') + ' width: 10px; height: 10px; background: #091121; border-right: 1px solid #1C2C4B; border-bottom: 1px solid #1C2C4B; transform: rotate(45deg);"></div>' +
      '</div>';
  }

  function buildLauncherHtml(config) {
    var borderRadius = '16px';
    if (config.bubble_style === 'pill') borderRadius = '50%';
    if (config.bubble_style === 'square') borderRadius = '6px';

    return '<div id="ycb-launcher-group" style="display: flex; align-items: center; gap: 10px;">' +
      '<button id="ycb-voice-launcher" style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #9333ea, #06b6d4); color: #ffffff; border: 1px solid rgba(255,255,255,0.25); outline: none; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" title="Open Voice Agent">' +
        Icons.mic() +
      '</button>' +
      '<button id="ycb-launcher" style="width: 56px; height: 56px; border-radius: ' + borderRadius + '; background-color: ' + config.theme_color + '; color: #ffffff; border: none; outline: none; cursor: pointer; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" title="Open Chat">' +
        Icons.message() +
      '</button>' +
    '</div>';
  }

  function buildChatWindowHtml(config) {
    var posLeft = config.position === 'left';
    return '<div id="ycb-window" style="display: none; width: 375px; height: 530px; max-width: calc(100vw - 32px); max-height: calc(100vh - 90px); background: #080E1B; color: #F3F6FF; border-radius: 20px; box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.5); border: 1px solid #1C2C4B; overflow: hidden; flex-direction: column; position: absolute; bottom: 0; ' + (posLeft ? 'left: 0;' : 'right: 0;') + ' z-index: 10;">' +
      // Header
      '<div style="background-color: #091121; color: #F3F6FF; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1C2C4B; flex-shrink: 0;">' +
        '<div style="display: flex; align-items: center; gap: 10px;">' +
          '<div style="width: 36px; height: 36px; border-radius: 10px; background-color: ' + config.theme_color + '; color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">' +
            Icons.avatar(config.avatar_icon) +
          '</div>' +
          '<div>' +
            '<div style="font-weight: 700; font-size: 14px; color: #F3F6FF; line-height: 1.2;">' + config.name + '</div>' +
            '<div id="ycb-header-sub" style="font-size: 10px; color: #71829F; margin-top: 2px;">AI Assistant Online</div>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 6px;">' +
          '<button id="ycb-toggle-mode" title="Switch Mode" style="background: #101D39; border: 1px solid #1C2C4B; color: #C7D2FE; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">' +
            '<span id="ycb-mode-btn-text">Voice</span>' +
          '</button>' +
          '<button id="ycb-refresh" title="Reset chat" style="background: transparent; border: none; color: #71829F; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">' +
            Icons.refresh() +
          '</button>' +
          '<button id="ycb-close" title="Close" style="background: transparent; border: none; color: #71829F; cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">' +
            Icons.close() +
          '</button>' +
        '</div>' +
      '</div>' +

      // Text Chat View
      '<div id="ycb-chat-view" style="display: flex; flex-direction: column; flex: 1; min-height: 0;">' +
        '<div id="ycb-messages" style="flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background-color: #080E1B;"></div>' +
        '<div style="padding: 10px 12px 6px 12px; background: #091121; border-top: 1px solid #1C2C4B; flex-shrink: 0;">' +
          '<form id="ycb-form" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">' +
            '<input id="ycb-input" type="text" placeholder="Type a message or tap mic..." style="flex: 1; border: 1px solid #1C2C4B; border-radius: 10px; padding: 9px 12px; font-size: 13px; outline: none; background: #101D39; color: #F3F6FF;" />' +
            '<button type="button" id="ycb-mic-trigger" style="width: 36px; height: 36px; border-radius: 10px; background: #142342; border: 1px solid #243653; color: #22D3EE; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Voice Mode">' +
              Icons.mic() +
            '</button>' +
            '<button type="submit" id="ycb-send" style="width: 36px; height: 36px; border-radius: 10px; background-color: ' + config.theme_color + '; color: #ffffff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">' +
              Icons.send() +
            '</button>' +
          '</form>' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #71829F; padding: 0 2px;">' +
            '<span>Shift + Enter for new line</span>' +
            '<span style="font-weight: 500; color: #818CF8;">Powered by yourchatbot</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // Voice Agent View
      '<div id="ycb-voice-view" style="display: none; flex-direction: column; flex: 1; min-height: 0; background: radial-gradient(circle at center, #101D39 0%, #080E1B 80%); padding: 20px; align-items: center; justify-content: space-between;">' +
        '<div style="text-align: center; margin-top: 10px;">' +
          '<div id="ycb-voice-status-title" style="font-size: 16px; font-weight: 700; color: #F3F6FF;">Tap to Speak</div>' +
          '<div id="ycb-voice-status-sub" style="font-size: 12px; color: #71829F; margin-top: 4px;">Speak clearly into your microphone</div>' +
        '</div>' +

        // Animated Voice Orb Visualizer
        '<div style="position: relative; display: flex; align-items: center; justify-content: center; margin: 24px 0;">' +
          '<div id="ycb-orb-ring" style="position: absolute; width: 140px; height: 140px; border-radius: 50%; border: 1px solid rgba(99, 102, 241, 0.3); transition: transform 0.15s ease;"></div>' +
          '<button id="ycb-voice-mic-btn" style="width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, ' + config.theme_color + ', #9333ea); border: none; color: #ffffff; outline: none; cursor: pointer; box-shadow: 0 0 30px ' + config.theme_color + '80; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, background 0.3s;">' +
            Icons.mic() +
          '</button>' +
        '</div>' +

        // Spoken Transcript Box
        '<div style="width: 100%; max-height: 110px; background: rgba(9, 17, 33, 0.8); border: 1px solid #1C2C4B; border-radius: 12px; padding: 10px 14px; overflow-y: auto;">' +
          '<div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #71829F; margin-bottom: 4px;">Latest Speech</div>' +
          '<div id="ycb-voice-transcript" style="font-size: 12px; color: #F3F6FF; line-height: 1.4;">Waiting for your question...</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ---------------------------------------------------------------------------
  // 5. Main Widget Application Controller
  // ---------------------------------------------------------------------------
  function initializeWidgetApp() {
    var envConfig = getScriptConfig();
    var botId = envConfig.botId;
    var apiBase = envConfig.apiBase;
    var config = envConfig.defaults;

    var isOpen = false;
    var currentMode = 'chat'; // 'chat' or 'voice'
    var activeConversationId = null;
    var voiceSessionId = null;
    var isRecording = false;
    var mediaRecorder = null;
    var audioChunks = [];
    var currentAudio = null;

    var rootContainer = document.createElement('div');
    rootContainer.id = 'yourchatbot-widget-root';
    rootContainer.style.position = 'fixed';
    rootContainer.style.bottom = '24px';
    rootContainer.style.zIndex = '999999';
    rootContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

    function renderUI() {
      rootContainer.style.left = config.position === 'left' ? '24px' : 'auto';
      rootContainer.style.right = config.position === 'right' ? '24px' : 'auto';
      rootContainer.innerHTML = buildTooltipHtml(config) + buildLauncherHtml(config) + buildChatWindowHtml(config);
      document.body.appendChild(rootContainer);

      bindEvents();
      resetMessages();
    }

    var launcherGroup, launcherBtn, voiceLauncherBtn, windowEl, closeBtn, refreshBtn, toggleModeBtn, modeBtnText;
    var formEl, inputEl, micTriggerBtn, messagesEl, tooltipEl, headerSub;
    var chatView, voiceView, voiceMicBtn, orbRing, voiceStatusTitle, voiceStatusSub, voiceTranscript;

    function bindEvents() {
      launcherGroup = document.getElementById('ycb-launcher-group');
      launcherBtn = document.getElementById('ycb-launcher');
      voiceLauncherBtn = document.getElementById('ycb-voice-launcher');
      windowEl = document.getElementById('ycb-window');
      closeBtn = document.getElementById('ycb-close');
      refreshBtn = document.getElementById('ycb-refresh');
      toggleModeBtn = document.getElementById('ycb-toggle-mode');
      modeBtnText = document.getElementById('ycb-mode-btn-text');
      headerSub = document.getElementById('ycb-header-sub');

      formEl = document.getElementById('ycb-form');
      inputEl = document.getElementById('ycb-input');
      micTriggerBtn = document.getElementById('ycb-mic-trigger');
      messagesEl = document.getElementById('ycb-messages');
      tooltipEl = document.getElementById('ycb-tooltip');

      chatView = document.getElementById('ycb-chat-view');
      voiceView = document.getElementById('ycb-voice-view');
      voiceMicBtn = document.getElementById('ycb-voice-mic-btn');
      orbRing = document.getElementById('ycb-orb-ring');
      voiceStatusTitle = document.getElementById('ycb-voice-status-title');
      voiceStatusSub = document.getElementById('ycb-voice-status-sub');
      voiceTranscript = document.getElementById('ycb-voice-transcript');

      launcherBtn.addEventListener('click', function () { openWidget('chat'); });
      voiceLauncherBtn.addEventListener('click', function () { openWidget('voice'); });
      closeBtn.addEventListener('click', function () { closeWidget(); });
      refreshBtn.addEventListener('click', function () { resetMessages(); });
      toggleModeBtn.addEventListener('click', function () {
        setWidgetMode(currentMode === 'chat' ? 'voice' : 'chat');
      });
      micTriggerBtn.addEventListener('click', function () { setWidgetMode('voice'); });
      formEl.addEventListener('submit', handleMessageSubmit);
      voiceMicBtn.addEventListener('click', handleVoiceMicClick);

      if (config.open_automatically) {
        var delay = (config.pop_after_seconds || 3) * 1000;
        setTimeout(function () {
          if (!isOpen) openWidget('chat');
        }, delay);
      }
    }

    function openWidget(mode) {
      isOpen = true;
      windowEl.style.display = 'flex';
      launcherGroup.style.display = 'none';
      if (tooltipEl) tooltipEl.style.display = 'none';
      setWidgetMode(mode || 'chat');
    }

    function closeWidget() {
      isOpen = false;
      stopAudioPlayback();
      stopVoiceStreaming();
      if (voiceWs) {
        try { voiceWs.close(); } catch (e) {}
        voiceWs = null;
      }
      if (isRecording) stopVoiceRecording();
      windowEl.style.display = 'none';
      launcherGroup.style.display = 'flex';
      if (tooltipEl && config.show_welcome_tooltip) tooltipEl.style.display = 'block';
    }

    var voiceWs = null;
    var micStream = null;
    var micAudioCtx = null;
    var micProcessor = null;
    var assistantSpeakingStartTime = 0;

    function downsampleTo16k(input, inputSampleRate) {
      if (inputSampleRate === 16000) {
        var out = new Int16Array(input.length);
        for (var i = 0; i < input.length; i++) {
          var s = Math.max(-1, Math.min(1, input[i]));
          out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return out;
      }
      var ratio = inputSampleRate / 16000;
      var newLength = Math.round(input.length / ratio);
      var out = new Int16Array(newLength);
      for (var j = 0; j < newLength; j++) {
        var originalIdx = j * ratio;
        var leftIdx = Math.floor(originalIdx);
        var rightIdx = Math.min(leftIdx + 1, input.length - 1);
        var weight = originalIdx - leftIdx;
        var sample = input[leftIdx] * (1 - weight) + input[rightIdx] * weight;
        var s2 = Math.max(-1, Math.min(1, sample));
        out[j] = s2 < 0 ? s2 * 0x8000 : s2 * 0x7fff;
      }
      return out;
    }

    function startVoiceStreaming(ws) {
      stopVoiceStreaming();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Microphone recording is not supported in this browser.');
        return;
      }
      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      .then(function (stream) {
        micStream = stream;
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        micAudioCtx = new AudioCtx();
        if (micAudioCtx.state === 'suspended') {
          micAudioCtx.resume().catch(function () {});
        }
        var source = micAudioCtx.createMediaStreamSource(stream);
        var processor = micAudioCtx.createScriptProcessor(4096, 1, 1);
        micProcessor = processor;

        processor.onaudioprocess = function (e) {
          if (!ws || ws.readyState !== WebSocket.OPEN) return;
          var channelData = e.inputBuffer.getChannelData(0);
          var sum = 0;
          for (var i = 0; i < channelData.length; i++) {
            sum += Math.abs(channelData[i]);
          }
          var avg = sum / channelData.length;
          var norm = Math.min(100, Math.round(avg * 350));
          if (norm > 15 && orbRing) {
            orbRing.style.transform = 'scale(' + (1 + norm / 200) + ')';
          }

          var isSpeaking = (window.speechSynthesis && window.speechSynthesis.speaking) || (pcmPlayer.ctx && pcmPlayer.nextTime > pcmPlayer.ctx.currentTime);
          if (isSpeaking) {
            var elapsed = Date.now() - assistantSpeakingStartTime;
            if (elapsed < 1200 || avg < 0.025) return;
          }

          var pcm16 = downsampleTo16k(channelData, micAudioCtx.sampleRate);
          try {
            ws.send(pcm16.buffer);
          } catch (err) {
            console.error('[Voice WS] Mic send error:', err);
          }
        };

        source.connect(processor);
        var muteGain = micAudioCtx.createGain();
        muteGain.gain.value = 0;
        processor.connect(muteGain);
        muteGain.connect(micAudioCtx.destination);
      })
      .catch(function (err) {
        console.warn('[Voice WS] Microphone permission note:', err);
        voiceTranscript.innerHTML = '<span style="color:#fb7185;">Please allow microphone permissions to speak.</span>';
      });
    }

    function stopVoiceStreaming() {
      if (micProcessor) {
        try { micProcessor.disconnect(); } catch (e) {}
        micProcessor = null;
      }
      if (micAudioCtx) {
        try { micAudioCtx.close(); } catch (e) {}
        micAudioCtx = null;
      }
      if (micStream) {
        try { micStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        micStream = null;
      }
    }

    function setWidgetMode(mode) {
      currentMode = mode;
      if (currentMode === 'voice') {
        chatView.style.display = 'none';
        voiceView.style.display = 'flex';
        modeBtnText.innerText = 'Chat';
        headerSub.innerText = 'Voice Agent (WebSocket)';
        initVoiceAgentWs();
      } else {
        voiceView.style.display = 'none';
        chatView.style.display = 'flex';
        modeBtnText.innerText = 'Voice';
        headerSub.innerText = 'AI Assistant Online';
        stopAudioPlayback();
        stopVoiceStreaming();
        if (voiceWs) {
          try { voiceWs.close(); } catch(e){}
          voiceWs = null;
        }
        inputEl.focus();
      }
    }

    var pcmPlayer = {
      ctx: null,
      nextTime: 0,
      init: function () {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!this.ctx || this.ctx.state === 'closed') this.ctx = new AC();
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(function () {});
        this.nextTime = this.ctx.currentTime;
      },
      play: function (buffer) {
        this.init();
        var ctx = this.ctx;
        var int16 = new Int16Array(buffer);
        if (int16.length === 0) return;
        var f32 = new Float32Array(int16.length);
        for (var i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768;
        var audioBuf = ctx.createBuffer(1, f32.length, 24000);
        audioBuf.getChannelData(0).set(f32);
        var src = ctx.createBufferSource();
        src.buffer = audioBuf;
        src.connect(ctx.destination);
        var now = ctx.currentTime;
        var start = Math.max(now, this.nextTime);
        src.start(start);
        this.nextTime = start + audioBuf.duration;
      },
      stop: function () {
        if (this.ctx && this.ctx.state !== 'closed') {
          this.nextTime = this.ctx.currentTime;
        }
      }
    };

    function initVoiceAgentWs() {
      var wsProto = apiBase.indexOf('https') === 0 ? 'wss' : 'ws';
      var wsHost = apiBase.replace(/^https?:\/\//, '');
      var wsUrl = wsProto + '://' + wsHost + '/ws/voice';

      try {
        if (voiceWs) {
          try { voiceWs.close(); } catch(e){}
        }
        voiceWs = new WebSocket(wsUrl);
        voiceWs.binaryType = 'arraybuffer';
        voiceWs.onopen = function () {
          console.info('[Voice WS] Connected; streaming mic');
          voiceWs.send(JSON.stringify({ type: 'config', language: 'en' }));
          var welcome = config.welcome_message || 'Hello! How can I help you today?';
          voiceWs.send(JSON.stringify({ type: 'greeting', text: welcome }));
          speakFallback(welcome);
          startVoiceStreaming(voiceWs);
        };
        voiceWs.onmessage = function (ev) {
          if (ev.data instanceof ArrayBuffer) {
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
              window.speechSynthesis.cancel();
            }
            updateVoiceUI('speaking');
            pcmPlayer.play(ev.data);
            return;
          }
          if (typeof ev.data === 'string') {
            try {
              var m = JSON.parse(ev.data);
              if (m.type === 'session_created') {
                voiceSessionId = m.session_id;
              } else if (m.type === 'speech_start') {
                var isSpk = (window.speechSynthesis && window.speechSynthesis.speaking) || (pcmPlayer.ctx && pcmPlayer.nextTime > pcmPlayer.ctx.currentTime);
                if (!isSpk) {
                  updateVoiceUI('listening');
                }
              } else if (m.type === 'tts_fallback') {
                if (m.text) {
                  speakFallback(m.text);
                }
              } else if (m.type === 'transcript') {
                if (m.role === 'user') {
                  voiceTranscript.innerHTML = '<strong>You:</strong> ' + m.text;
                  updateVoiceUI('processing');
                } else {
                  voiceTranscript.innerHTML += '<br/><strong>Agent:</strong> ' + m.text;
                  appendMessage('assistant', m.text);
                  // Play via speech synthesis if binary PCM stream didn't arrive
                  setTimeout(function () {
                    if (!pcmPlayer.ctx || pcmPlayer.nextTime <= pcmPlayer.ctx.currentTime) {
                      speakFallback(m.text);
                    }
                  }, 250);
                }
              } else if (m.type === 'interrupt') {
                stopAudioPlayback();
                updateVoiceUI('listening');
              } else if (m.type === 'turn_end') {
                if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
                  updateVoiceUI('idle');
                }
              }
            } catch (e) {}
          }
        };
        voiceWs.onerror = function (e) {
          console.warn('[Voice WS] Error:', e);
        };
        voiceWs.onclose = function () {
          stopVoiceStreaming();
        };
      } catch (e) {
        console.warn('WebSocket init note:', e);
      }
    }

    function handleVoiceMicClick() {
      if (micAudioCtx && micAudioCtx.state === 'suspended') {
        micAudioCtx.resume().catch(function () {});
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        stopAudioPlayback();
        if (voiceWs && voiceWs.readyState === WebSocket.OPEN) {
          try { voiceWs.send(JSON.stringify({ type: 'interrupt' })); } catch (e) {}
        }
        updateVoiceUI('listening');
        return;
      }
      if (!voiceWs || voiceWs.readyState !== WebSocket.OPEN) {
        initVoiceAgentWs();
      } else {
        if (!micProcessor) {
          startVoiceStreaming(voiceWs);
        }
        updateVoiceUI('listening');
      }
    }

    function startVoiceRecording() {
      stopAudioPlayback();
      ensureVoiceSession(function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Microphone recording is not supported in this browser.');
          return;
        }

        navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
          .then(function (stream) {
            audioChunks = [];
            var mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
            mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);

            mediaRecorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = function () {
              stream.getTracks().forEach(function (t) { t.stop(); });
              isRecording = false;
              updateVoiceUI('processing');

              var blob = new Blob(audioChunks, { type: mime || 'audio/webm' });
              sendVoiceTurn(blob);
            };

            mediaRecorder.start();
            isRecording = true;
            updateVoiceUI('listening');
          })
          .catch(function (err) {
            alert('Please allow microphone permissions to talk with the voice agent.');
          });
      });
    }

    function stopVoiceRecording() {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }

    function sendVoiceTurn(audioBlob) {
      var formData = new FormData();
      formData.append('audio', audioBlob, 'turn.webm');
      formData.append('session_id', voiceSessionId);
      formData.append('language', 'en');

      fetch(apiBase + '/api/v1/voice/turn', {
        method: 'POST',
        body: formData
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'repeat') {
          voiceTranscript.innerHTML = '<em>' + (data.message || 'Could not understand audio. Please speak clearly.') + '</em>';
          updateVoiceUI('idle');
          return;
        }

        var userText = data.transcript || '(voice input)';
        var replyText = data.reply || 'No response';
        voiceTranscript.innerHTML = '<strong>You:</strong> ' + userText + '<br/><strong>Agent:</strong> ' + replyText;

        // Also add to text chat messages
        appendMessage('user', userText);
        appendMessage('assistant', replyText);

        if (data.audio_b64) {
          playAudioBase64(data.audio_b64, replyText);
        } else {
          speakFallback(replyText);
        }
      })
      .catch(function () {
        voiceTranscript.innerHTML = '<span style="color:#fb7185;">Voice turn failed. Please tap mic and try again.</span>';
        updateVoiceUI('idle');
      });
    }

    function playAudioBase64(b64, textFallback) {
      stopAudioPlayback();
      try {
        currentAudio = new Audio('data:audio/wav;base64,' + b64);
        updateVoiceUI('speaking');
        currentAudio.onended = function () {
          updateVoiceUI('idle');
          currentAudio = null;
        };
        currentAudio.onerror = function () {
          speakFallback(textFallback);
        };
        currentAudio.play().catch(function () {
          speakFallback(textFallback);
        });
      } catch (e) {
        speakFallback(textFallback);
      }
    }

    function speakFallback(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        assistantSpeakingStartTime = Date.now();
        var u = new SpeechSynthesisUtterance(text);
        updateVoiceUI('speaking');
        u.onend = function () { updateVoiceUI('idle'); };
        u.onerror = function () { updateVoiceUI('idle'); };
        window.speechSynthesis.speak(u);
      } else {
        updateVoiceUI('idle');
      }
    }

    function stopAudioPlayback() {
      if (pcmPlayer) {
        pcmPlayer.stop();
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      updateVoiceUI('idle');
    }

    function updateVoiceUI(state) {
      if (state === 'listening') {
        voiceStatusTitle.innerText = 'Listening...';
        voiceStatusSub.innerText = 'Tap button when done speaking';
        voiceMicBtn.style.background = '#EF4444';
        voiceMicBtn.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.6)';
        orbRing.style.transform = 'scale(1.2)';
        orbRing.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      } else if (state === 'processing') {
        voiceStatusTitle.innerText = 'Processing...';
        voiceStatusSub.innerText = 'Transcribing and thinking...';
        voiceMicBtn.style.background = '#8B5CF6';
        voiceMicBtn.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.6)';
      } else if (state === 'speaking') {
        voiceStatusTitle.innerText = 'Speaking...';
        voiceStatusSub.innerText = 'Tap to interrupt speech';
        voiceMicBtn.style.background = '#10B981';
        voiceMicBtn.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.6)';
        orbRing.style.transform = 'scale(1.15)';
        orbRing.style.borderColor = 'rgba(16, 214, 160, 0.5)';
      } else {
        voiceStatusTitle.innerText = 'Tap to Speak';
        voiceStatusSub.innerText = 'Speak clearly into your microphone';
        voiceMicBtn.style.background = 'linear-gradient(135deg, ' + config.theme_color + ', #9333ea)';
        voiceMicBtn.style.boxShadow = '0 0 30px ' + config.theme_color + '80';
        orbRing.style.transform = 'scale(1)';
        orbRing.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      }
    }

    function resetMessages() {
      if (!messagesEl) return;
      messagesEl.innerHTML = '';
      activeConversationId = null;
      voiceSessionId = null;
      stopAudioPlayback();
      appendMessage('assistant', config.welcome_message);
    }

    function appendMessage(role, text) {
      var isUser = role === 'user';
      var msgWrap = document.createElement('div');
      msgWrap.style.display = 'flex';
      msgWrap.style.flexDirection = 'column';
      msgWrap.style.alignItems = isUser ? 'flex-end' : 'flex-start';
      msgWrap.style.marginBottom = '4px';

      var bubble = document.createElement('div');
      bubble.style.maxWidth = '85%';
      bubble.style.padding = '10px 14px';
      bubble.style.fontSize = '13px';
      bubble.style.lineHeight = '1.5';

      if (config.bubble_style === 'pill') {
        bubble.style.borderRadius = isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
      } else if (config.bubble_style === 'square') {
        bubble.style.borderRadius = '4px';
      } else {
        bubble.style.borderRadius = isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px';
      }

      bubble.style.backgroundColor = isUser ? config.theme_color : '#101D39';
      bubble.style.color = isUser ? '#ffffff' : '#F3F6FF';
      bubble.style.border = isUser ? 'none' : '1px solid #1C2C4B';
      bubble.style.wordBreak = 'break-word';

      if (isUser) {
        bubble.style.whiteSpace = 'pre-wrap';
        bubble.innerText = text;
      } else {
        bubble.innerHTML = renderMarkdown(text);
      }

      var timeStamp = document.createElement('span');
      timeStamp.style.fontSize = '10px';
      timeStamp.style.color = '#71829F';
      timeStamp.style.marginTop = '4px';
      timeStamp.style.padding = '0 2px';
      timeStamp.innerText = 'Just now';

      msgWrap.appendChild(bubble);
      msgWrap.appendChild(timeStamp);
      messagesEl.appendChild(msgWrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function handleMessageSubmit(e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text) return;

      inputEl.value = '';
      appendMessage('user', text);

      fetch(apiBase + '/chatbot/public/' + botId + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: activeConversationId })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.conversation_id) activeConversationId = data.conversation_id;
        appendMessage('assistant', data.message || "Thank you for reaching out! How else can I assist you today?");
      })
      .catch(function () {
        appendMessage('assistant', "Could not reach assistant. Please try again.");
      });
    }

    // Fetch Chatbot Configuration
    fetch(apiBase + '/chatbot/public/' + botId)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data) {
          config.name = data.name || config.name;
          config.welcome_message = data.welcome_message || data.description || config.welcome_message;
          config.theme_color = data.theme_color || config.theme_color;
          config.avatar_icon = data.avatar_icon || config.avatar_icon;
          config.position = data.position || config.position;
          config.bubble_style = data.bubble_style || config.bubble_style;
          config.open_automatically = data.open_automatically !== undefined ? data.open_automatically : config.open_automatically;
          config.pop_after_seconds = data.pop_after_seconds || config.pop_after_seconds;
          config.show_welcome_tooltip = data.show_welcome_tooltip !== undefined ? data.show_welcome_tooltip : config.show_welcome_tooltip;
        }
        renderUI();
      })
      .catch(function () {
        renderUI();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgetApp);
  } else {
    initializeWidgetApp();
  }
})();
