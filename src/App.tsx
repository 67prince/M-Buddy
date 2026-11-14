import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HistoryTab } from './components/HistoryTab';
import { LogTab } from './components/LogTab';
import { SettingsTab } from './components/SettingsTab';
import { SetupScreen } from './components/SetupScreen';
import type { EditionId, StudyConfig, StudyLogsByDate, TabId } from './types/study';
import { diffCalendarDays, getTodayDateString } from './utils/date';
import {
  loadPersistedState,
  saveConfig,
  saveHapticEnabled,
  saveLogs,
} from './utils/storage';

export default function App() {
  const [initialState] = useState(() => loadPersistedState());
  const [config, setConfig] = useState<StudyConfig | null>(initialState.config);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(initialState.hapticEnabled);
  const [logs, setLogs] = useState<StudyLogsByDate>(initialState.logs);
  const [activeTab, setActiveTab] = useState<TabId>('log');
  const [todayDateStr, setTodayDateStr] = useState<string>(() => getTodayDateString());

  // Keep today's local calendar date synchronized across midnight and tab resumes
  useEffect(() => {
    const syncDate = () => {
      const current = getTodayDateString();
      setTodayDateStr((prev) => (prev === current ? prev : current));
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncDate();
      }
    };

    const intervalId = window.setInterval(syncDate, 30000);
    window.addEventListener('focus', syncDate);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', syncDate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (!config) {
    const handleSetupComplete = (edition: EditionId, targetDays: number) => {
      const today = getTodayDateString();
      const nextConfig: StudyConfig = {
        edition,
        initialTargetDays: targetDays,
        targetStartDate: today,
      };
      setTodayDateStr(today);
      setConfig(nextConfig);
      saveConfig(nextConfig);
    };

    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  const elapsedDays = Math.max(0, diffCalendarDays(config.targetStartDate, todayDateStr));
  const remainingTargetDays = Math.max(1, config.initialTargetDays - elapsedDays);

  const handleAddStudyTimeForDate = (
    dateStr: string,
    subjectId: string,
    minutesToAdd: number
  ) => {
    setLogs((prev) => {
      const existingDay = prev[dateStr] ?? {};
      const nextLogs: StudyLogsByDate = {
        ...prev,
        [dateStr]: {
          ...existingDay,
          [subjectId]: (existingDay[subjectId] ?? 0) + minutesToAdd,
        },
      };
      saveLogs(nextLogs);
      return nextLogs;
    });
  };

  const handleAddStudyTime = (subjectId: string, minutesToAdd: number) => {
    const today = getTodayDateString();
    setTodayDateStr(today);
    handleAddStudyTimeForDate(today, subjectId, minutesToAdd);
  };

  const handleDeleteLogEntry = (dateStr: string, subjectId: string) => {
    setLogs((prev) => {
      const dayEntries = prev[dateStr];
      if (!dayEntries || !(subjectId in dayEntries)) {
        return prev;
      }
      const nextDayEntries = { ...dayEntries };
      delete nextDayEntries[subjectId];

      const nextLogs = { ...prev };
      if (Object.keys(nextDayEntries).length === 0) {
        delete nextLogs[dateStr];
      } else {
        nextLogs[dateStr] = nextDayEntries;
      }
      saveLogs(nextLogs);
      return nextLogs;
    });
  };

  const handleUpdateTargetDays = (newTargetDays: number) => {
    const today = getTodayDateString();
    setTodayDateStr(today);
    const nextConfig: StudyConfig = {
      ...config,
      initialTargetDays: newTargetDays,
      targetStartDate: today,
    };
    setConfig(nextConfig);
    saveConfig(nextConfig);
  };

  const handleToggleHaptic = (nextEnabled: boolean) => {
    setHapticEnabled(nextEnabled);
    saveHapticEnabled(nextEnabled);
  };

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-[#F5F5F7] pt-safe">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)]">
        {activeTab === 'log' && (
          <LogTab
            edition={config.edition}
            todayDateStr={todayDateStr}
            targetStartDate={config.targetStartDate}
            remainingTargetDays={remainingTargetDays}
            logs={logs}
            onAddStudyTime={handleAddStudyTime}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            edition={config.edition}
            todayDateStr={todayDateStr}
            logs={logs}
            onAddLogForDate={handleAddStudyTimeForDate}
            onDeleteLogEntry={handleDeleteLogEntry}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            remainingTargetDays={remainingTargetDays}
            hapticEnabled={hapticEnabled}
            onUpdateTargetDays={handleUpdateTargetDays}
            onToggleHaptic={handleToggleHaptic}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
