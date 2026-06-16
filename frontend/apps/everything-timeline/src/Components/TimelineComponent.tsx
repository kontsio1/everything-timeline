import * as d3 from 'd3';
import React, {
  forwardRef,
  SyntheticEvent,
  useEffect,
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
} from './TimelineAxisWave';
import { useControlsContext } from '../context/ControlsContext';

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
}

export const TimelineComponent = forwardRef<
  TimelineComponentHandle,
  TimelineComponentProps
>(function TimelineComponent(props, ref) {
  const classes = useStyles();
  const { controls } = useControlsContext();
  const { events, periods, domain, loading, onEventSelect } = props;
  const svgRef = useRef<SVGSVGElement>(null); // SVG ref for React-managed SVG
  const axisRef = useRef<SVGGElement>(null);
  const xScaleRef = useRef<d3.ScaleTime<number, number, never> | null>(null);
  const laneHeightPaddingRef = useRef<number>(
    controls.visibleEventsLaneHeightPadding,
  );
  const defaultEventStemHeightRef = useRef<number>(
    controls.defaultEventStemHeight,
  );

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

  const getEventKey = (event: TimelineEvent) =>
    `${event.label}-${event.date.toISOString()}`;

  const formatTicks = (domainValue: any) => {
    const date =
      domainValue instanceof Date ? domainValue : new Date(Number(domainValue));
    const year = date.getUTCFullYear();
    return getYearLabel(year);
  };

  // Create initial scale
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
    setTransform({ x: 0, k: 1 });
    updatePeriods(x);
    updateEvents(x);
    if (!svgRef.current) return;
    const zoom = d3
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
      .on(
        'zoom',
        (event: {
          transform: { x: any; k: any; rescaleX: (arg0: any) => any };
        }) => {
          setTransform({ x: event.transform.x, k: event.transform.k });
          const newX = event.transform.rescaleX(xScaleRef.current!);
          updatePeriods(newX);
          updateEvents(newX);
        },
      );
    d3.select(svgRef.current).call(zoom);
  }, [events, domain]);

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
  }, [transform, visibleEvents, visiblePeriods, loading, controls.ticksNo]);

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

  const getTransformedXScale = () => {
    const baseScale = xScaleRef.current;
    if (!baseScale) return null;
    const d3Transform = d3.zoomIdentity
      .translate(transform.x, 0)
      .scale(transform.k);
    return d3Transform.rescaleX(baseScale);
  };

  computeRelativePeriodOverlaps(periods);

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
    let filteredEvents = eventsInDomain.filter((e) => e.stemHeight != -1);
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
    setVisiblePeriods(periodsByStartDate);
  };

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

  // Add gradient definition for tick stems and axis line
  const axisGradientId = 'axis-bar-gradient';
  const periodMaskId = 'period-edge-fade-mask';
  const periodMaskGradientId = 'period-mask-gradient';

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
      const svgSelection = d3.select(svgRef.current);
      const zoomBehavior = d3
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
        .on(
          'zoom',
          (event: {
            transform: { x: any; k: any; rescaleX: (arg0: any) => any };
          }) => {
            setTransform({ x: event.transform.x, k: event.transform.k });
            const newX = event.transform.rescaleX(xScaleRef.current!);
            updatePeriods(newX);
            updateEvents(newX);
          },
        );
      svgSelection.call(zoomBehavior);
      svgSelection
        .transition()
        .duration(zoomToEventDuration)
        .call(zoomBehavior.transform, targetTransform);
    },
  }));

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
              {isHoveringTimeline && !loading && hoverX != null && (
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
          <TimelineAxisWave
            hoverX={hoverX}
            isActive={isHoveringTimeline && !loading}
          />
          {/* Render markers/periods first, then axis to bring axis forward in z-order */}
          <g mask={`url(#${periodMaskId})`}>
            {visiblePeriods.map((period) => (
              <TimelinePeriodMarker
                key={period.label + period.startDate.toISOString()}
                period={period}
                x={getTransformedXScale() ?? (() => 0)}
              />
            ))}
          </g>
          <g mask={`url(#${periodMaskId})`}>
            {renderEvents.map((item) => (
              <EventComponent
                key={getEventKey(item.event)}
                event={item.event}
                x={getTransformedXScale() ?? (() => 0)}
                onSelect={onEventSelect}
                fadeState={item.fade}
                isHighlighted={
                  getEventKey(item.event) === props.highlightedEventKey
                }
                shouldPulse={getEventKey(item.event) === props.pulseEventKey}
              />
            ))}
          </g>
          {controls.hoverLineEnabled && (
            <TimelineHoverLine
              xScale={getTransformedXScale()}
              hoverX={hoverX}
              hoverY={hoverY}
              isActive={isHoveringTimeline && !loading}
            />
          )}
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
        </svg>
        <PeriodTooltip />
      </div>
    </>
  );
});
