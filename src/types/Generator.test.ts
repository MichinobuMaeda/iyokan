import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { generatorFromDoc } from "./Generator";

describe("Generator types", () => {
  describe("generatorFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = generatorFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Generator from valid document", () => {
      const mockData = {
        name: "test-generator",
        source: "test-source",
        prompt: "This is a test prompt",
        providers: ["provider1", "provider2"],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "generator-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = generatorFromDoc(mockDoc);
      expect(result).toEqual({
        id: "generator-123",
        name: "test-generator",
        source: "test-source",
        prompt: "This is a test prompt",
        providers: ["provider1", "provider2"],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "generator-456",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = generatorFromDoc(mockDoc);
      expect(result).toEqual({
        id: "generator-456",
        name: "",
        source: "",
        prompt: "",
        providers: [],
        valid: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle partial data with some fields missing", () => {
      const mockData = {
        name: "partial-generator",
        source: "partial-source",
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "generator-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = generatorFromDoc(mockDoc);
      expect(result).toEqual({
        id: "generator-789",
        name: "partial-generator",
        source: "partial-source",
        prompt: "",
        providers: [],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it("should handle empty providers array", () => {
      const mockData = {
        name: "no-providers",
        source: "test-source",
        prompt: "test prompt",
        providers: [],
        valid: true,
      };

      const mockDoc = {
        exists: () => true,
        id: "generator-empty",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = generatorFromDoc(mockDoc);
      expect(result).toEqual({
        id: "generator-empty",
        name: "no-providers",
        source: "test-source",
        prompt: "test prompt",
        providers: [],
        valid: true,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
