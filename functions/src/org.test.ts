import { describe, it, expect, beforeEach, vi } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import { createOrgAndGroups } from "./org.js";
import type { Context } from "./firebase.js";
import { GID_ADMINS, GID_MANAGERS } from "./common.js";

describe("org", () => {
  let mockContext: Context;
  let mockOrgSet: any;
  let mockGroupSet: any;
  let mockGroupDoc: any;
  let mockGroupCollection: any;
  let mockOrgDoc: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrgSet = vi.fn().mockResolvedValue(undefined);
    mockGroupSet = vi.fn().mockResolvedValue(undefined);
    mockGroupDoc = vi.fn(() => ({ set: mockGroupSet }));
    mockGroupCollection = vi.fn(() => ({ doc: mockGroupDoc }));

    mockOrgDoc = vi.fn(() => ({
      id: "test-org-id",
      set: mockOrgSet,
      collection: mockGroupCollection,
    }));

    mockContext = {
      auth: {} as any,
      db: {
        collection: vi.fn(() => ({ doc: mockOrgDoc })),
      } as any,
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      } as any,
    };
  });

  describe("createOrgAndGroups", () => {
    it("should create org with all groups successfully", async () => {
      const result = await createOrgAndGroups(mockContext, {
        oid: "org-123",
        name: "Test Organization",
        desc: "Test Description",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("test-org-id");
      }

      expect(mockContext.db.collection).toHaveBeenCalledWith("orgs");
      expect(mockOrgDoc).toHaveBeenCalledWith("org-123");
      expect(mockOrgSet).toHaveBeenCalledWith({
        oid: "org-123",
        name: "Test Organization",
        desc: "Test Description",
        valid: true,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockContext.logger.info).toHaveBeenCalledWith("Org created", {
        oid: "org-123",
        name: "Test Organization",
      });

      expect(mockGroupCollection).toHaveBeenCalledWith("groups");
      expect(mockGroupDoc).toHaveBeenCalledWith(GID_MANAGERS);
      expect(mockGroupDoc).toHaveBeenCalledWith(GID_ADMINS);

      expect(mockGroupSet).toHaveBeenCalledWith({
        name: "Managers",
        members: [],
        valid: true,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockGroupSet).toHaveBeenCalledWith({
        name: "Admins",
        members: [],
        valid: true,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Managers group created",
        { oid: "org-123" }
      );
      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Admins group created",
        { oid: "org-123" }
      );
    });

    it("should create org without optional desc field", async () => {
      const result = await createOrgAndGroups(mockContext, {
        oid: "org-456",
        name: "Minimal Org",
        desc: undefined,
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe("test-org-id");
      }

      expect(mockOrgSet).toHaveBeenCalledWith({
        oid: "org-456",
        name: "Minimal Org",
        desc: undefined,
        valid: true,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });

    it("should return Left(Error) when oid is missing", async () => {
      const result = await createOrgAndGroups(mockContext, {
        oid: "",
        name: "Test Org",
        desc: "Description",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Missing required org data");
      }

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Missing required org data",
        { oid: "", name: "Test Org" }
      );

      expect(mockOrgSet).not.toHaveBeenCalled();
    });

    it("should return Left(Error) when name is missing", async () => {
      const result = await createOrgAndGroups(mockContext, {
        oid: "org-789",
        name: "",
        desc: "Description",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("Missing required org data");
      }

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Missing required org data",
        { oid: "org-789", name: "" }
      );

      expect(mockOrgSet).not.toHaveBeenCalled();
    });

    it("should return Left(Error) when org set fails", async () => {
      const mockError = new Error("Firestore error");
      mockOrgSet.mockRejectedValue(mockError);

      const result = await createOrgAndGroups(mockContext, {
        oid: "org-fail",
        name: "Failing Org",
        desc: "Will fail",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create org",
        { error: mockError }
      );
    });

    it("should return Left(Error) when managers group creation fails", async () => {
      const mockError = new Error("Group creation error");
      mockGroupSet.mockRejectedValueOnce(mockError);

      const result = await createOrgAndGroups(mockContext, {
        oid: "org-group-fail",
        name: "Group Fail Org",
        desc: undefined,
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create org",
        { error: mockError }
      );
    });

    it("should return Left(Error) when admins group creation fails", async () => {
      const mockError = new Error("Admin group creation error");
      mockGroupSet
        .mockResolvedValueOnce(undefined) // managers group succeeds
        .mockRejectedValueOnce(mockError); // admins group fails

      const result = await createOrgAndGroups(mockContext, {
        oid: "org-admin-fail",
        name: "Admin Fail Org",
        desc: undefined,
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(mockError);
      }

      expect(mockContext.logger.info).toHaveBeenCalledWith(
        "Managers group created",
        { oid: "org-admin-fail" }
      );

      expect(mockContext.logger.error).toHaveBeenCalledWith(
        "Failed to create org",
        { error: mockError }
      );
    });

    it("should create org with valid=false when specified", async () => {
      const result = await createOrgAndGroups(mockContext, {
        oid: "org-invalid",
        name: "Invalid Org",
        valid: false,
      });

      expect(E.isRight(result)).toBe(true);

      expect(mockOrgSet).toHaveBeenCalledWith({
        oid: "org-invalid",
        name: "Invalid Org",
        desc: undefined,
        valid: false,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockGroupSet).toHaveBeenCalledWith({
        name: "Managers",
        members: [],
        valid: false,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(mockGroupSet).toHaveBeenCalledWith({
        name: "Admins",
        members: [],
        valid: false,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
    });
  });
});
