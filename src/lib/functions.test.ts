import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";

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
  });

  describe("createUser", () => {
    it("should return right on successful user creation", async () => {
      const { httpsCallable } = await import("firebase/functions");
      const { createUser } = await import("./functions");

      const mockCallable = vi.fn().mockResolvedValue({ data: {} });
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const result = await createUser("org123", {
        name: "Test User",
        email: "user@example.com",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(httpsCallable).toHaveBeenCalledWith({}, "createUser");
      expect(mockCallable).toHaveBeenCalledWith({
        oid: "org123",
        name: "Test User",
        email: "user@example.com",
        valid: true,
      });
    });

    it("should return errorCreateUser on failure", async () => {
      const { httpsCallable } = await import("firebase/functions");
      const { createUser } = await import("./functions");

      const mockCallable = vi
        .fn()
        .mockRejectedValue(new Error("Function error"));
      vi.mocked(httpsCallable).mockReturnValue(mockCallable as never);

      const result = await createUser("org123", {
        name: "Test User",
        email: "user@example.com",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorCreateUser");
      }
    });
  });
});
