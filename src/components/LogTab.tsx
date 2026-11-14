import { useState } from 'react';
import { X } from 'lucide-react';
import type { EditionId, Subject, StudyLogsByDate } from '../types/study';
import { getEditionTotals, SUBJECTS_BY_EDITION } from '../data/subjects';
import { diffCalendarDays } from '../utils/date';
import { triggerHaptic } from '../utils/haptics';

interface LogTabProps {
  edition: EditionId;
  todayDateStr: string;
  targetStartDate: string;
  remainingTargetDays: number;
  logs: StudyLogsByDate;
  onAddStudyTime: (subjectId: string, minutesToAdd: number) => void;
}

export function LogTab({
  edition,
  todayDateStr,
  targetStartDate,
  remainingTargetDays,
  logs,
  onAddStudyTime,
}: LogTabProps) {
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [minutesInput, setMinutesInput] = useState<string>('');

  const subjects = SUBJECTS_BY_EDITION[edition];
  const { totalMinutes: totalEditionMinutes, totalHours: totalEditionHours } =
    getEditionTotals(edition);

  // Sum completed minutes per subject across all logged calendar dates
  const completedBySubject: Record<string, number> = {};
  for (const dayEntries of Object.values(logs)) {
    for (const [subjectId, mins] of Object.entries(dayEntries)) {
      completedBySubject[subjectId] = (completedBySubject[subjectId] ?? 0) + mins;
    }
  }

  const totalCompletedMinutes = subjects.reduce(
    (sum, subject) => sum + (completedBySubject[subject.id] ?? 0),
    0
  );
  const totalCompletedHours = (totalCompletedMinutes / 60).toFixed(1);

  const overallPercent =
    totalEditionMinutes > 0
      ? totalCompletedMinutes >= totalEditionMinutes
        ? 100
        : Math.min(99, Math.round((totalCompletedMinutes / totalEditionMinutes) * 100))
      : 0;

  const progressWidthPercent =
    totalEditionMinutes > 0
      ? Math.min(100, (totalCompletedMinutes / totalEditionMinutes) * 100)
      : 0;

  const remainingMinutes = Math.max(0, totalEditionMinutes - totalCompletedMinutes);
  let paceStartDate = targetStartDate;
  for (const [dateStr, entries] of Object.entries(logs)) {
    const hasMinutes = Object.values(entries).some((mins) => mins > 0);
    if (hasMinutes && diffCalendarDays(dateStr, paceStartDate) > 0) {
      paceStartDate = dateStr;
    }
  }
  const daysSinceStart = Math.max(1, diffCalendarDays(paceStartDate, todayDateStr) + 1);
  const actualDailyPaceMinutes = totalCompletedMinutes / daysSinceStart;

  let completionInLabel = '--';
  let isWithinTarget = false;

  if (remainingMinutes === 0) {
    completionInLabel = '0 days';
    isWithinTarget = true;
  } else if (actualDailyPaceMinutes > 0) {
    const completionInDays = Math.ceil(remainingMinutes / actualDailyPaceMinutes);
    completionInLabel = `${completionInDays} ${completionInDays === 1 ? 'day' : 'days'}`;
    isWithinTarget = completionInDays <= remainingTargetDays;
  }

  const openModal = (subject: Subject) => {
    triggerHaptic();
    setActiveSubject(subject);
    setMinutesInput('');
  };

  const closeModal = () => {
    triggerHaptic();
    setActiveSubject(null);
  };

  const totalMinutesToAdd = Math.max(0, Number.parseInt(minutesInput || '0', 10) || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || totalMinutesToAdd <= 0) {
      return;
    }
    triggerHaptic();
    onAddStudyTime(activeSubject.id, totalMinutesToAdd);
    setActiveSubject(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Marrow Summary Card */}
      <section
        aria-label="Marrow"
        className="bg-[#141417] rounded-[24px] border border-[#26262A] p-5 sm:p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-[#F5F5F7]">Marrow</h1>
          <span className="bg-[#222228] text-[#F5F5F7] text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
            Edition {edition}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-3xl font-bold tabular-nums text-[#F5B0C2]">
              {overallPercent}%
            </span>
            <span className="text-sm font-medium tabular-nums text-[#A1A1AA]">
              {totalCompletedHours}h / {totalEditionHours.toFixed(1)}h
            </span>
          </div>

          <div
            className="h-3 w-full rounded-full bg-[#222228] overflow-hidden"
            role="progressbar"
            aria-valuenow={overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#F5B0C2] transition-all duration-200"
              style={{ width: `${progressWidthPercent}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[#26262A] pt-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-[#A1A1AA]">Completion In</span>
          <span
            className={`text-xl font-bold tabular-nums ${
              isWithinTarget ? 'text-[#F5B0C2]' : 'text-[#F87171]'
            }`}
          >
            {completionInLabel}
          </span>
        </div>
      </section>

      {/* 19 Subjects Grid */}
      <section aria-label="Subjects" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map((subject) => {
          const subjectCompleted = completedBySubject[subject.id] ?? 0;
          const pct =
            subjectCompleted >= subject.minutes
              ? 100
              : subjectCompleted <= 0
                ? 0
                : Math.min(99, Math.round((subjectCompleted / subject.minutes) * 100));

          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => openModal(subject)}
              className="bg-[#141417] rounded-[24px] border border-[#26262A] px-5 py-4 min-h-[60px] w-full flex items-center justify-between gap-4 text-left transition-colors duration-150 hover:border-[#3A3A42] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
            >
              <span className="text-base font-semibold text-[#F5F5F7] leading-snug break-words">
                {subject.name}
              </span>
              <span
                className={`text-base font-bold tabular-nums shrink-0 ${
                  pct === 100
                    ? 'text-[#F5B0C2]'
                    : pct > 0
                      ? 'text-[#F5F5F7]'
                      : 'text-[#A1A1AA]'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </section>

      {/* Log Study Time Modal / Bottom Sheet */}
      {activeSubject && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/85 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-subject-title"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141417] rounded-t-[24px] sm:rounded-[24px] border border-[#26262A] p-6 pb-8 sm:pb-6 flex flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2
                  id="log-subject-title"
                  className="text-xl font-bold text-[#F5F5F7] leading-snug break-words"
                >
                  {activeSubject.name}
                </h2>
                <span className="text-xs font-medium tabular-nums text-[#A1A1AA]">
                  {todayDateStr}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center shrink-0 hover:bg-[#2E2E36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="log-minutes" className="text-sm font-semibold text-[#F5F5F7]">
                Minutes
              </label>
              <input
                id="log-minutes"
                type="number"
                inputMode="numeric"
                min={1}
                max={1440}
                autoFocus
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                placeholder="0"
                className="w-full min-h-[52px] rounded-[16px] bg-[#222228] px-4 text-xl font-semibold tabular-nums text-[#F5F5F7] placeholder:text-[#6E6E77] focus:outline-none focus:ring-2 focus:ring-[#F5B0C2]"
              />
            </div>

            <button
              type="submit"
              disabled={totalMinutesToAdd <= 0}
              className={`w-full min-h-[52px] rounded-[20px] font-bold text-base transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                totalMinutesToAdd > 0
                  ? 'bg-[#F5B0C2] text-[#121215]'
                  : 'bg-[#222228] text-[#6E6E77] cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
