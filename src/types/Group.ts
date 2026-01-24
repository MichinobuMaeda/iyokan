import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export interface GroupData {
  name: string;
  members: string[];
  valid: boolean;
}

export interface Group extends Meta, GroupData {
  id: string;
  name: string;
  members: string[];
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a Group object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Group object or null if document doesn't exist
 */
export function groupFromDoc(doc: DocumentSnapshot): Group | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    name: data?.name ?? "",
    members: data?.members ?? [],
    valid: data?.valid ?? false,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
