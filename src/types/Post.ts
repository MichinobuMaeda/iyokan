import { DocumentSnapshot } from "firebase/firestore";

import { type PostError } from "../../functions/src/common";
import { type ProviderType } from "./Provider";
import { type Meta } from "./Meta";

export type PostStatus = "canceled" | "paused" | "scheduled" | "finished";

export interface PostData {
  schedule: Date;
  title: string;
  message: string;
  link: string;
  files: string[];
  providers: ProviderType[];
  status: PostStatus;
  errors?: PostError[];
  template: string | null;
  generator: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface Post extends Meta, PostData {
  id: string;
  schedule: Date;
  title: string;
  message: string;
  link: string;
  files: string[];
  providers: ProviderType[];
  status: PostStatus;
  errors?: PostError[];
  template: string | null;
  generator: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creates a Post object from a Firebase document snapshot
 * @param doc - Firebase document snapshot
 * @returns Post object or null if document doesn't exist
 */
export function postFromDoc(doc: DocumentSnapshot): Post | null {
  if (!doc.exists()) {
    return null;
  }

  const data = doc.data();

  return {
    id: doc.id,
    schedule: data?.schedule?.toDate() ?? new Date(),
    title: data?.title ?? "",
    message: data?.message ?? "",
    link: data?.link ?? "",
    files: data?.files ?? [],
    providers: data?.providers ?? [],
    status: data?.status ?? "paused",
    errors: data?.errors ?? [],
    template: data?.template || null,
    generator: data?.generator || null,
    createdBy: data?.createdBy || null,
    updatedBy: data?.updatedBy || null,
    createdAt: data?.createdAt?.toDate(),
    updatedAt: data?.updatedAt?.toDate(),
  };
}
