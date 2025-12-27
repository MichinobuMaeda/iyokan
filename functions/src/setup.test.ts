import { describe, it, expect, beforeEach, vi } from "vitest";
import { setupData } from "./setup.js";
import * as account from "./account.js";

vi.mock("./account.js", () => ({
  createAdminUser: vi.fn(),
}));

describe("setup", () => {
  let mockAdmin: any;
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

    mockAdmin = {
      firestore: {
        FieldValue: {
          serverTimestamp: vi.fn(() => "TIMESTAMP"),
        },
      },
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe("setupData", () => {
    it("should return early if no event provided", async () => {
      await setupData(mockAdmin, mockLogger, false, undefined);

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

      await setupData(mockAdmin, mockLogger, false, mockEvent);

      expect(account.createAdminUser).toHaveBeenCalledWith(
        mockAdmin,
        mockLogger,
        false,
        "test@example.com",
        "Primary user"
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created for version 0",
        { name: "Primary user", email: "test@example.com" }
      );
      expect(mockRef.set).toHaveBeenCalledWith({
        version: 1,
        createdAt: "TIMESTAMP",
      });
    });

    it("should handle undefined version as 0", async () => {
      mockSnapshot.data.mockReturnValue({
        email: "test@example.com",
      });

      await setupData(mockAdmin, mockLogger, false, mockEvent);

      expect(account.createAdminUser).toHaveBeenCalledWith(
        mockAdmin,
        mockLogger,
        false,
        "test@example.com",
        "Primary user"
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Admin user created for version 0",
        { name: "Primary user", email: "test@example.com" }
      );
      expect(mockRef.set).toHaveBeenCalledWith({
        version: 1,
        createdAt: "TIMESTAMP",
      });
    });

    it("should use test email when isTest is true", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "real@example.com",
      });

      await setupData(mockAdmin, mockLogger, true, mockEvent);

      expect(account.createAdminUser).toHaveBeenCalledWith(
        mockAdmin,
        mockLogger,
        true,
        "primary@example.com",
        "Primary user"
      );
    });

    it("should log error if no email provided for version 0", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 0,
      });

      await setupData(mockAdmin, mockLogger, false, mockEvent);

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

      await setupData(mockAdmin, mockLogger, false, mockEvent);

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

      await setupData(mockAdmin, mockLogger, false, mockEvent);

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

      await setupData(mockAdmin, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create document version: 1",
        { error: mockError }
      );
    });

    it("should handle null data from snapshot", async () => {
      mockSnapshot.data.mockReturnValue(null);

      await setupData(mockAdmin, mockLogger, false, mockEvent);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "No email provided for creating admin user"
      );
      expect(account.createAdminUser).not.toHaveBeenCalled();
      expect(mockRef.set).not.toHaveBeenCalled();
    });
  });
});
