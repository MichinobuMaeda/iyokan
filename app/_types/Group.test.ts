import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { groupFromDoc } from "./Group";

describe("Group types", () => {
  describe("groupFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = groupFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Group from valid document", () => {
      const mockData = {
        name: "Test Group",
        members: [],
        valid: true,
        createdAt: { toDate: () => new Date("2024-01-01") },
        updatedAt: { toDate: () => new Date("2024-01-02") },
      };

      const mockDoc = {
        exists: () => true,
        id: "user-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = groupFromDoc(mockDoc);
      expect(result).toEqual({
        id: "user-123",
        name: "Test Group",
        members: [],
        valid: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "user-456",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = groupFromDoc(mockDoc);
      expect(result).toEqual({
        id: "user-456",
        name: "",
        members: [],
        valid: false,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
});
