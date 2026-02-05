import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { orgFromDoc } from "./Org";

describe("Org types", () => {
  describe("orgFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Org from valid document", () => {
      const mockData = {
        name: "Test Organization",
        desc: "Test description",
        hardBreak: true,
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "org-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-123",
        name: "Test Organization",
        desc: "Test description",
        hardBreak: true,
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "org-456",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-456",
        name: "",
        desc: undefined,
        hardBreak: false,
        valid: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle hardBreak field", () => {
      const mockData = {
        name: "Test Org",
        hardBreak: true,
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-with-break",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-with-break",
        name: "Test Org",
        desc: undefined,
        hardBreak: true,
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
