import type { EditionId, PersistedState, StudyConfig, StudyLogsByDate } from '../types/study';

const STORAGE_KEYS = {
  config: 'm_buddy_config_v1',
  haptic: 'm_buddy_haptic_v1',
  logs: 'm_buddy_logs_v1',
} as const;

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(value);
}

function isValidEdition(value: unknown): value is EditionId {
  return value === '6' || value === '8';
}

export function readHapticEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.haptic);
    if (raw === null) {
      return true;
    }
    return raw === 'true';
  } catch {
    return true;
  }
}

export function saveHapticEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.haptic, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage quota or private mode failures
  }
}

export function readConfig(): StudyConfig | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StudyConfig>;
    if (
      isValidEdition(parsed.edition) &&
      typeof parsed.initialTargetDays === 'number' &&
      Number.isFinite(parsed.initialTargetDays) &&
      parsed.initialTargetDays >= 1 &&
      isValidDateString(parsed.targetStartDate)
    ) {
      return {
        edition: parsed.edition,
        initialTargetDays: Math.floor(parsed.initialTargetDays),
        targetStartDate: parsed.targetStartDate,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveConfig(config: StudyConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

export function readLogs(): StudyLogsByDate {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.logs);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    const sanitized: StudyLogsByDate = {};
    for (const [dateKey, entries] of Object.entries(parsed as Record<string, unknown>)) {
      if (!isValidDateString(dateKey) || !entries || typeof entries !== 'object') {
        continue;
      }
      const subjectMap: Record<string, number> = {};
      for (const [subjectId, mins] of Object.entries(entries as Record<string, unknown>)) {
        if (typeof mins === 'number' && Number.isFinite(mins) && mins > 0) {
          subjectMap[subjectId] = Math.round(mins);
        }
      }
      if (Object.keys(subjectMap).length > 0) {
        sanitized[dateKey] = subjectMap;
      }
    }
    return sanitized;
  } catch {
    return {};
  }
}

export function saveLogs(logs: StudyLogsByDate): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
  } catch {
    // Ignore storage errors
  }
}

export function loadPersistedState(): PersistedState {
  return {
    config: readConfig(),
    hapticEnabled: readHapticEnabled(),
    logs: readLogs(),
  };
}
