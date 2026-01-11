import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";

// Mock Firebase modules
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "MOCK_TIMESTAMP"),
}));

vi.mock("./firebase", () => ({
  db: {},
}));

describe("client firestore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateAdmin", () => {
    it("should return right on successful update", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateAdmin } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await updateAdmin({
        id: "admin-123",
        name: "Test Admin",
        email: "test@example.com",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it("should trim email and name", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateAdmin } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateAdmin({
        id: "admin-123",
        name: "  Test Admin  ",
        email: "  test@example.com  ",
        valid: true,
      });

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: "Test Admin",
          email: "test@example.com",
        })
      );
    });

    it("should return errorUpdateAdmin on failure", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateAdmin } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await updateAdmin({
        id: "admin-123",
        name: "Test Admin",
        email: "test@example.com",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorUpdateAdmin");
      }
    });
  });

  describe("saveOrg", () => {
    it("should create org document and default groups", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await saveOrg("org-123", {
        name: "Test Org",
        desc: "Test description",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      // Should be called 3 times: org, managers group, admins group
      expect(setDoc).toHaveBeenCalledTimes(3);
      expect(doc).toHaveBeenCalledWith({}, "orgs", "org-123");
      expect(doc).toHaveBeenCalledWith(
        {},
        "orgs",
        "org-123",
        "groups",
        "managers"
      );
      expect(doc).toHaveBeenCalledWith(
        {},
        "orgs",
        "org-123",
        "groups",
        "admins"
      );
    });

    it("should trim name and desc and create with correct data", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await saveOrg("org-123", {
        name: "  Test Org  ",
        desc: "  Test description  ",
        valid: true,
      });

      // Check org document
      expect(setDoc).toHaveBeenNthCalledWith(
        1,
        {},
        expect.objectContaining({
          name: "Test Org",
          desc: "Test description",
          valid: true,
        }),
        { merge: true }
      );

      // Check managers group
      expect(setDoc).toHaveBeenNthCalledWith(
        2,
        {},
        expect.objectContaining({
          name: "Managers",
          members: [],
        }),
        { merge: true }
      );

      // Check admins group
      expect(setDoc).toHaveBeenNthCalledWith(
        3,
        {},
        expect.objectContaining({
          name: "Admins",
          members: [],
        }),
        { merge: true }
      );
    });

    it("should handle missing desc field", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await saveOrg("org-456", {
        name: "Test Org",
        valid: true,
      });

      expect(setDoc).toHaveBeenNthCalledWith(
        1,
        {},
        expect.objectContaining({
          name: "Test Org",
          desc: "",
          valid: true,
        }),
        { merge: true }
      );
    });

    it("should return errorSaveOrg on failure", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await saveOrg("org-123", {
        name: "Test Org",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorSaveOrg");
      }
    });
  });

  describe("updateOrg", () => {
    it("should return right on successful update", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await updateOrg({
        id: "org-123",
        name: "Test Org",
        desc: "Test description",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
    });

    it("should return errorUpdateOrg on failure", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateOrg } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await updateOrg({
        id: "org-123",
        name: "Test Org",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorUpdateOrg");
      }
    });
  });

  describe("updateOrgUser", () => {
    it("should return right on successful update", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateOrgUser } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await updateOrgUser("org-123", {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
      expect(doc).toHaveBeenCalledWith(
        {},
        "orgs",
        "org-123",
        "users",
        "user-123"
      );
    });

    it("should trim email and name", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateOrgUser } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateOrgUser("org-123", {
        id: "user-123",
        name: "  Test User  ",
        email: "  test@example.com  ",
        valid: true,
      });

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: "Test User",
          email: "test@example.com",
          valid: true,
        })
      );
    });

    it("should return errorUpdateUser on failure", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateOrgUser } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await updateOrgUser("org-123", {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorUpdateUser");
      }
    });
  });

  describe("saveProvider", () => {
    it("should return right on successful save", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const result = await saveProvider("org-123", {
        type: "bluesky",
        name: "Bluesky Provider",
        params: [
          { key: "service", value: "https://bsky.social" },
          { key: "identifier", value: "user.bsky.social" },
          { key: "password", value: "app-password" },
        ],
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(setDoc).toHaveBeenCalled();
    });

    it("should generate provider ID with type and timestamp", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const mockTimestamp = 1234567890;
      vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

      await saveProvider("org-123", {
        type: "mastodon",
        name: "Mastodon Provider",
        params: [],
        valid: true,
      });

      expect(doc).toHaveBeenCalledWith(
        {},
        "orgs",
        "org-123",
        "providers",
        "mastodon-1234567890"
      );
    });

    it("should return errorSaveProvider on failure", async () => {
      const { setDoc, doc } = await import("firebase/firestore");
      const { saveProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(setDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await saveProvider("org-123", {
        type: "bluesky",
        name: "Bluesky Provider",
        params: [],
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorSaveProvider");
      }
    });
  });

  describe("updateProvider", () => {
    it("should return right on successful update", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await updateProvider("org-123", {
        id: "provider-123",
        type: "bluesky",
        name: "Bluesky Provider",
        params: [
          { key: "service", value: "https://bsky.social" },
          { key: "identifier", value: "user.bsky.social" },
          { key: "password", value: "app-password" },
        ],
        valid: true,
      });

      expect(E.isRight(result)).toBe(true);
      expect(updateDoc).toHaveBeenCalled();
      expect(doc).toHaveBeenCalledWith(
        {},
        "orgs",
        "org-123",
        "providers",
        "provider-123"
      );
    });

    it("should trim name", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateProvider("org-123", {
        id: "provider-123",
        type: "mastodon",
        name: "  Mastodon Provider  ",
        params: [
          { key: "token", value: "token123" },
          { key: "url", value: "https://mastodon.social" },
        ],
        valid: true,
      });

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: "Mastodon Provider",
          type: "mastodon",
          params: [
            { key: "token", value: "token123" },
            { key: "url", value: "https://mastodon.social" },
          ],
          valid: true,
        })
      );
    });

    it("should return errorUpdateProvider on failure", async () => {
      const { updateDoc, doc } = await import("firebase/firestore");
      const { updateProvider } = await import("./firestore");

      vi.mocked(doc).mockReturnValue({} as never);
      vi.mocked(updateDoc).mockRejectedValue(new Error("Firestore error"));

      const result = await updateProvider("org-123", {
        id: "provider-123",
        type: "bluesky",
        name: "Bluesky Provider",
        params: [],
        valid: true,
      });

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("errorUpdateProvider");
      }
    });
  });
});
