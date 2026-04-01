# AGENTS.md - Everything Timeline

## Architecture Overview

A full-stack historical timeline visualization app with:
- **Frontend**: React 19 + TypeScript + D3.js (in `/frontend`)
- **Backend**: .NET 8 Azure Functions with Entity Framework Core (in `/functions`)
- **Database**: Azure SQL Server (Events, Periods, Datasets tables in `dbo` schema)

### Data Flow
1. Frontend fetches datasets via `getDatasets()` → displays in dataset selector
2. User selects dataset → `getEvents(datasetId)` fetches events → rendered as D3.js timeline
3. Events/Periods use `DatasetId` (GUID) as foreign key for multi-dataset support

## Key Patterns

### Frontend Entity System
- **`TimelineEvent`** and **`TimelinePeriod`** extend `BaseEvent` — both have computed visual properties (color from label hash, height/opacity from duration)
- Colors are deterministically generated: `stringToUnique01(label, seedNo)` in `LogarithmicScaleHelper.ts`
- Dates use `[year, month, day]` arrays: `new TimelineEvent([-3200], "Unification of Egypt")` (negative = BCE)

### Timeline Rendering (D3.js)
- `TimelineComponent.tsx` manages zoom/pan via D3 zoom behaviors
- Event visibility uses lane-based collision detection: `computeEventPositionByLaneStrategy()` in `GenericHelperFunctions.ts`
- Period priority calculated by duration + overlap penalties (see `priorityOverlapBonuses` constant)
- Global constants in `Constants/GlobalConfigConstants.ts` control dimensions, colors, and behavior

### State Management
- `DatasetContext` shares datasets/initialization state across components
- Session storage tracks initialization: `sessionStorage.getItem('everythingTimeline_initialized')`

### API Interface
- Frontend interfaces in `api/Interfaces.ts` mirror backend entities but use PascalCase: `IApiEvent`, `IApiPeriod`, `IApiDataset`
- Backend entities in `Entities.cs` — ensure property names match when modifying

## Development Commands

### Frontend (`/frontend`)
```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build to /build
npm test           # Jest tests
```

### Backend (`/functions`)
```bash
func start         # Local Azure Functions at localhost:7071
dotnet build       # Build functions project
```

### Docker
```bash
docker compose up --build  # Full stack via compose.yaml
```

## Environment Configuration

- **Frontend API URL**: Set `REACT_APP_API_URL` or defaults to Azure production endpoint
- **Backend DB**: `SqlConnectionString` in `local.settings.json` or environment variable

## API Endpoints (Azure Functions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/GetDatasets` | GET | List all datasets |
| `/api/GetEvents?dataset={guid}` | GET | Events filtered by dataset (optional) |
| `/api/AddEvent` | POST | Add events (array of Event objects) |
| `/api/GetPeriods?dataset={guid}` | GET | Periods filtered by dataset |

## File Conventions

- React components in `src/Components/` — each has optional `.css` file
- Entity classes in `src/Entities/` — business logic for timeline items
- Seed data in `src/Seed/` — default historical events/periods for testing
- Helper functions in `src/Helpers/` — pure functions for calculations

## Common Modifications

**Adding a new API endpoint:**
1. Add function in `functions/Functions.cs` with `[Function("Name")]` attribute
2. Use `SetCorsHeaders(response)` for CORS
3. Add corresponding function in `frontend/src/api/api.ts`

**Adding new timeline visual properties:**
1. Modify entity in `Entities/TimelineEvent.ts` or `TimelinePeriod.ts`
2. Update rendering in `TimelineComponent.tsx` or `EventComponent.tsx`
3. Adjust constants in `GlobalConfigConstants.ts` if needed

