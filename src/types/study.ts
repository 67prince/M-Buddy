export type EditionId = '6' | '8';

export type TabId = 'log' | 'history' | 'settings';

export interface Subject {
  id: string;
  name: string;
  hours: number;
  minutes: number;
}

/**
 * Map of calendar date string ("YYYY/MM/DD") -> Map of subjectId -> logged minutes.
 * Stores date-only keys with zero timestamps.
 */
export type StudyLogsByDate = Record<string, Record<string, number>>;

export interface StudyConfig {
  edition: EditionId;
  initialTargetDays: number;
  targetStartDate: string; // "YYYY/MM/DD"
}

export interface PersistedState {
  config: StudyConfig | null;
  hapticEnabled: boolean;
  logs: StudyLogsByDate;
}
