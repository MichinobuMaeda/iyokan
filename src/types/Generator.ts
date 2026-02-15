import { DocumentSnapshot } from "firebase/firestore";
import type { Meta } from "./Meta";

export interface GeneratorData {
  name: string;
  source: string;
  prompt: string;
  providers: string[];
  valid: boolean;
}

export interface Generator extends Meta, GeneratorData {
  id: string;
  name: string;
  source: string;
  prompt: string;
  providers: string[];
  valid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a Generator object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Generator object or null if document doesn't exist
 */
export function generatorFromDoc(doc: DocumentSnapshot): Generator | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    name: data?.name ?? "",
    source: data?.source ?? "",
    prompt: data?.prompt ?? "",
    providers: data?.providers ?? [],
    valid: data?.valid ?? false,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
