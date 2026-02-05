import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export interface ConfData {
  webUrl: string;
  desc?: string;
  hardBreak?: boolean;
}

export interface Conf extends Meta, ConfData {
  id: string;
  webUrl: string;
  desc?: string;
  hardBreak?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function confFromDoc(doc: DocumentSnapshot): Conf | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    webUrl: data?.webUrl ?? "",
    desc: data?.desc,
    hardBreak: !!data?.hardBreak,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
