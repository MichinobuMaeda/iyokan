import { describe, it, expect, beforeEach, vi } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import {
  generateRandomPassword,
  getExistingAuthUserByEmail,
  createAuthUserIfNotExists,
  createOrgUser,
  getUserPrivileges,
} from "./account.js";
import type { Context } from "./firebase.js";
import * as firebase from "./firebase.js";

vi.mock("./firebase.js", async () => {
  const actual = await vi.importActual("./firebase.js");
  return {
    ...actual,
    isOrganizationMember: vi.fn(),
    isGroupMember: vi.fn(),
  };
});

describe("account", () => {
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      auth: {
        getUserByEmail: vi.fn(),
        createUser: vi.fn(),
        getUser: vi.fn(),
      } as any,
      db: {
        collection: vi.fn(),
      } as any,
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      } as any,
    };
  });

  describe("generateRandomPassword", () => {
    it("should return DEFAULT_PASSWORD from env if set", () => {
      const originalPassword = process.env.DEFAULT_PASSWORD;
      process.env.DEFAULT_PASSWORD = "test-default-password";

      const password = generateRandomPassword();

      expect(password).toBe("test-default-password");

      // Restore original value
      if (originalPassword) {
        process.env.DEFAULT_PASSWORD = originalPassword;
      } else {
        delete process.env.DEFAULT_PASSWORD;
      }
    });

    it("should generate random password if DEFAULT_PASSWORD not set", () => {
      const originalPassword = process.env.DEFAULT_PASSWORD;
      delete process.env.DEFAULT_PASSWORD;

      const password = generateRandomPassword();

      expect(password).toBeDefined();
      expect(typeof password).toBe("string");
      expect(password.length).toBeGreaterThan(0);
      // Password should be composed of Math.random() results
      expect(password.length).toBeGreaterThanOrEqual(4); // At least 4 characters from 4 random strings

      // Restore original value
      if (originalPassword) {
        process.env.DEFAULT_PASSWORD = originalPassword;
      }
    });

    it("should generate different passwords on each call when DEFAULT_PASSWORD not set", () => {
      const originalPassword = process.env.DEFAULT_PASSWORD;
      delete process.env.DEFAULT_PASSWORD;

      const password1 = generateRandomPassword();
      const password2 = generateRandomPassword();

      expect(password1).not.toBe(password2);

      // Restore original value
      if (originalPassword) {
        process.env.DEFAULT_PASSWORD = originalPassword;
      }
    });
  });

  describe("getExistingAuthUserByEmail", () => {
    it("should return Right(uid) if user exists", async () => {
      const mockUser = { uid: "user123", email: "test@example.com" };
      vi.mocked(mockContext.auth.getUserByEmail).mockResolvedValue(
        mockUser as any
      );

      const result = await getExistingAuthUserByEmail(
        mockContext,
        "test@example.com"
      );

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("user123");
      }
      expect(mockContext.auth.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return Right(null) if user not found", async () => {
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });

      const result = await getExistingAuthUserByEmail(
        mockContext,
        "nonexistent@example.com"
      );

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBeNull();
      }
    });

    it("should return Left(Error) if other error occurs", async () => {
      const mockError = new Error("Internal error");
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue(mockError);

      const result = await getExistingAuthUserByEmail(
        mockContext,
        "test@example.com"
      );

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
    });
  });

  describe("createAuthUserIfNotExists", () => {
    it("should return Right(uid) for existing user", async () => {
      const mockUser = { uid: "user123", email: "test@example.com" };
      vi.mocked(mockContext.auth.getUserByEmail).mockResolvedValue(
        mockUser as any
      );

      const result = await createAuthUserIfNotExists(mockContext, {
        email: "test@example.com",
        name: "Test User",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("user123");
      }
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Auth account already exists",
        { uid: "user123", email: "test@example.com" }
      );
    });

    it("should create new user and return Right(uid) if not found", async () => {
      const mockNewUser = { uid: "newuser123", email: "new@example.com" };
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue(
        mockNewUser as any
      );

      const result = await createAuthUserIfNotExists(mockContext, {
        email: "new@example.com",
        name: "New User",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("newuser123");
      }
      expect(mockContext.auth.createUser).toHaveBeenCalledWith({
        displayName: "New User",
        email: "new@example.com",
        password: expect.any(String),
      });
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Auth account created",
        {
          uid: "newuser123",
          email: "new@example.com",
        }
      );
    });

    it("should create user with random password", async () => {
      const originalPassword = process.env.DEFAULT_PASSWORD;
      delete process.env.DEFAULT_PASSWORD;

      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue({
        uid: "testuser123",
        email: "test@example.com",
      } as any);

      await createAuthUserIfNotExists(mockContext, {
        email: "test@example.com",
        name: "Test User",
      });

      expect(mockContext.auth.createUser).toHaveBeenCalledWith({
        displayName: "Test User",
        email: "test@example.com",
        password: expect.any(String),
      });

      const calledPassword = vi.mocked(mockContext.auth.createUser).mock
        .calls[0][0].password;
      expect(calledPassword).toBeDefined();
      expect(typeof calledPassword).toBe("string");
      expect(calledPassword?.length).toBeGreaterThan(0);

      // Restore original value
      if (originalPassword) {
        process.env.DEFAULT_PASSWORD = originalPassword;
      }
    });

    it("should create user with DEFAULT_PASSWORD from env when set", async () => {
      const originalPassword = process.env.DEFAULT_PASSWORD;
      process.env.DEFAULT_PASSWORD = "test-env-password";

      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue({
        uid: "testuser456",
        email: "env@example.com",
      } as any);

      await createAuthUserIfNotExists(mockContext, {
        email: "env@example.com",
        name: "Env Test User",
      });

      expect(mockContext.auth.createUser).toHaveBeenCalledWith({
        displayName: "Env Test User",
        email: "env@example.com",
        password: "test-env-password",
      });

      // Restore original value
      if (originalPassword) {
        process.env.DEFAULT_PASSWORD = originalPassword;
      } else {
        delete process.env.DEFAULT_PASSWORD;
      }
    });

    it("should create user with undefined displayName when name is empty", async () => {
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue({
        uid: "testuser123",
        email: "test@example.com",
      } as any);

      await createAuthUserIfNotExists(mockContext, {
        email: "test@example.com",
        name: "",
      });

      expect(mockContext.auth.createUser).toHaveBeenCalledWith({
        displayName: undefined,
        email: "test@example.com",
        password: expect.any(String),
      });
    });

    it("should return Left(Error) on creation failure", async () => {
      const mockError = new Error("Creation failed");
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockRejectedValue(mockError);

      const result = await createAuthUserIfNotExists(mockContext, {
        email: "test@example.com",
        name: "Test User",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create auth account",
        { error: mockError }
      );
    });

    it("should throw error when getExistingAuthUserByEmail returns Left", async () => {
      const mockError = new Error("Database error");
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue(mockError);

      await expect(
        createAuthUserIfNotExists(mockContext, {
          email: "test@example.com",
          name: "Test User",
        })
      ).rejects.toThrow(mockError);
    });
  });

  describe("createOrgUser", () => {
    it("should create auth user and firestore document in org subcollection", async () => {
      const mockUser = { uid: "user123", email: "user@example.com" };
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue(mockUser as any);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockCollection as any
      );

      const result = await createOrgUser(mockContext, {
        oid: "org123",
        email: "user@example.com",
        name: "Test User",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("user123");
      }
      expect(mockCollection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org123");
      expect(mockSubCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user123");
      expect(mockSet).toHaveBeenCalledWith({
        name: "Test User",
        valid: true,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "User created in Firestore",
        { oid: "org123", uid: "user123" }
      );
    });

    it("should create org user with valid=false", async () => {
      const mockUser = { uid: "user456", email: "user2@example.com" };
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue(mockUser as any);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockCollection as any
      );

      const result = await createOrgUser(mockContext, {
        oid: "org456",
        email: "user2@example.com",
        name: "User Two",
        valid: false,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("user456");
      }
      expect(mockCollection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org456");
      expect(mockSubCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user456");
      expect(mockSet).toHaveBeenCalledWith({
        name: "User Two",
        valid: false,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "User created in Firestore",
        { oid: "org456", uid: "user456" }
      );
    });

    it("should use existing auth user if found", async () => {
      const mockUser = {
        uid: "existingUser123",
        email: "existing@example.com",
      };
      vi.mocked(mockContext.auth.getUserByEmail).mockResolvedValue(
        mockUser as any
      );

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockCollection as any
      );

      const result = await createOrgUser(mockContext, {
        oid: "org789",
        email: "existing@example.com",
        name: "Existing User",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("existingUser123");
      }
      expect(mockContext.auth.createUser).not.toHaveBeenCalled();
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Auth account already exists",
        { uid: "existingUser123", email: "existing@example.com" }
      );
      expect(mockDoc).toHaveBeenCalledWith("existingUser123");
      expect(mockSet).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Firestore error");
      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockRejectedValue(mockError);

      const result = await createOrgUser(mockContext, {
        oid: "org123",
        email: "user@example.com",
        name: "Test User",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create auth account",
        { error: mockError }
      );
    });

    it("should return Left when oid is missing", async () => {
      const result = await createOrgUser(mockContext, {
        email: "user@example.com",
        name: "Test User",
        valid: true,
      } as any);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Missing required user data");
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Missing required user data",
        { email: "user@example.com", name: "Test User", valid: true }
      );
    });

    it("should return Left when email is missing", async () => {
      const result = await createOrgUser(mockContext, {
        oid: "org123",
        name: "Test User",
        valid: true,
      } as any);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Missing required user data");
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Missing required user data",
        { oid: "org123", name: "Test User", valid: true }
      );
    });

    it("should return Left when name is missing", async () => {
      const result = await createOrgUser(mockContext, {
        oid: "org123",
        email: "user@example.com",
        valid: true,
      } as any);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Missing required user data");
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Missing required user data",
        { oid: "org123", email: "user@example.com", valid: true }
      );
    });

    it("should handle Firestore errors during document creation", async () => {
      const mockUser = { uid: "user123", email: "user@example.com" };
      const mockFirestoreError = new Error("Firestore write failed");

      vi.mocked(mockContext.auth.getUserByEmail).mockRejectedValue({
        code: "auth/user-not-found",
      });
      vi.mocked(mockContext.auth.createUser).mockResolvedValue(mockUser as any);

      const mockSet = vi.fn().mockRejectedValue(mockFirestoreError);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockCollection as any
      );

      const result = await createOrgUser(mockContext, {
        oid: "org123",
        email: "user@example.com",
        name: "Test User",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockFirestoreError);
      }
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create user account",
        { error: mockFirestoreError }
      );
    });
  });

  describe("getUserPrivileges", () => {
    it("should return Left when uid is not provided", async () => {
      const result = await getUserPrivileges(mockContext, {
        data: undefined,
      } as any);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("No UID provided");
      }
    });

    it("should retrieve user privileges across organizations", async () => {
      const uid = "user123";

      // Mock orgs collection
      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org1" }, { id: "org2" }],
      });
      const mockOrgsWhere = vi.fn().mockReturnValue({
        get: mockOrgsGet,
      });

      vi.mocked(mockContext.db.collection).mockImplementation(
        (collectionName: string) => {
          if (collectionName === "orgs") {
            return { where: mockOrgsWhere } as any;
          }
          return undefined as any;
        }
      );

      // Mock the helper functions
      vi.mocked(firebase.isOrganizationMember)
        .mockResolvedValueOnce(E.right(true)) // org1 member
        .mockResolvedValueOnce(E.right(false)); // org2 not member
      vi.mocked(firebase.isGroupMember)
        .mockResolvedValueOnce(E.right(true)) // org1 manager
        .mockResolvedValueOnce(E.right(false)) // org1 not admin
        .mockResolvedValueOnce(E.right(false)) // org2 not manager
        .mockResolvedValueOnce(E.right(false)); // org2 not admin

      const result = await getUserPrivileges(mockContext, {
        data: { uid },
      } as any);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual({
          org1: {
            manager: true,
            admin: false,
          },
        });
      }
    });

    it("should return empty privileges when user is not a member of any organization", async () => {
      const uid = "newUser123";

      const mockOrgsGet = vi.fn().mockResolvedValue({ docs: [] });
      const mockOrgsWhere = vi.fn().mockReturnValue({
        get: mockOrgsGet,
      });

      vi.mocked(mockContext.db.collection).mockImplementation(
        (collectionName: string) => {
          if (collectionName === "orgs") {
            return { where: mockOrgsWhere } as any;
          }
          return undefined as any;
        }
      );

      const result = await getUserPrivileges(mockContext, {
        data: { uid },
      } as any);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual({});
      }
    });

    it("should handle errors gracefully", async () => {
      const uid = "user123";
      const mockError = new Error("Firestore error");

      vi.mocked(mockContext.db.collection).mockImplementation(() => {
        throw mockError;
      });

      const result = await getUserPrivileges(mockContext, {
        data: { uid },
      } as any);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }
    });

    it("should include multiple organizations with different privileges", async () => {
      const uid = "user456";

      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org1" }, { id: "org2" }, { id: "org3" }],
      });
      const mockOrgsWhere = vi.fn().mockReturnValue({
        get: mockOrgsGet,
      });

      vi.mocked(mockContext.db.collection).mockImplementation(
        (collectionName: string) => {
          if (collectionName === "orgs") {
            return { where: mockOrgsWhere } as any;
          }
          return undefined as any;
        }
      );

      // Use mockImplementation for more control
      vi.mocked(firebase.isOrganizationMember).mockImplementation(
        async (context, { oid }) => {
          if (oid === "org1") return E.right(true);
          if (oid === "org2") return E.right(true);
          if (oid === "org3") return E.right(false);
          return E.left(new Error("Unknown org"));
        }
      );

      vi.mocked(firebase.isGroupMember).mockImplementation(
        async (context, { oid, gid }) => {
          if (oid === "org1" && gid === "managers") return E.right(false);
          if (oid === "org1" && gid === "admins") return E.right(true);
          if (oid === "org2" && gid === "managers") return E.right(true);
          if (oid === "org2" && gid === "admins") return E.right(false);
          if (oid === "org3" && gid === "managers") return E.right(false);
          if (oid === "org3" && gid === "admins") return E.right(false);
          return E.left(new Error("Unknown org/group"));
        }
      );

      const result = await getUserPrivileges(mockContext, {
        data: { uid },
      } as any);

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toEqual({
          org1: {
            manager: false,
            admin: true,
          },
          org2: {
            manager: true,
            admin: false,
          },
        });
      }
    });
  });
});
