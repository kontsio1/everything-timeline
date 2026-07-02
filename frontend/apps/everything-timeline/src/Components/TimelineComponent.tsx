import * as d3 from 'd3';
import React, {
  forwardRef,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import {
  timelineHeight,
  timelineWidth,
  noOfVisiblePeriods,
  horizontalPaddingOfTimeline,
  bgColor,
  txtColor,
  zoomToEventDuration,
} from '../Constants/GlobalConfigConstants';
import { TimelinePeriod } from '../Entities/TimelinePeriod';
import { TimelineEvent } from '../Entities/TimelineEvent';
import {
  computeEventPositionByLaneStrategy,
  computePeriodLabelPositionByLaneStrategy,
  computeRelativePeriodOverlaps,
  getYearLabel,
} from '../Helpers/GenericHelperFunctions';
import { PeriodTooltip } from './PeriodTooltip';
import { makeStyles } from '@mui/styles';
import TimelinePeriodMarker from './TimelinePeriodMarker';
import EventComponent from './EventComponent';
import TimelineHoverLine from './TimelineHoverLine';
import TimelineAxisWave, {
  WAVE_HALF_WIDTH,
  MAX_AMPLITUDE,
  WaveParams,
  computeWaveOffset,
} from './TimelineAxisWave';
import { useControlsContext } from '../context/ControlsContext';
import { useThemeContext } from '../context/ThemeContext';

const useStyles = makeStyles({
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'space-around',
  },
});

export interface TimelineComponentProps {
  events: TimelineEvent[];
  periods: TimelinePeriod[];
  domain: [Date, Date];
  selectedDatabase: string | null;
  highlightedEventKey: string | null;
  pulseEventKey: string | null;
  onDatabaseChange: (event: SyntheticEvent, value: string | null) => void;
  onEventSearch: (
    event: SyntheticEvent,
    newValue: TimelineEvent | null,
  ) => void;
  onEventSelect?: (event: TimelineEvent) => void;
  loading: boolean;
}

export interface TimelineComponentHandle {
  zoomToEvent: (event?: TimelineEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  panLeft: () => void;
  panRight: () => void;
}

export const TimelineComponent = forwardRef<
  TimelineComponentHandle,
  TimelineComponentProps
>(function TimelineComponent(props, ref) {
  //#region Context/props
  const classes = useStyles();
  const { controls } = useControlsContext();
  const { mode } = useThemeContext();
  const { events, periods, domain, loading, onEventSelect } = props;

  //#endregion

  //#region Refs
  const svgRef = useRef<SVGSVGElement>(null); // SVG ref for React-managed SVG
  const axisRef = useRef<SVGGElement>(null);
  const svgSelectionRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const xScaleRef = useRef<d3.ScaleTime<number, number, never> | null>(null);
  const laneHeightPaddingRef = useRef<number>(
    controls.visibleEventsLaneHeightPadding,
  );
  const defaultEventStemHeightRef = useRef<number>(
    controls.defaultEventStemHeight,
  );

  /** Shared wave params written every rAF frame by TimelineAxisWave */
  const waveParamsRef = useRef<WaveParams | null>(null);
  /** Live DOM refs to every rendered event group, keyed by event key */
  const eventGroupRefsMap = useRef<Map<string, SVGGElement>>(new Map());
  const circleWaveFrameRef = useRef<number | null>(null);
  /**
   * Ref copy of transform kept in sync with both setTransform (via handleZoom)
   * and the domain-init effect reset. Used by the [events, periods] effect so it
   * always reads the latest transform and never suffers from a stale closure when
   * domain and events change in the same React render batch.
   */
  const transformRef = useRef<{ x: number; k: number }>({ x: 0, k: 1 });

  //#endregion

  //#region State
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);
  const [visiblePeriods, setVisiblePeriods] = useState<TimelinePeriod[]>([]);
  const [transform, setTransform] = useState<{ x: number; k: number }>({
    x: 0,
    k: 1,
  }); //x axis panning & scale/zoom state
  const [renderEvents, setRenderEvents] = useState<
    { event: TimelineEvent; fade: 'enter' | 'stable' }[]
  >([]);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

  //#endregion

  //#region Constants

  const timelineControlAnimationDuration = 500;
  const axisGradientId = 'axis-bar-gradient';
  const periodMaskId = 'period-edge-fade-mask';
  const periodMaskGradientId = 'period-mask-gradient';

  //#endregion

  //#region Pure helpers

  const getEventKey = (event: TimelineEvent) =>
    `${event.label}-${event.date.toISOString()}`;

  const formatTicks = (domainValue: any) => {
    const date =
      domainValue instanceof Date ? domainValue : new Date(Number(domainValue));
    const year = date.getUTCFullYear();
    return getYearLabel(year);
  };

  const getTransformedXScale = () => {
    const baseScale = xScaleRef.current;
    if (!baseScale) return null;
    const d3Transform = d3.zoomIdentity
      .translate(transform.x, 0)
      .scale(transform.k);
    return d3Transform.rescaleX(baseScale);
  };

  // Helper to recalculate boxX/boxWidth for all events
  const recalculateEventBoxes = (
    events: TimelineEvent[],
    xScale: d3.ScaleTime<number, number, never>,
  ) => {
    const padding = 4;
    const fontSize = 12;
    if (events == null) return;
    events.forEach((event) => {
      const timelineX = xScale(event.date);
      const textWidth = event.label.length * fontSize * 0.6;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = fontSize + padding * 2;
      const rectX = timelineX - textWidth / 2 - padding;
      event.boxWidth = rectWidth;
      event.boxHeight = rectHeight;
      event.boxX = rectX;
    });
  };

  const recalculatePeriodLabelBoxes = (
    periods: TimelinePeriod[],
    xScale: d3.ScaleTime<number, number, never>,
  ) => {
    const fontSize = 12;

    periods.forEach((period) => {
      const rectX = xScale(period.startDate);
      const rectWidth = xScale(period.endDate) - rectX;
      const shouldShowLabel = rectWidth > timelineWidth * 0.04;

      period.labelX = rectX + rectWidth / 2;
      period.labelWidth = shouldShowLabel ? period.label.length * fontSize * 0.6 : 0;
      period.labelHeight = fontSize;
      period.labelVisible = shouldShowLabel;
      period.labelYoffset = 0;
      period.updateLabelY();
    });
  };

  const updateEvents = (newX: d3.ScaleTime<number, number, never>) => {
    recalculateEventBoxes(events, newX);
    const [domainStart, domainEnd] = newX.domain();
    const eventsInDomain = events.filter(
      (p) => p.date >= domainStart && p.date <= domainEnd,
    );
    computeEventPositionByLaneStrategy(
      eventsInDomain,
      laneHeightPaddingRef.current,
      defaultEventStemHeightRef.current,
    );
    const filteredEvents = eventsInDomain.filter((e) => e.stemHeight != -1);
    setVisibleEvents(filteredEvents);
  };

  const updatePeriods = (newX: d3.ScaleTime<number, number, never>) => {
    const [domainStart, domainEnd] = newX.domain();
    const periodsInDomain = periods.filter(
      (p) => p.endDate >= domainStart && p.startDate <= domainEnd,
    );
    periodsInDomain.forEach((period) => {
      period.updateDuration([domainStart, domainEnd]);
      period.updateVisualAttributesBasedOnDuration();
    });
    const topPriorityPeriods = periodsInDomain
      .sort((a, b) => b.priority - a.priority)
      .slice(0, noOfVisiblePeriods);
    const periodsByStartDate = topPriorityPeriods.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
    recalculatePeriodLabelBoxes(periodsByStartDate, newX);
    computePeriodLabelPositionByLaneStrategy(periodsByStartDate);
    setVisiblePeriods(periodsByStartDate);
  };

  //#endregion

  //#region Effects

  // Initialize scale/zoom only when domain changes to preserve current zoom when events refresh.
  useEffect(() => {
    const x = d3
      .scaleTime()
      .domain(domain)
      //horizontal distance between the left edge of the timeline rectangle (SVG) and the start of the timeline
      .range([
        horizontalPaddingOfTimeline,
        timelineWidth - horizontalPaddingOfTimeline,
      ])
      .clamp(true);
    xScaleRef.current = x;
    transformRef.current = { x: 0, k: 1 }; // reset ref immediately so subsequent effects see the fresh value
    setTransform({ x: 0, k: 1 });
    updatePeriods(x);
    updateEvents(x);
    if (!svgRef.current) return;
    const svgSelection = d3.select(svgRef.current);
    const zoomBehavior = createZoomBehavior();
    svgSelectionRef.current = svgSelection;
    zoomBehaviorRef.current = zoomBehavior;
    svgSelection.call(zoomBehavior);
  }, [domain]);

  // Keep visible items in sync when event/period collections change.
  // Uses transformRef (not transform state) to avoid a stale-closure bug where
  // domain change and events arrival land in the same render batch: the domain
  // effect resets transformRef synchronously before this effect runs, so the
  // correct (reset) transform is always used here regardless of render order.
  useEffect(() => {
    const baseScale = xScaleRef.current;
    if (!baseScale) return;
    const { x, k } = transformRef.current;
    const d3Transform = d3.zoomIdentity.translate(x, 0).scale(k);
    const xScale = d3Transform.rescaleX(baseScale);
    updatePeriods(xScale);
    updateEvents(xScale);
  }, [events, periods]);

  // Update axis ticks on transform/scale change
  useEffect(() => {
    const xScale = getTransformedXScale();
    if (axisRef.current && xScale) {
      const axisSelection = d3
        .select(axisRef.current)
        .call(
          d3.axisBottom(xScale).ticks(controls.ticksNo).tickFormat(formatTicks),
        );

      axisSelection
        .selectAll('.domain')
        .attr('stroke', `url(#${axisGradientId})`)
        .attr('stroke-width', 5)
        .attr('mask', 'url(#axis-wave-mask)');

      // Keep tick styling consistent
      axisSelection
        .selectAll('.tick text')
        .attr('fill', txtColor)
        .attr('dy', '1.71em');
      axisSelection.selectAll('.tick line').attr('stroke', txtColor);
    }
  }, [
    transform,
    visibleEvents,
    visiblePeriods,
    loading,
    controls.ticksNo,
    mode,
  ]);

  useEffect(() => {
    setRenderEvents((prev) => {
      const prevByKey = new Map(
        prev.map((item) => [getEventKey(item.event), item]),
      );
      return visibleEvents.map((event) => {
        const key = getEventKey(event);
        const previous = prevByKey.get(key);
        return { event, fade: previous ? 'stable' : 'enter' };
      });
    });
  }, [visibleEvents]);

  useEffect(() => {
    const hasEntering = renderEvents.some((item) => item.fade === 'enter');
    if (!hasEntering) return;
    const rafId = window.requestAnimationFrame(() => {
      setRenderEvents((prev) =>
        prev.map((item) =>
          item.fade === 'enter' ? { ...item, fade: 'stable' } : item,
        ),
      );
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [renderEvents]);

  computeRelativePeriodOverlaps(periods);

  useEffect(() => {
    laneHeightPaddingRef.current = controls.visibleEventsLaneHeightPadding;
    defaultEventStemHeightRef.current = controls.defaultEventStemHeight;
    events.forEach((event) => {
      event.defaultHeight = defaultEventStemHeightRef.current;
    });
    const xScale = getTransformedXScale();
    if (!xScale) return;
    updateEvents(xScale);
  }, [
    controls.visibleEventsLaneHeightPadding,
    controls.defaultEventStemHeight,
  ]);

  //#endregion

  //#region UI interaction handlers
  const handleTimelineMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setHoverX(event.clientX - rect.left);
    setHoverY(event.clientY - rect.top);
    setIsHoveringTimeline(true);
  };

  const handleTimelineMouseLeave = () => {
    setIsHoveringTimeline(false);
  };
  //#endregion

  const transformedXScale = useMemo(
    () => getTransformedXScale(),
    [domain, transform.x, transform.k],
  );

  //#region Zoom behavior

  const handleZoom = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const { x, k } = event.transform;
    setTransform({ x, k });
    transformRef.current = { x, k };
    const newX = event.transform.rescaleX(xScaleRef.current!);
    updatePeriods(newX);
    updateEvents(newX);
  };
  const createZoomBehavior = () =>
    d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1000])
      .translateExtent([
        [horizontalPaddingOfTimeline, 0],
        [timelineWidth - horizontalPaddingOfTimeline, 0],
      ])
      .extent([
        [50, 0],
        [timelineWidth - 50, timelineHeight],
      ])
      .on('zoom', handleZoom);

  const getAdaptiveZoomFactor = () => {
    const zoomLevel = Math.max(transform.k, 1);
    //currently 1
    const dynamicStep = Math.max(0.5, 1 / Math.sqrt(zoomLevel));
    return 1 + dynamicStep;
  };
  const getAdaptivePanDelta = () => {
    const zoomLevel = Math.max(transform.k, 1);
    const viewportStepPx = timelineWidth * 0.12;
    // translateBy multiplies by current scale; normalize so the on-screen pan stays consistent.
    return viewportStepPx / zoomLevel;
  };

  // Expose zoomToEvent via ref
  useImperativeHandle(ref, () => ({
    zoomToEvent(event?: TimelineEvent) {
      const date = event?.date;
      if (!date || !xScaleRef.current || !svgRef.current) return;
      const xScale = xScaleRef.current;
      const targetX = xScale(date);
      const centerX = timelineWidth / 2;

      // D3 translateExtent clamps tx to: [ex0 - x1*k, ex1 - x0*k]
      // where extent is [[50,0],[timelineWidth-50,h]] and translateExtent is [[hPad,0],[timelineWidth-hPad,0]]
      // For the desired tx = centerX - targetX*k to be unclamped, derive min k:
      //   tx >= ex0 - (timelineWidth - hPad)*k  →  (timelineWidth - hPad - targetX)*k >= ex0 - centerX
      //   tx <= (timelineWidth - 50) - hPad*k   →  (targetX - hPad)*k >= centerX - (timelineWidth - 50)
      const hPad = horizontalPaddingOfTimeline;
      const ex0 = 50;
      const ex1 = timelineWidth - 50;
      const x1 = timelineWidth - hPad;
      const x0 = hPad;

      let minZoom = 7;

      // Lower-bound: tx >= tx_min  →  centerX - targetX*k >= ex0 - x1*k
      //   k*(x1 - targetX) >= ex0 - centerX  →  k >= (centerX - ex0) / (x1 - targetX)
      const denomA = x1 - targetX;
      if (denomA > 0) {
        minZoom = Math.max(minZoom, (centerX - ex0) / denomA);
      }

      // Upper-bound: tx <= tx_max  →  centerX - targetX*k <= ex1 - x0*k
      //   k*(targetX - x0) >= centerX - ex1  →  k >= (centerX - ex1) / (-(targetX - x0))
      const denomB = targetX - x0;
      if (denomB > 0) {
        minZoom = Math.max(minZoom, (centerX - ex1) / -denomB);
      }

      const zoomLevel = Math.min(Math.ceil(minZoom * 10) / 10, 1000);
      const translateX = centerX - targetX * zoomLevel;
      const targetTransform = d3.zoomIdentity
        .translate(translateX, 0)
        .scale(zoomLevel);
      const svgSelection = svgSelectionRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgSelection || !zoomBehavior) return;
      svgSelection.call(zoomBehavior);
      svgSelection
        .transition()
        .duration(zoomToEventDuration)
        .call(zoomBehavior.transform, targetTransform);
    },
    zoomIn() {
      const svgSelection = svgSelectionRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgSelection || !zoomBehavior) return;
      svgSelection
        .transition()
        .duration(timelineControlAnimationDuration)
        .call(zoomBehavior.scaleBy, getAdaptiveZoomFactor());
    },
    zoomOut() {
      const svgSelection = svgSelectionRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgSelection || !zoomBehavior) return;
      svgSelection
        .transition()
        .duration(timelineControlAnimationDuration)
        .call(zoomBehavior.scaleBy, 1 / getAdaptiveZoomFactor());
    },
    panLeft() {
      const svgSelection = svgSelectionRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgSelection || !zoomBehavior) return;
      svgSelection
        .transition()
        .duration(timelineControlAnimationDuration)
        .call(zoomBehavior.translateBy, getAdaptivePanDelta(), 0);
    },
    panRight() {
      const svgSelection = svgSelectionRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgSelection || !zoomBehavior) return;
      svgSelection
        .transition()
        .duration(timelineControlAnimationDuration)
        .call(zoomBehavior.translateBy, -getAdaptivePanDelta(), 0);
    },
  }));
  //#endregion

  //#region Wave animation
  const isWaveActive =
    isHoveringTimeline && !loading && controls.hoverLineEnabled;

  useEffect(() => {
    if (!isWaveActive) {
      eventGroupRefsMap.current.forEach((group) => {
        group.setAttribute('transform', '');
      });
      if (circleWaveFrameRef.current != null) {
        cancelAnimationFrame(circleWaveFrameRef.current);
        circleWaveFrameRef.current = null;
      }
      return;
    }

    const tick = () => {
      const params = waveParamsRef.current;
      const xScale = getTransformedXScale();

      eventGroupRefsMap.current.forEach((group, key) => {
        const event = visibleEvents.find((e) => getEventKey(e) === key);

        let target = 0;
        if (event && xScale && params) {
          const dist = xScale(event.date) - params.hoverX;
          if (Math.abs(dist) < WAVE_HALF_WIDTH) {
            target = computeWaveOffset(dist, params);
          }
        }

        if (Math.abs(target) < 0.01) {
          group.setAttribute('transform', '');
        } else {
          group.setAttribute('transform', `translate(0,${target.toFixed(2)})`);
        }
      });

      circleWaveFrameRef.current = requestAnimationFrame(tick);
    };

    circleWaveFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (circleWaveFrameRef.current != null) {
        cancelAnimationFrame(circleWaveFrameRef.current);
        circleWaveFrameRef.current = null;
      }
      eventGroupRefsMap.current.forEach((group) => {
        group.setAttribute('transform', '');
      });
    };
  }, [isWaveActive, visibleEvents]);

  //#endregion

  return (
    <>
      <div className={classes.timelineContainer}>
        <svg
          ref={svgRef}
          width="90vw"
          height="70vh"
          style={{ background: bgColor }}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
        >
          {/* Gradient definitions for tick stems and axis line */}
          <defs>
            <linearGradient
              id={axisGradientId}
              x1={horizontalPaddingOfTimeline}
              y1="0"
              x2={timelineWidth - horizontalPaddingOfTimeline}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop offset="5%" stopColor={txtColor} stopOpacity="0.15" />
              <stop offset="95%" stopColor={txtColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Gradient for axis loading animation - white line faded on edges */}
            <linearGradient
              id="axis-loading-gradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="20%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor="white" stopOpacity="1" />
              <stop offset="80%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Gradient for period edge fade mask */}
            <linearGradient
              id={periodMaskGradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor="white" stopOpacity="1" />
              <stop offset="95%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>

            {/* Mask that cuts the D3 domain line out of the wave region.
                NOTE: maskContentUnits defaults to "userSpaceOnUse", which means
                coordinates are in the local space of the masked element (.domain).
                .domain lives inside <g transform="translate(0, timelineHeight/2)">,
                so y=0 here equals the axis line. The white rect must cover the full
                local range; the black cut-out is centred on y=0. */}
            <mask id="axis-wave-mask">
              {/* Show everything in the element's local coordinate space */}
              <rect
                x={0}
                y={-timelineHeight}
                width={timelineWidth}
                height={timelineHeight * 3}
                fill="white"
              />
              {/* Hide domain line in the wave region (local y=0 is the axis) */}
              {isHoveringTimeline &&
                !loading &&
                hoverX != null &&
                controls.hoverLineEnabled && (
                  <rect
                    x={hoverX - WAVE_HALF_WIDTH}
                    y={-(MAX_AMPLITUDE + 3)}
                    width={WAVE_HALF_WIDTH * 2}
                    height={MAX_AMPLITUDE * 2 + 6}
                    fill="black"
                  />
                )}
            </mask>

            {/* Mask that applies edge fade to periods */}
            <mask id={periodMaskId}>
              <rect
                x={horizontalPaddingOfTimeline}
                y="0"
                width={timelineWidth - 2 * horizontalPaddingOfTimeline}
                height={timelineHeight}
                fill={`url(#${periodMaskGradientId})`}
              />
            </mask>
          </defs>
          <g mask={`url(#${periodMaskId})`}>
            <TimelineAxisWave
              hoverX={hoverX}
              isActive={
                isHoveringTimeline && !loading && controls.hoverLineEnabled
              }
              waveParamsRef={waveParamsRef}
            />
          </g>
          {/* Render markers/periods first, then axis to bring axis forward in z-order */}
          <g mask={`url(#${periodMaskId})`}>
            {visiblePeriods.map((period) => (
              <TimelinePeriodMarker
                key={period.label + period.startDate.toISOString()}
                period={period}
                x={transformedXScale ?? (() => 0)}
                loading={loading}
              />
            ))}
          </g>
          <g mask={`url(#${periodMaskId})`}>
            {renderEvents.map((item) => (
              <EventComponent
                key={getEventKey(item.event)}
                event={item.event}
                x={transformedXScale ?? (() => 0)}
                onSelect={onEventSelect}
                fadeState={item.fade}
                isHighlighted={
                  getEventKey(item.event) === props.highlightedEventKey
                }
                shouldPulse={getEventKey(item.event) === props.pulseEventKey}
                groupRef={(el) => {
                  const key = getEventKey(item.event);
                  if (el) {
                    eventGroupRefsMap.current.set(key, el);
                  } else {
                    eventGroupRefsMap.current.delete(key);
                  }
                }}
              />
            ))}
          </g>
          <g ref={axisRef} transform={`translate(0,${timelineHeight / 2})`} />
          {/* Loading animation - white line moving across the axis */}
          {loading && (
            <rect
              className="axis-loading-line"
              x={horizontalPaddingOfTimeline}
              y={timelineHeight / 2 - 2}
              width={120}
              height={4}
              fill="url(#axis-loading-gradient)"
            />
          )}
          <TimelineHoverLine
            xScale={transformedXScale}
            hoverX={hoverX}
            hoverY={hoverY}
            isActive={
              controls.hoverLineEnabled && isHoveringTimeline && !loading
            }
          />
        </svg>
        <PeriodTooltip />
      </div>
    </>
  );
});
