import { describe, it, expect, beforeEach, vi } from "vitest";
import { setUpData } from "./setup.js";
import * as account from "./account.js";

vi.mock("./account.js", () => ({
  createAdminUser: vi.fn(),
}));

describe("setup", () => {
  let mockAuth: any;
  let mockDb: any;
  let mockLogger: any;
  let mockSnapshot: any;
  let mockEvent: any;
  let mockRef: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRef = {
      set: vi.fn().mockResolvedValue(undefined),
    };

    mockSnapshot = {
      data: vi.fn(),
      ref: mockRef,
    };

    mockEvent = {
      data: mockSnapshot,
    };

    mockAuth = {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
    };

    mockDb = {
      collection: vi.fn(),
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe("setUpData", () => {
    it("should return early if no event provided", async () => {
      await setUpData(mockAuth, mockDb, mockLogger, false, undefined);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "No data associated with the event"
      );
      expect(account.createAdminUser).not.toHaveBeenCalled();
    });

    it("should handle version 0 with email and create admin user", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(account.createAdminUser).toHaveBeenCalledWith(
        mockAuth,
        mockDb,
        mockLogger,
        false,
        { email: "test@example.com", name: "Primary user" }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created for version 0",
        { name: "Primary user", email: "test@example.com" }
      );
      expect(mockRef.set).toHaveBeenCalledWith({
        version: 1,
        createdAt: expect.any(Object),
      });
    });

    it("should handle undefined version as 0", async () => {
      mockSnapshot.data.mockReturnValue({
        email: "test@example.com",
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(account.createAdminUser).toHaveBeenCalledWith(
        mockAuth,
        mockDb,
        mockLogger,
        false,
        { email: "test@example.com", name: "Primary user" }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created for version 0",
        { name: "Primary user", email: "test@example.com" }
      );
      expect(mockRef.set).toHaveBeenCalled();
    });

    it("should log error if no email provided for version 0", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 0,
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "No email provided for creating admin user"
      );
      expect(account.createAdminUser).not.toHaveBeenCalled();
      expect(mockRef.set).not.toHaveBeenCalled();
    });

    it("should handle createAdminUser errors gracefully", async () => {
      const mockError = new Error("Admin creation failed");
      vi.mocked(account.createAdminUser).mockRejectedValue(mockError);
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create admin user",
        { error: mockError }
      );
      expect(mockRef.set).not.toHaveBeenCalled();
    });

    it("should handle non-zero versions", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 1,
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "No action for this version: 1"
      );
      expect(account.createAdminUser).not.toHaveBeenCalled();
      expect(mockRef.set).not.toHaveBeenCalled();
    });

    it("should handle snapshot.ref.set errors", async () => {
      const mockError = new Error("Firestore set failed");
      vi.mocked(account.createAdminUser).mockResolvedValue(undefined);
      mockRef.set.mockRejectedValueOnce(mockError);
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create document version: 1",
        { error: mockError }
      );
    });

    it("should handle null data from snapshot", async () => {
      mockSnapshot.data.mockReturnValue(null);

      await setUpData(mockAuth, mockDb, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "No email provided for creating admin user"
      );
      expect(account.createAdminUser).not.toHaveBeenCalled();
      expect(mockRef.set).not.toHaveBeenCalled();
    });
  });
});
