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
        errors: [],
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
        errors: [],
        template: null,
        generator: null,
        createdBy: null,
        updatedBy: null,
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
        expect(result.errors).toEqual([]);
        expect(result.template).toBeNull();
        expect(result.generator).toBeNull();
        expect(result.createdBy).toBeNull();
        expect(result.updatedBy).toBeNull();
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
        errors: [],
        template: null,
        generator: null,
        createdBy: null,
        updatedBy: null,
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

    it("should handle errors field when present", () => {
      const mockErrors = [
        {
          provider: "twitter" as const,
          code: "AUTH_ERROR",
          message: "Authentication failed",
        },
        {
          provider: "facebook" as const,
          code: "RATE_LIMIT",
          message: "Rate limit exceeded",
        },
      ];

      const mockData = {
        schedule: { toDate: () => new Date("2024-05-01T10:00:00Z") },
        title: "Post with Errors",
        message: "This post has errors",
        link: "",
        files: [],
        providers: ["twitter", "facebook"],
        status: "paused",
        errors: mockErrors,
      };

      const mockDoc = {
        exists: () => true,
        id: "post-with-errors",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errors).toEqual(mockErrors);
        expect(result.errors).toHaveLength(2);
      }
    });

    it("should default to empty array when errors field is missing", () => {
      const mockData = {
        schedule: { toDate: () => new Date("2024-06-01T10:00:00Z") },
        title: "Post without Errors",
        message: "This post has no errors",
        link: "",
        files: [],
        providers: ["twitter"],
        status: "scheduled",
      };

      const mockDoc = {
        exists: () => true,
        id: "post-no-errors",
        data: () => mockData,
      } as unknown as DocumentSnapshot;

      const result = postFromDoc(mockDoc);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errors).toEqual([]);
      }
    });
  });
});
