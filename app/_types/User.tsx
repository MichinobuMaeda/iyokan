import { DocumentSnapshot } from "firebase/firestore";
import { Meta } from "./Meta";

export interface UserData {
  name: string;
  email: string;
  valid: boolean;
}

export interface User extends Meta, UserData {
  id: string;
  name: string;
  email: string;
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a User object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns User object or null if document doesn't exist
 */
export function userFromDoc(doc: DocumentSnapshot): User | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    name: data?.name ?? "",
    email: data?.email ?? "",
    valid: data?.valid ?? false,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
