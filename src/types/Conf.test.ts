import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { confFromDoc } from "./Conf";

describe("Conf types", () => {
  describe("confFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Conf from valid document", () => {
      const mockData = {
        webUrl: "https://example.com",
        desc: "Description text",
        hardBreak: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "conf",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toEqual({
        id: "conf",
        webUrl: "https://example.com",
        desc: "Description text",
        hardBreak: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "conf-123",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toEqual({
        id: "conf-123",
        webUrl: "",
        desc: undefined,
        hardBreak: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle partial data with some fields missing", () => {
      const mockData = {
        webUrl: "https://test.com",
      };

      const mockDoc = {
        exists: () => true,
        id: "conf-456",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toEqual({
        id: "conf-456",
        webUrl: "https://test.com",
        desc: undefined,
        hardBreak: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle string desc", () => {
      const mockData = {
        webUrl: "https://site.com",
        desc: "Some description",
      };

      const mockDoc = {
        exists: () => true,
        id: "conf-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toEqual({
        id: "conf-789",
        webUrl: "https://site.com",
        desc: "Some description",
        hardBreak: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle hardBreak field", () => {
      const mockData = {
        webUrl: "https://example.com",
        hardBreak: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "conf-with-break",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = confFromDoc(mockDoc);
      expect(result).toEqual({
        id: "conf-with-break",
        webUrl: "https://example.com",
        desc: undefined,
        hardBreak: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
