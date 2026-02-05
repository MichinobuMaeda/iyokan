import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";
import type { User } from "firebase/auth";

import type { UserPrivileges } from "../../functions/src/common";
import { oidAtom, userPrivilegesAtom, appStateAtom } from "./store";

// Mock modules
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  sub: vi.fn(),
};

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    getDefaultStore: vi.fn(() => mockStore),
  };
});

const mockSubscribeUserDataAll = vi.fn();
const mockUnsubscribeUserDataAll = vi.fn();

vi.mock("./firestore", () => ({
  subscribeUserDataAll: mockSubscribeUserDataAll,
  unsubscribeUserDataAll: mockUnsubscribeUserDataAll,
}));

const mockLogout = vi.fn();

vi.mock("./auth", () => ({
  logout: mockLogout,
}));

const mockGetUserPrivs = vi.fn();

vi.mock("./functions", () => ({
  getUserPrivs: mockGetUserPrivs,
}));

describe("app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("setValidOrganization", () => {
    it("should set first privileged org when current is not in privileges", async () => {
      const { setValidOrganization } = await import("./app");

      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
        org2: { admin: false, manager: true },
      };

      mockStore.get.mockReturnValue("invalidOrg");

      setValidOrganization(mockStore, privs);

      expect(mockStore.set).toHaveBeenCalledWith(oidAtom, "org1");
    });

    it("should not change org when current is valid", async () => {
      const { setValidOrganization } = await import("./app");

      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
        org2: { admin: false, manager: true },
      };

      mockStore.get.mockReturnValue("org2");

      setValidOrganization(mockStore, privs);

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    it("should not change org when current is null and no privileges", async () => {
      const { setValidOrganization } = await import("./app");

      mockStore.get.mockReturnValue(null);

      setValidOrganization(mockStore, null);

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    it("should not change org when privileges is undefined", async () => {
      const { setValidOrganization } = await import("./app");

      mockStore.get.mockReturnValue("org1");

      setValidOrganization(mockStore, undefined);

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    it("should not change org when privileges is empty object", async () => {
      const { setValidOrganization } = await import("./app");

      mockStore.get.mockReturnValue("org1");

      setValidOrganization(mockStore, {});

      expect(mockStore.set).not.toHaveBeenCalled();
    });

    it("should set org when current is null and privileges exist", async () => {
      const { setValidOrganization } = await import("./app");

      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };

      mockStore.get.mockReturnValue(null);

      setValidOrganization(mockStore, privs);

      expect(mockStore.set).toHaveBeenCalledWith(oidAtom, "org1");
    });
  });

  describe("setAppState", () => {
    it("should set privileges when user has valid privileges", async () => {
      const { setAppState } = await import("./app");

      const user = { uid: "user123" } as User;
      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };

      mockGetUserPrivs.mockResolvedValue(E.right(privs));
      mockStore.get.mockReturnValue(null);

      await setAppState(mockStore, user);

      expect(mockGetUserPrivs).toHaveBeenCalledWith("user123");
      expect(mockStore.set).toHaveBeenCalledWith(userPrivilegesAtom, privs);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("should logout user when privileges fetch fails", async () => {
      const { setAppState } = await import("./app");

      const user = { uid: "user123" } as User;

      mockGetUserPrivs.mockResolvedValue(E.left("errorGetUserPrivs"));
      mockLogout.mockResolvedValue(E.right(undefined));

      await setAppState(mockStore, user);

      expect(mockGetUserPrivs).toHaveBeenCalledWith("user123");
      expect(mockLogout).toHaveBeenCalled();
      expect(mockStore.set).toHaveBeenCalledWith(userPrivilegesAtom, null);
    });

    it("should set privileges to null when user is null", async () => {
      const { setAppState } = await import("./app");

      mockGetUserPrivs.mockResolvedValue(E.left("errorGetUserPrivs"));

      await setAppState(mockStore, null);

      expect(mockGetUserPrivs).toHaveBeenCalledWith(undefined);
      expect(mockLogout).not.toHaveBeenCalled();
      expect(mockStore.set).toHaveBeenCalledWith(userPrivilegesAtom, null);
    });

    it("should call setValidOrganization with privileges", async () => {
      const { setAppState } = await import("./app");

      const user = { uid: "user123" } as User;
      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
        org2: { admin: false, manager: true },
      };

      mockGetUserPrivs.mockResolvedValue(E.right(privs));
      mockStore.get.mockReturnValue("invalidOrg");

      await setAppState(mockStore, user);

      expect(mockStore.set).toHaveBeenCalledWith(oidAtom, "org1");
      expect(mockStore.set).toHaveBeenCalledWith(userPrivilegesAtom, privs);
    });
  });

  describe("listenAppState", () => {
    it("should subscribe to app state changes", async () => {
      const { listenAppState } = await import("./app");

      listenAppState();

      expect(mockStore.sub).toHaveBeenCalledWith(
        appStateAtom,
        expect.any(Function)
      );
    });

    it("should subscribe to user data when appState is set", async () => {
      const { listenAppState } = await import("./app");

      let callback: () => void;
      mockStore.sub.mockImplementation((_atom, cb) => {
        callback = cb;
      });

      const appState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      mockStore.get.mockReturnValue(appState);

      listenAppState();
      callback!();

      expect(mockSubscribeUserDataAll).toHaveBeenCalledWith(appState);
      expect(mockUnsubscribeUserDataAll).not.toHaveBeenCalled();
    });

    it("should unsubscribe from user data when appState is null", async () => {
      const { listenAppState } = await import("./app");

      let callback: () => void;
      mockStore.sub.mockImplementation((_atom, cb) => {
        callback = cb;
      });

      mockStore.get.mockReturnValueOnce(null).mockReturnValueOnce(null);
      mockLogout.mockResolvedValue(E.right(undefined));

      listenAppState();
      callback!();

      expect(mockUnsubscribeUserDataAll).toHaveBeenCalledWith(null);
      expect(mockLogout).toHaveBeenCalled();
    });

    it("should unsubscribe from user data when appState is undefined", async () => {
      const { listenAppState } = await import("./app");

      let callback: () => void;
      mockStore.sub.mockImplementation((_atom, cb) => {
        callback = cb;
      });

      mockStore.get.mockReturnValue(undefined);

      listenAppState();
      callback!();

      expect(mockUnsubscribeUserDataAll).toHaveBeenCalledWith(undefined);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it("should logout when appState is null and userPrivileges is null", async () => {
      const { listenAppState } = await import("./app");

      let callback: () => void;
      mockStore.sub.mockImplementation((_atom, cb) => {
        callback = cb;
      });

      mockStore.get
        .mockReturnValueOnce(null) // appState
        .mockReturnValueOnce(null); // userPrivileges

      mockLogout.mockResolvedValue(E.right(undefined));

      listenAppState();
      callback!();

      expect(mockLogout).toHaveBeenCalled();
    });

    it("should not logout when appState is null but userPrivileges is set", async () => {
      const { listenAppState } = await import("./app");

      let callback: () => void;
      mockStore.sub.mockImplementation((_atom, cb) => {
        callback = cb;
      });

      const privs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };

      mockStore.get
        .mockReturnValueOnce(null) // appState
        .mockReturnValueOnce(privs); // userPrivileges

      listenAppState();
      callback!();

      expect(mockLogout).not.toHaveBeenCalled();
    });
  });
});
