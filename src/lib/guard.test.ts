import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Privilege } from "./store";
import type { UserState } from "../types/UserState";

// Mock react
vi.mock("react", () => ({
  useEffect: vi.fn((cb) => cb()),
}));

// Mock react-router
vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  redirect: vi.fn(),
}));

// Mock jotai
vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    getDefaultStore: vi.fn(),
    useAtom: vi.fn(),
  };
});

describe("guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.info and console.log during tests
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("checkAccess", () => {
    it("should allow access when no privileges required", async () => {
      const { checkAccess } = await import("./guard");

      const result = checkAccess({}, [], null);

      expect(result).toBeUndefined();
    });

    it("should allow access when guest privilege and not authenticated", async () => {
      const { checkAccess } = await import("./guard");

      const privileges: Privilege[] = ["guest"];
      const result = checkAccess({}, privileges, null);

      expect(result).toBeUndefined();
    });

    it("should redirect to root when not authenticated and guest privilege not included", async () => {
      const { checkAccess } = await import("./guard");

      const privileges: Privilege[] = ["user"];
      const result = checkAccess({}, privileges, null);

      expect(result).toBe("/");
    });

    it("should allow access when user privilege and authenticated", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["user"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should redirect to user org when sys privilege required but user is not sys", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["sys"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBe("/o/org1");
    });

    it("should allow access when sys privilege required and user is sys", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "sysadmin",
        uid: "user1",
        sys: true,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["sys"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should redirect to user org when manager privilege required but user is not manager", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["manager"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBe("/o/org1");
    });

    it("should allow access when manager privilege required and user is manager", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: true,
        admin: false,
      };

      const privileges: Privilege[] = ["manager"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should redirect to user org when admin privilege required but user is not admin", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["admin"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBe("/o/org1");
    });

    it("should allow access when admin privilege required and user is admin", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      const privileges: Privilege[] = ["admin"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should redirect to user org when accessing different org", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["user"];
      const params = { oid: "org2" };
      const result = checkAccess(params, privileges, dataState);

      expect(result).toBe("/o/org1");
    });

    it("should allow accessing same org", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["user"];
      const params = { oid: "org1" };
      const result = checkAccess(params, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should allow accessing different org when no oid param", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["user"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should allow access when user has one of multiple required privileges", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: true,
        admin: false,
      };

      const privileges: Privilege[] = ["sys", "admin", "manager"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBeUndefined();
    });

    it("should redirect when user has none of multiple required privileges", async () => {
      const { checkAccess } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const privileges: Privilege[] = ["sys", "admin", "manager"];
      const result = checkAccess({}, privileges, dataState);

      expect(result).toBe("/o/org1");
    });
  });

  describe("setPrivileges", () => {
    it("should set privileges and allow access when guard passes", async () => {
      const { getDefaultStore } = await import("jotai");
      const { guardRoute: setPrivileges } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const mockStore = {
        get: vi.fn(() => dataState),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);

      const privileges: Privilege[] = ["user"];
      const middleware = setPrivileges(privileges);
      const next = vi.fn(() => Promise.resolve());

      const result = await middleware(
        {
          params: {},
          context: {} as never,
          request: {} as never,
          unstable_pattern: {} as never,
        },
        next
      );

      expect(mockStore.set).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should redirect when guard fails", async () => {
      const { redirect } = await import("react-router");
      const { getDefaultStore } = await import("jotai");
      const { guardRoute: setPrivileges } = await import("./guard");

      const mockStore = {
        get: vi.fn(() => null),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(redirect).mockReturnValue({
        type: "redirect",
        path: "/",
      } as never);

      const privileges: Privilege[] = ["user"];
      const middleware = setPrivileges(privileges);
      const next = vi.fn();

      const result = await middleware(
        {
          params: {},
          context: {} as never,
          request: {} as never,
          unstable_pattern: {} as never,
        },
        next
      );

      expect(mockStore.set).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/");
      expect(next).not.toHaveBeenCalled();
      expect(result).toEqual({ type: "redirect", path: "/" });
    });

    it("should redirect to user org when accessing wrong org", async () => {
      const { redirect } = await import("react-router");
      const { getDefaultStore } = await import("jotai");
      const { guardRoute: setPrivileges } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const mockStore = {
        get: vi.fn(() => dataState),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(redirect).mockReturnValue({
        type: "redirect",
        path: "/o/org1",
      } as never);

      const privileges: Privilege[] = ["user"];
      const middleware = setPrivileges(privileges);
      const next = vi.fn();

      await middleware(
        {
          params: { oid: "org2" },
          context: {} as never,
          request: {} as never,
          unstable_pattern: {} as never,
        },
        next
      );

      expect(redirect).toHaveBeenCalledWith("/o/org1");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("useGuard", () => {
    it("should navigate when guard fails (not authenticated, user privilege required)", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { useAtom } = await import("jotai");
      const { useGuard } = await import("./guard");

      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useParams).mockReturnValue({});
      vi.mocked(useAtom)
        .mockReturnValueOnce([["user"], vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >)
        .mockReturnValueOnce([null, vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >);

      useGuard();

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should not navigate when guard passes", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { useAtom } = await import("jotai");
      const { useGuard } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useParams).mockReturnValue({ oid: "org1" });
      vi.mocked(useAtom)
        .mockReturnValueOnce([["user"], vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >)
        .mockReturnValueOnce([dataState, vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >);

      useGuard();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should navigate to user org when accessing wrong org", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { useAtom } = await import("jotai");
      const { useGuard } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useParams).mockReturnValue({ oid: "org2" });
      vi.mocked(useAtom)
        .mockReturnValueOnce([["user"], vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >)
        .mockReturnValueOnce([dataState, vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >);

      useGuard();

      expect(mockNavigate).toHaveBeenCalledWith("/o/org1");
    });

    it("should navigate to user org when privilege check fails", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { useAtom } = await import("jotai");
      const { useGuard } = await import("./guard");

      const dataState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useParams).mockReturnValue({});
      vi.mocked(useAtom)
        .mockReturnValueOnce([["admin"], vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >)
        .mockReturnValueOnce([dataState, vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >);

      useGuard();

      expect(mockNavigate).toHaveBeenCalledWith("/o/org1");
    });

    it("should not navigate when no privileges required", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { useAtom } = await import("jotai");
      const { useGuard } = await import("./guard");

      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useParams).mockReturnValue({});
      vi.mocked(useAtom)
        .mockReturnValueOnce([[], vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >)
        .mockReturnValueOnce([null, vi.fn()] as unknown as ReturnType<
          typeof useAtom
        >);

      useGuard();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
