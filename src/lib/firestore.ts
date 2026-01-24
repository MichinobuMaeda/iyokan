import { getDefaultStore } from "jotai";
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import {
  authStateAtom,
  userPrivilegesAtom,
  confAtom,
  orgsAtom,
  usersAtom,
  groupsAtom,
  providersAtom,
} from "./store";
import { confFromDoc } from "../types/Conf";
import { orgFromDoc } from "../types/Org";
import { userFromDoc } from "../types/User";
import { groupFromDoc } from "../types/Group";
import { providerFromDoc } from "../types/Provider";

export function subscribeConf() {
  onSnapshot(doc(db, "service", "conf"), (doc) => {
    getDefaultStore().set(confAtom, confFromDoc(doc));
    console.log("Get conf");
  });
}

interface UserDataItem {
  collectionName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atom: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromDoc: (doc: DocumentSnapshot) => any;
}

const userDataItems: UserDataItem[] = [
  {
    collectionName: "orgs",
    atom: orgsAtom,
    fromDoc: orgFromDoc,
  },
  {
    collectionName: "users",
    atom: usersAtom,
    fromDoc: userFromDoc,
  },
  {
    collectionName: "groups",
    atom: groupsAtom,
    fromDoc: groupFromDoc,
  },
  {
    collectionName: "providers",
    atom: providersAtom,
    fromDoc: providerFromDoc,
  },
];

const unsubscribes: { [key: string]: Unsubscribe | null } = {};

const getOids = () =>
  Object.keys(getDefaultStore().get(userPrivilegesAtom) || {});

export function subscribeUserData(
  oid: string,
  userDataItem: UserDataItem,
  sys: boolean = false
) {
  const { collectionName, atom, fromDoc } = userDataItem;

  unsubscribeUserData(userDataItem);
  unsubscribes[collectionName] = onSnapshot(
    collectionName === "orgs"
      ? sys
        ? collection(db, collectionName)
        : query(collection(db, collectionName), where("oid", "in", getOids()))
      : collection(db, "orgs", oid, collectionName),
    (snapshot) => {
      getDefaultStore().set(
        atom,
        snapshot.docs.map((doc) => fromDoc(doc)!)
      );
      console.log(`Get ${collectionName}`);
    },
    (onError) => {
      getDefaultStore().set(atom, undefined);
      console.error(`Failed to subscribe to ${collectionName}`, onError);
    }
  );
}

export function unsubscribeUserData({ collectionName, atom }: UserDataItem) {
  getDefaultStore().set(atom, undefined);
  if (unsubscribes[collectionName]) {
    unsubscribes[collectionName]!();
    unsubscribes[collectionName] = null;
    console.log(`Unsubscribed from ${collectionName}`);
  }
}

export function listenAuthStateChanged() {
  const store = getDefaultStore();
  store.sub(authStateAtom, () => {
    const authState = store.get(authStateAtom);
    if (authState) {
      userDataItems.forEach((item) => {
        subscribeUserData(authState.oid, item, authState.sys);
      });
    } else {
      userDataItems.forEach((item) => {
        unsubscribeUserData(item);
      });
    }
  });
}
