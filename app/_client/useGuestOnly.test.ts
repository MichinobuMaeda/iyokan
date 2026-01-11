/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock Next.js navigation
const mockReplace = vi.fn();
const mockUseRouter = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
}));

// Mock Firebase
const mockOnAuthStateChanged = vi.fn();

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock("./firebase", () => ({
  auth: {},
}));

describe("useGuestOnly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call onAuthStateChanged and redirect when user is authenticated", async () => {
    const { useGuestOnly } = await import("./useGuestOnly");

    const mockRouter = {
      replace: mockReplace,
    };

    mockUseRouter.mockReturnValue(mockRouter);

    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate user is authenticated
      callback({ uid: "test-uid", email: "test@example.com" });
      return unsubscribe;
    });

    const { unmount } = renderHook(() => useGuestOnly());

    expect(mockOnAuthStateChanged).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/");

    // Test cleanup
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not redirect when user is not authenticated", async () => {
    const { useGuestOnly } = await import("./useGuestOnly");

    const mockRouter = {
      replace: mockReplace,
    };

    mockUseRouter.mockReturnValue(mockRouter);

    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate user is not authenticated
      callback(null);
      return unsubscribe;
    });

    const { unmount } = renderHook(() => useGuestOnly());

    expect(mockOnAuthStateChanged).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();

    // Test cleanup
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not set up auth listener when disabled is true", async () => {
    const { useGuestOnly } = await import("./useGuestOnly");

    const mockRouter = {
      replace: mockReplace,
    };

    mockUseRouter.mockReturnValue(mockRouter);

    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback({ uid: "test-uid", email: "test@example.com" });
      return unsubscribe;
    });

    const { unmount } = renderHook(() => useGuestOnly(true));

    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();

    unmount();
  });
});
