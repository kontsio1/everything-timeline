export const timelineInitialDomain = [new Date(-3200, 0, 1), new Date()]
export const logScaleExponent = 6 // Exponent for logarithmic scale normalization
// export const colourSeed = 12.9898
export const colourSeed = 2.9898 //not used
export const colourSeedStr = ["kontsio", "god", "programmer"] //heufhe
export const timelineHeight = window.innerHeight * 0.7;
export const timelineWidth = window.innerWidth * 0.9;
export const ticksNo = (window.innerWidth > 500)? 10 : 4;
export const noOfVisiblePeriods = 7;
export const priorityOverlapBonuses = [2, 0.3, 0, -0.25, -0.5] // [0, 0-100, 100-200, 200-200, >300]
export const eventBoxMargin = 15; // min margin enforced between event boxes for overalap handling
export const defaultEventStemHeight = 50;
export const horizontalPaddingOfTimeline = timelineWidth*0.05; // horizontal distance between the left edge of the timeline rectangle (SVG) and the start of the timeline, also applied to the right edge
export const timelineTopEventsMargin = timelineHeight*0.1

export const bgColor = "#0f0e0b"
export const txtColor = "#f5f0e8"
export const txtColor2 = "#9aa5b4"

// --ink: #0f0e0b;
// --parchment: #f5f0e8;
// --aged: #e8dfc8;
// --rust: #c45c2e;
// --gold: #b8963e;
// --slate: #4a5568;
// --mist: #9aa5b4;
// --era-1: #2d4a3e;
// --era-2: #4a3728;
// --era-3: #2a3d52;
// --era-4: #3d2a4a;

// font-family: 'DM Sans', sans-serif;