import { describe, it, expect, vi, beforeEach } from "vitest";
import * as E from "fp-ts/Either";

import {
  GID_ADMINS,
  GID_MANAGERS,
  OID_SYSADMIN,
} from "../../functions/src/common";
import type { UserState } from "../types/UserState";
import type { Org } from "../types/Org";
import type { User } from "../types/User";
import type { Group } from "../types/Group";
import type { Provider } from "../types/Provider";
import type { Template } from "../types/Template";
import type { Generator } from "../types/Generator";

// Mock Firestore
const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockServerTimestamp = vi.fn(() => new Date("2024-01-01T00:00:00.000Z"));

vi.mock("firebase/firestore", () => ({
  collection: mockCollection,
  doc: mockDoc,
  query: mockQuery,
  where: mockWhere,
  onSnapshot: mockOnSnapshot,
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  serverTimestamp: mockServerTimestamp,
}));

// Mock store
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("jotai", () => ({
  getDefaultStore: vi.fn(() => mockStore),
}));

vi.mock("./firebase", () => ({
  db: { name: "firestore" },
}));

vi.mock("./store", () => ({
  confAtom: { toString: () => "confAtom" },
  userPrivilegesAtom: { toString: () => "userPrivilegesAtom" },
  orgsAtom: { toString: () => "orgsAtom" },
  usersAtom: { toString: () => "usersAtom" },
  groupsAtom: { toString: () => "groupsAtom" },
  providersAtom: { toString: () => "providersAtom" },
  templatesAtom: { toString: () => "templatesAtom" },
  generatorsAtom: { toString: () => "generatorsAtom" },
}));

vi.mock("../types/Conf", () => ({
  confFromDoc: vi.fn((doc) => doc),
}));

vi.mock("../types/Org", () => ({
  orgFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

vi.mock("../types/User", () => ({
  userFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

vi.mock("../types/Group", () => ({
  groupFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

vi.mock("../types/Provider", () => ({
  providerFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

vi.mock("../types/Template", () => ({
  templateFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

vi.mock("../types/Generator", () => ({
  generatorFromDoc: vi.fn((doc) => ({ id: doc.id })),
}));

describe("firestore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("subscribeConf", () => {
    it("should subscribe to conf document", async () => {
      const { subscribeConf } = await import("./firestore");

      mockDoc.mockReturnValue("conf-doc-ref");
      mockOnSnapshot.mockImplementation((_ref, callback) => {
        callback({ id: "conf" });
        return vi.fn();
      });

      subscribeConf();

      expect(mockDoc).toHaveBeenCalledWith(
        { name: "firestore" },
        "service",
        "conf"
      );
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(mockStore.set).toHaveBeenCalled();
    });
  });

  describe("sorting functions", () => {
    describe("sortOrgs", () => {
      it("should sort sysadmin org first", async () => {
        const { sortOrgs } = await import("./firestore");

        const org1 = { id: "org1" } as Org;
        const orgSys = { id: OID_SYSADMIN } as Org;

        expect(sortOrgs(orgSys, org1)).toBe(-1);
        expect(sortOrgs(org1, orgSys)).toBe(1);
      });

      it("should sort orgs alphabetically when neither is sysadmin", async () => {
        const { sortOrgs } = await import("./firestore");

        const org1 = { id: "beta" } as Org;
        const org2 = { id: "alpha" } as Org;

        expect(sortOrgs(org1, org2)).toBeGreaterThan(0);
        expect(sortOrgs(org2, org1)).toBeLessThan(0);
      });
    });

    describe("sortUsers", () => {
      it("should sort users alphabetically by name", async () => {
        const { sortUsers } = await import("./firestore");

        const user1 = { name: "Bob" } as User;
        const user2 = { name: "Alice" } as User;

        expect(sortUsers(user1, user2)).toBeGreaterThan(0);
        expect(sortUsers(user2, user1)).toBeLessThan(0);
      });
    });

    describe("sortGroups", () => {
      it("should sort managers group first", async () => {
        const { sortGroups } = await import("./firestore");

        const group1 = { id: "group1", name: "Group 1" } as Group;
        const groupManagers = { id: GID_MANAGERS, name: "Managers" } as Group;

        expect(sortGroups(groupManagers, group1)).toBe(-1);
        expect(sortGroups(group1, groupManagers)).toBe(1);
      });

      it("should sort admins group second", async () => {
        const { sortGroups } = await import("./firestore");

        const group1 = { id: "group1", name: "Group 1" } as Group;
        const groupAdmins = { id: GID_ADMINS, name: "Admins" } as Group;

        expect(sortGroups(groupAdmins, group1)).toBe(-1);
        expect(sortGroups(group1, groupAdmins)).toBe(1);
      });

      it("should sort other groups alphabetically by name", async () => {
        const { sortGroups } = await import("./firestore");

        const group1 = { id: "g1", name: "Zebra" } as Group;
        const group2 = { id: "g2", name: "Apple" } as Group;

        expect(sortGroups(group1, group2)).toBeGreaterThan(0);
        expect(sortGroups(group2, group1)).toBeLessThan(0);
      });
    });

    describe("sortProviders", () => {
      it("should sort providers by type then name", async () => {
        const { sortProviders } = await import("./firestore");

        const provider1 = { type: "a", name: "Z" } as Provider;
        const provider2 = { type: "b", name: "A" } as Provider;

        expect(sortProviders(provider1, provider2)).toBeLessThan(0);
        expect(sortProviders(provider2, provider1)).toBeGreaterThan(0);
      });

      it("should sort providers by name when types are equal", async () => {
        const { sortProviders } = await import("./firestore");

        const provider1 = { type: "a", name: "Z" } as Provider;
        const provider2 = { type: "a", name: "A" } as Provider;

        expect(sortProviders(provider1, provider2)).toBeGreaterThan(0);
        expect(sortProviders(provider2, provider1)).toBeLessThan(0);
      });
    });

    describe("sortTemplates", () => {
      it("should sort templates alphabetically by name", async () => {
        const { sortTemplates } = await import("./firestore");

        const template1 = { name: "Zebra" } as Template;
        const template2 = { name: "Apple" } as Template;

        expect(sortTemplates(template1, template2)).toBeGreaterThan(0);
        expect(sortTemplates(template2, template1)).toBeLessThan(0);
      });
    });

    describe("sortGenerators", () => {
      it("should sort generators alphabetically by name", async () => {
        const { sortGenerators } = await import("./firestore");

        const generator1 = { name: "Zebra" } as Generator;
        const generator2 = { name: "Apple" } as Generator;

        expect(sortGenerators(generator1, generator2)).toBeGreaterThan(0);
        expect(sortGenerators(generator2, generator1)).toBeLessThan(0);
      });
    });
  });

  describe("subscribeUserData", () => {
    it("should subscribe to orgs collection for sys admin", async () => {
      const { subscribeUserData } = await import("./firestore");

      mockCollection.mockReturnValue("orgs-collection");
      mockOnSnapshot.mockImplementation((_ref, callback) => {
        callback({ docs: [] });
        return vi.fn();
      });

      const userDataItem = {
        collectionName: "orgs",
        atom: "orgsAtom",
        fromDoc: vi.fn(),
        sort: vi.fn(),
        priv: true,
      };

      subscribeUserData("org1", userDataItem, true);

      expect(mockCollection).toHaveBeenCalledWith(
        { name: "firestore" },
        "orgs"
      );
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it("should subscribe to org subcollection for non-org data", async () => {
      const { subscribeUserData } = await import("./firestore");

      mockCollection.mockReturnValue("users-collection");
      mockOnSnapshot.mockImplementation((_ref, callback) => {
        callback({ docs: [] });
        return vi.fn();
      });

      const userDataItem = {
        collectionName: "users",
        atom: "usersAtom",
        fromDoc: vi.fn(),
        sort: vi.fn(),
        priv: true,
      };

      subscribeUserData("org1", userDataItem, false);

      expect(mockCollection).toHaveBeenCalledWith(
        { name: "firestore" },
        "orgs",
        "org1",
        "users"
      );
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it("should handle snapshot errors", async () => {
      const { subscribeUserData } = await import("./firestore");

      mockCollection.mockReturnValue("users-collection");
      mockOnSnapshot.mockImplementation(
        (_ref, _successCallback, errorCallback) => {
          errorCallback(new Error("Snapshot error"));
          return vi.fn();
        }
      );

      const userDataItem = {
        collectionName: "users",
        atom: "usersAtom",
        fromDoc: vi.fn(),
        sort: vi.fn(),
        priv: true,
      };

      subscribeUserData("org1", userDataItem, false);

      expect(mockStore.set).toHaveBeenCalledWith("usersAtom", undefined);
    });

    it("should handle snapshot completion", async () => {
      const { subscribeUserData } = await import("./firestore");

      mockCollection.mockReturnValue("users-collection");
      mockOnSnapshot.mockImplementation(
        (_ref, _successCallback, _errorCallback, completeCallback) => {
          completeCallback();
          return vi.fn();
        }
      );

      const userDataItem = {
        collectionName: "users",
        atom: "usersAtom",
        fromDoc: vi.fn(),
        sort: vi.fn(),
        priv: true,
      };

      subscribeUserData("org1", userDataItem, false);

      expect(mockStore.set).toHaveBeenCalledWith("usersAtom", undefined);
    });
  });

  describe("unsubscribeUserData", () => {
    it("should unsubscribe from collection", async () => {
      const { subscribeUserData, unsubscribeUserData } =
        await import("./firestore");

      const unsubscribe = vi.fn();
      mockCollection.mockReturnValue("users-collection");
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const userDataItem = {
        collectionName: "users",
        atom: "usersAtom",
        fromDoc: vi.fn(),
        sort: vi.fn(),
        priv: true,
      };

      subscribeUserData("org1", userDataItem, false);
      unsubscribeUserData(userDataItem);

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("subscribeUserDataAll", () => {
    it("should subscribe to all privileged data items", async () => {
      const { subscribeUserDataAll } = await import("./firestore");

      mockCollection.mockReturnValue("collection");
      mockOnSnapshot.mockReturnValue(vi.fn());

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      subscribeUserDataAll(appState);

      // Should subscribe to orgs, users, groups (not providers for non-admin)
      expect(mockOnSnapshot).toHaveBeenCalled();
    });

    it("should subscribe to providers for admins", async () => {
      const { subscribeUserDataAll } = await import("./firestore");

      mockCollection.mockReturnValue("collection");
      mockOnSnapshot.mockReturnValue(vi.fn());

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      subscribeUserDataAll(appState);

      // Should subscribe to all including providers
      expect(mockOnSnapshot).toHaveBeenCalled();
    });
  });

  describe("unsubscribeUserDataAll", () => {
    it("should unsubscribe from all data items", async () => {
      const { subscribeUserDataAll, unsubscribeUserDataAll } =
        await import("./firestore");

      const unsubscribe = vi.fn();
      mockCollection.mockReturnValue("collection");
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      subscribeUserDataAll(appState);
      unsubscribeUserDataAll(appState);

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("updateConf", () => {
    it("should update conf document successfully", async () => {
      const { updateConf } = await import("./firestore");

      mockDoc.mockReturnValue("conf-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        webUrl: "https://example.com ",
        desc: "Test description  ",
        hardBreak: true,
      };

      const result = await updateConf(formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("conf-doc-ref", {
        webUrl: "https://example.com",
        desc: "Test description",
        hardBreak: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateConf } = await import("./firestore");

      mockDoc.mockReturnValue("conf-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        webUrl: "https://example.com",
        desc: "Test description",
        hardBreak: true,
      };

      const result = await updateConf(formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });

    it("should handle undefined desc", async () => {
      const { updateConf } = await import("./firestore");

      mockDoc.mockReturnValue("conf-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        webUrl: "https://example.com",
        desc: undefined,
        hardBreak: false,
      };

      const result = await updateConf(formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("conf-doc-ref", {
        webUrl: "https://example.com",
        desc: "",
        hardBreak: false,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("updateOrg", () => {
    it("should update org document successfully", async () => {
      const { updateOrg } = await import("./firestore");

      mockDoc.mockReturnValue("org-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        id: "org1",
        name: "Test Org  ",
        desc: "Description  ",
        valid: true,
        hardBreak: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      } as Org;

      const result = await updateOrg(formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("org-doc-ref", {
        name: "Test Org",
        desc: "Description",
        valid: true,
        hardBreak: false,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrg } = await import("./firestore");

      mockDoc.mockReturnValue("org-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        id: "org1",
        name: "Test Org",
        desc: "Description",
        valid: true,
        hardBreak: false,
      } as Org;

      const result = await updateOrg(formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });

    it("should handle undefined desc", async () => {
      const { updateOrg } = await import("./firestore");

      mockDoc.mockReturnValue("org-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        id: "org1",
        name: "Test Org",
        desc: undefined,
        valid: true,
        hardBreak: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      } as Org;

      const result = await updateOrg(formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("org-doc-ref", {
        name: "Test Org",
        desc: "",
        valid: true,
        hardBreak: false,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("updateOrgUser", () => {
    it("should update user document successfully", async () => {
      const { updateOrgUser } = await import("./firestore");

      mockDoc.mockReturnValue("user-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test User  ",
        valid: true,
      };

      const result = await updateOrgUser("org1", "user1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("user-doc-ref", {
        name: "Test User",
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrgUser } = await import("./firestore");

      mockDoc.mockReturnValue("user-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        name: "Test User",
        valid: true,
      };

      const result = await updateOrgUser("org1", "user1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("updateOrgGroup", () => {
    it("should update group document successfully", async () => {
      const { updateOrgGroup } = await import("./firestore");

      mockDoc.mockReturnValue("group-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Group  ",
        members: ["user1", "user2"],
        valid: true,
      };

      const result = await updateOrgGroup("org1", "group1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("group-doc-ref", {
        name: "Test Group",
        members: ["user1", "user2"],
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should handle empty members array", async () => {
      const { updateOrgGroup } = await import("./firestore");

      mockDoc.mockReturnValue("group-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Group",
        members: [],
        valid: true,
      };

      const result = await updateOrgGroup("org1", "group1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("group-doc-ref", {
        name: "Test Group",
        members: [],
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should handle undefined members", async () => {
      const { updateOrgGroup } = await import("./firestore");

      mockDoc.mockReturnValue("group-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Group",
        members: undefined,
        valid: true,
      };

      const result = await updateOrgGroup("org1", "group1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("group-doc-ref", {
        name: "Test Group",
        members: [],
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrgGroup } = await import("./firestore");

      mockDoc.mockReturnValue("group-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        name: "Test Group",
        members: [],
        valid: true,
      };

      const result = await updateOrgGroup("org1", "group1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("createOrgProvider", () => {
    it("should create provider document successfully", async () => {
      const { createOrgProvider } = await import("./firestore");

      mockCollection.mockReturnValue("providers-collection");
      mockAddDoc.mockResolvedValue({ id: "provider1" });

      const formData = {
        type: "github",
        name: "Test Provider  ",
        valid: true,
        params: [
          { key: "apiKey", value: "secret123" },
          { key: "url", value: "https://api.github.com" },
        ],
      };

      const result = await createOrgProvider("org1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledWith("providers-collection", {
        type: "github",
        name: "Test Provider",
        apiKey: "secret123",
        url: "https://api.github.com",
        valid: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { createOrgProvider } = await import("./firestore");

      mockCollection.mockReturnValue("providers-collection");
      mockAddDoc.mockRejectedValue(new Error("Create error"));

      const formData = {
        type: "github",
        name: "Test Provider",
        valid: true,
        params: [],
      };

      const result = await createOrgProvider("org1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("updateOrgProvider", () => {
    it("should update provider document successfully", async () => {
      const { updateOrgProvider } = await import("./firestore");

      mockDoc.mockReturnValue("provider-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        type: "github",
        name: "Test Provider  ",
        valid: true,
        params: [
          { key: "apiKey", value: "secret123" },
          { key: "url", value: "https://api.github.com" },
        ],
      };

      const result = await updateOrgProvider("org1", "provider1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("provider-doc-ref", {
        type: "github",
        name: "Test Provider",
        apiKey: "secret123",
        url: "https://api.github.com",
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrgProvider } = await import("./firestore");

      mockDoc.mockReturnValue("provider-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        type: "github",
        name: "Test Provider",
        valid: true,
        params: [],
      };

      const result = await updateOrgProvider("org1", "provider1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("createOrgTemplate", () => {
    it("should create template document successfully", async () => {
      const { createOrgTemplate } = await import("./firestore");

      mockCollection.mockReturnValue("templates-collection");
      mockAddDoc.mockResolvedValue({ id: "template1" });

      const formData = {
        name: "Test Template  ",
        title: "Template Title  ",
        message: "Test message  ",
        link: "https://example.com  ",
        feed: "feed1  ",
        category: "cat1  ",
        valid: true,
      };

      const result = await createOrgTemplate("org1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledWith("templates-collection", {
        name: "Test Template",
        title: "Template Title",
        message: "Test message",
        link: "https://example.com",
        feed: "feed1",
        category: "cat1",
        valid: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { createOrgTemplate } = await import("./firestore");

      mockCollection.mockReturnValue("templates-collection");
      mockAddDoc.mockRejectedValue(new Error("Create error"));

      const formData = {
        name: "Test Template",
        title: "Template Title",
        message: "Test message",
        link: "https://example.com",
        feed: "feed1",
        category: "cat1",
        valid: true,
      };

      const result = await createOrgTemplate("org1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("updateOrgTemplate", () => {
    it("should update template document successfully", async () => {
      const { updateOrgTemplate } = await import("./firestore");

      mockDoc.mockReturnValue("template-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Template  ",
        title: "Template Title  ",
        message: "Test message  ",
        link: "https://example.com  ",
        feed: "feed1  ",
        category: "cat1  ",
        valid: true,
      };

      const result = await updateOrgTemplate("org1", "template1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("template-doc-ref", {
        name: "Test Template",
        title: "Template Title",
        message: "Test message",
        link: "https://example.com",
        feed: "feed1",
        category: "cat1",
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrgTemplate } = await import("./firestore");

      mockDoc.mockReturnValue("template-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        name: "Test Template",
        title: "Template Title",
        message: "Test message",
        link: "https://example.com",
        feed: "feed1",
        category: "cat1",
        valid: true,
      };

      const result = await updateOrgTemplate("org1", "template1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });
  });

  describe("createOrgGenerator", () => {
    it("should create generator document successfully", async () => {
      const { createOrgGenerator } = await import("./firestore");

      mockCollection.mockReturnValue("generators-collection");
      mockAddDoc.mockResolvedValue({ id: "generator1" });

      const formData = {
        name: "Test Generator  ",
        source: "source1  ",
        prompt: "Test prompt  ",
        providers: ["provider1", "provider2"],
        valid: true,
      };

      const result = await createOrgGenerator("org1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledWith("generators-collection", {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: ["provider1", "provider2"],
        valid: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { createOrgGenerator } = await import("./firestore");

      mockCollection.mockReturnValue("generators-collection");
      mockAddDoc.mockRejectedValue(new Error("Create error"));

      const formData = {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: [],
        valid: true,
      };

      const result = await createOrgGenerator("org1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });

    it("should handle undefined providers", async () => {
      const { createOrgGenerator } = await import("./firestore");

      mockCollection.mockReturnValue("generators-collection");
      mockAddDoc.mockResolvedValue({ id: "generator1" });

      const formData = {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: undefined as any,
        valid: true,
      };

      const result = await createOrgGenerator("org1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockAddDoc).toHaveBeenCalledWith("generators-collection", {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: [],
        valid: true,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("updateOrgGenerator", () => {
    it("should update generator document successfully", async () => {
      const { updateOrgGenerator } = await import("./firestore");

      mockDoc.mockReturnValue("generator-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Generator  ",
        source: "source1  ",
        prompt: "Test prompt  ",
        providers: ["provider1", "provider2"],
        valid: true,
      };

      const result = await updateOrgGenerator("org1", "generator1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("generator-doc-ref", {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: ["provider1", "provider2"],
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });

    it("should return error on failure", async () => {
      const { updateOrgGenerator } = await import("./firestore");

      mockDoc.mockReturnValue("generator-doc-ref");
      mockUpdateDoc.mockRejectedValue(new Error("Update error"));

      const formData = {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: [],
        valid: true,
      };

      const result = await updateOrgGenerator("org1", "generator1", formData);

      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBe("defaultErrorMessage");
      }
    });

    it("should handle undefined providers", async () => {
      const { updateOrgGenerator } = await import("./firestore");

      mockDoc.mockReturnValue("generator-doc-ref");
      mockUpdateDoc.mockResolvedValue(undefined);

      const formData = {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: undefined as any,
        valid: true,
      };

      const result = await updateOrgGenerator("org1", "generator1", formData);

      expect(E.isRight(result)).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith("generator-doc-ref", {
        name: "Test Generator",
        source: "source1",
        prompt: "Test prompt",
        providers: [],
        valid: true,
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
    });
  });

  describe("userDataItemsAtom", () => {
    it("should return all data items when appState is null", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const items = userDataItemsAtom(null);

      expect(items).toHaveLength(6);
      expect(items[0].collectionName).toBe("orgs");
      expect(items[1].collectionName).toBe("users");
      expect(items[2].collectionName).toBe("groups");
      expect(items[3].collectionName).toBe("providers");
      expect(items[4].collectionName).toBe("templates");
      expect(items[5].collectionName).toBe("generators");
    });

    it("should set provider priv to true for admin users", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      const items = userDataItemsAtom(appState);

      const providerItem = items.find(
        (item) => item.collectionName === "providers"
      );
      expect(providerItem?.priv).toBe(true);
    });

    it("should set provider priv to true for sys admin", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: true,
        manager: false,
        admin: false,
      };

      const items = userDataItemsAtom(appState);

      const providerItem = items.find(
        (item) => item.collectionName === "providers"
      );
      expect(providerItem?.priv).toBe(true);
    });

    it("should set provider priv to false for regular users", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const items = userDataItemsAtom(appState);

      const providerItem = items.find(
        (item) => item.collectionName === "providers"
      );
      expect(providerItem?.priv).toBe(false);
    });

    it("should set templates priv to true for managers", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: true,
        admin: false,
      };

      const items = userDataItemsAtom(appState);

      const templateItem = items.find(
        (item) => item.collectionName === "templates"
      );
      expect(templateItem?.priv).toBe(true);
    });

    it("should set generators priv to true for admins", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: true,
      };

      const items = userDataItemsAtom(appState);

      const generatorItem = items.find(
        (item) => item.collectionName === "generators"
      );
      expect(generatorItem?.priv).toBe(true);
    });

    it("should set templates and generators priv to true for all authenticated users", async () => {
      const { userDataItemsAtom } = await import("./firestore");

      const appState: UserState = {
        oid: "org1",
        uid: "user1",
        sys: false,
        manager: false,
        admin: false,
      };

      const items = userDataItemsAtom(appState);

      const templateItem = items.find(
        (item) => item.collectionName === "templates"
      );
      const generatorItem = items.find(
        (item) => item.collectionName === "generators"
      );
      expect(templateItem?.priv).toBe(true);
      expect(generatorItem?.priv).toBe(true);
    });
  });
});
