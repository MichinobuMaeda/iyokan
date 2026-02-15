import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Firebase modules
const mockApp = {
  name: "[DEFAULT]",
  options: {},
  automaticDataCollectionEnabled: true,
};
const mockAuth = { name: "auth" };
const mockDb = { name: "firestore" };
const mockFunctions = { name: "functions", region: "" };
const mockStorage = { name: "storage" };

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => mockApp),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => mockAuth),
  connectAuthEmulator: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => mockDb),
  connectFirestoreEmulator: vi.fn(),
}));

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => mockFunctions),
  connectFunctionsEmulator: vi.fn(),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(() => mockStorage),
  connectStorageEmulator: vi.fn(),
}));

describe("firebase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Suppress console logs during tests
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("initFirebase", () => {
    it("should initialize Firebase when no apps exist", async () => {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      const { getFirestore } = await import("firebase/firestore");
      const { getFunctions } = await import("firebase/functions");
      const { getStorage } = await import("firebase/storage");
      const { firebaseConfig } = await import("./firebase-config");

      // Mock non-localhost hostname
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "example.com",
        },
      });

      vi.mocked(getApps).mockReturnValue([]);

      const { initFirebase } = await import("./firebase");
      const result = initFirebase();

      expect(initializeApp).toHaveBeenCalledWith(firebaseConfig);
      expect(getAuth).toHaveBeenCalledWith(mockApp);
      expect(getFirestore).toHaveBeenCalledWith(mockApp);
      expect(getFunctions).toHaveBeenCalledWith(mockApp);
      expect(getStorage).toHaveBeenCalledWith(mockApp);
      expect(result.auth).toBe(mockAuth);
      expect(result.db).toBe(mockDb);
      expect(result.functions).toBe(mockFunctions);
      expect(result.storage).toBe(mockStorage);
      expect(result.functions.region).toBe("asia-northeast1");
    });

    it("should reuse existing app when already initialized", async () => {
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      const { getFirestore } = await import("firebase/firestore");
      const { getFunctions } = await import("firebase/functions");
      const { getStorage } = await import("firebase/storage");

      // Mock non-localhost hostname
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "example.com",
        },
      });

      const existingApp = {
        name: "[EXISTING]",
        options: {},
        automaticDataCollectionEnabled: true,
      };
      vi.mocked(getApps).mockReturnValue([existingApp]);

      const { initFirebase } = await import("./firebase");
      const result = initFirebase();

      expect(initializeApp).not.toHaveBeenCalled();
      expect(getAuth).toHaveBeenCalledWith(existingApp);
      expect(getFirestore).toHaveBeenCalledWith(existingApp);
      expect(getFunctions).toHaveBeenCalledWith(existingApp);
      expect(getStorage).toHaveBeenCalledWith(existingApp);
      expect(result.auth).toBe(mockAuth);
      expect(result.db).toBe(mockDb);
      expect(result.functions).toBe(mockFunctions);
      expect(result.storage).toBe(mockStorage);
    });

    it("should connect to emulators on localhost", async () => {
      const { getApps } = await import("firebase/app");
      const { connectAuthEmulator } = await import("firebase/auth");
      const { connectFirestoreEmulator } = await import("firebase/firestore");
      const { connectFunctionsEmulator } = await import("firebase/functions");
      const { connectStorageEmulator } = await import("firebase/storage");

      // Mock localhost
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "localhost",
        },
      });

      vi.mocked(getApps).mockReturnValue([]);

      const { initFirebase } = await import("./firebase");
      initFirebase();

      expect(connectAuthEmulator).toHaveBeenCalledWith(
        mockAuth,
        "http://127.0.0.1:9099",
        { disableWarnings: true }
      );
      expect(connectFirestoreEmulator).toHaveBeenCalledWith(
        mockDb,
        "127.0.0.1",
        8080
      );
      expect(connectFunctionsEmulator).toHaveBeenCalledWith(
        mockFunctions,
        "127.0.0.1",
        5001
      );
      expect(connectStorageEmulator).toHaveBeenCalledWith(
        mockStorage,
        "127.0.0.1",
        9199
      );
    });

    it("should connect to emulators on 127.0.0.1", async () => {
      const { getApps } = await import("firebase/app");
      const { connectAuthEmulator } = await import("firebase/auth");
      const { connectFirestoreEmulator } = await import("firebase/firestore");
      const { connectFunctionsEmulator } = await import("firebase/functions");
      const { connectStorageEmulator } = await import("firebase/storage");

      // Mock 127.0.0.1
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "127.0.0.1",
        },
      });

      vi.mocked(getApps).mockReturnValue([]);

      const { initFirebase } = await import("./firebase");
      initFirebase();

      expect(connectAuthEmulator).toHaveBeenCalledWith(
        mockAuth,
        "http://127.0.0.1:9099",
        { disableWarnings: true }
      );
      expect(connectFirestoreEmulator).toHaveBeenCalledWith(
        mockDb,
        "127.0.0.1",
        8080
      );
      expect(connectFunctionsEmulator).toHaveBeenCalledWith(
        mockFunctions,
        "127.0.0.1",
        5001
      );
      expect(connectStorageEmulator).toHaveBeenCalledWith(
        mockStorage,
        "127.0.0.1",
        9199
      );
    });

    it("should not connect to emulators on production hostname", async () => {
      const { getApps } = await import("firebase/app");
      const { connectAuthEmulator } = await import("firebase/auth");
      const { connectFirestoreEmulator } = await import("firebase/firestore");
      const { connectFunctionsEmulator } = await import("firebase/functions");
      const { connectStorageEmulator } = await import("firebase/storage");

      // Mock production hostname
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "myapp.firebaseapp.com",
        },
      });

      vi.mocked(getApps).mockReturnValue([]);

      const { initFirebase } = await import("./firebase");
      initFirebase();

      expect(connectAuthEmulator).not.toHaveBeenCalled();
      expect(connectFirestoreEmulator).not.toHaveBeenCalled();
      expect(connectFunctionsEmulator).not.toHaveBeenCalled();
      expect(connectStorageEmulator).not.toHaveBeenCalled();
    });
  });

  describe("module exports", () => {
    it("should export auth, db, functions, and storage instances", async () => {
      const { getApps } = await import("firebase/app");

      // Mock non-localhost hostname
      Object.defineProperty(global, "location", {
        writable: true,
        value: {
          hostname: "example.com",
        },
      });

      vi.mocked(getApps).mockReturnValue([]);

      const module = await import("./firebase");

      expect(module.auth).toBeDefined();
      expect(module.db).toBeDefined();
      expect(module.functions).toBeDefined();
      expect(module.storage).toBeDefined();
    });
  });
});
