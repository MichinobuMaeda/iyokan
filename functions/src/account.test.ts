import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getExistingAuthUserByEmail,
  createAuthUserIfNotExists,
  createAdminUser,
  createOrgUser,
  updateCustomUserClaims,
} from "./account.js";

describe("account", () => {
  let mockAuth: any;
  let mockLogger: any;
  let mockFirestore: any;

  beforeEach(() => {
    // Create mock auth
    mockAuth = {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      getUser: vi.fn(),
    };

    // Create mock firestore
    mockFirestore = {
      collection: vi.fn(),
    };

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe("getExistingAuthUserByEmail", () => {
    it("should return user if exists", async () => {
      const mockUser = { uid: "user123", email: "test@example.com" };
      mockAuth.getUserByEmail.mockResolvedValue(mockUser);

      const result = await getExistingAuthUserByEmail(
        mockAuth,
        "test@example.com"
      );

      expect(result).toEqual(mockUser);
      expect(mockAuth.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("should return null if user not found", async () => {
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });

      const result = await getExistingAuthUserByEmail(
        mockAuth,
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });

    it("should throw error if other error occurs", async () => {
      const mockError = { code: "auth/internal-error" };
      mockAuth.getUserByEmail.mockRejectedValue(mockError);

      await expect(
        getExistingAuthUserByEmail(mockAuth, "test@example.com")
      ).rejects.toEqual(mockError);
    });
  });

  describe("createAuthUserIfNotExists", () => {
    it("should return existing user if found", async () => {
      const mockUser = { uid: "user123", email: "test@example.com" };
      mockAuth.getUserByEmail.mockResolvedValue(mockUser);

      const result = await createAuthUserIfNotExists(mockAuth, mockLogger, {
        email: "test@example.com",
        name: "Test User",
      });

      expect(result).toEqual(mockUser);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Auth account already exists",
        { uid: "user123", email: "test@example.com" }
      );
    });

    it("should create new user if not found", async () => {
      const mockNewUser = { uid: "newuser123", email: "new@example.com" };
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue(mockNewUser);

      const result = await createAuthUserIfNotExists(mockAuth, mockLogger, {
        email: "new@example.com",
        name: "New User",
      });

      expect(result).toEqual(mockNewUser);
      expect(mockAuth.createUser).toHaveBeenCalledWith({
        displayName: "New User",
        email: "new@example.com",
        password: expect.any(String),
      });
      expect(mockLogger.info).toHaveBeenCalledWith("Auth account created", {
        uid: "newuser123",
        email: "new@example.com",
      });
    });

    it("should create user with random password", async () => {
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue({
        uid: "testuser123",
        email: "test@example.com",
      });

      await createAuthUserIfNotExists(mockAuth, mockLogger, {
        email: "test@example.com",
        name: "Test User",
      });

      expect(mockAuth.createUser).toHaveBeenCalledWith({
        displayName: "Test User",
        email: "test@example.com",
        password: expect.any(String),
      });
    });

    it("should create user with undefined displayName when name is empty", async () => {
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue({
        uid: "testuser123",
        email: "test@example.com",
      });

      await createAuthUserIfNotExists(mockAuth, mockLogger, {
        email: "test@example.com",
        name: "",
      });

      expect(mockAuth.createUser).toHaveBeenCalledWith({
        displayName: undefined,
        email: "test@example.com",
        password: expect.any(String),
      });
    });
  });

  describe("createAdminUser", () => {
    it("should create auth user and firestore document", async () => {
      const mockUser = { uid: "admin123", email: "admin@example.com" };
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue(mockUser);
      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockCollection = vi.fn(() => ({ doc: mockDoc }));
      mockFirestore.collection = mockCollection;

      await createAdminUser(mockAuth, mockFirestore, mockLogger, {
        email: "admin@example.com",
        name: "Admin User",
        valid: true,
      });

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith("admin123", {
        admin: true,
      });
      expect(mockCollection).toHaveBeenCalledWith("admins");
      expect(mockDoc).toHaveBeenCalledWith("admin123");
      expect(mockSet).toHaveBeenCalledWith({
        name: "Admin User",
        email: "admin@example.com",
        valid: true,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created in Firestore",
        { uid: "admin123", email: "admin@example.com" }
      );
    });

    it("should create auth user and firestore document with valid=false", async () => {
      const mockUser = { uid: "admin456", email: "admin2@example.com" };
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue(mockUser);
      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockCollection = vi.fn(() => ({ doc: mockDoc }));
      mockFirestore.collection = mockCollection;

      await createAdminUser(mockAuth, mockFirestore, mockLogger, {
        email: "admin2@example.com",
        name: "Admin Two",
        valid: false,
      });

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith("admin456", {
        admin: true,
      });
      expect(mockCollection).toHaveBeenCalledWith("admins");
      expect(mockDoc).toHaveBeenCalledWith("admin456");
      expect(mockSet).toHaveBeenCalledWith({
        name: "Admin Two",
        email: "admin2@example.com",
        valid: false,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created in Firestore",
        { uid: "admin456", email: "admin2@example.com" }
      );
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Firestore error");
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockRejectedValue(mockError);

      await createAdminUser(mockAuth, mockFirestore, mockLogger, {
        email: "admin@example.com",
        name: "Admin User",
        valid: true,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create admin account",
        { error: mockError }
      );
    });
  });
  describe("createOrgUser", () => {
    it("should create auth user and firestore document in org subcollection", async () => {
      const mockUser = { uid: "user123", email: "user@example.com" };
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue(mockUser);
      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      mockFirestore.collection = mockCollection;

      await createOrgUser(mockAuth, mockFirestore, mockLogger, {
        oid: "org123",
        email: "user@example.com",
        name: "Test User",
        valid: true,
      });

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith("user123", {
        org123: true,
      });
      expect(mockCollection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org123");
      expect(mockSubCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user123");
      expect(mockSet).toHaveBeenCalledWith({
        name: "Test User",
        email: "user@example.com",
        valid: true,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User created in Firestore",
        { oid: "org123", uid: "user123", email: "user@example.com" }
      );
    });

    it("should create org user with valid=false", async () => {
      const mockUser = { uid: "user456", email: "user2@example.com" };
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue(mockUser);
      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      mockFirestore.collection = mockCollection;

      await createOrgUser(mockAuth, mockFirestore, mockLogger, {
        oid: "org456",
        email: "user2@example.com",
        name: "User Two",
        valid: false,
      });

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith("user456", {
        org456: true,
      });
      expect(mockCollection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org456");
      expect(mockSubCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("user456");
      expect(mockSet).toHaveBeenCalledWith({
        name: "User Two",
        email: "user2@example.com",
        valid: false,
        createdAt: expect.any(Object),
        updatedAt: expect.any(Object),
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User created in Firestore",
        { oid: "org456", uid: "user456", email: "user2@example.com" }
      );
    });

    it("should use existing auth user if found", async () => {
      const mockUser = {
        uid: "existingUser123",
        email: "existing@example.com",
      };
      mockAuth.getUserByEmail.mockResolvedValue(mockUser);
      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockSubCollection = vi.fn(() => ({ doc: mockDoc }));
      const mockOrgDoc = vi.fn(() => ({ collection: mockSubCollection }));
      const mockCollection = vi.fn(() => ({ doc: mockOrgDoc }));
      mockFirestore.collection = mockCollection;

      await createOrgUser(mockAuth, mockFirestore, mockLogger, {
        oid: "org789",
        email: "existing@example.com",
        name: "Existing User",
        valid: true,
      });

      expect(mockAuth.createUser).not.toHaveBeenCalled();
      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(
        "existingUser123",
        {
          org789: true,
        }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Auth account already exists",
        { uid: "existingUser123", email: "existing@example.com" }
      );
      expect(mockDoc).toHaveBeenCalledWith("existingUser123");
      expect(mockSet).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Firestore error");
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockRejectedValue(mockError);

      await createOrgUser(mockAuth, mockFirestore, mockLogger, {
        oid: "org123",
        email: "user@example.com",
        name: "Test User",
        valid: true,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create user account",
        { error: mockError }
      );
    });
  });

  describe("updateCustomUserClaims", () => {
    it("should throw error when uid is not provided", async () => {
      await expect(
        updateCustomUserClaims(mockAuth, mockFirestore, undefined)
      ).rejects.toThrow("No UID provided for updating user claims");
    });

    it("should update admin claim when user is valid admin", async () => {
      const uid = "user123";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });

      const mockAdminGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: true }),
      });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockOrgsGet = vi.fn().mockResolvedValue({ docs: [] });
      const mockOrgsCollection = { get: mockOrgsGet };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAdminDoc).toHaveBeenCalledWith(uid);
      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
        admin: true,
      });
    });

    it("should update admin claim to false when admin document does not exist", async () => {
      const uid = "user456";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });

      const mockAdminGet = vi.fn().mockResolvedValue({
        exists: false,
      });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockOrgsGet = vi.fn().mockResolvedValue({ docs: [] });
      const mockOrgsCollection = { get: mockOrgsGet };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(uid, {
        admin: false,
      });
    });

    it("should update org user claims when user is valid in org", async () => {
      const uid = "user789";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });

      const mockAdminGet = vi.fn().mockResolvedValue({ exists: false });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockUserGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: true }),
      });
      const mockUserDoc = vi.fn(() => ({ get: mockUserGet }));
      const mockUsersCollection = { doc: mockUserDoc };

      const mockManagersGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ members: ["user789", "other"] }),
      });
      const mockManagersDoc = vi.fn(() => ({ get: mockManagersGet }));
      const mockGroupsCollection = { doc: mockManagersDoc };

      const mockOrgDoc = vi.fn(() => ({
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return undefined;
        }),
      }));

      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org123" }],
      });
      const mockOrgsCollection = {
        get: mockOrgsGet,
        doc: mockOrgDoc,
      };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledTimes(3);
      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(1, uid, {
        admin: false,
      });
      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(2, uid, {
        org123: true,
      });
      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(3, uid, {
        "org123.manager": true,
      });
    });

    it("should set org claim to false when user not valid in org", async () => {
      const uid = "user999";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });

      const mockAdminGet = vi.fn().mockResolvedValue({ exists: false });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockUserGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: false }),
      });
      const mockUserDoc = vi.fn(() => ({ get: mockUserGet }));
      const mockUsersCollection = { doc: mockUserDoc };

      const mockManagersGet = vi.fn().mockResolvedValue({
        exists: false,
      });
      const mockManagersDoc = vi.fn(() => ({ get: mockManagersGet }));
      const mockGroupsCollection = { doc: mockManagersDoc };

      const mockOrgDoc = vi.fn(() => ({
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return undefined;
        }),
      }));

      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org456" }],
      });
      const mockOrgsCollection = {
        get: mockOrgsGet,
        doc: mockOrgDoc,
      };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(2, uid, {
        org456: false,
      });
      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(3, uid, {
        "org456.manager": false,
      });
    });

    it("should set manager claim to false when user not in managers group", async () => {
      const uid = "user111";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });

      const mockAdminGet = vi.fn().mockResolvedValue({ exists: false });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockUserGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ valid: true }),
      });
      const mockUserDoc = vi.fn(() => ({ get: mockUserGet }));
      const mockUsersCollection = { doc: mockUserDoc };

      const mockManagersGet = vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ members: ["other-user"] }),
      });
      const mockManagersDoc = vi.fn(() => ({ get: mockManagersGet }));
      const mockGroupsCollection = { doc: mockManagersDoc };

      const mockOrgDoc = vi.fn(() => ({
        collection: vi.fn((name: string) => {
          if (name === "users") return mockUsersCollection;
          if (name === "groups") return mockGroupsCollection;
          return undefined;
        }),
      }));

      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org789" }],
      });
      const mockOrgsCollection = {
        get: mockOrgsGet,
        doc: mockOrgDoc,
      };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(3, uid, {
        "org789.manager": false,
      });
    });

    it("should handle multiple orgs correctly", async () => {
      const uid = "multiUser";
      mockAuth.getUser = vi.fn().mockResolvedValue({ uid });
      const mockAdminGet = vi.fn().mockResolvedValue({ exists: false });
      const mockAdminDoc = vi.fn(() => ({ get: mockAdminGet }));
      const mockAdminsCollection = { doc: mockAdminDoc };

      const mockOrgsDoc = vi.fn((orgId: string) => {
        const isOrg1 = orgId === "org1";

        return {
          collection: vi.fn((collectionName: string) => {
            if (collectionName === "users") {
              return {
                doc: vi.fn(() => ({
                  get: vi.fn().mockResolvedValue({
                    exists: true,
                    data: () => ({ valid: isOrg1 }), // org1: valid=true, org2: valid=false
                  }),
                })),
              };
            }
            if (collectionName === "groups") {
              return {
                doc: vi.fn(() => ({
                  get: vi.fn().mockResolvedValue({
                    exists: isOrg1,
                    data: () => ({ members: isOrg1 ? [uid] : [] }), // org1 has user in members
                  }),
                })),
              };
            }
            return undefined;
          }),
        };
      });

      const mockOrgsGet = vi.fn().mockResolvedValue({
        docs: [{ id: "org1" }, { id: "org2" }],
      });
      const mockOrgsCollection = {
        get: mockOrgsGet,
        doc: mockOrgsDoc,
      };

      mockFirestore.collection = vi
        .fn()
        .mockImplementation((collectionName: string) => {
          if (collectionName === "admins") return mockAdminsCollection;
          if (collectionName === "orgs") return mockOrgsCollection;
          return undefined;
        });

      mockAuth.setCustomUserClaims = vi.fn().mockResolvedValue(undefined);

      await updateCustomUserClaims(mockAuth, mockFirestore, uid);

      expect(mockAuth.setCustomUserClaims).toHaveBeenCalledTimes(5);
      // First call is always admin claim
      expect(mockAuth.setCustomUserClaims).toHaveBeenNthCalledWith(1, uid, {
        admin: false,
      });

      // Verify all expected calls were made (order may vary due to Promise.all)
      const allCalls = (mockAuth.setCustomUserClaims as any).mock.calls;
      const callArgs = allCalls.map((call: any) => call[1]);

      // Expect these claim objects to exist in the calls (excluding the first admin call)
      expect(callArgs).toContainEqual({ org1: true });
      expect(callArgs).toContainEqual({ org2: false });
      expect(callArgs).toContainEqual({ "org2.manager": false });
      // org1.manager should be true based on our mock setup
      const org1ManagerCall = callArgs.find(
        (arg: any) => "org1.manager" in arg
      );
      expect(org1ManagerCall).toEqual({ "org1.manager": true });
    });
  });
});
