import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export const reservedOids = ["id", "oid", "admin", "admins"];

export interface OrgData {
  name: string;
  desc: string;
  hardBreak: boolean;
  presetTimes: string[];
  valid: boolean;
}

export interface Org extends Meta, OrgData {
  id: string;
  name: string;
  desc: string;
  hardBreak: boolean;
  presetTimes: string[];
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates an Org object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Org object or null if document doesn't exist
 */
export function orgFromDoc(doc: DocumentSnapshot): Org | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    name: data?.name ?? "",
    desc: data?.desc ?? "",
    hardBreak: !!data?.hardBreak,
    valid: !!data?.valid,
    presetTimes: data?.presetTimes ?? [],
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
