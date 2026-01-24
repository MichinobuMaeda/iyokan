import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export interface ConfData {
  webUrl: string;
  desc: string[];
}

export interface Conf extends Meta, ConfData {
  id: string;
  webUrl: string;
  desc: string[];
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
    webUrl: data?.web_url ?? "",
    desc: data?.desc ?? [],
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
