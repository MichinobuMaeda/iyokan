import { type User } from "firebase/auth";
import { getDefaultStore } from "jotai";
import * as E from "fp-ts/Either";

import type { UserPrivileges } from "../../functions/src/common";
import { oidAtom, userPrivilegesAtom, appStateAtom } from "./store";
import { subscribeUserDataAll, unsubscribeUserDataAll } from "./firestore";
import { logout } from "./auth";
import { getUserPrivs } from "./functions";

export function setValidOrganization(
  store: ReturnType<typeof getDefaultStore>,
  privs: UserPrivileges | null | undefined
): void {
  const current = store.get(oidAtom);
  const privilegedOids = Object.keys(privs || {});

  if (privilegedOids.length > 0 && !privilegedOids.includes(current || "")) {
    const oid = privilegedOids[0];
    console.info(`setValidOrganization() oid: ${current} => ${oid}`);
    store.set(oidAtom, oid);
  }
}

export async function setAppState(
  store: ReturnType<typeof getDefaultStore>,
  user: User | null
): Promise<void> {
  const result = await getUserPrivs(user?.uid);

  if (E.isLeft(result)) {
    if (user) {
      console.error("logout due to no privileges");
      await logout();
    }
    store.set(userPrivilegesAtom, null);
  } else {
    const privs = result.right;
    console.info("setAppState() privs:", privs);
    setValidOrganization(store, privs);
    store.set(userPrivilegesAtom, privs);
  }
}

export function listenAppState() {
  console.info("Start listenAppState()");
  const store = getDefaultStore();

  store.sub(appStateAtom, () => {
    const appState = store.get(appStateAtom);
    console.info("listenAppState() appState changed:", appState);

    if (appState) {
      subscribeUserDataAll(appState);
    } else {
      unsubscribeUserDataAll(appState);
      if (appState === null) {
        const userPrivileges = store.get(userPrivilegesAtom);
        if (userPrivileges === null) {
          logout();
        }
      }
    }
  });
}
