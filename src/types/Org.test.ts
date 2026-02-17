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
        presetTimes: [],
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
        desc: "",
        hardBreak: false,
        valid: false,
        presetTimes: [],
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
        desc: "",
        hardBreak: true,
        valid: true,
        presetTimes: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle presetTimes field", () => {
      const mockData = {
        name: "Test Org",
        valid: true,
        presetTimes: ["09:00", "12:00", "18:00"],
      };

      const mockDoc = {
        exists: () => true,
        id: "org-with-preset",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-with-preset",
        name: "Test Org",
        desc: "",
        hardBreak: false,
        valid: true,
        presetTimes: ["09:00", "12:00", "18:00"],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle all optional fields being present", () => {
      const mockData = {
        name: "Complete Organization",
        desc: "Full description",
        hardBreak: true,
        valid: true,
        presetTimes: ["10:00", "14:00", "20:00"],
        createdAt: { toDate: () => new Date("2024-02-01") },
        updatedAt: { toDate: () => new Date("2024-02-15") },
      };

      const mockDoc = {
        exists: () => true,
        id: "complete-org",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "complete-org",
        name: "Complete Organization",
        desc: "Full description",
        hardBreak: true,
        valid: true,
        presetTimes: ["10:00", "14:00", "20:00"],
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-15"),
      });
    });

    it("should handle hardBreak as false when not provided", () => {
      const mockData = {
        name: "Test Org",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-no-break",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-no-break",
        name: "Test Org",
        desc: "",
        hardBreak: false,
        valid: true,
        presetTimes: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle hardBreak as false when explicitly set to false", () => {
      const mockData = {
        name: "Test Org",
        hardBreak: false,
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-no-break-explicit",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-no-break-explicit",
        name: "Test Org",
        desc: "",
        hardBreak: false,
        valid: true,
        presetTimes: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle partial data with only required fields", () => {
      const mockData = {
        name: "Minimal Org",
        valid: false,
      };

      const mockDoc = {
        exists: () => true,
        id: "minimal-org",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "minimal-org",
        name: "Minimal Org",
        desc: "",
        hardBreak: false,
        valid: false,
        presetTimes: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should coerce truthy values to boolean for valid field", () => {
      const mockData = {
        name: "Test Org",
        valid: 1,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-truthy-valid",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.valid).toBe(true);
      }
    });

    it("should coerce truthy values to boolean for hardBreak field", () => {
      const mockData = {
        name: "Test Org",
        valid: true,
        hardBreak: 1,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-truthy-hardbreak",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.hardBreak).toBe(true);
      }
    });

    it("should handle empty string for desc explicitly", () => {
      const mockData = {
        name: "Test Org",
        desc: "",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-empty-desc",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).toEqual({
        id: "org-empty-desc",
        name: "Test Org",
        desc: "",
        hardBreak: false,
        valid: true,
        presetTimes: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle empty presetTimes array explicitly", () => {
      const mockData = {
        name: "Test Org",
        valid: true,
        presetTimes: [],
      };

      const mockDoc = {
        exists: () => true,
        id: "org-empty-preset",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.presetTimes).toEqual([]);
        expect(result.presetTimes).toHaveLength(0);
      }
    });

    it("should handle null values for timestamp fields", () => {
      const mockData = {
        name: "Test Org",
        valid: true,
        createdAt: null,
        updatedAt: null,
      };

      const mockDoc = {
        exists: () => true,
        id: "org-null-timestamps",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = orgFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.createdAt).toBeUndefined();
        expect(result.updatedAt).toBeUndefined();
      }
    });
  });
});
