import {
  TimelineComponent,
  TimelineComponentHandle,
} from './TimelineComponent';
import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { TimelineEvent } from '../Entities/TimelineEvent';
import { seedPeriods } from '../Seed/DefaultEvents';
import {
  getEvents,
  addEvents,
  getDatasets,
  updateEvent,
  deleteEvent,
} from '../api/api';
import { Header } from './Header';
import { SearchEventHero } from './SearchEventHero';
import { IEventAddRequest } from '../api/Interfaces';
import { useDatasetContext } from '../context/DatasetContext';
import { EventDetailsPanel } from './EventDetailsPanel';
import {
  pulseEventDuration,
  zoomToEventDuration,
} from '../Constants/GlobalConfigConstants';
import { useNavigate } from 'react-router-dom';

const REQUEST_TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms),
    ),
  ]);
}

export const TimelinePage = () => {
  const navigate = useNavigate();
  const timelineRef = useRef<TimelineComponentHandle>(null);

  const redirectToWelcome = useCallback(() => {
    sessionStorage.removeItem('everythingTimeline_initialized');
    navigate('/welcome', { replace: true });
  }, [navigate]);
  const [highlightedEvent, setHighlightedEvent] =
    React.useState<TimelineEvent | null>(null);
  const [detailsEvent, setDetailsEvent] = React.useState<TimelineEvent | null>(
    null,
  );
  const [pulseEventKey, setPulseEventKey] = React.useState<string | null>(null);
  const [scrollDetailsOnOpen, setScrollDetailsOnOpen] = React.useState(false);
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const periods = seedPeriods;

  const {
    datasets,
    setDatasets,
    isInitialized,
    setIsInitialized,
    selectedDatasetId,
    setSelectedDatasetId,
    activeDomain,
  } = useDatasetContext();

  // Resolve selected dataset from context id, fallback to null
  const selectedDataset = React.useMemo(() => {
    if (!selectedDatasetId) return null;
    return datasets.find((d) => d.Id === selectedDatasetId) ?? null;
  }, [selectedDatasetId, datasets]);

  const getEventKey = (event: TimelineEvent) =>
    `${event.label}-${event.date.toISOString()}`;

  useMemo(() => {
    // Only fetch datasets if not already initialized via welcome page
    if (isInitialized && datasets.length > 0) {
      return;
    }

    setLoading(true);
    const fetchDatasets = async () => {
      try {
        var fetchedDatasets = await withTimeout(
          getDatasets(),
          REQUEST_TIMEOUT_MS,
        );
        setDatasets(fetchedDatasets);
        setIsInitialized(true);
        sessionStorage.setItem('everythingTimeline_initialized', 'true');
      } catch {
        redirectToWelcome();
      }
    };
    fetchDatasets().then((r) => setLoading(false));
  }, [isInitialized, datasets.length, setDatasets, setIsInitialized]);

  // Auto-select first dataset when datasets become available and no valid selection exists
  useEffect(() => {
    if (datasets.length === 0) return;
    const isValidSelection =
      selectedDatasetId && datasets.some((d) => d.Id === selectedDatasetId);
    if (!isValidSelection) {
      setSelectedDatasetId(datasets[0].Id);
    }
  }, [datasets]);

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const events = await withTimeout(
          getEvents(selectedDataset?.Id),
          REQUEST_TIMEOUT_MS,
        );
        const timelineEvents = events.map(
          (e) =>
            new TimelineEvent(
              e.Id,
              [e.Date, 0, 1],
              e.Name,
              e.Info,
              undefined,
              e.DatasetId,
              e.Date,
            ),
        );
        setEvents(timelineEvents);
      } catch {
        redirectToWelcome();
      }
    };
    fetchEvents().then((r) => setLoading(false));
  }, [selectedDataset]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('.timeline-event')) {
        setHighlightedEvent(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setHighlightedEvent(null);
    setDetailsEvent(null);
    setPulseEventKey(null);
    setScrollDetailsOnOpen(false);
  }, [selectedDataset]);

  const handleEventSearch = (
    event: React.SyntheticEvent,
    searchedEvent: TimelineEvent | null,
  ) => {
    if (!searchedEvent) return;
    const eventKey = getEventKey(searchedEvent);
    setHighlightedEvent(searchedEvent);
    setDetailsEvent(searchedEvent);
    setScrollDetailsOnOpen(false);
    setPulseEventKey(eventKey);
    timelineRef.current?.zoomToEvent(searchedEvent);
    window.setTimeout(() => {
      setPulseEventKey((current) => (current === eventKey ? null : current));
    }, zoomToEventDuration + pulseEventDuration);
  };

  const handleDatabaseChange = (
    e: React.SyntheticEvent,
    name: string | null,
  ) => {
    const dataset = datasets.find((d) => d.Name === name) || null;
    setSelectedDatasetId(dataset?.Id ?? null);
  };

  const handleAddEvent = async (eventData: {
    name: string;
    year: number;
    info: string;
    wikiPageTitle?: string;
  }) => {
    const newEvent = {
      Date: eventData.year,
      Name: eventData.name,
      Info: eventData.info,
      DatasetId: selectedDataset?.Id,
      WikiPageTitle: eventData.wikiPageTitle,
    } as IEventAddRequest;
    try {
      const addedRecords = await addEvents([newEvent]);
      setLoading(true);
      try {
        const fetchedEvents = await getEvents(selectedDataset?.Id);
        const timelineEvents = fetchedEvents.map(
          (e) =>
            new TimelineEvent(
              e.Id,
              [e.Date, 0, 1],
              e.Name,
              e.Info,
              undefined,
              e.DatasetId,
              e.Date,
            ),
        );
        setEvents(timelineEvents);

        // Find the newly added event using the returned record's Name + Date
        const addedRecord = addedRecords?.[0];
        console.log('Added record:', addedRecord);
        console.log('Timeline events:', timelineEvents);
        if (addedRecord) {
          window.setTimeout(() => {
            const matched = timelineEvents.find((e) => e.id == addedRecord.Id);
            if (matched) {
              const eventKey = getEventKey(matched);
              setHighlightedEvent(matched);
              setDetailsEvent(matched);
              setScrollDetailsOnOpen(false);
              setPulseEventKey(eventKey);
              timelineRef.current?.zoomToEvent(matched);
              window.setTimeout(() => {
                setPulseEventKey((current) =>
                  current === eventKey ? null : current,
                );
              }, zoomToEventDuration + pulseEventDuration);
            }
            console.log('Event found and highlighted:', matched);
          }, 500);
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      alert('AddEvents error: ' + err);
    }
    console.log('New event added:', eventData);
  };

  const handleEventSelect = (event: TimelineEvent) => {
    setHighlightedEvent(event);
    setDetailsEvent(event);
    setScrollDetailsOnOpen(true);
    setPulseEventKey(null);
  };

  const handleCloseDetails = () => {
    setHighlightedEvent(null);
    setDetailsEvent(null);
    setScrollDetailsOnOpen(false);
  };

  const handleSaveEventInfo = async (updatedInfo: string) => {
    if (
      !detailsEvent ||
      !detailsEvent.datasetId ||
      detailsEvent.rawDate === undefined
    )
      return;
    await updateEvent({
      Event: {
        Id: detailsEvent.id,
        Date: detailsEvent.rawDate,
        Name: detailsEvent.label,
        Info: updatedInfo,
        DatasetId: detailsEvent.datasetId,
      },
    });
    // Update local events state
    const updatedEvents = events.map((e) =>
      e.id === detailsEvent.id
        ? Object.assign(Object.create(Object.getPrototypeOf(e)), e, {
            info: updatedInfo,
          })
        : e,
    );
    setEvents(updatedEvents);
    // Update the details panel event reference
    const updatedDetailsEvent =
      updatedEvents.find((e) => e.id === detailsEvent.id) ?? null;
    setDetailsEvent(updatedDetailsEvent);
  };

  const handleDeleteEvent = async () => {
    if (
      !detailsEvent ||
      !detailsEvent.datasetId ||
      detailsEvent.rawDate === undefined
    )
      return;
    await deleteEvent({
      Event: {
        Id: detailsEvent.id,
        Date: detailsEvent.rawDate,
        Name: detailsEvent.label,
        Info: detailsEvent.info ?? '',
        DatasetId: detailsEvent.datasetId,
      },
    });
    // this momentarily changes zoom  level?
    // setEvents(prev => prev.filter(e => e.id !== detailsEvent.id));
    window.location.reload(); // Temporary full refresh to ensure all state is consistent after delete, can optimize later
    setHighlightedEvent(null);
    setDetailsEvent(null);
    setScrollDetailsOnOpen(false);
  };

  return (
    <>
      <Header
        databaseOptions={datasets.map((s) => s.Name)}
        onDatabaseChange={handleDatabaseChange}
        selectedDatabase={selectedDataset?.Name ?? null}
        loading={loading}
      />
      <SearchEventHero
        events={events}
        selectedEvent={detailsEvent}
        selectedDatabase={selectedDataset?.Name ?? null}
        loading={loading}
        onEventSearch={handleEventSearch}
        onSubmitEvent={handleAddEvent}
      />
      <TimelineComponent
        ref={timelineRef}
        events={events}
        periods={periods}
        domain={activeDomain}
        selectedDatabase={selectedDataset?.Name ?? null}
        highlightedEventKey={
          highlightedEvent ? getEventKey(highlightedEvent) : null
        }
        pulseEventKey={pulseEventKey}
        onDatabaseChange={handleDatabaseChange}
        onEventSearch={handleEventSearch}
        onEventSelect={handleEventSelect}
        loading={loading}
      />
      <EventDetailsPanel
        event={detailsEvent}
        onClose={handleCloseDetails}
        scrollOnOpen={scrollDetailsOnOpen}
        onSave={handleSaveEventInfo}
        onDelete={handleDeleteEvent}
      />
    </>
  );
};
