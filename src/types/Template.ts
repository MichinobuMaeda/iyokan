import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export interface TemplateData {
  name: string;
  title: string;
  message: string;
  link: string;
  feed: string;
  category: string;
  valid: boolean;
}

export interface Template extends Meta, TemplateData {
  id: string;
  name: string;
  title: string;
  message: string;
  link: string;
  feed: string;
  category: string;
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a Template object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Template object or null if document doesn't exist
 */
export function templateFromDoc(doc: DocumentSnapshot): Template | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    name: data?.name ?? "",
    title: data?.title ?? "",
    message: data?.message ?? "",
    link: data?.link ?? "",
    feed: data?.feed ?? "",
    category: data?.category ?? "",
    valid: data?.valid ?? false,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
