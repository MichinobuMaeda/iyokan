import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getExistingAuthUserByEmail,
  createAuthUserIfNotExists,
  createAdminUser,
} from "./account.js";

describe("account", () => {
  let mockAdmin: any;
  let mockLogger: any;
  let mockAuth: any;
  let mockFirestore: any;

  beforeEach(() => {
    // Create persistent mock instances
    mockAuth = {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
    };

    mockFirestore = {
      collection: vi.fn(),
      FieldValue: {
        serverTimestamp: vi.fn(() => "TIMESTAMP"),
      },
    };

    // Mock admin
    mockAdmin = {
      auth: vi.fn(() => mockAuth),
      firestore: Object.assign(
        vi.fn(() => mockFirestore),
        {
          FieldValue: mockFirestore.FieldValue,
        }
      ),
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
        mockAdmin,
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
        mockAdmin,
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });

    it("should throw error if other error occurs", async () => {
      const mockError = { code: "auth/internal-error" };
      mockAuth.getUserByEmail.mockRejectedValue(mockError);

      await expect(
        getExistingAuthUserByEmail(mockAdmin, "test@example.com")
      ).rejects.toEqual(mockError);
    });
  });

  describe("createAuthUserIfNotExists", () => {
    it("should return existing user if found", async () => {
      const mockUser = { uid: "user123", email: "test@example.com" };
      mockAuth.getUserByEmail.mockResolvedValue(mockUser);

      const result = await createAuthUserIfNotExists(
        mockAdmin,
        mockLogger,
        false,
        "test@example.com",
        "Test User"
      );

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

      const result = await createAuthUserIfNotExists(
        mockAdmin,
        mockLogger,
        false,
        "new@example.com",
        "New User"
      );

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

    it("should use test password when isTest is true", async () => {
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockResolvedValue({
        uid: "testuser123",
        email: "test@example.com",
      });

      await createAuthUserIfNotExists(
        mockAdmin,
        mockLogger,
        true,
        "test@example.com",
        "Test User"
      );

      expect(mockAuth.createUser).toHaveBeenCalledWith({
        displayName: "Test User",
        email: "test@example.com",
        password: "P@ssword123",
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

      await createAuthUserIfNotExists(
        mockAdmin,
        mockLogger,
        true,
        "test@example.com",
        ""
      );

      expect(mockAuth.createUser).toHaveBeenCalledWith({
        displayName: undefined,
        email: "test@example.com",
        password: "P@ssword123",
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

      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockDoc = vi.fn(() => ({ set: mockSet }));
      const mockCollection = vi.fn(() => ({ doc: mockDoc }));
      mockFirestore.collection = mockCollection;

      await createAdminUser(
        mockAdmin,
        mockLogger,
        true,
        "admin@example.com",
        "Admin User"
      );

      expect(mockCollection).toHaveBeenCalledWith("admins");
      expect(mockDoc).toHaveBeenCalledWith("admin123");
      expect(mockSet).toHaveBeenCalledWith({
        name: "Admin User",
        email: "admin@example.com",
        createdAt: "TIMESTAMP",
        updatedAt: "TIMESTAMP",
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created in Firestore",
        { uid: "admin123", email: "admin@example.com" }
      );
    });

    it("should handle errors gracefully", async () => {
      const mockError = new Error("Firestore error");
      mockAuth.getUserByEmail.mockRejectedValue({
        code: "auth/user-not-found",
      });
      mockAuth.createUser.mockRejectedValue({ code: "auth/user-not-found" });
      mockAdmin.auth().createUser = vi.fn().mockRejectedValue(mockError);

      await createAdminUser(
        mockAdmin,
        mockLogger,
        true,
        "admin@example.com",
        "Admin User"
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create auth account",
        { error: mockError }
      );
    });
  });
});
