import { describe, it, expect } from "vitest";
import { formatTimestamp, formatLong, formatShort } from "./formatter";

describe("formatter", () => {
  describe("formatTimestamp", () => {
    it("should format date as yyyy-MM-dd HH:mm:ss in Asia/Tokyo timezone", () => {
      // 2024-01-15 10:30:45 UTC -> 2024-01-15 19:30:45 JST (UTC+9)
      const date = new Date("2024-01-15T10:30:45Z");
      const result = formatTimestamp(date);
      expect(result).toBe("2024-01-15 19:30:45");
    });

    it("should handle midnight correctly", () => {
      // 2024-01-15 00:00:00 UTC -> 2024-01-15 09:00:00 JST
      const date = new Date("2024-01-15T00:00:00Z");
      const result = formatTimestamp(date);
      expect(result).toBe("2024-01-15 09:00:00");
    });

    it("should handle date crossing midnight", () => {
      // 2024-01-15 15:30:00 UTC -> 2024-01-16 00:30:00 JST
      const date = new Date("2024-01-15T15:30:00Z");
      const result = formatTimestamp(date);
      expect(result).toBe("2024-01-16 00:30:00");
    });

    it("should return empty string when date is undefined", () => {
      const result = formatTimestamp(undefined);
      expect(result).toBe("");
    });

    it("should return custom default value when date is undefined", () => {
      const result = formatTimestamp(undefined, "N/A");
      expect(result).toBe("N/A");
    });
  });

  describe("formatLong", () => {
    it("should format date as yyyy/MM/dd HH:mm in Asia/Tokyo timezone", () => {
      // 2024-01-15 10:30:45 UTC -> 2024-01-15 19:30 JST
      const date = new Date("2024-01-15T10:30:45Z");
      const result = formatLong(date);
      expect(result).toBe("2024/01/15 19:30");
    });

    it("should handle single digit month and day", () => {
      // 2024-03-05 10:30:00 UTC -> 2024-03-05 19:30 JST
      const date = new Date("2024-03-05T10:30:00Z");
      const result = formatLong(date);
      expect(result).toBe("2024/03/05 19:30");
    });

    it("should handle date crossing midnight", () => {
      // 2024-01-15 15:30:00 UTC -> 2024-01-16 00:30 JST
      const date = new Date("2024-01-15T15:30:00Z");
      const result = formatLong(date);
      expect(result).toBe("2024/01/16 00:30");
    });

    it("should return empty string when date is undefined", () => {
      const result = formatLong(undefined);
      expect(result).toBe("");
    });

    it("should return custom default value when date is undefined", () => {
      const result = formatLong(undefined, "-");
      expect(result).toBe("-");
    });
  });

  describe("formatShort", () => {
    it("should format date as yyyy/MM/dd in Asia/Tokyo timezone", () => {
      // 2024-01-15 10:30:45 UTC -> 2024-01-15 JST
      const date = new Date("2024-01-15T10:30:45Z");
      const result = formatShort(date);
      expect(result).toBe("2024/01/15");
    });

    it("should handle single digit month and day", () => {
      // 2024-03-05 10:30:00 UTC -> 2024-03-05 JST
      const date = new Date("2024-03-05T10:30:00Z");
      const result = formatShort(date);
      expect(result).toBe("2024/03/05");
    });

    it("should handle date crossing midnight", () => {
      // 2024-01-15 15:30:00 UTC -> 2024-01-16 JST
      const date = new Date("2024-01-15T15:30:00Z");
      const result = formatShort(date);
      expect(result).toBe("2024/01/16");
    });

    it("should ignore time component", () => {
      const date1 = new Date("2024-01-15T10:00:00Z");
      const date2 = new Date("2024-01-15T23:59:59Z");
      expect(formatShort(date1)).toBe("2024/01/15");
      expect(formatShort(date2)).toBe("2024/01/16");
    });

    it("should return empty string when date is undefined", () => {
      const result = formatShort(undefined);
      expect(result).toBe("");
    });

    it("should return custom default value when date is undefined", () => {
      const result = formatShort(undefined, "—");
      expect(result).toBe("—");
    });
  });
});
