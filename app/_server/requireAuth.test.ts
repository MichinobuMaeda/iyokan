import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Auth } from "firebase/auth";

// Mock next/navigation before importing the module
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not redirect when user is authenticated", async () => {
    const { redirect } = await import("next/navigation");
    const { requireAuth } = await import("./requireAuth");

    const mockAuth = {
      currentUser: { uid: "test-user-123" },
    } as Auth;

    requireAuth(mockAuth);

    expect(redirect).not.toHaveBeenCalled();
  });

  it("should redirect to /login when no user is authenticated", async () => {
    const { redirect } = await import("next/navigation");
    const { requireAuth } = await import("./requireAuth");

    const mockAuth = {
      currentUser: null,
    } as Auth;

    requireAuth(mockAuth);

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
