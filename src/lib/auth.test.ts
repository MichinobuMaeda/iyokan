import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import type { User } from "firebase/auth";

// Mock Firebase modules
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  reauthenticateWithCredential: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getDoc: vi.fn(),
  doc: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}));

vi.mock("./firebase", () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  functions: {},
}));

vi.mock("./firestore", () => ({
  unsubscribeUserData: vi.fn(),
}));

vi.mock("./app", () => ({
  setAppState: vi.fn(),
}));

vi.mock("./store", () => ({
  authUserAtom: { toString: () => "authUserAtom" },
  localeAtom: { toString: () => "localeAtom" },
  oidAtom: { toString: () => "oidAtom" },
  userPrivilegesAtom: { toString: () => "userPrivilegesAtom" },
  authStateAtom: { toString: () => "authStateAtom" },
}));

vi.mock("jotai", () => ({
  getDefaultStore: vi.fn(() => ({
    get: vi.fn(() => null),
    set: vi.fn(),
  })),
}));

// Mock document and window for node environment
global.document = {
  cookie: "",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

global.window = {
  location: {
    href: "",
    origin: "http://localhost:3000",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as any;

describe("client auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document.cookie
    global.document.cookie = "";
    // Reset window.location.href
    global.window.location.href = "";
    // Reset localStorage
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
    vi.mocked(localStorage.removeItem).mockClear();
    // Suppress console.error and console.info during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  describe("listenAuthState", () => {
    it("should set up auth state listener and update store on auth change", async () => {
      const { onAuthStateChanged, isSignInWithEmailLink } =
        await import("firebase/auth");
      const { getDefaultStore } = await import("jotai");
      const { authUserAtom } = await import("./store");
      const { setAppState } = await import("./app");
      const { initAuth: listenAuthState } = await import("./auth");

      const mockUser = { uid: "test-uid-123", email: "test@example.com" };
      const mockStore = {
        get: vi.fn(() => null), // No previous user
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(isSignInWithEmailLink).mockReturnValue(false);
      vi.mocked(onAuthStateChanged).mockImplementation(
        (_auth, nextOrObserver) => {
          if (typeof nextOrObserver === "function") {
            nextOrObserver(mockUser as User);
          }
          return vi.fn();
        }
      );

      await listenAuthState();

      expect(onAuthStateChanged).toHaveBeenCalled();
      expect(mockStore.set).toHaveBeenCalledWith(authUserAtom, mockUser);
      expect(setAppState).toHaveBeenCalledWith(mockStore, mockUser);
    });

    it("should call setAppState when uid changes", async () => {
      const { onAuthStateChanged, isSignInWithEmailLink } =
        await import("firebase/auth");
      const { getDefaultStore } = await import("jotai");
      const { authUserAtom } = await import("./store");
      const { setAppState } = await import("./app");
      const { initAuth: listenAuthState } = await import("./auth");

      const prevUser = { uid: "old-uid", email: "old@example.com" };
      const newUser = { uid: "new-uid", email: "new@example.com" };
      const mockStore = {
        get: vi.fn(() => prevUser),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(isSignInWithEmailLink).mockReturnValue(false);
      vi.mocked(onAuthStateChanged).mockImplementation(
        (_auth, nextOrObserver) => {
          if (typeof nextOrObserver === "function") {
            nextOrObserver(newUser as User);
          }
          return vi.fn();
        }
      );

      await listenAuthState();

      expect(mockStore.set).toHaveBeenCalledWith(authUserAtom, newUser);
      expect(setAppState).toHaveBeenCalledWith(mockStore, newUser);
    });

    it("should not call setAppState when uid remains the same", async () => {
      const { onAuthStateChanged, isSignInWithEmailLink } =
        await import("firebase/auth");
      const { getDefaultStore } = await import("jotai");
      const { authUserAtom } = await import("./store");
      const { setAppState } = await import("./app");
      const { initAuth: listenAuthState } = await import("./auth");

      const sameUser = { uid: "same-uid", email: "test@example.com" };
      const mockStore = {
        get: vi.fn(() => sameUser),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(isSignInWithEmailLink).mockReturnValue(false);
      vi.mocked(onAuthStateChanged).mockImplementation(
        (_auth, nextOrObserver) => {
          if (typeof nextOrObserver === "function") {
            nextOrObserver(sameUser as User);
          }
          return vi.fn();
        }
      );

      await listenAuthState();

      expect(mockStore.set).toHaveBeenCalledWith(authUserAtom, sameUser);
      expect(setAppState).not.toHaveBeenCalled();
    });

    it("should handle user logout (null user)", async () => {
      const { onAuthStateChanged, isSignInWithEmailLink } =
        await import("firebase/auth");
      const { getDefaultStore } = await import("jotai");
      const { authUserAtom } = await import("./store");
      const { setAppState } = await import("./app");
      const { initAuth: listenAuthState } = await import("./auth");

      const prevUser = { uid: "test-uid", email: "test@example.com" };
      const mockStore = {
        get: vi.fn(() => prevUser),
        set: vi.fn(),
      };

      vi.mocked(getDefaultStore).mockReturnValue(mockStore as never);
      vi.mocked(isSignInWithEmailLink).mockReturnValue(false);
      vi.mocked(onAuthStateChanged).mockImplementation(
        (_auth, nextOrObserver) => {
          if (typeof nextOrObserver === "function") {
            nextOrObserver(null);
          }
          return vi.fn();
        }
      );

      await listenAuthState();

      expect(mockStore.set).toHaveBeenCalledWith(authUserAtom, null);
      expect(setAppState).toHaveBeenCalledWith(mockStore, null);
    });
  });

  describe("handleSignInWithEmailLink", () => {
    it("should do nothing if URL is not a sign-in link and call next", async () => {
      const { isSignInWithEmailLink } = await import("firebase/auth");
      const { handleSignInWithEmailLink } = await import("./auth");

      vi.mocked(isSignInWithEmailLink).mockReturnValue(false);
      global.window.location.href = "http://localhost:3000/some-page";
      const mockNext = vi.fn();

      await handleSignInWithEmailLink(mockNext);

      expect(isSignInWithEmailLink).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should sign in with email link when valid", async () => {
      const { isSignInWithEmailLink, signInWithEmailLink } =
        await import("firebase/auth");
      const { handleSignInWithEmailLink } = await import("./auth");

      vi.mocked(localStorage.getItem).mockReturnValue("test@example.com");
      vi.mocked(isSignInWithEmailLink).mockReturnValue(true);
      vi.mocked(signInWithEmailLink).mockResolvedValue({
        user: { uid: "test-uid" },
      } as never);

      global.window.location.href = "http://localhost:3000?apiKey=xxx";
      const mockNext = vi.fn();

      await handleSignInWithEmailLink(mockNext);

      expect(isSignInWithEmailLink).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith("iyokan-sendLinkEmail");
      expect(signInWithEmailLink).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "http://localhost:3000?apiKey=xxx"
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        "iyokan-sendLinkEmail"
      );
      expect(global.window.location.href).toBe("http://localhost:3000");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle error when signing in with email link fails", async () => {
      const { isSignInWithEmailLink, signInWithEmailLink } =
        await import("firebase/auth");
      const { handleSignInWithEmailLink } = await import("./auth");

      vi.mocked(localStorage.getItem).mockReturnValue("test@example.com");
      vi.mocked(isSignInWithEmailLink).mockReturnValue(true);
      vi.mocked(signInWithEmailLink).mockRejectedValue(
        new Error("Sign-in failed")
      );

      global.window.location.href = "http://localhost:3000?apiKey=xxx";
      const mockNext = vi.fn();

      await handleSignInWithEmailLink(mockNext);

      expect(signInWithEmailLink).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Error signing in with email link:",
        expect.any(Error)
      );
      expect(global.window.location.href).toBe("http://localhost:3000");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not sign in if email is missing from localStorage", async () => {
      const { isSignInWithEmailLink, signInWithEmailLink } =
        await import("firebase/auth");
      const { handleSignInWithEmailLink } = await import("./auth");

      vi.mocked(localStorage.getItem).mockReturnValue(null);
      vi.mocked(isSignInWithEmailLink).mockReturnValue(true);

      global.window.location.href = "http://localhost:3000?apiKey=xxx";
      const mockNext = vi.fn();

      await handleSignInWithEmailLink(mockNext);

      expect(signInWithEmailLink).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Email is required to sign in with email link"
      );
      expect(global.window.location.href).toBe("http://localhost:3000");
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return right with uid and idToken on successful admin login", async () => {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { getDoc, doc } = await import("firebase/firestore");
      const { login } = await import("./auth");

      const mockUser = {
        uid: "test-uid-123",
        getIdToken: vi.fn().mockResolvedValue("mock-id-token"),
      };

      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as never);

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ valid: true }),
      } as never);

      const result = await login({
        email: "test@example.com",
        password: "password123",
      });

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toBe(undefined);
      }
    });

    it("should return errorLogin on authentication failure", async () => {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { login } = await import("./auth");

      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
        new Error("Auth error")
      );

      const result = await login({
        email: "test@example.com",
        password: "wrong-password",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorLogin");
      }
    });
  });

  describe("resetPassword", () => {
    it("should return right on success", async () => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { resetPassword } = await import("./auth");

      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

      const result = await resetPassword({ email: "test@example.com" });

      expect(E.isRight(result)).toBe(true);
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it("should return errorResetPassword on failure", async () => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { resetPassword } = await import("./auth");

      vi.mocked(sendPasswordResetEmail).mockRejectedValue(
        new Error("Reset error")
      );

      const result = await resetPassword({ email: "test@example.com" });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorResetPassword");
      }
    });
  });

  describe("sendLoginLink", () => {
    it("should send login link and store email in localStorage", async () => {
      const { sendSignInLinkToEmail } = await import("firebase/auth");
      const { sendLoginLink } = await import("./auth");

      vi.mocked(sendSignInLinkToEmail).mockResolvedValue(undefined);

      const result = await sendLoginLink({ email: "test@example.com" });

      expect(E.isRight(result)).toBe(true);
      expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        {
          url: "http://localhost:3000",
          handleCodeInApp: true,
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "iyokan-sendLinkEmail",
        "test@example.com"
      );
    });

    it("should return errorSendLoginLink on failure", async () => {
      const { sendSignInLinkToEmail } = await import("firebase/auth");
      const { sendLoginLink } = await import("./auth");

      vi.mocked(sendSignInLinkToEmail).mockRejectedValue(
        new Error("Send link error")
      );

      const result = await sendLoginLink({ email: "test@example.com" });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorSendLoginLink");
      }
    });
  });

  describe("logout", () => {
    it("should return right on success", async () => {
      const { signOut } = await import("firebase/auth");
      const { logout } = await import("./auth");

      vi.mocked(signOut).mockResolvedValue(undefined);

      const result = await logout();

      expect(E.isRight(result)).toBe(true);
      expect(signOut).toHaveBeenCalled();
    });

    it("should return errorLogout on failure", async () => {
      const { signOut } = await import("firebase/auth");
      const { logout } = await import("./auth");

      vi.mocked(signOut).mockRejectedValue(new Error("Logout error"));

      const result = await logout();

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorLogout");
      }
    });
  });

  describe("reauthenticate", () => {
    it("should return right on successful reauthentication", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { reauthenticate } = await import("./auth");

      const mockCredential = {};
      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue(
        mockCredential as never
      );
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );

      const result = await reauthenticate("password123");

      expect(E.isRight(result)).toBe(true);
    });

    it("should return errorNoUser when no user is logged in", async () => {
      const authModule = await import("./firebase");
      const { reauthenticate } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: null,
      });

      const result = await reauthenticate("password123");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorNoUser");
      }
    });

    it("should return errorReauthenticate on failure", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { reauthenticate } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockRejectedValue(
        new Error("Reauth error")
      );

      const result = await reauthenticate("wrong-password");

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorReauthenticate");
      }
    });
  });

  describe("changeEmail", () => {
    it("should return right on successful email change", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential, updateEmail } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changeEmail } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "old@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );
      vi.mocked(updateEmail).mockResolvedValue(undefined);

      const result = await changeEmail({
        password: "password123",
        newEmail: "new@example.com",
        confirmation: "new@example.com",
      });

      expect(E.isRight(result)).toBe(true);
    });

    it("should return errorChangeEmail when emails don't match", async () => {
      const { changeEmail } = await import("./auth");

      const result = await changeEmail({
        password: "password123",
        newEmail: "new@example.com",
        confirmation: "different@example.com",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorChangeEmail");
      }
    });

    it("should return errorReauthenticate when reauthentication fails", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changeEmail } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "old@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockRejectedValue(
        new Error("Reauth error")
      );

      const result = await changeEmail({
        password: "wrongPassword",
        newEmail: "new@example.com",
        confirmation: "new@example.com",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorReauthenticate");
      }
    });

    it("should return errorNoUser when user is null after reauthentication", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changeEmail } = await import("./auth");

      // Set currentUser initially for reauthenticate
      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        configurable: true,
        value: {
          email: "old@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );

      // After reauthenticate, set currentUser to null
      vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
        return Object.defineProperty(authModule.auth, "currentUser", {
          writable: true,
          configurable: true,
          value: null,
        }) as never;
      });

      const result = await changeEmail({
        password: "password123",
        newEmail: "new@example.com",
        confirmation: "new@example.com",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorNoUser");
      }
    });

    it("should return errorChangeEmail on failure", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential, updateEmail } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changeEmail } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "old@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );
      vi.mocked(updateEmail).mockRejectedValue(new Error("Update error"));

      const result = await changeEmail({
        password: "password123",
        newEmail: "new@example.com",
        confirmation: "new@example.com",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorChangeEmail");
      }
    });
  });

  describe("changePassword", () => {
    it("should return right on successful password change", async () => {
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
      } = await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changePassword } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );
      vi.mocked(updatePassword).mockResolvedValue(undefined);

      const result = await changePassword({
        password: "oldPassword123",
        newPassword: "newPassword456",
        confirmation: "newPassword456",
      });

      expect(E.isRight(result)).toBe(true);
    });

    it("should return errorChangePassword when passwords don't match", async () => {
      const { changePassword } = await import("./auth");

      const result = await changePassword({
        password: "oldPassword123",
        newPassword: "newPassword456",
        confirmation: "differentPassword789",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorChangePassword");
      }
    });

    it("should return errorReauthenticate when reauthentication fails", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changePassword } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockRejectedValue(
        new Error("Reauth error")
      );

      const result = await changePassword({
        password: "wrongPassword",
        newPassword: "newPassword456",
        confirmation: "newPassword456",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorReauthenticate");
      }
    });

    it("should return errorNoUser when user is null after reauthentication", async () => {
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changePassword } = await import("./auth");

      // Set currentUser initially for reauthenticate
      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        configurable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);

      // After reauthenticate, set currentUser to null
      vi.mocked(reauthenticateWithCredential).mockImplementation(async () => {
        return Object.defineProperty(authModule.auth, "currentUser", {
          writable: true,
          configurable: true,
          value: null,
        }) as never;
      });

      const result = await changePassword({
        password: "password123",
        newPassword: "newPassword456",
        confirmation: "newPassword456",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorNoUser");
      }
    });

    it("should return errorChangePassword on failure", async () => {
      const {
        EmailAuthProvider,
        reauthenticateWithCredential,
        updatePassword,
      } = await import("firebase/auth");
      const authModule = await import("./firebase");
      const { changePassword } = await import("./auth");

      Object.defineProperty(authModule.auth, "currentUser", {
        writable: true,
        value: {
          email: "test@example.com",
        },
      });

      vi.mocked(EmailAuthProvider.credential).mockReturnValue({} as never);
      vi.mocked(reauthenticateWithCredential).mockResolvedValue(
        undefined as never
      );
      vi.mocked(updatePassword).mockRejectedValue(new Error("Update error"));

      const result = await changePassword({
        password: "oldPassword123",
        newPassword: "newPassword456",
        confirmation: "newPassword456",
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorChangePassword");
      }
    });
  });
});
