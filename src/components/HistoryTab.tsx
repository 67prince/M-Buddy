import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import type { EditionId, StudyLogsByDate } from '../types/study';
import { SUBJECTS_BY_EDITION } from '../data/subjects';
import {
  addCalendarDays,
  DAY_NAMES,
  formatDateHeading,
  formatDuration,
  formatMonthYear,
  getMonthCalendarGrid,
  getWeekCapsules,
  MONTH_NAMES,
  parseCalendarDate,
} from '../utils/date';
import { triggerHaptic } from '../utils/haptics';

interface HistoryTabProps {
  edition: EditionId;
  todayDateStr: string;
  logs: StudyLogsByDate;
  onAddLogForDate: (dateStr: string, subjectId: string, minutesToAdd: number) => void;
  onDeleteLogEntry: (dateStr: string, subjectId: string) => void;
}

export function HistoryTab({
  edition,
  todayDateStr,
  logs,
  onAddLogForDate,
  onDeleteLogEntry,
}: HistoryTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [weekAnchorDate, setWeekAnchorDate] = useState<string>(todayDateStr);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerYear, setPickerYear] = useState<number>(() => parseCalendarDate(todayDateStr).year);
  const [pickerMonth, setPickerMonth] = useState<number>(
    () => parseCalendarDate(todayDateStr).month
  );

  const [showAddLogModal, setShowAddLogModal] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [minutesInput, setMinutesInput] = useState<string>('');

  const subjects = SUBJECTS_BY_EDITION[edition];
  const weekCapsules = getWeekCapsules(weekAnchorDate);
  const monthYearLabel = formatMonthYear(weekAnchorDate);

  const dayLogs = logs[selectedDate] ?? {};
  const loggedSubjects = subjects
    .filter((subject) => (dayLogs[subject.id] ?? 0) > 0)
    .map((subject) => ({
      subject,
      minutes: dayLogs[subject.id],
    }));

  const monthGridCells = getMonthCalendarGrid(pickerYear, pickerMonth);

  const handlePrevWeek = () => {
    triggerHaptic();
    const nextAnchor = addCalendarDays(weekAnchorDate, -7);
    setWeekAnchorDate(nextAnchor);
    setSelectedDate(nextAnchor);
  };

  const handleNextWeek = () => {
    triggerHaptic();
    const nextAnchor = addCalendarDays(weekAnchorDate, 7);
    setWeekAnchorDate(nextAnchor);
    setSelectedDate(nextAnchor);
  };

  const handleJumpToday = () => {
    triggerHaptic();
    setWeekAnchorDate(todayDateStr);
    setSelectedDate(todayDateStr);
  };

  const handleSelectDate = (dateStr: string) => {
    triggerHaptic();
    setSelectedDate(dateStr);
  };

  const handleOpenDatePicker = () => {
    triggerHaptic();
    const parsed = parseCalendarDate(selectedDate);
    setPickerYear(parsed.year);
    setPickerMonth(parsed.month);
    setShowDatePicker(true);
  };

  const handlePrevPickerMonth = () => {
    triggerHaptic();
    if (pickerMonth === 1) {
      setPickerMonth(12);
      setPickerYear((y) => y - 1);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const handleNextPickerMonth = () => {
    triggerHaptic();
    if (pickerMonth === 12) {
      setPickerMonth(1);
      setPickerYear((y) => y + 1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const handlePickDate = (dateStr: string) => {
    triggerHaptic();
    setSelectedDate(dateStr);
    setWeekAnchorDate(dateStr);
    setShowDatePicker(false);
  };

  const handleOpenAddLog = () => {
    triggerHaptic();
    setSelectedSubjectId(subjects[0]?.id ?? '');
    setMinutesInput('');
    setShowAddLogModal(true);
  };

  const totalMinutesToAdd = Math.max(0, Number.parseInt(minutesInput || '0', 10) || 0);
  const canSaveLog = Boolean(selectedSubjectId) && totalMinutesToAdd > 0;

  const handleSaveBackwardLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSaveLog) {
      return;
    }
    triggerHaptic();
    onAddLogForDate(selectedDate, selectedSubjectId, totalMinutesToAdd);
    setShowAddLogModal(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Horizontal Capsule Calendar Strip */}
      <section
        aria-label="Calendar"
        className="bg-[#141417] rounded-[24px] border border-[#26262A] p-4 sm:p-5 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleOpenDatePicker}
            className="min-h-[44px] px-4 rounded-full bg-[#222228] text-sm font-semibold text-[#F5F5F7] whitespace-nowrap shrink-0 hover:bg-[#2C2C34] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
          >
            {monthYearLabel}
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center hover:bg-[#2C2C34] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Next week"
              className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center hover:bg-[#2C2C34] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleJumpToday}
              className="min-h-[44px] px-4 rounded-full bg-[#222228] text-sm font-semibold text-[#F5F5F7] whitespace-nowrap shrink-0 hover:bg-[#2C2C34] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {weekCapsules.map((capsule) => {
            const isSelected = capsule.dateStr === selectedDate;
            return (
              <button
                key={capsule.dateStr}
                type="button"
                onClick={() => handleSelectDate(capsule.dateStr)}
                aria-pressed={isSelected}
                className={`min-h-[76px] rounded-[20px] py-2.5 px-1 flex flex-col items-center justify-between gap-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                  isSelected
                    ? 'bg-[#141417] border-2 border-[#F5B0C2]'
                    : 'bg-[#141417] border border-[#26262A] hover:border-[#3A3A42]'
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isSelected ? 'text-[#F5B0C2]' : 'text-[#A1A1AA]'
                  }`}
                >
                  {capsule.dayName}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm tabular-nums ${
                    isSelected
                      ? 'bg-[#F5B0C2] text-[#121215] font-bold'
                      : 'text-[#F5F5F7] font-semibold'
                  }`}
                >
                  {capsule.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Log History */}
      <section aria-label="Daily logs" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-bold text-[#F5F5F7]">
            {formatDateHeading(selectedDate)}
          </h2>
          <button
            type="button"
            onClick={handleOpenAddLog}
            className="min-h-[44px] px-4 rounded-full bg-[#F5B0C2] text-[#121215] text-sm font-bold flex items-center gap-1.5 shrink-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add log</span>
          </button>
        </div>

        {loggedSubjects.length === 0 ? (
          <div className="bg-[#141417] rounded-[24px] border border-[#26262A] px-5 py-10 flex items-center justify-center">
            <h3 className="text-base font-semibold text-[#A1A1AA]">No logs</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loggedSubjects.map(({ subject, minutes }) => (
              <div
                key={subject.id}
                className="bg-[#141417] rounded-[24px] border border-[#26262A] px-5 py-3.5 min-h-[60px] flex items-center justify-between gap-3"
              >
                <span className="text-base font-semibold text-[#F5F5F7] leading-snug break-words">
                  {subject.name}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-base font-bold tabular-nums text-[#F5B0C2]">
                    {formatDuration(minutes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onDeleteLogEntry(selectedDate, subject.id);
                    }}
                    aria-label={`Remove ${subject.name}`}
                    className="w-11 h-11 rounded-full text-[#8E8E93] hover:text-[#F5F5F7] hover:bg-[#222228] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full Date Calendar Picker Modal */}
      {showDatePicker && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/85 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select date"
          onClick={() => {
            triggerHaptic();
            setShowDatePicker(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#141417] rounded-t-[24px] sm:rounded-[24px] border border-[#26262A] p-6 pb-8 sm:pb-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPickerMonth}
                  aria-label="Previous month"
                  className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center hover:bg-[#2C2C34]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-base font-bold text-[#F5F5F7] px-1 whitespace-nowrap">
                  {MONTH_NAMES[pickerMonth - 1]} {pickerYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextPickerMonth}
                  aria-label="Next month"
                  className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center hover:bg-[#2C2C34]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setShowDatePicker(false);
                }}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center shrink-0 hover:bg-[#2E2E36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_NAMES.map((dayName) => (
                <span key={dayName} className="text-xs font-medium text-[#A1A1AA] py-1">
                  {dayName}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthGridCells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="min-h-[44px]" />;
                }
                const isSelected = cell.dateStr === selectedDate;
                const isToday = cell.dateStr === todayDateStr;
                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => handlePickDate(cell.dateStr)}
                    className={`min-h-[44px] rounded-full text-sm tabular-nums flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                      isSelected
                        ? 'bg-[#F5B0C2] text-[#121215] font-bold'
                        : isToday
                          ? 'border border-[#F5B0C2] text-[#F5F5F7] font-semibold hover:bg-[#222228]'
                          : 'text-[#F5F5F7] font-medium hover:bg-[#222228]'
                    }`}
                  >
                    {cell.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Backward Log Modal */}
      {showAddLogModal && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/85 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-add-log-title"
          onClick={() => {
            triggerHaptic();
            setShowAddLogModal(false);
          }}
        >
          <form
            onSubmit={handleSaveBackwardLog}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[88vh] bg-[#141417] rounded-t-[24px] sm:rounded-[24px] border border-[#26262A] p-6 pb-8 sm:pb-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-4 shrink-0">
              <div className="flex flex-col gap-1">
                <h2 id="history-add-log-title" className="text-xl font-bold text-[#F5F5F7]">
                  Add log
                </h2>
                <span className="text-xs font-medium tabular-nums text-[#A1A1AA]">
                  {selectedDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setShowAddLogModal(false);
                }}
                aria-label="Close"
                className="w-11 h-11 rounded-full bg-[#222228] text-[#F5F5F7] flex items-center justify-center shrink-0 hover:bg-[#2E2E36]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 min-h-0">
              <span className="text-sm font-semibold text-[#F5F5F7]">Subject</span>
              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2 pr-1">
                {subjects.map((subject) => {
                  const isActive = subject.id === selectedSubjectId;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic();
                        setSelectedSubjectId(subject.id);
                      }}
                      className={`min-h-[46px] w-full rounded-[16px] px-4 py-2.5 text-left text-sm font-semibold break-words transition-colors ${
                        isActive
                          ? 'bg-[#F5B0C2] text-[#121215]'
                          : 'bg-[#222228] text-[#F5F5F7] hover:bg-[#2C2C34]'
                      }`}
                    >
                      {subject.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <label htmlFor="history-log-minutes" className="text-sm font-semibold text-[#F5F5F7]">
                Minutes
              </label>
              <input
                id="history-log-minutes"
                type="number"
                inputMode="numeric"
                min={1}
                max={1440}
                value={minutesInput}
                onChange={(e) => setMinutesInput(e.target.value)}
                placeholder="0"
                className="w-full min-h-[52px] rounded-[16px] bg-[#222228] px-4 text-xl font-semibold tabular-nums text-[#F5F5F7] placeholder:text-[#6E6E77] focus:outline-none focus:ring-2 focus:ring-[#F5B0C2]"
              />
            </div>

            <button
              type="submit"
              disabled={!canSaveLog}
              className={`w-full min-h-[52px] rounded-[20px] font-bold text-base shrink-0 transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B0C2] ${
                canSaveLog
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
