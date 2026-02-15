import { describe, it, expect } from "vitest";
import { DocumentSnapshot } from "firebase/firestore";
import { postFromDoc } from "./Post";

describe("Post types", () => {
  describe("postFromDoc", () => {
    it("should return null for non-existent document", () => {
      const mockDoc = {
        exists: () => false,
        id: "test-id",
        data: () => undefined,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).toBeNull();
    });

    it("should create Post from valid document", () => {
      const mockData = {
        schedule: { toDate: () => new Date("2024-01-15T10:00:00Z") },
        title: "Test Post",
        message: "This is a test post message",
        link: "https://example.com/post",
        files: ["file1.jpg", "file2.png"],
        providers: ["provider1", "provider2"],
        status: "scheduled",
        createdAt: { toDate: () => new Date("2024-01-01T00:00:00Z") },
        updatedAt: { toDate: () => new Date("2024-01-02T00:00:00Z") },
      };

      const mockDoc = {
        exists: () => true,
        id: "post-123",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).toEqual({
        id: "post-123",
        schedule: new Date("2024-01-15T10:00:00Z"),
        title: "Test Post",
        message: "This is a test post message",
        link: "https://example.com/post",
        files: ["file1.jpg", "file2.png"],
        providers: ["provider1", "provider2"],
        status: "scheduled",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-02T00:00:00Z"),
      });
    });

    it("should use default values for missing fields", () => {
      const mockDoc = {
        exists: () => true,
        id: "post-456",
        data: () => ({}),
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe("post-456");
        expect(result.schedule).toBeInstanceOf(Date);
        expect(result.title).toBe("");
        expect(result.message).toBe("");
        expect(result.link).toBe("");
        expect(result.files).toEqual([]);
        expect(result.providers).toEqual([]);
        expect(result.status).toBe("paused");
        expect(result.createdAt).toBeUndefined();
        expect(result.updatedAt).toBeUndefined();
      }
    });

    it("should handle partial data with some fields missing", () => {
      const mockData = {
        schedule: { toDate: () => new Date("2024-02-01T12:00:00Z") },
        title: "Partial Post",
        createdAt: { toDate: () => new Date("2024-01-15T00:00:00Z") },
      };

      const mockDoc = {
        exists: () => true,
        id: "post-789",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).toEqual({
        id: "post-789",
        schedule: new Date("2024-02-01T12:00:00Z"),
        title: "Partial Post",
        message: "",
        link: "",
        files: [],
        providers: [],
        status: "paused",
        createdAt: new Date("2024-01-15T00:00:00Z"),
        updatedAt: undefined,
      });
    });

    it("should handle empty arrays for files and providers", () => {
      const mockData = {
        schedule: { toDate: () => new Date("2024-03-01T08:00:00Z") },
        title: "No Files Post",
        message: "Post without files or providers",
        link: "",
        files: [],
        providers: [],
      };

      const mockDoc = {
        exists: () => true,
        id: "post-empty-arrays",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.files).toEqual([]);
        expect(result.providers).toEqual([]);
        expect(result.files).toHaveLength(0);
        expect(result.providers).toHaveLength(0);
      }
    });

    it("should handle undefined createdAt and updatedAt", () => {
      const mockData = {
        schedule: { toDate: () => new Date("2024-04-01T10:00:00Z") },
        title: "No Timestamps",
        message: "Post without timestamps",
        link: "",
        files: [],
        providers: [],
        createdAt: undefined,
        updatedAt: undefined,
      };

      const mockDoc = {
        exists: () => true,
        id: "post-no-timestamps",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.createdAt).toBeUndefined();
        expect(result.updatedAt).toBeUndefined();
      }
    });
  });
});
