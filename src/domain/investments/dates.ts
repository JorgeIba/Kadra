import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
} from "date-fns"

const CALENDAR_DATE_FORMAT = "yyyy-MM-dd"
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const CALENDAR_DATE_FORMAT_LABEL = "YYYY-MM-DD"

export function getDaysBetween(startDate: string, endDate: string): number {
  return Math.max(
    0,
    differenceInCalendarDays(
      parseCalendarDate(endDate),
      parseCalendarDate(startDate),
    ),
  )
}

export function compareCalendarDatesAscending(
  leftDate: string,
  rightDate: string,
): number {
  return differenceInCalendarDays(
    parseCalendarDate(leftDate),
    parseCalendarDate(rightDate),
  )
}

export function addCalendarDays(date: Date, days: number): string {
  return toDateString(addDays(date, days))
}

export function isCalendarDateWithinRange(
  date: string,
  startDate?: string | null,
  endDate?: string,
): boolean {
  if (
    startDate !== undefined &&
    startDate !== null &&
    compareCalendarDatesAscending(startDate, date) > 0
  ) {
    return false
  }

  if (endDate === undefined) {
    return true
  }

  return compareCalendarDatesAscending(date, endDate) < 0
}

export function getDaysActive(
  startDate: string,
  asOfDate = new Date(),
): number {
  return getDaysBetween(startDate, toDateString(asOfDate))
}

export function isOnOrAfterDate(date: Date, calendarDate: string): boolean {
  return differenceInCalendarDays(date, parseCalendarDate(calendarDate)) >= 0
}

export function isCalendarDateString(date: string): boolean {
  if (!CALENDAR_DATE_PATTERN.test(date)) {
    return false
  }

  const parsedDate = parseCalendarDate(date)

  return isValid(parsedDate) && toDateString(parsedDate) === date
}

export function parseCalendarDate(date: string): Date {
  return parseISO(date)
}

export function toDateString(date: Date): string {
  return format(date, CALENDAR_DATE_FORMAT)
}
