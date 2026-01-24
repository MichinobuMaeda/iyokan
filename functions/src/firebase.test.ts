import { describe, it, expect, beforeEach, vi } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import {
  isOrganizationMember,
  isGroupMember,
  type Context,
} from "./firebase.js";

describe("firebase", () => {
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      auth: {} as any,
      db: {
        collection: vi.fn(),
      } as any,
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      } as any,
    };
  });

  describe("isOrganizationMember", () => {
    it("should return Right(false) if uid is not provided", async () => {
      const result = await isOrganizationMember(mockContext, {
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(false) if oid is not provided", async () => {
      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(false) if both uid and oid are not provided", async () => {
      const result = await isOrganizationMember(mockContext, {});

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(true) if user exists and is valid", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: true }),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockUsersCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockUsersCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(true);
      }
      expect(mockContext.db.collection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org123");
      expect(mockUsersCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user123");
    });

    it("should return Right(false) if user exists but is not valid", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: false }),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockUsersCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockUsersCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
    });

    it("should return Right(false) if user document does not exist", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: false,
        data: () => undefined,
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockUsersCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockUsersCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
    });

    it("should return Right(undefined) if user exists but valid field is undefined", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockUsersCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockUsersCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(undefined);
      }
    });

    it("should return Left(Error) if Firestore query fails", async () => {
      const mockError = new Error("Firestore error");
      const mockGet = vi.fn().mockRejectedValue(mockError);
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockUsersCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockUsersCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isOrganizationMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
    });
  });

  describe("isGroupMember", () => {
    it("should return Right(false) if uid is not provided", async () => {
      const result = await isGroupMember(mockContext, {
        oid: "org123",
        gid: "admins",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(false) if oid is not provided", async () => {
      const result = await isGroupMember(mockContext, {
        uid: "user123",
        gid: "admins",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(false) if gid is not provided", async () => {
      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(false) if all parameters are not provided", async () => {
      const result = await isGroupMember(mockContext, {});

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
      expect(mockContext.db.collection).not.toHaveBeenCalled();
    });

    it("should return Right(true) if user is a member of the group", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ members: ["user123", "user456"] }),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockGroupsCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockGroupsCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "admins",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(true);
      }
      expect(mockContext.db.collection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org123");
      expect(mockGroupsCollection).toHaveBeenCalledWith("groups");
      expect(mockDoc).toHaveBeenCalledWith("admins");
    });

    it("should return Right(false) if user is not a member of the group", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ members: ["user456", "user789"] }),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockGroupsCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockGroupsCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "admins",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(false);
      }
    });

    it("should return Left(Error) if members array is undefined", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockGroupsCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockGroupsCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "admins",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(Error);
      }
    });

    it("should return Left(Error) with 'unknown state' if group document does not exist", async () => {
      const mockGet = vi.fn().mockResolvedValue({
        exists: false,
        data: () => undefined,
      });
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockGroupsCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockGroupsCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "admins",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unknown state");
      }
    });

    it("should return Left(Error) if Firestore query fails", async () => {
      const mockError = new Error("Firestore error");
      const mockGet = vi.fn().mockRejectedValue(mockError);
      const mockDoc = vi.fn(() => ({ get: mockGet }));
      const mockGroupsCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockGroupsCollection }));
      const mockOrgsCollection = vi.fn(() => ({ doc: mockOrgDoc }));

      vi.mocked(mockContext.db.collection).mockImplementation(
        mockOrgsCollection as any
      );

      const result = await isGroupMember(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "admins",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
    });
  });
});
