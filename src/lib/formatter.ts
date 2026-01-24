import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Tokyo";

/**
 * Converts a date to the default timezone
 * @param date - Date to convert
 * @returns Date in default timezone
 */
function toDefaultTz(date: Date): Date {
  return toZonedTime(date, DEFAULT_TIMEZONE);
}

/**
 * Formats a date as timestamp: yyyy-MM-dd HH:mm:ss
 * @param date - Date to format
 * @param defaultValue - Value to return if date is not provided (default: "")
 * @returns Formatted date string or defaultValue
 */
export function formatTimestamp(date?: Date, defaultValue = ""): string {
  return date ? format(toDefaultTz(date), "yyyy-MM-dd HH:mm:ss") : defaultValue;
}

/**
 * Formats a date as long format: yyyy/MM/dd HH:mm
 * @param date - Date to format
 * @param defaultValue - Value to return if date is not provided (default: "")
 * @returns Formatted date string or defaultValue
 */
export function formatLong(date?: Date, defaultValue = ""): string {
  return date ? format(toDefaultTz(date), "yyyy/MM/dd HH:mm") : defaultValue;
}

/**
 * Formats a date as short format: yyyy/MM/dd
 * @param date - Date to format
 * @param defaultValue - Value to return if date is not provided (default: "")
 * @returns Formatted date string or defaultValue
 */
export function formatShort(date?: Date, defaultValue = ""): string {
  return date ? format(toDefaultTz(date), "yyyy/MM/dd") : defaultValue;
}
