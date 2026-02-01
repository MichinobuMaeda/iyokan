import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/lib/Either.js";

// Mock Firebase modules
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
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

vi.mock("./store", () => ({
  authUserAtom: { toString: () => "authUserAtom" },
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
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("client auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document.cookie
    global.document.cookie = "";
    // Suppress console.error and console.info during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
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
        expect(result.right).toBe("test-uid-123");
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
