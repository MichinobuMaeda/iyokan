import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";

import type { CreateOrgData } from "../../functions/src/common";

// Mock Firebase functions
vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(),
}));

vi.mock("./firebase", () => ({
  functions: {},
}));

describe("client functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear module cache to ensure fresh imports
    vi.resetModules();
    // Suppress console.error and console.info during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  describe("createOrg", () => {
    it("should return right on successful org creation", async () => {
      const { httpsCallable } = await import("firebase/functions");

      const mockCallable = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const { createOrg } = await import("./functions");

      const formData: CreateOrgData = {
        oid: "org123",
        name: "Test Org",
        desc: "A test organization",
        valid: true,
      };
      const result = await createOrg(formData);

      expect(E.isRight(result)).toBe(true);
      expect(httpsCallable).toHaveBeenCalledWith({}, "createOrg");
      expect(mockCallable).toHaveBeenCalledWith(formData);
    });

    it("should return errorCreateOrg on failure", async () => {
      const { httpsCallable } = await import("firebase/functions");

      const mockCallable = vi
        .fn()
        .mockRejectedValue(new Error("Function error"));
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const { createOrg } = await import("./functions");

      const formData: CreateOrgData = {
        oid: "org123",
        name: "Test Org",
        desc: "A test organization",
        valid: true,
      };
      const result = await createOrg(formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorCreateOrg");
      }
    });
  });

  describe("createUser", () => {
    it("should return right on successful user creation", async () => {
      const { httpsCallable } = await import("firebase/functions");

      const mockCallable = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const { createUser } = await import("./functions");

      const formData = {
        oid: "org123",
        name: "Test User",
        email: "user@example.com",
        valid: true,
      };
      const result = await createUser(formData);

      expect(E.isRight(result)).toBe(true);
      expect(httpsCallable).toHaveBeenCalledWith({}, "createUser");
      expect(mockCallable).toHaveBeenCalledWith(formData);
    });

    it("should return errorCreateUser on failure", async () => {
      const { httpsCallable } = await import("firebase/functions");

      const mockCallable = vi
        .fn()
        .mockRejectedValue(new Error("Function error"));
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const { createUser } = await import("./functions");

      const formData = {
        oid: "org123",
        name: "Test User",
        email: "user@example.com",
        valid: true,
      };
      const result = await createUser(formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorCreateUser");
      }
    });
  });
});
