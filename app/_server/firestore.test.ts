import { describe, it, expect, vi } from "vitest";
import { Firestore } from "firebase/firestore";
import * as E from "fp-ts/Either";
import {
  getAdmins,
  getAdmin,
  getOrgs,
  getOrg,
  getOrgUsers,
  getOrgUser,
  getOrgProviders,
  getOrgProvider,
} from "./firestore";

// Mock firebase/firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
  };
});

// Mock the type modules
vi.mock("@/app/_types/User", () => ({
  userFromDoc: vi.fn(),
}));

vi.mock("@/app/_types/Org", () => ({
  orgFromDoc: vi.fn(),
}));

vi.mock("@/app/_types/Provider", () => ({
  providerFromDoc: vi.fn(),
}));

describe("firestore", () => {
  const mockFirestore = {} as Firestore;

  describe("getAdmins", () => {
    it("should return array of users on success", async () => {
      const { getDocs, collection } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      const mockUsers = [
        { id: "1", name: "User 1", email: "user1@example.com", valid: true },
        { id: "2", name: "User 2", email: "user2@example.com", valid: true },
      ];

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: (doc: { id: string }) => void) => {
          mockUsers.forEach((user) => {
            callback({ id: user.id });
          });
        },
      } as never);

      let callCount = 0;
      vi.mocked(userFromDoc).mockImplementation(() => mockUsers[callCount++]);

      const result = await getAdmins(mockFirestore);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(2);
      }
    });

    it("should return error on failure", async () => {
      const { getDocs, collection } = await import("firebase/firestore");

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      const result = await getAdmins(mockFirestore);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchAdmins");
      }
    });
  });

  describe("getAdmin", () => {
    it("should return user on success", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        valid: true,
      };

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(userFromDoc).mockReturnValue(mockUser);

      const result = await getAdmin(mockFirestore, "123");

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockUser);
      }
    });

    it("should return errorAdminNotFound when user not found", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(userFromDoc).mockReturnValue(null);

      const result = await getAdmin(mockFirestore, "123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorAdminNotFound");
      }
    });

    it("should return errorFetchAdmin on error", async () => {
      const { getDoc, doc } = await import("firebase/firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await getAdmin(mockFirestore, "123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchAdmin");
      }
    });
  });

  describe("getOrgs", () => {
    it("should return array of orgs on success", async () => {
      const { getDocs, collection } = await import("firebase/firestore");
      const { orgFromDoc } = await import("@/app/_types/Org");

      const mockOrgs = [
        { id: "1", name: "Org 1", valid: true },
        { id: "2", name: "Org 2", valid: false },
      ];

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: (doc: { id: string }) => void) => {
          mockOrgs.forEach((org) => {
            callback({ id: org.id });
          });
        },
      } as never);

      let callCount = 0;
      vi.mocked(orgFromDoc).mockImplementation(() => mockOrgs[callCount++]);

      const result = await getOrgs(mockFirestore);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(2);
      }
    });

    it("should return error on failure", async () => {
      const { getDocs, collection } = await import("firebase/firestore");

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrgs(mockFirestore);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchOrgs");
      }
    });
  });

  describe("getOrg", () => {
    it("should return org on success", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { orgFromDoc } = await import("@/app/_types/Org");

      const mockOrg = { id: "123", name: "Test Org", valid: true };

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(orgFromDoc).mockReturnValue(mockOrg);

      const result = await getOrg(mockFirestore, "123");

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockOrg);
      }
    });

    it("should return errorOrgNotFound when org not found", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { orgFromDoc } = await import("@/app/_types/Org");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(orgFromDoc).mockReturnValue(null);

      const result = await getOrg(mockFirestore, "123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorOrgNotFound");
      }
    });

    it("should return errorFetchOrg on error", async () => {
      const { getDoc, doc } = await import("firebase/firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrg(mockFirestore, "123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchOrg");
      }
    });
  });

  describe("getOrgUsers", () => {
    it("should return array of users on success", async () => {
      const { getDocs, collection } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      const mockUsers = [
        { id: "1", name: "User 1", email: "user1@example.com", valid: true },
        { id: "2", name: "User 2", email: "user2@example.com", valid: true },
      ];

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: (doc: { id: string }) => void) => {
          mockUsers.forEach((user) => {
            callback({ id: user.id });
          });
        },
      } as never);

      let callCount = 0;
      vi.mocked(userFromDoc).mockImplementation(() => mockUsers[callCount++]);

      const result = await getOrgUsers(mockFirestore, "org123");

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveLength(2);
      }
    });

    it("should return error on failure", async () => {
      const { getDocs, collection } = await import("firebase/firestore");

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrgUsers(mockFirestore, "org123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchUsers");
      }
    });
  });

  describe("getOrgUser", () => {
    it("should return user on success", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      const mockUser = {
        id: "user123",
        name: "Test User",
        email: "test@example.com",
        valid: true,
      };

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(userFromDoc).mockReturnValue(mockUser);

      const result = await getOrgUser(mockFirestore, "org123", "user123");

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockUser);
      }
    });

    it("should return errorUserNotFound when user not found", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { userFromDoc } = await import("@/app/_types/User");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(userFromDoc).mockReturnValue(null);

      const result = await getOrgUser(mockFirestore, "org123", "user123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorUserNotFound");
      }
    });

    it("should return errorFetchUser on error", async () => {
      const { getDoc, doc } = await import("firebase/firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrgUser(mockFirestore, "org123", "user123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchUser");
      }
    });
  });

  describe("getOrgProviders", () => {
    it("should return array of providers on success", async () => {
      const { getDocs, collection } = await import("firebase/firestore");
      const { providerFromDoc } = await import("@/app/_types/Provider");

      const mockProviders = [
        {
          id: "provider-1",
          name: "Bluesky Provider",
          type: "bluesky",
          params: [
            { key: "service", value: "https://bsky.social" },
            { key: "identifier", value: "user.bsky.social" },
            { key: "password", value: "app-password" },
          ],
          valid: true,
        },
        {
          id: "provider-2",
          name: "Mastodon Provider",
          type: "mastodon",
          params: [
            { key: "token", value: "token123" },
            { key: "url", value: "https://mastodon.social" },
          ],
          valid: true,
        },
      ];

      const mockDocs = mockProviders.map(() => ({}));
      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: (doc: unknown) => void) => {
          mockDocs.forEach(callback);
        },
      } as never);
      vi.mocked(providerFromDoc)
        .mockReturnValueOnce(mockProviders[0])
        .mockReturnValueOnce(mockProviders[1]);

      const result = await getOrgProviders(mockFirestore, "org123");

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockProviders);
      }
    });

    it("should return error on failure", async () => {
      const { getDocs, collection } = await import("firebase/firestore");

      vi.mocked(collection).mockReturnValue({} as never);
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrgProviders(mockFirestore, "org123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchProviders");
      }
    });
  });

  describe("getOrgProvider", () => {
    it("should return provider on success", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { providerFromDoc } = await import("@/app/_types/Provider");

      const mockProvider = {
        id: "provider-123",
        name: "Bluesky Provider",
        type: "bluesky",
        params: [
          { key: "service", value: "https://bsky.social" },
          { key: "identifier", value: "user.bsky.social" },
          { key: "password", value: "app-password" },
        ],
        valid: true,
      };

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(providerFromDoc).mockReturnValue(mockProvider);

      const result = await getOrgProvider(
        mockFirestore,
        "org123",
        "provider-123"
      );

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual(mockProvider);
      }
    });

    it("should return errorProviderNotFound when provider not found", async () => {
      const { getDoc, doc } = await import("firebase/firestore");
      const { providerFromDoc } = await import("@/app/_types/Provider");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({} as never);
      vi.mocked(providerFromDoc).mockReturnValue(null);

      const result = await getOrgProvider(
        mockFirestore,
        "org123",
        "provider-123"
      );

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorProviderNotFound");
      }
    });

    it("should return errorFetchProvider on error", async () => {
      const { getDoc, doc } = await import("firebase/firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await getOrgProvider(
        mockFirestore,
        "org123",
        "provider-123"
      );

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorFetchProvider");
      }
    });
  });
});
