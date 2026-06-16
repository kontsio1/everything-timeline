import React, { useEffect, useRef } from 'react';
import { timelineHeight } from '../Constants/GlobalConfigConstants';
import './TimelineAxisWave.css';

interface TimelineAxisWaveProps {
  /** X position of the cursor inside the SVG, in pixels */
  hoverX: number | null;
  /** Whether the animation should be running (hovering + not loading) */
  isActive: boolean;
}

/** Half-width of the wave region around the cursor, in px */
export const WAVE_HALF_WIDTH = 100;
/** Maximum vertical lift of the wave crest at zero cursor speed, in px */
export const BASE_AMPLITUDE = 2;
/** Maximum vertical lift cap, in px */
export const MAX_AMPLITUDE = 20;
/** How much each px/frame of cursor speed adds to the amplitude */
const AMPLITUDE_VELOCITY_SCALE = 0.4;
/** Number of polyline segments used to approximate the smooth curve */
const NUM_POINTS = 120;
/** Base spatial frequency at zero cursor speed, rad/px */
const BASE_SPATIAL_FREQ = 0.07;
/** Maximum spatial frequency cap, rad/px */
const MAX_SPATIAL_FREQ = 0.28;
/** How much each px/frame of cursor speed adds to the spatial frequency */
const FREQ_VELOCITY_SCALE = 0.012;
/** Exponential-moving-average factor for velocity smoothing (0=instant, 1=frozen) */
const VELOCITY_SMOOTHING = 0.82;
/** Phase change per pixel of horizontal cursor movement, rad/px */
const MOVEMENT_SPEED = 0.03;

/**
 * Renders a ripple-wave that visually lifts the timeline axis at the cursor
 * intersection point.
 *
 * A `requestAnimationFrame` loop mutates the SVG `<path>` element directly
 * (bypassing React re-renders every frame).
 *
 * ## Wave formula (per frame)
 *   wave    = sin(freq×|dist| − phase) + 0.3×sin(2×freq×|dist| − 2×phase)
 *   yOffset = −amplitude × envelope(dist) × wave
 *
 * **Envelope** — cosine taper, 1 at the cursor, 0 at ±WAVE_HALF_WIDTH:
 *   envelope = 0.5 × (1 + cos(π×dist / WAVE_HALF_WIDTH))
 *
 * **Phase** — accumulates only from horizontal cursor displacement, so the
 * wave is completely frozen when the cursor is stationary:
 *   phase += MOVEMENT_SPEED × Δx   (Δx = 0 when still → no animation)
 *
 * **Frequency & amplitude** — both scale with cursor speed via a shared
 * EMA-smoothed velocity (|Δx| per frame), giving a livelier wave during fast
 * sweeps that settles back to calm values when the cursor slows:
 *   velocity  = VELOCITY_SMOOTHING × velocity + (1−VELOCITY_SMOOTHING) × |Δx|
 *   freq      = clamp(BASE_SPATIAL_FREQ  + FREQ_VELOCITY_SCALE      × velocity, …, MAX_SPATIAL_FREQ)
 *   amplitude = clamp(BASE_AMPLITUDE     + AMPLITUDE_VELOCITY_SCALE × velocity, …, MAX_AMPLITUDE)
 */
const TimelineAxisWave: React.FC<TimelineAxisWaveProps> = ({
  hoverX,
  isActive,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const frameRef = useRef<number | null>(null);
  const axisY = timelineHeight / 2 + 1;

  // These refs let the animation loop read the latest values without restarting
  const hoverXRef = useRef<number | null>(hoverX);
  const prevHoverXRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  /** EMA-smoothed absolute cursor velocity in px/frame */
  const velocityRef = useRef<number>(0);

  // Keep hoverXRef in sync with the prop each render without restarting the loop
  useEffect(() => {
    hoverXRef.current = hoverX;
  }, [hoverX]);

  // Main animation loop — only depends on isActive / axisY, not hoverX
  useEffect(() => {
    if (!isActive) {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      prevHoverXRef.current = null;
      velocityRef.current = 0;
      return;
    }

    const animate = () => {
      if (!pathRef.current) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const currentX = hoverXRef.current;
      if (currentX == null) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Accumulate phase only from horizontal movement — stationary = no change
      if (prevHoverXRef.current != null) {
        const dx = currentX - prevHoverXRef.current;
        phaseRef.current += MOVEMENT_SPEED * dx;
        // EMA-smooth the absolute velocity so frequency changes feel gradual
        velocityRef.current =
          VELOCITY_SMOOTHING * velocityRef.current +
          (1 - VELOCITY_SMOOTHING) * Math.abs(dx);
      }
      prevHoverXRef.current = currentX;

      const phase = phaseRef.current;
      // Dynamic spatial frequency: rises with cursor speed, capped at MAX
      const spatialFreq = Math.min(
        BASE_SPATIAL_FREQ + FREQ_VELOCITY_SCALE * velocityRef.current,
        MAX_SPATIAL_FREQ,
      );
      // Dynamic amplitude: rises with cursor speed, capped at MAX
      const amplitude = Math.min(
        BASE_AMPLITUDE + AMPLITUDE_VELOCITY_SCALE * velocityRef.current,
        MAX_AMPLITUDE,
      );
      const pts: string[] = [];

      for (let i = 0; i <= NUM_POINTS; i++) {
        const t = i / NUM_POINTS;
        const x = currentX - WAVE_HALF_WIDTH + t * WAVE_HALF_WIDTH * 2;
        const dist = x - currentX;

        //Function to calculate the envelope of the wave at a given distance from the cursor
        // Cosine envelope: peaks at cursor (dist=0), tapers to 0 at ±WAVE_HALF_WIDTH
        const envelope =
          0.5 * (1 + Math.cos((Math.PI * dist) / WAVE_HALF_WIDTH));

        const wave =
          Math.sin(spatialFreq * Math.abs(dist) - phase) +
          0.3 * Math.sin(2 * spatialFreq * Math.abs(dist) - 2 * phase);
        const yOffset = -amplitude * envelope * wave;

        pts.push(`${x.toFixed(1)},${(axisY + yOffset).toFixed(2)}`);
      }

      pathRef.current.setAttribute('d', 'M ' + pts.join(' L '));
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      prevHoverXRef.current = null;
      velocityRef.current = 0;
    };
  }, [isActive, axisY]);

  // Nothing to render until the cursor enters the SVG for the first time
  if (hoverX == null) return null;

  return (
    <g
      className={`timeline-axis-wave-group${isActive ? ' active' : ''}`}
      pointerEvents="none"
    >
      {/* Animated wave path - stroke matches the D3 axis gradient exactly */}
      <path
        ref={pathRef}
        className="timeline-axis-wave-path"
        fill="none"
        stroke="url(#axis-bar-gradient)"
      />
    </g>
  );
};

export default TimelineAxisWave;
