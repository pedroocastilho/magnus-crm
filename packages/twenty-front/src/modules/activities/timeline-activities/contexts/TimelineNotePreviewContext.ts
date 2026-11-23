import { createContext } from 'react';

type TimelineNotePreviewContextValue = {
  // Eventos que mostram o texto da nota: so o mais recente de cada nota (o robo reescreve a nota varias vezes).
  notePreviewEventIds: Set<string>;
};

export const TimelineNotePreviewContext =
  createContext<TimelineNotePreviewContextValue>({
    notePreviewEventIds: new Set(),
  });
