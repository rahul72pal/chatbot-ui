import React from 'react';
import './VoiceOrb.css';

export type OrbState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error';

export interface VoiceOrbProps {
  /** Current voice agent state — drives size breathing (colors are always blue/white) */
  state: OrbState;
  /** Live audio level 0-100 — adds reactive pulsing on top of state breathing */
  audioLevel?: number;
  /** Base diameter of the orb in px */
  size?: number;
  onClick?: () => void;
  children?: React.ReactNode;
}

/**
 * Fixed liquid palette for every state — saturated blue body flowing
 * into a near-white top, like the reference sphere.
 */
const ORB_COLOR_MAIN = '#0A84FF';
const ORB_COLOR_LIGHT = '#F4FBFF';

/**
 * VoiceOrb — liquid-flow sphere.
 *
 * The entire circle is a soft blurred liquid surface: a near-white tint and a
 * saturated blue tint continuously drift into each other, while the whole orb
 * gently increases/decreases in size depending on the agent state
 * (listening / speaking / thinking) plus the live audio level.
 */
export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  audioLevel = 0,
  size = 150,
  onClick,
  children,
}) => {
  // Audio level adds a reactive scale on top of the state-driven breathing.
  const reactiveScale =
    1 + (Math.max(0, Math.min(100, audioLevel)) / 100) * (state === 'speaking' ? 0.3 : 0.18);

  return (
    <div
      className="voice-orb-wrap"
      style={
        {
          '--orb-size': `${size}px`,
          '--orb-reactive': reactiveScale,
          '--orb-color-main': ORB_COLOR_MAIN,
          '--orb-color-light': ORB_COLOR_LIGHT,
        } as React.CSSProperties
      }
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="voice-orb" data-state={state}>
        {/* Soft ambient glow behind the sphere */}
        <div className="voice-orb__glow" />
        {/* Clipped liquid surface with drifting color blobs */}
        <div className="voice-orb__surface">
          <div className="voice-orb__blob voice-orb__blob--main" />
          <div className="voice-orb__blob voice-orb__blob--swirl" />
          <div className="voice-orb__blob voice-orb__blob--light" />
          <div className="voice-orb__sheen" />
        </div>
        {/* Static content (icon) — no separate animation, the orb IS the animation */}
        <div className="voice-orb__content">{children}</div>
      </div>
    </div>
  );
};

export default VoiceOrb;
