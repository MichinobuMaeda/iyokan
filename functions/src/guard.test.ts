import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  guardAuth,
  guardAdmin,
  guardOrgUsers,
  guardOrgManager,
} from "./guard.js";

describe("guard", () => {
  describe("guardAuth", () => {
    it("should pass when user is authenticated", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      await expect(guardAuth(mockRequest as any)).resolves.toBeUndefined();
    });

    it("should throw error when auth is missing", async () => {
      const mockRequest = {};

      await expect(guardAuth(mockRequest as any)).rejects.toThrow(
        "unauthenticated"
      );
    });

    it("should throw error when uid is missing", async () => {
      const mockRequest = {
        auth: {},
      };

      await expect(guardAuth(mockRequest as any)).rejects.toThrow(
        "unauthenticated"
      );
    });
  });

  describe("guardAdmin", () => {
    let mockFirestore: any;

    beforeEach(() => {
      mockFirestore = {
        collection: vi.fn(),
      };
    });

    it("should pass when user is a valid admin", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
      };

      const mockDocData = { valid: true };
      const mockDoc = {
        exists: true,
        data: () => mockDocData,
      };

      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: vi.fn().mockReturnValue(mockDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockCollection);

      await expect(
        guardAdmin(mockFirestore, mockRequest as any)
      ).resolves.toBeUndefined();

      expect(mockFirestore.collection).toHaveBeenCalledWith("admins");
      expect(mockCollection.doc).toHaveBeenCalledWith("admin123");
    });

    it("should throw error when user is not authenticated", async () => {
      const mockRequest = {};

      await expect(
        guardAdmin(mockFirestore, mockRequest as any)
      ).rejects.toThrow("unauthenticated");
    });

    it("should throw error when admin document does not exist", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
      };

      const mockDoc = {
        exists: false,
      };

      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: vi.fn().mockReturnValue(mockDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockCollection);

      await expect(
        guardAdmin(mockFirestore, mockRequest as any)
      ).rejects.toThrow("unknown user");
    });

    it("should throw error when admin is not valid", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
      };

      const mockDocData = { valid: false };
      const mockDoc = {
        exists: true,
        data: () => mockDocData,
      };

      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: vi.fn().mockReturnValue(mockDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockCollection);

      await expect(
        guardAdmin(mockFirestore, mockRequest as any)
      ).rejects.toThrow("forbidden");
    });

    it("should throw error when admin data has no valid field", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
      };

      const mockDoc = {
        exists: true,
        data: () => ({}),
      };

      const mockDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockCollection = {
        doc: vi.fn().mockReturnValue(mockDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockCollection);

      await expect(
        guardAdmin(mockFirestore, mockRequest as any)
      ).rejects.toThrow("forbidden");
    });
  });

  describe("guardOrgUsers", () => {
    let mockFirestore: any;

    beforeEach(() => {
      mockFirestore = {
        collection: vi.fn(),
      };
    });

    it("should pass when user is a valid org user", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockDocData = { valid: true };
      const mockDoc = {
        exists: true,
        data: () => mockDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgUsers(mockFirestore, mockRequest as any, "org123")
      ).resolves.toBeUndefined();

      expect(mockFirestore.collection).toHaveBeenCalledWith("orgs");
      expect(mockOrgsCollection.doc).toHaveBeenCalledWith("org123");
      expect(mockOrgDocRef.collection).toHaveBeenCalledWith("users");
      expect(mockUsersCollection.doc).toHaveBeenCalledWith("user123");
    });

    it("should throw error when user is not authenticated", async () => {
      const mockRequest = {};

      await expect(
        guardOrgUsers(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("unauthenticated");
    });

    it("should throw error when user document does not exist", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockDoc = {
        exists: false,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgUsers(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("unknown user");
    });

    it("should throw error when user is not valid", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockDocData = { valid: false };
      const mockDoc = {
        exists: true,
        data: () => mockDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgUsers(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("invalid user");
    });

    it("should throw error when user data has no valid field", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockDoc = {
        exists: true,
        data: () => ({}),
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgUsers(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("invalid user");
    });
  });

  describe("guardOrgManager", () => {
    let mockFirestore: any;

    beforeEach(() => {
      mockFirestore = {
        collection: vi.fn(),
      };
    });

    it("should pass when user is a valid org manager", async () => {
      const mockRequest = {
        auth: {
          uid: "manager123",
        },
      };

      const mockUserDocData = { valid: true };
      const mockUserDoc = {
        exists: true,
        data: () => mockUserDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockUserDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockManagerDocData = { members: ["manager123", "other-user"] };
      const mockManagerDoc = {
        exists: true,
        data: () => mockManagerDocData,
      };

      const mockManagerDocRef = {
        get: vi.fn().mockResolvedValue(mockManagerDoc),
      };

      const mockGroupsCollection = {
        doc: vi.fn().mockReturnValue(mockManagerDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return null;
        }),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgManager(mockFirestore, mockRequest as any, "org123")
      ).resolves.toBeUndefined();

      expect(mockGroupsCollection.doc).toHaveBeenCalledWith("managers");
    });

    it("should throw error when user is not authenticated", async () => {
      const mockRequest = {};

      await expect(
        guardOrgManager(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("unauthenticated");
    });

    it("should throw error when managers group does not exist", async () => {
      const mockRequest = {
        auth: {
          uid: "manager123",
        },
      };

      const mockUserDocData = { valid: true };
      const mockUserDoc = {
        exists: true,
        data: () => mockUserDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockUserDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockManagerDoc = {
        exists: false,
      };

      const mockManagerDocRef = {
        get: vi.fn().mockResolvedValue(mockManagerDoc),
      };

      const mockGroupsCollection = {
        doc: vi.fn().mockReturnValue(mockManagerDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return null;
        }),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgManager(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("unknown state");
    });

    it("should throw error when user is not in managers group", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockUserDocData = { valid: true };
      const mockUserDoc = {
        exists: true,
        data: () => mockUserDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockUserDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockManagerDocData = { members: ["manager123", "other-user"] };
      const mockManagerDoc = {
        exists: true,
        data: () => mockManagerDocData,
      };

      const mockManagerDocRef = {
        get: vi.fn().mockResolvedValue(mockManagerDoc),
      };

      const mockGroupsCollection = {
        doc: vi.fn().mockReturnValue(mockManagerDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return null;
        }),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgManager(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("forbidden");
    });

    it("should throw error when user is not a valid org user", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
      };

      const mockUserDocData = { valid: false };
      const mockUserDoc = {
        exists: true,
        data: () => mockUserDocData,
      };

      const mockUserDocRef = {
        get: vi.fn().mockResolvedValue(mockUserDoc),
      };

      const mockUsersCollection = {
        doc: vi.fn().mockReturnValue(mockUserDocRef),
      };

      const mockOrgDocRef = {
        collection: vi.fn().mockReturnValue(mockUsersCollection),
      };

      const mockOrgsCollection = {
        doc: vi.fn().mockReturnValue(mockOrgDocRef),
      };

      mockFirestore.collection.mockReturnValue(mockOrgsCollection);

      await expect(
        guardOrgManager(mockFirestore, mockRequest as any, "org123")
      ).rejects.toThrow("invalid user");
    });
  });
});
