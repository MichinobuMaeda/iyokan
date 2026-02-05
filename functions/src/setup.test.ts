import { describe, it, expect, beforeEach, vi } from "vitest";
import * as E from "fp-ts/lib/Either.js";

import { OID_SYSADMIN } from "./common.js";
import { setUpData } from "./setup.js";
import type { Context } from "./firebase.js";
import * as account from "./account.js";

vi.mock("./account.js", () => ({
  createOrgUser: vi.fn().mockResolvedValue(undefined),
}));

describe("setup", () => {
  let mockContext: Context;
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

    mockContext = {
      auth: {
        getUserByEmail: vi.fn(),
        createUser: vi.fn(),
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

  describe("setUpData", () => {
    it("should handle version 0 with email and create admin user and service config", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockGroupUpdate = vi.fn().mockResolvedValue(undefined);

      const mockGroupDoc = vi.fn(() => ({ update: mockGroupUpdate }));
      const mockGroupCollection = vi.fn(() => ({ doc: mockGroupDoc }));

      const mockOrgDoc = vi.fn(() => ({
        collection: mockGroupCollection,
      }));

      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));

      vi.mocked(mockContext.db.collection).mockImplementation(((
        name: string
      ) => {
        if (name === "service") {
          return { doc: mockConfDoc };
        }
        if (name === "orgs") {
          return { doc: mockOrgDoc };
        }
        return { doc: vi.fn() };
      }) as any);

      vi.mocked(account.createOrgUser).mockResolvedValue(E.right("user-123"));

      await setUpData(mockContext, mockEvent);

      expect(mockContext.db.collection).toHaveBeenCalledWith("service");
      expect(mockConfDoc).toHaveBeenCalledWith("conf");
      expect(mockConfSet).toHaveBeenCalledWith({
        webUrl: expect.any(String),
        desc: "",
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Organization created",
        { oid: OID_SYSADMIN }
      );

      expect(account.createOrgUser).toHaveBeenCalledWith(mockContext, {
        oid: OID_SYSADMIN,
        email: "test@example.com",
        name: "Primary user",
        valid: true,
      });

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Admin user created",
        { uid: "user-123", name: "Primary user", email: "test@example.com" }
      );

      expect(mockGroupCollection).toHaveBeenCalledWith("groups");
      expect(mockGroupDoc).toHaveBeenCalledWith("managers");
      expect(mockGroupDoc).toHaveBeenCalledWith("admins");
      expect(mockGroupUpdate).toHaveBeenCalledWith({
        members: ["user-123"],
        updatedAt: expect.anything(),
      });
      expect(mockGroupUpdate).toHaveBeenCalledTimes(2);

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Managers group updated",
        { oid: OID_SYSADMIN }
      );
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Admins group updated",
        { oid: OID_SYSADMIN }
      );

      expect(mockRef.set).toHaveBeenCalledWith({
        version: 1,
        createdAt: expect.anything(),
      });
    });

    it("should handle undefined version as 0", async () => {
      mockSnapshot.data.mockReturnValue({
        email: "test@example.com",
      });

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockGroupUpdate = vi.fn().mockResolvedValue(undefined);

      const mockGroupDoc = vi.fn(() => ({ update: mockGroupUpdate }));
      const mockGroupCollection = vi.fn(() => ({ doc: mockGroupDoc }));

      const mockOrgDoc = vi.fn(() => ({
        collection: mockGroupCollection,
      }));

      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));

      vi.mocked(mockContext.db.collection).mockImplementation(((
        name: string
      ) => {
        if (name === "service") {
          return { doc: mockConfDoc };
        }
        if (name === "orgs") {
          return { doc: mockOrgDoc };
        }
        return { doc: vi.fn() };
      }) as any);

      vi.mocked(account.createOrgUser).mockResolvedValue(E.right("user-123"));

      await setUpData(mockContext, mockEvent);

      expect(mockContext.db.collection).toHaveBeenCalledWith("service");
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Organization created",
        { oid: OID_SYSADMIN }
      );
      expect(account.createOrgUser).toHaveBeenCalledWith(mockContext, {
        oid: OID_SYSADMIN,
        email: "test@example.com",
        name: "Primary user",
        valid: true,
      });
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Admin user created",
        { uid: "user-123", name: "Primary user", email: "test@example.com" }
      );
      expect(mockRef.set).toHaveBeenCalledWith({
        version: 1,
        createdAt: expect.anything(),
      });
    });

    it("should log error if no email provided for version 0", async () => {
      const mockError = new Error("Email is required");
      vi.mocked(account.createOrgUser).mockRejectedValueOnce(mockError);

      mockSnapshot.data.mockReturnValue({
        version: 0,
      });

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));
      const mockServiceCollection = vi.fn(() => ({ doc: mockConfDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockServiceCollection as any
      );

      await setUpData(mockContext, mockEvent);

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create admin user",
        expect.objectContaining({ error: mockError })
      );
      expect(account.createOrgUser).toHaveBeenCalled();
    });

    it("should handle createAdminUser errors gracefully", async () => {
      const mockError = new Error("Admin creation failed");
      vi.mocked(account.createOrgUser).mockRejectedValue(mockError);
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));
      const mockServiceCollection = vi.fn(() => ({ doc: mockConfDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockServiceCollection as any
      );

      await setUpData(mockContext, mockEvent);

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create admin user",
        { error: mockError }
      );
      expect(mockRef.set).not.toHaveBeenCalled();
    });

    it("should handle non-zero versions", async () => {
      mockSnapshot.data.mockReturnValue({
        version: 1,
      });

      await setUpData(mockContext, mockEvent);

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "No action for this version: 1"
      );
      expect(account.createOrgUser).not.toHaveBeenCalled();
      expect(mockRef.set).not.toHaveBeenCalled();
    });

    it("should handle snapshot.ref.set errors", async () => {
      const mockError = new Error("Firestore set failed");
      vi.mocked(account.createOrgUser).mockResolvedValue(E.right("some-uid"));
      mockRef.set.mockRejectedValueOnce(mockError);
      mockSnapshot.data.mockReturnValue({
        version: 0,
        email: "test@example.com",
      });

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockGroupUpdate = vi.fn().mockResolvedValue(undefined);

      const mockGroupDoc = vi.fn(() => ({ update: mockGroupUpdate }));
      const mockGroupCollection = vi.fn(() => ({ doc: mockGroupDoc }));

      const mockOrgDoc = vi.fn(() => ({
        collection: mockGroupCollection,
      }));

      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));

      vi.mocked(mockContext.db.collection).mockImplementation(((
        name: string
      ) => {
        if (name === "service") {
          return { doc: mockConfDoc };
        }
        if (name === "orgs") {
          return { doc: mockOrgDoc };
        }
        return { doc: vi.fn() };
      }) as any);

      await setUpData(mockContext, mockEvent);

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create document version: 1",
        { error: mockError }
      );
    });

    it("should handle null data from snapshot", async () => {
      const mockError = new Error("Email is required");
      vi.mocked(account.createOrgUser).mockRejectedValueOnce(mockError);

      mockSnapshot.data.mockReturnValue(null);

      const mockConfSet = vi.fn().mockResolvedValue(undefined);
      const mockConfDoc = vi.fn(() => ({ set: mockConfSet }));
      const mockServiceCollection = vi.fn(() => ({ doc: mockConfDoc }));
      vi.mocked(mockContext.db.collection).mockImplementation(
        mockServiceCollection as any
      );

      await setUpData(mockContext, mockEvent);

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create admin user",
        expect.objectContaining({ error: mockError })
      );
      expect(account.createOrgUser).toHaveBeenCalled();
    });
  });
});
