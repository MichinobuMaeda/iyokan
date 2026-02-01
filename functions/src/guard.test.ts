import { describe, it, expect, beforeEach, vi } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import {
  guardAuth,
  guardOrgUsers,
  guardOrgGroupMember,
  guardSystemAdmin,
  guardManager,
  guardAdmin,
} from "./guard.js";
import * as firebase from "./firebase.js";

vi.mock("./firebase.js", () => ({
  isOrganizationMember: vi.fn(),
  isGroupMember: vi.fn(),
}));

describe("guard", () => {
  const mockContext = {
    auth: {} as any,
    db: {} as any,
    logger: {} as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("guardAuth", () => {
    it("should return Right when user is authenticated", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {},
      } as any;

      const result = await guardAuth(mockRequest);
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when auth is missing", async () => {
      const mockRequest = {
        data: {},
      } as any;

      const result = await guardAuth(mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
    });

    it("should return Left when uid is missing", async () => {
      const mockRequest = {
        auth: {},
        data: {},
      } as any;

      const result = await guardAuth(mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
    });
  });

  describe("guardOrgUsers", () => {
    it("should return Right when user is authenticated and valid org member", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));

      const result = await guardOrgUsers(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
      expect(firebase.isOrganizationMember).toHaveBeenCalledWith(mockContext, {
        uid: "user123",
        oid: "org123",
      });
    });

    it("should return Left when user is not authenticated", async () => {
      const mockRequest = {
        data: {
          oid: "org123",
        },
      } as any;

      const result = await guardOrgUsers(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
      expect(firebase.isOrganizationMember).not.toHaveBeenCalled();
    });

    it("should return Left when user is not a valid org member", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(
        E.right(false)
      );

      const result = await guardOrgUsers(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("invalid user");
      }
    });

    it("should return Left when isOrganizationMember returns an error", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      const error = new Error("firestore error");
      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.left(error));

      const result = await guardOrgUsers(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(error);
      }
    });
  });

  describe("guardOrgGroupMember", () => {
    it("should return Right when user is authenticated, valid org member, and group member", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(true));

      const result = await guardOrgGroupMember(
        mockContext,
        mockRequest,
        "org123",
        "group123"
      );
      expect(E.isRight(result)).toBe(true);
      expect(firebase.isGroupMember).toHaveBeenCalledWith(mockContext, {
        uid: "user123",
        oid: "org123",
        gid: "group123",
      });
    });

    it("should return Left when user is not authenticated", async () => {
      const mockRequest = {
        data: {
          oid: "org123",
        },
      } as any;

      const result = await guardOrgGroupMember(
        mockContext,
        mockRequest,
        "org123",
        "group123"
      );
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
      expect(firebase.isGroupMember).not.toHaveBeenCalled();
    });

    it("should return Left when user is not a valid org member", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(
        E.right(false)
      );

      const result = await guardOrgGroupMember(
        mockContext,
        mockRequest,
        "org123",
        "group123"
      );
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("invalid user");
      }
      expect(firebase.isGroupMember).not.toHaveBeenCalled();
    });

    it("should return Left when user is not a group member", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(false));

      const result = await guardOrgGroupMember(
        mockContext,
        mockRequest,
        "org123",
        "group123"
      );
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("forbidden");
      }
    });

    it("should return Left when isGroupMember returns an error", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      const error = new Error("unknown state");
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.left(error));

      const result = await guardOrgGroupMember(
        mockContext,
        mockRequest,
        "org123",
        "group123"
      );
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe(error);
      }
    });
  });

  describe("guardSystemAdmin", () => {
    it("should return Right when user is a system admin", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
        data: {},
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(true));

      const result = await guardSystemAdmin(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left when user is not authenticated", async () => {
      const mockRequest = {
        data: {
          oid: "admin",
        },
      } as any;

      const result = await guardSystemAdmin(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
    });

    it("should return Left when user is not a system admin", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "admin",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(false));

      const result = await guardSystemAdmin(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("forbidden");
      }
    });
  });

  describe("guardManager", () => {
    it("should return Right when user is a system admin", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
        data: {
          oid: "admin",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(true));

      const result = await guardManager(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
      // Should check system admin first
      expect(firebase.isOrganizationMember).toHaveBeenCalledWith(mockContext, {
        uid: "admin123",
        oid: "sys",
      });
      expect(firebase.isGroupMember).toHaveBeenCalledWith(mockContext, {
        uid: "admin123",
        oid: "sys",
        gid: "admins",
      });
    });

    it("should return Right when user is an organization manager", async () => {
      const mockRequest = {
        auth: {
          uid: "manager123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember)
        .mockResolvedValueOnce(E.right(true)) // For system admin check (data.oid='org123', but won't match admin)
        .mockResolvedValueOnce(E.right(true)); // For org manager check
      vi.mocked(firebase.isGroupMember)
        .mockResolvedValueOnce(E.right(false)) // Not system admin
        .mockResolvedValueOnce(E.right(true)); // Is org manager

      const result = await guardManager(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
      // Should check both system admin and org manager
      // guardManager passes request.data.oid to guardOrgGroupMember
      expect(firebase.isGroupMember).toHaveBeenLastCalledWith(mockContext, {
        uid: "manager123",
        oid: "org123",
        gid: "managers",
      });
    });

    it("should return Left when user is neither system admin nor org manager", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember)
        .mockResolvedValueOnce(E.right(true)) // For system admin check
        .mockResolvedValueOnce(E.right(true)); // For org manager check
      vi.mocked(firebase.isGroupMember)
        .mockResolvedValueOnce(E.right(false)) // Not system admin
        .mockResolvedValueOnce(E.right(false)); // Not org manager

      const result = await guardManager(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("forbidden");
      }
    });

    it("should return Left when user is not authenticated", async () => {
      const mockRequest = {
        data: {
          oid: "org123",
        },
      } as any;

      const result = await guardManager(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
    });
  });

  describe("guardAdmin", () => {
    it("should return Right when user is a system admin", async () => {
      const mockRequest = {
        auth: {
          uid: "admin123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember).mockResolvedValue(E.right(true));
      vi.mocked(firebase.isGroupMember).mockResolvedValue(E.right(true));

      const result = await guardAdmin(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
      // guardAdmin calls guardSystemAdmin -> guardOrgGroupMember(oid="sys")
      // but guardOrgGroupMember -> guardOrgUsers uses request.data.oid
      expect(firebase.isOrganizationMember).toHaveBeenCalledWith(mockContext, {
        uid: "admin123",
        oid: "sys", // Uses OID_SYSADMIN constant
      });
      expect(firebase.isGroupMember).toHaveBeenCalledWith(mockContext, {
        uid: "admin123",
        oid: "sys", // This uses the OID_SYSADMIN constant
        gid: "admins",
      });
    });

    it("should return Right when user is an organization admin", async () => {
      const mockRequest = {
        auth: {
          uid: "orgadmin123",
        },
        data: {
          oid: "org123",
        },
      } as any;

      vi.mocked(firebase.isOrganizationMember)
        .mockResolvedValueOnce(E.right(true)) // For system admin check
        .mockResolvedValueOnce(E.right(true)); // For org admin check
      vi.mocked(firebase.isGroupMember)
        .mockResolvedValueOnce(E.right(false)) // Not system admin
        .mockResolvedValueOnce(E.right(true)); // Is org admin

      const result = await guardAdmin(mockContext, mockRequest);
      expect(E.isRight(result)).toBe(true);
      // Should check both system admin and org admin
      // guardAdmin passes request.data.oid to guardOrgGroupMember
      expect(firebase.isGroupMember).toHaveBeenLastCalledWith(mockContext, {
        uid: "orgadmin123",
        oid: mockRequest.data.oid,
        gid: "admins",
      });
    });

    it("should return Left when user is neither system admin nor org admin", async () => {
      const mockRequest = {
        auth: {
          uid: "user123",
        },
        data: "org123",
      } as any;

      vi.mocked(firebase.isOrganizationMember)
        .mockResolvedValueOnce(E.right(true)) // For system admin check
        .mockResolvedValueOnce(E.right(true)); // For org admin check
      vi.mocked(firebase.isGroupMember)
        .mockResolvedValueOnce(E.right(false)) // Not system admin
        .mockResolvedValueOnce(E.right(false)); // Not org admin

      const result = await guardAdmin(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("forbidden");
      }
    });

    it("should return Left when user is not authenticated", async () => {
      const mockRequest = {
        data: {
          oid: "org123",
        },
      } as any;

      const result = await guardAdmin(mockContext, mockRequest);
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left.message).toBe("unauthenticated");
      }
    });
  });
});
