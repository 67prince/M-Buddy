const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function formatCalendarDate(year: number, month: number, day: number): string {
  return `${year}/${pad2(month)}/${pad2(day)}`;
}

/**
 * Returns today's local calendar date formatted strictly as "YYYY/MM/DD".
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatCalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function parseCalendarDate(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    const fallback = new Date();
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      day: fallback.getDate(),
    };
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return { year, month, day };
}

/**
 * Exact calendar day difference between two "YYYY/MM/DD" dates using UTC midnight
 * so daylight saving time shifts never distort day counts.
 */
export function diffCalendarDays(startDateStr: string, endDateStr: string): number {
  const start = parseCalendarDate(startDateStr);
  const end = parseCalendarDate(endDateStr);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUtc - startUtc) / 86400000);
}

export function addCalendarDays(dateStr: string, deltaDays: number): string {
  const { year, month, day } = parseCalendarDate(dateStr);
  const date = new Date(year, month - 1, day + deltaDays);
  return formatCalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export interface WeekDayCapsule {
  dateStr: string;
  dayName: (typeof DAY_NAMES)[number];
  dayNumber: number;
}

/**
 * Returns the 7 calendar days (Sun through Sat) for the week containing anchorDateStr.
 */
export function getWeekCapsules(anchorDateStr: string): WeekDayCapsule[] {
  const { year, month, day } = parseCalendarDate(anchorDateStr);
  const anchor = new Date(year, month - 1, day);
  const dayOfWeek = anchor.getDay(); // 0 = Sun
  const sundayDate = new Date(year, month - 1, day - dayOfWeek);

  const capsules: WeekDayCapsule[] = [];
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(
      sundayDate.getFullYear(),
      sundayDate.getMonth(),
      sundayDate.getDate() + i
    );
    capsules.push({
      dateStr: formatCalendarDate(current.getFullYear(), current.getMonth() + 1, current.getDate()),
      dayName: DAY_NAMES[i],
      dayNumber: current.getDate(),
    });
  }
  return capsules;
}

export function formatMonthYear(dateStr: string): string {
  const { year, month } = parseCalendarDate(dateStr);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDateHeading(dateStr: string): string {
  const { year, month, day } = parseCalendarDate(dateStr);
  const date = new Date(year, month - 1, day);
  const dayName = DAY_NAMES[date.getDay()];
  return `${dayName}, ${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

export { DAY_NAMES, MONTH_NAMES };

export interface MonthCalendarCell {
  dateStr: string;
  dayNumber: number;
}

/**
 * Returns a 7-column aligned array for the given calendar year and 1-indexed month.
 * Leading empty slots are null.
 */
export function getMonthCalendarGrid(year: number, month: number): (MonthCalendarCell | null)[] {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (MonthCalendarCell | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      dateStr: formatCalendarDate(year, month, day),
      dayNumber: day,
    });
  }
  return cells;
}

export function formatDuration(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}
