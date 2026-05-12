import { differenceInCalendarDays, format, parseISO } from "date-fns"
import type { Investment } from "@/domain/investments/types"

const CALENDAR_DATE_FORMAT = "yyyy-MM-dd"

export function getDaysBetween(startDate: string, endDate: string): number {
  return Math.max(
    0,
    differenceInCalendarDays(
      parseCalendarDate(endDate),
      parseCalendarDate(startDate),
    ),
  )
}

export function getDaysActive(
  investment: Investment,
  asOfDate = new Date(),
): number {
  return getDaysBetween(investment.startDate, toDateString(asOfDate))
}

export function isOnOrAfterDate(date: Date, calendarDate: string): boolean {
  return differenceInCalendarDays(date, parseCalendarDate(calendarDate)) >= 0
}

export function parseCalendarDate(date: string): Date {
  return parseISO(date)
}

export function toDateString(date: Date): string {
  return format(date, CALENDAR_DATE_FORMAT)
}
