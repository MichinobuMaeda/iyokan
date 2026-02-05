import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import type { User as FirebaseUser } from "firebase/auth";

import {
  OID_SYSADMIN,
  GID_ADMINS,
  GID_MANAGERS,
  type UserPrivileges,
} from "../../functions/src/common";
import type { UserState } from "../types/UserState";
import type { Conf } from "../types/Conf";
import type { Org } from "../types/Org";
import type { User } from "../types/User";
import type { Group } from "../types/Group";
import type { Provider } from "../types/Provider";
import {
  authUserAtom,
  userPrivilegesAtom,
  oidAtom,
  confAtom,
  orgsAtom,
  usersAtom,
  groupsAtom,
  providersAtom,
  getAppState,
  appStateAtom,
  getDataState,
  dataStateAtom,
} from "./store";

describe("store", () => {
  describe("getAppState", () => {
    it("should return undefined when authUser is undefined", () => {
      const store = createStore();
      store.set(authUserAtom, undefined);
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when conf is undefined", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      store.set(authUserAtom, mockUser);
      store.set(confAtom, undefined);

      const result = getAppState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when conf is null", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      store.set(authUserAtom, mockUser);
      store.set(confAtom, null);

      const result = getAppState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return null when authUser is null", () => {
      const store = createStore();
      store.set(authUserAtom, null);
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toBe(null);
    });

    it("should return null when userPrivileges is null", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, null);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toBe(null);
    });

    it("should return null when oid is null", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, null);
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toBe(null);
    });

    it("should return UserState for regular user", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: false, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: false,
      } as UserState);
    });

    it("should return UserState for org admin", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: true,
      } as UserState);
    });

    it("should return UserState for org manager", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: false, manager: true },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: true,
        admin: false,
      } as UserState);
    });

    it("should return UserState for sysadmin", () => {
      const store = createStore();
      const mockUser = { uid: "sysuser" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        [OID_SYSADMIN]: { admin: true, manager: false },
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = getAppState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "sysuser",
        sys: true,
        manager: false,
        admin: true,
      } as UserState);
    });
  });

  describe("appStateAtom", () => {
    it("should derive state from other atoms", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);

      const result = store.get(appStateAtom);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: true,
      } as UserState);
    });
  });

  describe("getDataState", () => {
    it("should return null when appState is null", () => {
      const store = createStore();
      store.set(authUserAtom, null);
      store.set(confAtom, {} as Conf);

      const result = getDataState(store.get);

      expect(result).toBe(null);
    });

    it("should return undefined when appState is undefined", () => {
      const store = createStore();
      store.set(authUserAtom, undefined);
      store.set(confAtom, {} as Conf);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when orgs is undefined", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, undefined);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when users is undefined", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, []);
      store.set(usersAtom, undefined);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when groups is undefined", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, []);
      store.set(usersAtom, []);
      store.set(groupsAtom, undefined);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when providers is undefined", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, []);
      store.set(usersAtom, []);
      store.set(groupsAtom, []);
      store.set(providersAtom, undefined);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when org not found in orgs", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org2" } as Org];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, []);
      store.set(groupsAtom, []);
      store.set(providersAtom, []);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when user not found in users", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user456" } as User];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, []);
      store.set(providersAtom, []);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when manager state does not match groups", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: false, manager: true },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: [],
          valid: true,
        } as Group,
        { id: GID_ADMINS, name: "Admins", members: [], valid: true } as Group,
      ];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, []);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return undefined when admin state does not match groups", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: [],
          valid: true,
        } as Group,
        { id: GID_ADMINS, name: "Admins", members: [], valid: true } as Group,
      ];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, []);

      const result = getDataState(store.get);

      expect(result).toBe(undefined);
    });

    it("should return appState when all data is consistent for regular user", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: false, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: [],
          valid: true,
        } as Group,
        { id: GID_ADMINS, name: "Admins", members: [], valid: true } as Group,
      ];
      const mockProviders: Provider[] = [];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, mockProviders);

      const result = getDataState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: false,
      } as UserState);
    });

    it("should return appState when all data is consistent for manager", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: false, manager: true },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: ["user123"],
          valid: true,
        } as Group,
        { id: GID_ADMINS, name: "Admins", members: [], valid: true } as Group,
      ];
      const mockProviders: Provider[] = [];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, mockProviders);

      const result = getDataState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: true,
        admin: false,
      } as UserState);
    });

    it("should return appState when all data is consistent for admin", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: [],
          valid: true,
        } as Group,
        {
          id: GID_ADMINS,
          name: "Admins",
          members: ["user123"],
          valid: true,
        } as Group,
      ];
      const mockProviders: Provider[] = [];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, mockProviders);

      const result = getDataState(store.get);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: true,
      } as UserState);
    });
  });

  describe("dataStateAtom", () => {
    it("should derive state from other atoms", () => {
      const store = createStore();
      const mockUser = { uid: "user123" } as FirebaseUser;
      const mockPrivs: UserPrivileges = {
        org1: { admin: true, manager: false },
      };
      const mockOrgs: Org[] = [{ id: "org1" } as Org];
      const mockUsers: User[] = [{ id: "user123" } as User];
      const mockGroups: Group[] = [
        {
          id: GID_MANAGERS,
          name: "Managers",
          members: [],
          valid: true,
        } as Group,
        {
          id: GID_ADMINS,
          name: "Admins",
          members: ["user123"],
          valid: true,
        } as Group,
      ];
      const mockProviders: Provider[] = [];

      store.set(authUserAtom, mockUser);
      store.set(userPrivilegesAtom, mockPrivs);
      store.set(oidAtom, "org1");
      store.set(confAtom, {} as Conf);
      store.set(orgsAtom, mockOrgs);
      store.set(usersAtom, mockUsers);
      store.set(groupsAtom, mockGroups);
      store.set(providersAtom, mockProviders);

      const result = store.get(dataStateAtom);

      expect(result).toEqual({
        oid: "org1",
        uid: "user123",
        sys: false,
        manager: false,
        admin: true,
      } as UserState);
    });
  });
});
