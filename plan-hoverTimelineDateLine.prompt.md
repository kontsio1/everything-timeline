## Plan: Hover Date Line Overlay

Add a small overlay component that tracks mouse position within the SVG, renders a vertical line plus a rounded date label, and plugs into the existing zoomed `x` scale so the date matches the timeline. Wire it into the timeline render tree and add CSS for the line/label styling while keeping the logic isolated and easy to toggle.

### Steps
1. Create a small hover overlay component in `frontend/src/Components/TimelineHoverLine.tsx` that takes `xScale`, SVG bounds, and hover state.
2. Add mouse move/leave handlers in `frontend/src/Components/TimelineComponent.tsx` to compute hover X and date via `getTransformedXScale()`.
3. Render the new hover overlay inside the SVG in `frontend/src/Components/TimelineComponent.tsx`, above periods and below axis for correct z-order.
4. Add styles for the line and rounded label in `frontend/src/Components/TimelineHoverLine.css` (or reuse `frontend/src/Components/Header.css` if you prefer a shared stylesheet).
5. Use existing `getYearLabel` from `frontend/src/Helpers/GenericHelperFunctions.ts` for the label text so BCE/CE formatting stays consistent.

### Further Considerations
1. Should the hover line be full-height or only span the timeline area (Option A full SVG, Option B axis-to-axis)? Implement Option A
2. Do you want the date label to snap to ticks or follow the exact mouse date (Option A snap, Option B continuous)? Implement Option B
3. Should the line hide during loading or when zoom/pan is active (Option A always visible, Option B gated by `loading`)? Implement Option B

