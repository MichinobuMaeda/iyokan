import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { templateFromDoc } from "./Template";

describe("Template types", () => {
  describe("templateFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = templateFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Template from valid document", () => {
      const mockData = {
        name: "test-template",
        title: "Test Template",
        message: "This is a test message",
        link: "https://example.com",
        feed: "test-feed",
        category: "test-category",
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "template-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = templateFromDoc(mockDoc);
      expect(result).toEqual({
        id: "template-123",
        name: "test-template",
        title: "Test Template",
        message: "This is a test message",
        link: "https://example.com",
        feed: "test-feed",
        category: "test-category",
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "template-456",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = templateFromDoc(mockDoc);
      expect(result).toEqual({
        id: "template-456",
        name: "",
        title: "",
        message: "",
        link: "",
        feed: "",
        category: "",
        valid: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle partial data with some fields missing", () => {
      const mockData = {
        name: "partial-template",
        title: "Partial Template",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "template-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = templateFromDoc(mockDoc);
      expect(result).toEqual({
        id: "template-789",
        name: "partial-template",
        title: "Partial Template",
        message: "",
        link: "",
        feed: "",
        category: "",
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
