/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock Next.js navigation
const mockRedirect = vi.fn();
const mockUseRouter = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  useRouter: mockUseRouter,
}));

// Mock Firebase
vi.mock("./firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user and router when user is authenticated", async () => {
    const authModule = await import("./firebase");
    const { useAuth } = await import("./useAuth");

    const mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    const mockUser = {
      uid: "test-uid-123",
      email: "test@example.com",
    };

    mockUseRouter.mockReturnValue(mockRouter);
    Object.defineProperty(authModule.auth, "currentUser", {
      writable: true,
      configurable: true,
      value: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.router).toEqual(mockRouter);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should call redirect to /login when user is not authenticated", async () => {
    const authModule = await import("./firebase");
    const { useAuth } = await import("./useAuth");

    const mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockUseRouter.mockReturnValue(mockRouter);
    Object.defineProperty(authModule.auth, "currentUser", {
      writable: true,
      configurable: true,
      value: null,
    });

    // Mock redirect to throw to simulate the redirect behavior
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
